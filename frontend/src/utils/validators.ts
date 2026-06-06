export function isRequired(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isMobile(value: string): boolean {
  return /^\+?91?[6-9]\d{9}$/.test(value.replace(/\s/g, ''))
}

export function isValidIFSC(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value)
}

export function isFutureDate(date: string): boolean {
  return new Date(date) > new Date()
}

export function isWithinCurrentWeek(date: string): boolean {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  const target = new Date(date)
  return target >= weekStart && target <= weekEnd
}

export interface ValidationErrors {
  [field: string]: string
}

export function validateRequired(
  fields: Record<string, unknown>,
  labels: Record<string, string>,
): ValidationErrors {
  const errors: ValidationErrors = {}
  for (const [key, value] of Object.entries(fields)) {
    if (!isRequired(value)) {
      errors[key] = `${labels[key] || key} is required`
    }
  }
  return errors
}
