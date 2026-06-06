function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date
}

export function formatDate(date: string | Date): string {
  const d = toDate(date)
  const day = d.getDate().toString().padStart(2, '0')
  const month = d.toLocaleString('en-IN', { month: 'short' })
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export function formatDateShort(date: string | Date): string {
  const d = toDate(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateLong(date: string | Date): string {
  const d = toDate(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateWithWeekday(date: string | Date): string {
  const d = toDate(date)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShortNoYear(date: string | Date): string {
  const d = toDate(date)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatTime(date: string | Date): string {
  const d = toDate(date)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateTime(date: string | Date): string {
  return `${formatDateShort(date)}, ${formatTime(date)}`
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function formatDelayDays(days: number): string {
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day overdue'
  return `${days} days overdue`
}

export function formatMinutes(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}
