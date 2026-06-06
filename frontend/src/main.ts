import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import './styles/tailwind.css'
import { reportWebVitals } from './utils/webVitalsReporter'
import { logger } from './utils/logger'
import { initErrorTracking, captureError } from './utils/errorTracking'
import { addRouteTiming } from './utils/performance'
import { trackPageView } from './utils/analytics'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

initErrorTracking()

// Global unhandled promise rejection capture
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const message = reason instanceof Error ? reason.message : String(reason || 'Unknown promise rejection')
  captureError(message, 'unhandledrejection', { reason: String(reason) })
})

// Global browser runtime error capture (outside Vue render)
window.addEventListener('error', (event) => {
  const message = event.message || 'Unknown runtime error'
  captureError(message, 'window-error', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  })
})

app.config.errorHandler = (err, _instance, info) => {
  const message = err instanceof Error ? err.message : String(err)
  logger.error('VueRender', message, { info })
  captureError(message, 'vue-render-error', { info })
}

router.beforeEach((_to, _from, next) => {
  performance.mark(`route-start:${_to.path}`)
  next()
})

router.afterEach((to, from) => {
  const markName = `route-start:${to.path}`
  const startMark = performance.getEntriesByName(markName)[0]
  if (startMark) {
    const duration = performance.now() - startMark.startTime
    addRouteTiming(to.path, from?.path || '', Math.round(duration))
    performance.clearMarks(markName)
  }
  trackPageView(to.path, (to.meta?.title as string) || '', to.meta?.role as string)
})

app.mount('#app')

reportWebVitals()
