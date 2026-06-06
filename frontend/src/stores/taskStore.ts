
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DelegationTask, ChecklistItem, FMSTask, Task, TaskStatus, TaskType } from '../types'
import {
getAllTasks,  createTask as createTaskSvc,  updateTaskStatus as updateTaskStatusSvc,} from '../services'
import { useOfflineStore } from './offlineStore'
import { logger } from '../utils/logger'
export const useTaskStore = defineStore('tasks', () => {
const delegationTasks = ref<DelegationTask[]>([])
const checklistTasks = ref<ChecklistItem[]>([])
const fmsTasks = ref<FMSTask[]>([])
const loading = ref(false)
const error = ref('')
const pendingSync = ref<{ action: string; taskId: string; timestamp: number }[]>([])
const stale = ref(false)
const allTasks = computed<Task[]>(() => [
...delegationTasks.value,
...checklistTasks.value,
...fmsTasks.value,
])
const tasksByType = (type: TaskType) => {
switch (type) {
case 'delegation':
return delegationTasks
case 'checklist':
return checklistTasks
case 'fms':
return fmsTasks
}
}
function logSync(action: string, taskId: string) {
pendingSync.value.push({ action, taskId, timestamp: Date.now() })
}
async function fetchTasks(): Promise<void> {
loading.value = true
stale.value = false
try {
const { delegation, checklist, fms } = await getAllTasks()
delegationTasks.value = delegation
checklistTasks.value = checklist
fmsTasks.value = fms
} catch (e) {
logger.error('TaskStore', 'Failed to fetch tasks', e)
error.value = 'Failed to load tasks'
} finally {
loading.value = false
}
}
async function fetchIfStale(): Promise<void> {
if (stale.value) {
await fetchTasks()
}
}
async function createTask(task: Task): Promise<void> {
loading.value = true
stale.value = true
const list = tasksByType(task.type)
list.value.unshift(task as never)
logSync('create', task.id)
try {
const offlineStore = useOfflineStore()
if (offlineStore.isOnline) {
await createTaskSvc(task)
} else {
offlineStore.addToQueue({
entityType: 'task',
entityId: task.id,
action: 'create',
      payload: task }
    )
}
} catch (e) {
// Rollback: remove the optimistically-added task
const idx = list.value.findIndex((t) => (t as Task).id === task.id)
if (idx >= 0) list.value.splice(idx, 1)
error.value = 'Failed to create task'
logger.error('TaskStore', 'Failed to create task', e)
} finally {
loading.value = false
}
}
async function updateStatus(taskId: string, type: TaskType, status: TaskStatus): Promise<void> {
loading.value = true
error.value = ''
stale.value = true
const list = tasksByType(type)
const idx = list.value.findIndex((t) => (t as Task).id === taskId)
if (idx === -1) { loading.value = false;
return
}
const task = list.value[idx] as Task
const prevStatus = task.status
task.status = status
logSync('update_status', taskId)
try {
const offlineStore = useOfflineStore()
if (offlineStore.isOnline) {
await updateTaskStatusSvc(taskId, type, status)
} else {
offlineStore.addToQueue({
entityType: 'task',
      entityId: taskId,
      action: 'updateStatus',
      payload: { taskId, type, status },
})
}
if (status === 'completed' && 'completed_on' in task) {
;(task as ChecklistItem).completed_on = new Date().toISOString().split('T')[0]
}
} catch (e) {
// Rollback: revert to previous status
task.status = prevStatus
error.value = 'Failed to update status'
logger.error('TaskStore', 'Failed to update status', e)
} finally {
loading.value = false
}
}
async function markDone(taskId: string, type: TaskType): Promise<void> {
await updateStatus(taskId, type, 'completed')
}
const completedDelegationTasks = computed(() =>
delegationTasks.value.filter((t) => t.status === 'completed'),
)
const completedFMSTasks = computed(() =>
fmsTasks.value.filter((t) => t.status === 'completed'),
)
const reviewQueue = computed<Task[]>(() => [
...completedDelegationTasks.value,
...completedFMSTasks.value,
])
async function addComment(taskId: string, type: TaskType, comment: string): Promise<void> {
try {
await new Promise((r) => setTimeout(r, 300))
logSync('add_comment', taskId)
} catch (e) {
logger.error('TaskStore', 'Failed to add comment', e)
}
}
return {
delegationTasks,
checklistTasks,
fmsTasks,
loading,
error,
pendingSync,
stale,
allTasks,
fetchTasks,
fetchIfStale,
createTask,
updateStatus,
markDone,
addComment,
reviewQueue,
completedDelegationTasks,
completedFMSTasks,
}
})
