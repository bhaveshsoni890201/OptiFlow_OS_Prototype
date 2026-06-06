import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000

// ─── Extend Axios config with optional Zod-like schema validator ───
export interface ApiRequestConfig extends AxiosRequestConfig {
  schema?: { parse: (data: unknown) => unknown }
}

interface RetryConfig {
  _retryCount?: number
}

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── CSRF token from cookie ──────────────────────────────────────
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// ─── Request interceptor: auth token + CSRF ──────────────────────
// NOTE: localStorage token storage is susceptible to XSS.
// For production, migrate to httpOnly cookie-based auth (backend sets cookie,
// frontend never reads it). This interim approach keeps the token in
// Authorization header only — never exposed in DOM or inline JS.
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // localStorage unavailable
  }

  // Frappe/Django CSRF token from cookie
  const csrfToken = getCookie('csrftoken') || getCookie('X-CSRFToken')
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

// ─── Response interceptor: retry + 401 redirect ──────────────────
const MAX_RETRIES = 2
const RETRYABLE_STATUSES = [408, 429, 502, 503, 504]

function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), 8000)
}

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const status = error.response?.status
    const cfg = error.config as AxiosRequestConfig & RetryConfig

    // 401: clear session and redirect
    if (status === 401) {
      try {
        localStorage.removeItem('auth_token')
      } catch {
        // localStorage unavailable
      }
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Retry on transient errors (408, 429, 5xx)
    if (cfg && RETRYABLE_STATUSES.includes(status) && !cfg._retryCount) {
      cfg._retryCount = 0
    }
    if (cfg && RETRYABLE_STATUSES.includes(status) && (cfg._retryCount ?? 0) < MAX_RETRIES) {
      cfg._retryCount = (cfg._retryCount ?? 0) + 1
      const delay = getRetryDelay(cfg._retryCount)
      await new Promise((r) => setTimeout(r, delay))
      return client(cfg)
    }

    return Promise.reject(error)
  },
)

// ─── API response types ──────────────────────────────────────────
export interface ApiResponse<T> {
  message: T
  status: 'success' | 'error'
  error?: string
}

async function unwrap<T>(response: AxiosResponse<ApiResponse<T>>, schema?: { parse: (data: unknown) => unknown }): Promise<T> {
  if (response.data.status === 'error') throw new Error(response.data.error || 'API error')
  const data = response.data.message
  if (schema) {
    return schema.parse(data) as T
  }
  return data
}

// ─── Exported helpers with per-request timeout + schema ──────────
export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const timeout = config?.timeout ?? API_TIMEOUT
  const response = await client.get<ApiResponse<T>>(url, {
    ...config,
    timeout,
  })
  return unwrap(response, config?.schema)
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const timeout = config?.timeout ?? API_TIMEOUT
  const response = await client.post<ApiResponse<T>>(url, data, {
    ...config,
    timeout,
  })
  return unwrap(response, config?.schema)
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const timeout = config?.timeout ?? API_TIMEOUT
  const response = await client.put<ApiResponse<T>>(url, data, {
    ...config,
    timeout,
  })
  return unwrap(response, config?.schema)
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const timeout = config?.timeout ?? API_TIMEOUT
  const response = await client.patch<ApiResponse<T>>(url, data, {
    ...config,
    timeout,
  })
  return unwrap(response, config?.schema)
}

export async function apiDelete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const timeout = config?.timeout ?? API_TIMEOUT
  const response = await client.delete<ApiResponse<T>>(url, {
    ...config,
    timeout,
  })
  return unwrap(response, config?.schema)
}

export default client
