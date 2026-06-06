import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Employee } from '../types'
import { getEmployees, createEmployee as createEmployeeSvc, updateEmployee as updateEmployeeSvc, deleteEmployee as deleteEmployeeSvc } from '../services'
import { cache } from '../services/BaseService'
import { logger } from '../utils/logger'

export const useAdminStore = defineStore('admin', () => {
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchEmployees(): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      employees.value = await getEmployees()
    } catch (e) {
      error.value = 'Failed to fetch employees'
      logger.error('AdminStore', 'Failed to fetch employees', e)
    } finally {
      loading.value = false
    }
  }

  async function createEmployee(employee: Employee): Promise<void> {
    try {
      await createEmployeeSvc(employee)
      employees.value.push(employee)
      cache.invalidate('employee:')
    } catch (e) {
      logger.error('AdminStore', 'Failed to create employee', e)
    }
  }

  async function updateEmployee(id: string, updates: Partial<Employee>): Promise<void> {
    let backup: Employee | null = null
    try {
      const idx = employees.value.findIndex((e) => e.employee_id === id)
      if (idx !== -1) {
        backup = { ...employees.value[idx] }
        Object.assign(employees.value[idx], updates)
      }
      await updateEmployeeSvc(id, updates)
      cache.invalidate('employee:')
    } catch (e) {
      if (backup) {
        const idx = employees.value.findIndex((e) => e.employee_id === id)
        if (idx !== -1) Object.assign(employees.value[idx], backup)
      }
      logger.error('AdminStore', 'Failed to update employee', e)
    }
  }

  async function deleteEmployee(id: string): Promise<void> {
    try {
      await deleteEmployeeSvc(id)
      employees.value = employees.value.filter((e) => e.employee_id !== id)
      cache.invalidate('employee:')
    } catch (e) {
      logger.error('AdminStore', 'Failed to delete employee', e)
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
})

