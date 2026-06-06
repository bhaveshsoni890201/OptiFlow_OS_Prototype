type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel =
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) || (import.meta.env.DEV ? 'debug' : 'warn')

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const ts = new Date().toISOString()
  const prefix = `[${ts}] [${level.toUpperCase()}] [${context}]`
  return data ? `${prefix} ${message}` : `${prefix} ${message}`
}

const logger = {
  debug(context: string, message: string, data?: unknown): void {
    if (!shouldLog('debug')) return
    const formatted = formatMessage('debug', context, message)
    if (data) console.debug(formatted, data)
    else console.debug(formatted)
  },

  info(context: string, message: string, data?: unknown): void {
    if (!shouldLog('info')) return
    const formatted = formatMessage('info', context, message)
    if (data) console.info(formatted, data)
    else console.info(formatted)
  },

  warn(context: string, message: string, data?: unknown): void {
    if (!shouldLog('warn')) return
    const formatted = formatMessage('warn', context, message)
    if (data) console.warn(formatted, data)
    else console.warn(formatted)
  },

  error(context: string, message: string, data?: unknown): void {
    if (!shouldLog('error')) return
    const formatted = formatMessage('error', context, message)
    if (data) console.error(formatted, data)
    else console.error(formatted)
  },
}

export type { LogLevel }
export { logger }