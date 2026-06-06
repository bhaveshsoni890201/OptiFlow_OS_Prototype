import { logger } from './logger'

interface PageView {
  path: string
  title: string
  role?: string
  timestamp: string
}

interface FeatureEvent {
  feature: string
  action: string
  timestamp: string
}

interface ErrorSnapshot {
  count: number
  contexts: Record<string, number>
  period: string
}

const pageViews: PageView[] = []
const featureEvents: FeatureEvent[] = []
const errorSnapshots: ErrorSnapshot[] = []
const MAX_SAMPLES = 200

function sanitizePath(path: string): string {
  // Replace IDs with :param — never store specific IDs
  return path.replace(/\/[A-Z0-9-]+(?:\/[A-Z0-9-]+)?(?=\/|$)/gi, (match) => {
    if (/^\d{4}-\d{2}-\d{2}/.test(match)) return match
    if (/^\d+$/.test(match)) return '/:id'
    if (/^EMP-\d{4}/.test(match)) return '/:id'
    return match
  })
}

export function trackPageView(path: string, title: string, role?: string): void {
  const trackPath = sanitizePath(path)
  const event: PageView = { path: trackPath, title, role: role ? `role:${role}` : undefined, timestamp: new Date().toISOString() }
  pageViews.push(event)
  if (pageViews.length > MAX_SAMPLES) pageViews.shift()
  logger.debug('Analytics', `Page view: ${title}`, { path: trackPath, role })
}

export function trackFeature(feature: string, action: string): void {
  const event: FeatureEvent = { feature, action, timestamp: new Date().toISOString() }
  featureEvents.push(event)
  if (featureEvents.length > MAX_SAMPLES) featureEvents.shift()
  logger.debug('Analytics', `Feature: ${feature} / ${action}`)
}

export function trackErrorRate(context: string): void {
  const hour = new Date().toISOString().slice(0, 13)
  let snapshot = errorSnapshots.find((s) => s.period === hour)
  if (!snapshot) {
    snapshot = { count: 0, contexts: {}, period: hour }
    errorSnapshots.push(snapshot)
    if (errorSnapshots.length > 48) errorSnapshots.shift()
  }
  snapshot.count++
  snapshot.contexts[context] = (snapshot.contexts[context] || 0) + 1
}

export function getAnalyticsSnapshot(): {
  pageViews: number
  topPages: { path: string; count: number }[]
  featureUsage: { feature: string; count: number }[]
  recentErrors: { period: string; count: number }[]
} {
  const pageCounts = new Map<string, number>()
  pageViews.forEach((v) => pageCounts.set(v.path, (pageCounts.get(v.path) || 0) + 1))
  const topPages = Array.from(pageCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const featureCounts = new Map<string, number>()
  featureEvents.forEach((f) => featureCounts.set(f.feature, (featureCounts.get(f.feature) || 0) + 1))
  const featureUsage = Array.from(featureCounts.entries())
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    pageViews: pageViews.length,
    topPages,
    featureUsage,
    recentErrors: errorSnapshots.slice(-24).map((s) => ({ period: s.period, count: s.count })),
  }
}