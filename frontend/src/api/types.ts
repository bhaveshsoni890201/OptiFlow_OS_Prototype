export interface ApiResponse<T> {
  message: T
  status: 'success' | 'error'
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  page_size: number
}

export interface ApiError {
  status: number
  message: string
  details?: Record<string, string[]>
}
