import { logger } from './logger'

const marks = new Map<string, number>()

export function startMeasure(name: string): void {
  marks.set(name, performance.now())
}

export function endMeasure(name: string, context?: string): number | undefined {
  const start = marks.get(name)
  if (start === undefined) return undefined
  const duration = performance.now() - start
  marks.delete(name)
  logger.debug('Perf', `${name} took ${duration.toFixed(1)}ms`, { context, durationMs: +duration.toFixed(1) })

  const entries = JSON.parse(sessionStorage.getItem('optiflow-route-timing') || '[]')
  entries.push({ name, durationMs: +duration.toFixed(1), timestamp: new Date().toISOString() })
  sessionStorage.setItem('optiflow-route-timing', JSON.stringify(entries.slice(-100)))

  return duration
}

export function addRouteTiming(to: string, from: string, durationMs: number): void {
  logger.info('Router', `Navigated ${from || '(entry)'} → ${to} in ${durationMs}ms`)
  const entries = JSON.parse(sessionStorage.getItem('optiflow-route-timing') || '[]')
  entries.push({ to, from, durationMs, timestamp: new Date().toISOString() })
  sessionStorage.setItem('optiflow-route-timing', JSON.stringify(entries.slice(-100)))
}