import type { Department } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class DepartmentService extends BaseService {
  protected entityName = 'Department'

  async getDepartments(): Promise<Department[]> {
    return this.fetchList<Department>(
      endpoints.departments.list,
      async () => {
        const { employees } = await import('../mock/employees')
        const deptMap = new Map<string, number>()
        employees.forEach((e: { department: string }) => {
          deptMap.set(e.department, (deptMap.get(e.department) || 0) + 1)
        })
        return Array.from(deptMap.entries()).map(([name, count], i) => ({
          id: `DEPT-${String(i + 1).padStart(3, '0')}`,
          name,
          head: '',
          employeeCount: count,
        }))
      },
      'department:list',
    )
  }

  async createDepartment(data: Partial<Department>): Promise<void> {
    await this.mutate('post', endpoints.departments.create, data, ['department:'])
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<void> {
    await this.mutate('put', endpoints.departments.update(id), data, ['department:'])
  }
}

const departmentService = new DepartmentService()

export const getDepartments = () => departmentService.getDepartments()
export const createDepartment = (data: Partial<Department>) => departmentService.createDepartment(data)
export const updateDepartment = (id: string, data: Partial<Department>) => departmentService.updateDepartment(id, data)
