<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import type {
  TaskType,
  TaskStatus,
  Priority,
  DelegationTask,
  ChecklistItem,
  FMSTask,
  Task,
} from '../../types'
import { formatTime, formatDateShortNoYear } from '../../utils/formatters'
import { useTaskStore } from '../../stores/taskStore'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import OptChip from '../../components/common/OptChip.vue'
import PendingSyncChip from '../../components/common/PendingSyncChip.vue'
import OptSkeleton from '../../components/common/OptSkeleton.vue'

const router = useRouter()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)
const empId = computed(() => currentEmployee.value?.employee_id ?? '')

type TabType = 'delegation' | 'checklist' | 'fms'
const activeTab = ref<TabType>('delegation')
const loading = ref(true)
const { immediate: searchInput, debounced: searchQuery, clear: clearSearch } = useDebouncedSearch(300)
const showFilterSheet = ref(false)
const selectedStatuses = ref<TaskStatus[]>([])
const selectedPriority = ref<Priority | ''>('')
const sortBy = ref<'due_date' | 'priority' | 'last_activity'>('due_date')
const sortDir = ref<'asc' | 'desc'>('asc')

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Completed', value: 'completed' },
]

const delegations = ref<DelegationTask[]>([])
const checklists = ref<ChecklistItem[]>([])
const fmsTasks = ref<FMSTask[]>([])

const tabCounts = computed(() => ({
  delegation: delegations.value.filter((d) => d.status !== 'completed').length,
  checklist: checklists.value.filter((c) => c.status !== 'completed').length,
  fms: fmsTasks.value.filter((f) => f.status !== 'completed').length,
}))

const activeList = computed(() => {
  switch (activeTab.value) {
    case 'delegation':
      return delegations.value
    case 'checklist':
      return checklists.value
    case 'fms':
    default:
      return fmsTasks.value
  }
})

const filteredTasks = computed(() => {
  let list = [...activeList.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((t) => t.title.toLowerCase().includes(q))
  }
  if (selectedStatuses.value.length > 0) {
    list = list.filter((t) => selectedStatuses.value.includes(t.status))
  }
  if (selectedPriority.value) {
    list = list.filter(
      (t) => 'priority' in t && (t as DelegationTask).priority === selectedPriority.value,
    )
  }
  list.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'due_date') {
      const da = 'due_date' in a ? new Date(a.due_date).getTime() : 0
      const db = 'due_date' in b ? new Date(b.due_date).getTime() : 0
      cmp = da - db
    } else if (sortBy.value === 'priority') {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      const pa = 'priority' in a ? order[(a as DelegationTask).priority] || 99 : 99
      const pb = 'priority' in b ? order[(b as DelegationTask).priority] || 99 : 99
      cmp = pa - pb
    } else if (sortBy.value === 'last_activity') {
      const la = 'last_activity' in a ? new Date((a as DelegationTask).last_activity).getTime() : 0
      const lb = 'last_activity' in b ? new Date((b as DelegationTask).last_activity).getTime() : 0
      cmp = lb - la
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedStatuses.value.length > 0) count++
  if (selectedPriority.value) count++
  return count
})

function toggleStatus(status: TaskStatus) {
  const idx = selectedStatuses.value.indexOf(status)
  if (idx >= 0) selectedStatuses.value.splice(idx, 1)
  else selectedStatuses.value.push(status)
}

function clearFilters() {
  selectedStatuses.value = []
  selectedPriority.value = ''
}

function removeFilter(type: string) {
  if (type === 'status') selectedStatuses.value = []
  if (type === 'priority') selectedPriority.value = ''
}

function toggleSortDir() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const _today = new Date()
function isOverdue(dueDate: string) {
  const d = new Date(dueDate)
  return d < _today && d.toDateString() !== _today.toDateString()
}

function getPriorityColor(p: string) {
  const map: Record<string, string> = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-info-600/10 text-info-600',
    high: 'bg-warning-50 text-warning-500',
    critical: 'bg-danger-50 text-danger-600',
  }
  return map[p] || 'bg-neutral-100 text-neutral-600'
}

function getStatusVariant(s: string) {
  const map: Record<string, any> = {
    pending: 'pending' as const,
    in_progress: 'in-progress' as const,
    blocked: 'blocked' as const,
    escalated: 'escalated' as const,
    completed: 'completed' as const,
    reviewed: 'reviewed' as const,
  }
  return map[s] || ('default' as const)
}

function getEmployeeName(id: string) {
  const allEmployees = (store as any).user.employee ? [store.user.employee] : []
  return allEmployees.find((e: any) => e.employee_id === id)?.name || id
}

async function handleMarkDone(item: ChecklistItem) {
  completing.value.add(item.id)
  await new Promise((r) => setTimeout(r, 400))
  item.status = 'completed'
  item.completed_on = new Date().toISOString()
  store.addToast({ type: 'success', message: `${item.title} marked done`, duration: 3000 })
  await new Promise((r) => setTimeout(r, 1100))
  completing.value.delete(item.id)
}

function formatDueDate(dueDate: string) {
  const d = new Date(dueDate)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return `Today ${formatTime(d)}`
  if (d < now) return `${Math.ceil((now.getTime() - d.getTime()) / 86400000)}d overdue`
  return formatDateShortNoYear(d)
}

const taskStore = useTaskStore()
const error = ref('')
const completing = ref(new Set<string>())
const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

const {
  paginated: paginatedTasks,
  totalPages: tasksTotalPages,
  currentPage: tasksCurrentPage,
  totalItems: tasksTotalItems,
  goTo: tasksGoTo,
} = usePagination(filteredTasks, 20)

watch(filteredTasks, () => tasksGoTo(1))

async function fetchMyTasks() {
  error.value = ''
  loading.value = true
  startTimeout()
  try {
    await taskStore.fetchTasks()
    if (timedOut.value) throw new Error('Request timed out')
    delegations.value = [
      ...taskStore.delegationTasks.filter((d) => d.assigned_to === empId.value),
    ]
    checklists.value = [...taskStore.checklistTasks.filter((c) => c.assigned_to === empId.value)]
    fmsTasks.value = [...taskStore.fmsTasks.filter((f) => f.assigned_to === empId.value)]
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : 'Could not load tasks. Please try again.'
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchMyTasks)
</script>

<template>
  <div class="flex items-center justify-between mb-4">
      <h1 class="text-h1 text-neutral-900">My Tasks</h1>
      <button
        class="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-fab hover:bg-brand-700 transition-all min-h-touch min-w-touch"
        @click="router.push('/doer/tasks/create')"
      >
        <PlusIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="flex bg-neutral-100 rounded-lg p-0.5 mb-4">
      <button
        v-for="tab in ['delegation', 'checklist', 'fms'] as const"
        :key="tab"
        class="flex-1 h-10 rounded-md text-caption font-semibold transition-all min-h-touch flex items-center justify-center gap-1.5"
        :class="
          activeTab === tab
            ? 'bg-white shadow-sm text-neutral-900'
            : 'text-neutral-500 hover:text-neutral-700'
        "
        @click="activeTab = tab"
      >
        <span class="capitalize">{{ tab }}</span>
        <span
          class="h-5 min-w-[20px] px-1.5 rounded-full text-overline flex items-center justify-center"
          :class="activeTab === tab ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-500'"
        >
          {{ tabCounts[tab] }}
        </span>
      </button>
    </div>

    <div class="flex items-center gap-2 mb-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
        />
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search tasks..."
          aria-label="Search tasks"
          class="w-full h-10 pl-9 pr-3 text-body bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-neutral-400"
        />
      </div>
      <button
        class="h-10 w-10 flex items-center justify-center rounded-lg border min-h-touch min-w-touch relative"
        :class="
          activeFiltersCount > 0
            ? 'border-brand-600 bg-brand-50 text-brand-600'
            : 'border-neutral-300 text-neutral-500 hover:text-neutral-700'
        "
        @click="showFilterSheet = true"
        aria-label="Filters"
      >
        <FunnelIcon class="w-4 h-4" />
        <span
          v-if="activeFiltersCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-overline rounded-full flex items-center justify-center"
          >{{ activeFiltersCount }}</span
        >
      </button>
      <button
        class="h-10 w-10 md:w-auto md:px-3 flex items-center justify-center gap-1 rounded-lg border border-neutral-300 text-neutral-500 hover:text-neutral-700 min-h-touch"
        @click="toggleSortDir"
        aria-label="Toggle sort direction"
      >
        <span class="sr-only md:not-sr-only md:inline text-caption font-medium">{{
          sortBy === 'due_date' ? 'Due' : sortBy === 'priority' ? 'Priority' : 'Activity'
        }}</span>
        <ArrowUpIcon v-if="sortDir === 'asc'" class="w-3 h-3" />
        <ArrowDownIcon v-else class="w-3 h-3" />
      </button>
    </div>

    <div v-if="activeFiltersCount > 0" class="flex flex-wrap gap-2 mb-3">
      <OptChip
        v-if="selectedStatuses.length > 0"
        variant="default"
        removable
        @remove="removeFilter('status')"
      >
        {{ selectedStatuses.length }} status filter{{ selectedStatuses.length > 1 ? 's' : '' }}
      </OptChip>
      <OptChip
        v-if="selectedPriority"
        variant="default"
        removable
        @remove="removeFilter('priority')"
      >
        {{ selectedPriority }}
      </OptChip>
      <button class="text-caption text-brand-600 font-semibold min-h-touch" @click="clearFilters">
        Clear all
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="card p-8 text-center">
      <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
      <p class="text-body-strong text-neutral-900 mb-1">Failed to load tasks</p>
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchMyTasks"
      >
        <ArrowPathIcon class="h-4 w-4 inline mr-1" /> Retry
      </button>
    </div>

    <template v-else-if="loading">
      <div class="space-y-3">
        <div v-for="i in 4" :key="i" class="card p-4">
          <OptSkeleton variant="text" width="75%" :lines="1" />
          <div class="h-2" />
          <OptSkeleton variant="text" width="50%" :lines="1" />
        </div>
      </div>
    </template>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <ClipboardDocumentListIcon class="empty-state-icon" />
      <p class="empty-state-title">{{ $t('tasks.emptyState.noTasks', { tab: activeTab }) }}</p>
      <p class="empty-state-description">
        {{
          activeTab === 'delegation'
            ? $t('tasks.emptyState.tapToCreate')
            : activeTab === 'checklist'
              ? $t('tasks.emptyState.checklistAssigned')
              : $t('tasks.emptyState.noWorkflowItems')
        }}
      </p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="task in paginatedTasks"
        :key="task.id"
        :class="['card p-4 hover:shadow-card-hover transition-all active:scale-[0.99] relative overflow-hidden', completing.has((task as ChecklistItem).id) ? 'animate-fade-out-down' : '']"
        @click="router.push(`/doer/tasks/${task.id}`)"
      >
        <div v-if="activeTab === 'checklist'" class="absolute top-3 right-3">
          <button
            class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors min-h-touch min-w-touch"
            :class="
              completing.has((task as ChecklistItem).id)
                ? 'animate-check-pop bg-success-600 border-success-600 text-white'
                : (task as ChecklistItem).status === 'completed'
                  ? 'bg-success-600 border-success-600 text-white'
                  : 'border-neutral-300 hover:border-brand-600'
            "
            @click.stop="handleMarkDone(task as ChecklistItem)"
          >
            <CheckCircleSolid
              v-if="(task as ChecklistItem).status === 'completed' || completing.has((task as ChecklistItem).id)"
              class="w-4 h-4"
            />
          </button>
        </div>

        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-body-strong text-neutral-900 truncate">{{ task.title }}</p>
              <span
                v-if="'priority' in task"
                class="px-1.5 py-0.5 rounded text-overline shrink-0"
                :class="getPriorityColor((task as DelegationTask).priority)"
              >
                {{ (task as DelegationTask).priority }}
              </span>
              <PendingSyncChip entity-type="task" :entity-id="task.id" />
            </div>

            <template v-if="'workflow' in task">
              <p class="text-caption text-neutral-500">
                {{ (task as FMSTask).workflow }} · {{ (task as FMSTask).stage }}
              </p>
            </template>
            <template v-else-if="'frequency' in task">
              <p class="text-caption text-neutral-500">
                {{ (task as ChecklistItem).frequency }} ·
                {{ (task as ChecklistItem).worklist_item_id }}
              </p>
            </template>
            <template v-else>
              <p class="text-caption text-neutral-500">
                Assigned by {{ getEmployeeName((task as DelegationTask).assigned_by) }}
              </p>
            </template>

            <div class="flex items-center gap-2 mt-2">
              <span
                v-if="isOverdue(task.due_date) && task.status !== 'completed'"
                class="text-caption text-danger-600 font-semibold flex items-center gap-1"
              >
                <ExclamationTriangleIcon class="w-3 h-3" />
                {{ formatDueDate(task.due_date) }}
              </span>
              <span
                v-else-if="task.status !== 'completed'"
                class="text-caption text-neutral-500 flex items-center gap-1"
              >
                <ClockIcon class="w-3 h-3" />
                {{ formatDueDate(task.due_date) }}
              </span>
              <OptChip :variant="getStatusVariant(task.status)" size="sm">{{
                task.status.replace(/_/g, ' ')
              }}</OptChip>
              <span
                v-if="'reminder_count' in task && (task as DelegationTask).reminder_count > 0"
                class="text-caption text-warning-500 font-semibold"
              >
                {{ (task as DelegationTask).reminder_count }}
              </span>
            </div>
          </div>
          <ChevronRightIcon class="w-4 h-4 text-neutral-300 shrink-0 mt-1" />
        </div>
      </div>
    </div>

    <OptPagination
      :current-page="tasksCurrentPage"
      :total-pages="tasksTotalPages"
      :total-items="tasksTotalItems"
      :page-size="20"
      @page-change="tasksCurrentPage = $event"
    />

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div v-if="showFilterSheet" class="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-black/30" aria-hidden="true" @click="showFilterSheet = false" />
          <div
            class="relative w-full bg-white rounded-t-2xl max-h-[75vh] overflow-y-auto shadow-elevated"
          >
            <div
              class="sticky top-0 bg-white px-5 py-4 border-b border-neutral-100 flex items-center justify-between"
            >
              <h3 class="text-h3 text-neutral-900">Filters</h3>
              <button
                class="text-caption text-brand-600 font-semibold min-h-touch"
                @click="clearFilters"
              >
                Clear
              </button>
            </div>
            <div class="p-5 space-y-5">
              <div>
                <p class="text-body-strong text-neutral-700 mb-2">Status</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    class="px-3 py-1.5 rounded-full text-caption font-medium border transition-colors min-h-touch"
                    :class="
                      selectedStatuses.includes(opt.value)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-600'
                    "
                    @click="toggleStatus(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
              <div v-if="activeTab === 'delegation'">
                <p class="text-body-strong text-neutral-700 mb-2">Priority</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="p in ['low', 'medium', 'high', 'critical'] as const"
                    :key="p"
                    class="px-3 py-1.5 rounded-full text-caption font-medium border transition-colors min-h-touch capitalize"
                    :class="
                      selectedPriority === p
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-600'
                    "
                    @click="selectedPriority = selectedPriority === p ? '' : p"
                  >
                    {{ p }}
                  </button>
                </div>
              </div>
            </div>
            <div class="px-5 py-4 border-t border-neutral-100">
              <button
                class="w-full h-12 bg-brand-600 text-white rounded-lg text-button font-semibold hover:bg-brand-700 transition-colors min-h-touch"
                @click="showFilterSheet = false"
              >
                Apply Filters ({{ filteredTasks.length }} tasks)
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
</template>
