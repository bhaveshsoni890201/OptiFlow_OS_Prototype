import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

type VitalMetric = { name: string; value: number; rating: string }

function logMetric(metric: VitalMetric) {
  const entries = JSON.parse(sessionStorage.getItem('optiflow-web-vitals') || '[]')
  entries.push(metric)
  sessionStorage.setItem('optiflow-web-vitals', JSON.stringify(entries.slice(-50)))

  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
  }
}

export function reportWebVitals(): void {
  try {
    onCLS((m) => logMetric({ name: 'CLS', value: m.value, rating: m.rating }))
    onFCP((m) => logMetric({ name: 'FCP', value: m.value, rating: m.rating }))
    onLCP((m) => logMetric({ name: 'LCP', value: m.value, rating: m.rating }))
    onTTFB((m) => logMetric({ name: 'TTFB', value: m.value, rating: m.rating }))
    onINP((m) => logMetric({ name: 'INP', value: m.value, rating: m.rating }))
  } catch {
    // web-vitals reporting unavailable
  }
}
