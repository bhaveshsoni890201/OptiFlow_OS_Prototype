
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RescueRecord } from '../types'
import {
getRescueRecords,  sendReminder as sendReminderSvc,  escalateRescue,  reassignRescue,  resolveRescue,} from '../services'
import { logger } from '../utils/logger'
export const useRescueStore = defineStore('rescue', () => {
const records = ref<RescueRecord[]>([])
const loading = ref(false)
const error = ref('')
const activeRecords = computed(() => records.value.filter((r) => !r.resolved_on))
const resolvedRecords = computed(() => records.value.filter((r) => r.resolved_on))
async function fetchRecords(): Promise<void> {
loading.value = true
error.value = ''
try {
records.value = await getRescueRecords()
} catch (e) {
error.value = 'Failed to load rescue records'
logger.error('RescueStore', 'Failed to load rescue records', e)
} finally {
loading.value = false
}
}
  async function sendReminder(id: string): Promise<void> {
    error.value = ''
    let backup: RescueRecord | null = null
    try {
      const r = records.value.find((r) => r.id === id)
      if (r) {
        backup = { ...r }
        r.reminder_count++
        r.last_activity = new Date().toISOString()
      }
      await sendReminderSvc(id)
    } catch (e) {
      if (backup) {
        const r = records.value.find((rec) => rec.id === id)
        if (r) Object.assign(r, backup)
      }
      error.value = 'Failed to send reminder'
      logger.error('RescueStore', 'Failed to send reminder', e)
    }
  }
  async function escalate(id: string): Promise<void> {
    error.value = ''
    let backup: RescueRecord | null = null
    try {
      const r = records.value.find((r) => r.id === id)
      if (r) {
        backup = { ...r }
        const ladder: RescueRecord['severity'][] = ['soft', 'warning', 'high_risk', 'admin_escalation']
        const idx = ladder.indexOf(r.severity)
        if (idx < ladder.length - 1) r.severity = ladder[idx + 1]
        r.last_activity = new Date().toISOString()
      }
      await escalateRescue(id)
    } catch (e) {
      if (backup) {
        const r = records.value.find((rec) => rec.id === id)
        if (r) Object.assign(r, backup)
      }
      error.value = 'Failed to escalate'
      logger.error('RescueStore', 'Failed to escalate', e)
    }
  }
  async function reassign(id: string, newEmployeeId: string): Promise<void> {
    error.value = ''
    let backup: RescueRecord | null = null
    try {
      const r = records.value.find((r) => r.id === id)
      if (r) {
        backup = { ...r }
        r.employee_id = newEmployeeId
        r.reminder_count = 0
        r.severity = 'soft'
        r.last_activity = new Date().toISOString()
      }
      await reassignRescue(id, newEmployeeId)
    } catch (e) {
      if (backup) {
        const r = records.value.find((rec) => rec.id === id)
        if (r) Object.assign(r, backup)
      }
      error.value = 'Failed to reassign'
      logger.error('RescueStore', 'Failed to reassign', e)
    }
  }
  async function resolve(id: string): Promise<void> {
    error.value = ''
    let backup: RescueRecord | null = null
    try {
      const r = records.value.find((r) => r.id === id)
      if (r) {
        backup = { ...r }
        r.resolved_on = new Date().toISOString()
      }
      await resolveRescue(id)
    } catch (e) {
      if (backup) {
        const r = records.value.find((rec) => rec.id === id)
        if (r) Object.assign(r, backup)
      }
      error.value = 'Failed to resolve'
      logger.error('RescueStore', 'Failed to resolve', e)
    }
  }
async function generateFromOverdueTasks(): Promise<void> {
try {
const { useTaskStore } = await import('./taskStore')
const taskStore = useTaskStore()
    const overdue = [...taskStore.delegationTasks, ...taskStore.fmsTasks].filter(
      (t) => t.status !== 'completed' && new Date(t.due_date) < new Date())

for (const task of overdue) {
const exists = records.value.some((r) => r.task_id === task.id && !r.resolved_on)
if (!exists) {
        records.value.push({
          id: `RES-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          task_id: task.id,
          task_title: (task as any).title || (task as any).action_required || '',
          task_type: task.type,
          employee_id: task.assigned_to,
          employee_name: '',
          delay_days: Math.ceil((Date.now() - new Date(task.due_date).getTime()) / 86400000),
          priority: 'priority' in task ? (task as any).priority : 'medium',
          last_activity: (task as any).last_activity || task.due_date,
          reminder_count: 0,
          severity: 'soft',
          carry_forward_risk: false,
          created_on: new Date().toISOString()
        })
}
}
} catch (e) {
logger.error('RescueStore', 'Failed to generate from overdue tasks', e)
}
}
return {
records,
activeRecords,
resolvedRecords,
loading,
error,
fetchRecords,
sendReminder,
escalate,
reassign,
resolve,
generateFromOverdueTasks,
}
})
