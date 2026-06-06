import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../api/client'
import { isMockMode } from './config'
import { logger } from '../utils/logger'

// ─── ServiceError ────────────────────────────────────────────────
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN',
    public retryable: boolean = false,
    public status?: number,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// ─── Cache ───────────────────────────────────────────────────────
interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<any>>()

const cache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return undefined
    }
    return entry.value as T
  },

  set<T>(key: string, value: T, ttlMs: number = 30_000): void {
    store.set(key, { value, expiresAt: Date.now() + ttlMs })
  },

  invalidate(pattern?: string): void {
    if (!pattern) {
      store.clear()
      return
    }
    for (const key of store.keys()) {
      if (key.startsWith(pattern)) store.delete(key)
    }
  },

  clear(): void {
    store.clear()
  },
}

// ─── Request Dedup ───────────────────────────────────────────────
const inFlight = new Map<string, Promise<any>>()

const dedup = {
  get<T>(key: string): Promise<T> | undefined {
    return inFlight.get(key)
  },

  set<T>(key: string, promise: Promise<T>): void {
    inFlight.set(key, promise)
    promise.finally(() => inFlight.delete(key))
  },

  remove(key: string): void {
    inFlight.delete(key)
  },
}

// ─── Retry ───────────────────────────────────────────────────────
interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  shouldRetry?: (error: unknown) => boolean
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000 } = options
  const shouldRetry = options.shouldRetry ?? isTransientError

  let lastError: unknown
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxRetries && shouldRetry(err)) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}

function isTransientError(error: unknown): boolean {
  if (error instanceof ServiceError) return error.retryable
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('network error') || msg.includes('econnrefused')) return true
    if (msg.includes('429') || msg.includes('503') || msg.includes('502') || msg.includes('504')) return true
  }
  return false
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof ServiceError) return error.retryable || !!(error.status && error.status >= 500)
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('network error') || msg.includes('econnrefused') || msg.includes('timeout') || msg.includes('failed to fetch')
  }
  return false
}

// ─── BaseService ─────────────────────────────────────────────────
export abstract class BaseService {
  protected abstract entityName: string

  protected async fetchList<T>(
    endpoint: string,
    mockLoader: () => Promise<T[]>,
    cacheKey?: string,
    ttlMs: number = 30_000,
  ): Promise<T[]> {
    const dedupKey = `list:${endpoint}`

    if (cacheKey) {
      const cached = cache.get<T[]>(cacheKey)
      if (cached) return cached
    }

    if (isMockMode()) {
      try {
        const data = await mockLoader()
        if (cacheKey) cache.set(cacheKey, data, ttlMs)
        return data
      } catch (err) {
        logger.warn('BaseService', `Failed to load mock data:`, err)
        return []
      }
    }

    const inFlightReq = dedup.get<T[]>(dedupKey)
    if (inFlightReq) return inFlightReq

    const promise = (async () => {
      try {
        const result = await withRetry(() => apiGet<T[]>(endpoint), { maxRetries: 3 })
        if (cacheKey) cache.set(cacheKey, result, ttlMs)
        return result
      } catch (err) {
        const svcErr = normalizeError(err)
        if (isNetworkError(err)) {
          logger.warn('BaseService', 'Network error, falling back to mock')
          try {
            const data = await mockLoader()
            if (cacheKey) cache.set(cacheKey, data, ttlMs)
            return data
          } catch {
            throw svcErr
          }
        }
        throw svcErr
      }
    })()

    dedup.set(dedupKey, promise)
    return promise
  }

  protected async fetchOne<T>(
    endpoint: string,
    mockLoader: () => Promise<T | undefined>,
    cacheKey?: string,
    ttlMs: number = 60_000,
  ): Promise<T | undefined> {
    if (cacheKey) {
      const cached = cache.get<T>(cacheKey)
      if (cached) return cached
    }

    if (isMockMode()) {
      try {
        const result = await mockLoader()
        if (cacheKey && result) cache.set(cacheKey, result, ttlMs)
        return result
      } catch (err) {
        logger.warn('BaseService', 'Failed to load mock detail:', err)
        return undefined
      }
    }

    try {
      const result = await withRetry(() => apiGet<T>(endpoint), { maxRetries: 3 })
      if (cacheKey) cache.set(cacheKey, result, ttlMs)
      return result
    } catch (err) {
      const svcErr = normalizeError(err)
      if (isNetworkError(err)) {
        logger.warn('BaseService', 'Network error, falling back to mock')
        try { return await mockLoader() } catch { /* ignore */ }
      }
      throw svcErr
    }
  }

  protected async mutate<T = void>(
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: unknown,
    invalidatePatterns?: string[],
  ): Promise<T> {
    if (isMockMode()) return undefined as T

    const apiFn = method === 'post' ? apiPost
      : method === 'put' ? apiPut
      : method === 'patch' ? apiPatch
      : apiDelete

    try {
      const result = await apiFn<T>(endpoint, data)
      if (invalidatePatterns) {
        for (const p of invalidatePatterns) cache.invalidate(p)
      }
      return result
    } catch (err) {
      throw normalizeError(err)
    }
  }

  protected invalidateCache(pattern?: string): void {
    cache.invalidate(pattern)
  }
}

function normalizeError(err: unknown): ServiceError {
  if (err instanceof ServiceError) return err
  if (err instanceof Error) {
    const axiosErr = (err as any).response
    const status = axiosErr?.status
    const data = axiosErr?.data
    const message = data?.error || err.message || 'Unknown error'
    const code = status ? `HTTP_${status}` : 'NETWORK_ERROR'
    const retryable = !!(status && status >= 500) || status === 429
    return new ServiceError(message, code, retryable, status)
  }
  return new ServiceError('Unknown error', 'UNKNOWN', false)
}

export { cache, dedup }
