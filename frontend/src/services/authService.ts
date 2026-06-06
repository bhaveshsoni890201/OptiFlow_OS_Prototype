import { apiGet } from '../api/client'
import { endpoints } from '../api/endpoints'
import type { Employee, Role } from '../types'
import { BaseService, ServiceError } from './BaseService'
import { isMockMode } from './config'

export interface LoginResponse {
  token: string
  employee: Employee
  role: Role
}

class AuthService extends BaseService {
  protected entityName = 'Auth'

  async login(employeeId: string, password: string): Promise<LoginResponse> {
    try {
      if (isMockMode()) {
        const { employees } = await import('../mock/employees').catch(() => ({ employees: [] as Employee[] }))
        const normalize = (id: string) => id.replace(/-/g, '')
        const emp = employees.find((e: Employee) => normalize(e.employee_id) === normalize(employeeId))
        if (!emp || password !== 'Pass@123') throw new Error('Invalid credentials')
        return { token: 'mock-token-' + employeeId, employee: emp, role: emp.roles[0] || 'doer' }
      }
      return await this.mutate<LoginResponse>('post', endpoints.auth.login, { employee_id: employeeId, password })
    } catch (err) {
      throw err instanceof ServiceError ? err : new ServiceError('Login failed', 'AUTH_LOGIN_ERROR')
    }
  }

  async verifyOtp(mobile: string, otp: string): Promise<LoginResponse> {
    try {
      if (isMockMode()) {
        if (otp !== '111111') throw new Error('Incorrect OTP. Please try again.')
        const { employees } = await import('../mock/employees').catch(() => ({ employees: [] as Employee[] }))
        const emp = employees[0]
        if (!emp) throw new Error('No employee found')
        return { token: 'mock-token-otp', employee: emp, role: emp.roles[0] || 'doer' }
      }
      return await this.mutate<LoginResponse>('post', endpoints.auth.verifyOtp, { mobile, otp })
    } catch (err) {
      throw err instanceof ServiceError ? err : new ServiceError('OTP verification failed', 'AUTH_OTP_ERROR')
    }
  }

  async getProfile(): Promise<LoginResponse | null> {
    try {
      if (isMockMode()) return null
      return await apiGet<LoginResponse>(endpoints.auth.profile)
    } catch (err) {
      throw err instanceof ServiceError ? err : new ServiceError('Failed to fetch profile', 'AUTH_PROFILE_ERROR')
    }
  }

  async forgotPassword(employeeId: string): Promise<void> {
    try {
      if (isMockMode()) return
      await this.mutate('post', endpoints.auth.forgotPassword, { employee_id: employeeId })
    } catch (err) {
      throw err instanceof ServiceError ? err : new ServiceError('Forgot password request failed', 'AUTH_FORGOT_ERROR')
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      if (isMockMode()) return
      await this.mutate('post', endpoints.auth.resetPassword, { token, password })
    } catch (err) {
      throw err instanceof ServiceError ? err : new ServiceError('Password reset failed', 'AUTH_RESET_ERROR')
    }
  }
}

const authService = new AuthService()

export const login = (employeeId: string, password: string) => authService.login(employeeId, password)
export const verifyOtp = (mobile: string, otp: string) => authService.verifyOtp(mobile, otp)
export const getProfile = () => authService.getProfile()
export const forgotPassword = (employeeId: string) => authService.forgotPassword(employeeId)
export const resetPassword = (token: string, password: string) => authService.resetPassword(token, password)
