import { logger } from '../utils/logger'

type EventHandler = (data: unknown) => void

const handlers = new Map<string, Set<EventHandler>>()
let eventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let ws: WebSocket | null = null

const RECONNECT_DELAY = 5000

function onEvent(type: string, data: string) {
  try {
    const parsed = JSON.parse(data)
    const set = handlers.get(type)
    if (set) set.forEach((fn) => fn(parsed))
  } catch {
    const set = handlers.get(type)
    if (set) set.forEach((fn) => fn(data))
  }
}

export function connectSSE(url: string = '/api/events'): void {
  if (eventSource) return
  try {
    eventSource = new EventSource(url)
    eventSource.onmessage = (event) => onEvent(event.type || 'message', event.data)
    eventSource.onerror = () => {
      logger.warn('SSE', 'Connection error, reconnecting...')
      eventSource?.close()
      eventSource = null
      reconnectTimer = setTimeout(() => connectSSE(url), RECONNECT_DELAY)
    }
    logger.info('SSE', 'Connected')
  } catch {
    logger.warn('SSE', 'SSE not available, falling back to polling')
  }
}

export function connectWebSocket(url: string = '/api/ws'): void {
  if (ws) return
  try {
    ws = new WebSocket(url)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        onEvent(msg.type || 'notification', msg.payload)
      } catch {
        onEvent('message', event.data)
      }
    }
    ws.onclose = () => {
      logger.warn('WS', 'Disconnected, reconnecting...')
      ws = null
      reconnectTimer = setTimeout(() => connectWebSocket(url), RECONNECT_DELAY)
    }
    ws.onerror = () => {
      logger.warn('WS', 'Connection error')
      ws?.close()
    }
    logger.info('WS', 'Connected')
  } catch {
    logger.warn('WS', 'WebSocket not available')
  }
}

export function subscribe(event: string, handler: EventHandler): () => void {
  if (!handlers.has(event)) handlers.set(event, new Set())
  handlers.get(event)!.add(handler)
  return () => {
    handlers.get(event)?.delete(handler)
  }
}

export function unsubscribeAll(): void {
  handlers.clear()
}

export function disconnect(): void {
  eventSource?.close()
  eventSource = null
  ws?.close()
  ws = null
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}
