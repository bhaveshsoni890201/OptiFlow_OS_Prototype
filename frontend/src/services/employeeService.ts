import type { Employee } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class EmployeeService extends BaseService {
  protected entityName = 'Employee'

  async getEmployees(): Promise<Employee[]> {
    return this.fetchList<Employee>(
      endpoints.employees.list,
      async () => {
        const { employees } = await import('../mock/employees')
        return employees
      },
      'employee:list',
    )
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.fetchOne<Employee>(
      endpoints.employees.detail(id),
      async () => {
        const { employees } = await import('../mock/employees')
        return employees.find((e) => e.employee_id === id)
      },
      `employee:${id}`,
      60_000,
    )
  }

  async createEmployee(employee: Employee): Promise<void> {
    await this.mutate('post', endpoints.employees.create, employee, ['employee:'])
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<void> {
    await this.mutate('put', endpoints.employees.update(id), data, ['employee:', `employee:${id}`])
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.mutate('delete', endpoints.employees.delete(id), undefined, ['employee:', `employee:${id}`])
  }
}

const employeeService = new EmployeeService()

export const getEmployees = () => employeeService.getEmployees()
export const getEmployee = (id: string) => employeeService.getEmployee(id)
export const createEmployee = (employee: Employee) => employeeService.createEmployee(employee)
export const updateEmployee = (id: string, data: Partial<Employee>) => employeeService.updateEmployee(id, data)
export const deleteEmployee = (id: string) => employeeService.deleteEmployee(id)
