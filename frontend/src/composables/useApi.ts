import { ref, onUnmounted, type Ref } from 'vue'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, type ApiRequestConfig } from '../api/client'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface UseApiOptions {
  timeout?: number
  schema?: { parse: (data: unknown) => unknown }
}

interface UseApiReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(method: HttpMethod, url: string, options?: UseApiOptions): UseApiReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const controller = new AbortController()

  onUnmounted(() => {
    controller.abort()
  })

  function buildConfig(extra?: unknown): ApiRequestConfig {
    return {
      signal: controller.signal,
      timeout: options?.timeout,
      schema: options?.schema,
      ...(extra ? (extra as Record<string, unknown>) : {}),
    } as ApiRequestConfig
  }

  async function execute(...args: unknown[]): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      let result: T
      switch (method) {
        case 'get':
          result = await apiGet<T>(url, buildConfig(args[0]))
          break
        case 'post':
          result = await apiPost<T>(url, args[0] as any, buildConfig())
          break
        case 'put':
          result = await apiPut<T>(url, args[0] as any, buildConfig())
          break
        case 'patch':
          result = await apiPatch<T>(url, args[0] as any, buildConfig())
          break
        case 'delete':
          result = await apiDelete<T>(url, buildConfig())
          break
      }
      data.value = result!
      return result
    } catch (e) {
      if ((e as Error)?.name === 'CanceledError' || (e as any)?.code === 'ERR_CANCELED') {
        return data.value
      }
      const message = e instanceof Error ? e.message : 'An unexpected error occurred'
      error.value = message
      return null
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = null
    loading.value = false
    error.value = null
  }

  return { data, loading, error, execute, reset }
}
