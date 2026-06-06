import { logger } from './logger'

// ─── Types ───────────────────────────────────────────────────────
interface SentryLike {
  captureException: (error: Error, options?: { tags?: Record<string, string | undefined>; extra?: Record<string, unknown> }) => void
  captureMessage: (message: string, level?: string) => void
  setUser: (user: { id?: string } | null) => void
}

interface ErrorEvent {
  id: string
  timestamp: number
  message: string
  stack?: string
  context?: string
  extra?: Record<string, unknown>
  level?: 'info' | 'warning' | 'error' | 'fatal'
  environment?: string
  url?: string
}

// ─── State ────────────────────────────────────────────────────────
const STORAGE_KEY = 'optiflow-error-buffer'
const MAX_BUFFER = 50

let SentryInstance: SentryLike | null = null

// ─── Dedup + Throttle ─────────────────────────────────────────────
const recentErrors = new Map<string, { count: number; firstSeen: number }>()
const DEDUP_TTL_MS = 5_000
const THROTTLE_MAX = 10
const THROTTLE_WINDOW_MS = 30_000

function isThrottled(key: string): boolean {
  const now = Date.now()
  const entry = recentErrors.get(key)

  if (!entry) {
    recentErrors.set(key, { count: 1, firstSeen: now })
    return false
  }

  if (now - entry.firstSeen > DEDUP_TTL_MS) {
    recentErrors.set(key, { count: 1, firstSeen: now })
    return false
  }

  entry.count++
  if (entry.count > THROTTLE_MAX && (now - entry.firstSeen) < THROTTLE_WINDOW_MS) {
    if (entry.count === THROTTLE_MAX + 1) {
      logger.warn('ErrorTracking', `Error suppressed: "${key}" — ${THROTTLE_MAX}+ occurrences in 30s`)
    }
    return true
  }
  return false
}

// Clean up stale dedup entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of recentErrors) {
    if (now - entry.firstSeen > Math.max(DEDUP_TTL_MS, THROTTLE_WINDOW_MS)) {
      recentErrors.delete(key)
    }
  }
}, 60_000)

// ─── Rate Limit (global) ──────────────────────────────────────────
let globalErrorCount = 0
let globalWindowStart = Date.now()
const GLOBAL_RATE_LIMIT = 50
const GLOBAL_RATE_WINDOW_MS = 60_000

function isGloballyRateLimited(): boolean {
  const now = Date.now()
  if (now - globalWindowStart > GLOBAL_RATE_WINDOW_MS) {
    globalErrorCount = 0
    globalWindowStart = now
  }
  globalErrorCount++
  return globalErrorCount > GLOBAL_RATE_LIMIT
}

// ─── Buffer ───────────────────────────────────────────────────────
const errorBuffer: ErrorEvent[] = loadBuffer()

function loadBuffer(): ErrorEvent[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_BUFFER)
  } catch {
    return []
  }
}

function persistBuffer(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(errorBuffer.slice(-MAX_BUFFER)))
  } catch {
    // sessionStorage unavailable
  }
}

function bufferEvent(event: ErrorEvent): void {
  errorBuffer.push(event)
  if (errorBuffer.length > MAX_BUFFER) errorBuffer.shift()
  persistBuffer()
}

export function getErrorBuffer(): ErrorEvent[] {
  return [...errorBuffer]
}

function errorKey(message: string, context?: string): string {
  return `${context || ''}:${message}`
}

// ─── Sentry Init ──────────────────────────────────────────────────
export async function initErrorTracking(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    logger.info('ErrorTracking', 'Sentry DSN not configured — running in fallback mode')
    return
  }

  try {
    const Sentry = await import('@sentry/vue')
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: `optiflow@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,
      tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
      beforeSend(event) {
        if (event.request?.url) {
          try {
            const url = new URL(event.request.url)
            event.request.url = `${url.origin}${url.pathname}`
          } catch { /* keep as-is */ }
        }
        if (event.user) {
          event.user = { id: 'sanitized' }
        }
        return event
      },
    })
    SentryInstance = Sentry as unknown as SentryLike
    logger.info('ErrorTracking', 'Sentry initialized')
  } catch {
    logger.info('ErrorTracking', '@sentry/vue not installed — running fallback')
  }
}

// ─── Capture ─────────────────────────────────────────────────────
function buildEvent(
  message: string,
  level: ErrorEvent['level'],
  context?: string,
  stack?: string,
  extra?: Record<string, unknown>,
): ErrorEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    message,
    stack,
    context,
    extra,
    level,
    environment: import.meta.env.MODE,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  }
}

export function captureError(error: Error | string, context?: string, extra?: Record<string, unknown>): void {
  const message = typeof error === 'string' ? error : error.message
  const key = errorKey(message, context)

  if (isThrottled(key)) return
  if (isGloballyRateLimited()) return

  const event = buildEvent(message, 'error', context, typeof error !== 'string' ? error.stack : undefined, extra)
  bufferEvent(event)
  logger.error(context || 'ErrorTracking', message, { stack: event.stack, extra })

  if (SentryInstance) {
    SentryInstance.captureException(typeof error === 'string' ? new Error(error) : error, {
      tags: { context },
      extra,
    })
  }
}

export function captureWarning(message: string, context?: string, extra?: Record<string, unknown>): void {
  const key = errorKey(message, context)

  if (isThrottled(key)) return
  if (isGloballyRateLimited()) return

  const event = buildEvent(message, 'warning', context, undefined, extra)
  bufferEvent(event)
  logger.warn(context || 'ErrorTracking', message, extra)

  if (SentryInstance) {
    SentryInstance.captureMessage(message, 'warning')
  }
}

export function clearUserContext(): void {
  if (SentryInstance) {
    SentryInstance.setUser(null)
  }
}