<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { getTrainingAssignments } from '../../services'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid, PlayIcon } from '@heroicons/vue/24/solid'
import type { TrainingAssignment, TrainingStatus } from '../../types'
import OptTrainingViewer from '../../components/training/OptTrainingViewer.vue'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { formatDateShort, formatDateTime } from '../../utils/formatters'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const { t } = useI18n()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)
const empId = computed(() => currentEmployee.value?.employee_id ?? '')
const error = ref('')
const loading = ref(true)

onMounted(fetchTrainings)

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

const allTrainings = ref<TrainingAssignment[]>([])

async function fetchTrainings() {
  loading.value = true
  error.value = ''
  startTimeout()
  try {
    const result = await getTrainingAssignments()
    if (timedOut.value) throw new Error('Request timed out')
    allTrainings.value = result
  } catch (e: any) {
    error.value = timedOut.value ? 'Request timed out' : (e.message || t('training.loadError'))
  } finally {
    clearLoadTimeout()
    loading.value = false
  }
}

const activeFilter = ref<'all' | 'not_started' | 'in_progress' | 'completed' | 'overdue'>('all')
const selectedTraining = ref<TrainingAssignment | null>(null)
const showDetail = ref(false)
const completionChecked = ref(false)
const contentLoaded = ref(false)

const now = ref(new Date())

const filterKeys = ['all', 'not_started', 'in_progress', 'completed', 'overdue'] as const

function isOverdue(t: TrainingAssignment): boolean {
  return t.status !== 'completed' && new Date(t.deadline + 'T23:59:59') < now.value
}

const filteredTrainings = computed(() => {
  const list = allTrainings.value
  if (activeFilter.value === 'overdue') return list.filter((t) => isOverdue(t))
  if (activeFilter.value === 'not_started')
    return list.filter((t) => t.status === 'not_started')
  return list.filter((t) => {
    if (t.status === 'completed') return activeFilter.value === 'completed'
    if (isOverdue(t)) return false
    return activeFilter.value === 'all' || t.status === activeFilter.value
  })
})

function setFilter(key: typeof activeFilter.value) {
  activeFilter.value = key
}

function openDetail(t: TrainingAssignment) {
  selectedTraining.value = t
  showDetail.value = true
  completionChecked.value = false
  contentLoaded.value = false
}

function closeDetail() {
  showDetail.value = false
  selectedTraining.value = null
}

function updateStatus(status: TrainingStatus) {
  if (!selectedTraining.value) return
  selectedTraining.value = { ...selectedTraining.value, status }
  const idx = allTrainings.value.findIndex((t) => t.id === selectedTraining.value!.id)
  if (idx !== -1) allTrainings.value[idx] = { ...selectedTraining.value }
}

function markCompleteWithCheck() {
  if (!completionChecked.value || !contentLoaded.value) return
  updateStatus('completed')
}

function typeIcon(type: string) {
  switch (type) {
    case 'sop':
      return DocumentTextIcon
    case 'video':
      return VideoCameraIcon
    case 'guide':
      return BookOpenIcon
    default:
      return DocumentTextIcon
  }
}

function typeLabel(type: string): string {
  return t('training.types.' + type)
}

function statusBadgeClass(status: TrainingStatus, overdue: boolean): string {
  if (overdue) return 'bg-danger-50 text-danger-600'
  switch (status) {
    case 'completed':
      return 'bg-success-50 text-success-600'
    case 'in_progress':
      return 'bg-brand-50 text-brand-700'
    case 'not_started':
      return 'bg-neutral-100 text-neutral-600'
  }
}

function statusLabel(status: TrainingStatus, overdue: boolean): string {
  if (overdue) return t('training.statusLabels.overdue')
  switch (status) {
    case 'completed':
      return t('training.statusLabels.completed')
    case 'in_progress':
      return t('training.statusLabels.inProgress')
    case 'not_started':
      return t('training.statusLabels.notStarted')
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
      <h1 class="text-h2 text-neutral-900">{{ $t('training.title') }}</h1>
     </div>

     <!-- Loading state -->
     <div v-if="loading" class="space-y-4" aria-live="polite">
       <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
         <OptSkeleton variant="rectangular" height="160px" />
         <OptSkeleton variant="rectangular" height="160px" />
         <OptSkeleton variant="rectangular" height="160px" />
       </div>
     </div>

     <!-- Error state -->
     <div v-else-if="error" class="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3" role="alert" aria-live="polite">
       <ExclamationTriangleIcon class="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
       <p class="text-body text-danger-700 flex-1">{{ error }}</p>
       <div class="flex items-center gap-2 shrink-0">
         <button
           class="px-3 py-1.5 bg-danger-600 text-white rounded-lg text-caption font-semibold hover:bg-danger-700 transition-colors"
           @click="fetchTrainings"
         >
           {{ $t('common.retry') }}
         </button>
         <button
           class="text-danger-500 hover:text-danger-700 min-h-touch min-w-touch"
           @click="error = ''"
           aria-label="Dismiss error"
         >
           <XMarkIcon class="w-4 h-4" />
         </button>
       </div>
     </div>

<!-- Content area (not loading, not error) -->
     <div v-else>
       <!-- Filter bar -->
       <div class="flex overflow-x-auto gap-1 sm:gap-2 -mx-4 sm:mx-0 px-4 sm:px-0 pb-1 scrollbar-none">
         <button
           v-for="f in filterKeys"
           :key="f"
           class="flex-shrink-0 px-3.5 py-2 rounded-lg text-button transition-colors whitespace-nowrap"
           :class="
             activeFilter === f
               ? 'bg-brand-600 text-white'
               : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
           "
           @click="setFilter(f)"
         >
           {{ $t('training.filters.' + f) }}
         </button>
       </div>

       <OptEmptyState
          v-if="filteredTrainings.length === 0"
          type="training"
          :title="$t('training.emptyState.noTraining')"
          :description="$t('training.emptyState.allCaughtUp')"
          :action-label="$t('training.viewAll')"
          @action="activeFilter = 'all'"
        />

       <!-- List view -->
       <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div
        v-for="t in filteredTrainings"
        :key="t.id"
        class="bg-white rounded-lg shadow-card p-4 cursor-pointer transition-all hover:shadow-card-hover active:scale-[0.98]"
        @click="openDetail(t)"
      >
        <div class="flex items-start justify-between mb-3">
          <span
            class="inline-flex items-center justify-center h-9 w-9 rounded-lg"
            :class="
              t.type === 'sop'
                ? 'bg-brand-50 text-brand-700'
                : t.type === 'video'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-amber-50 text-amber-600'
            "
          >
            <component :is="typeIcon(t.type)" class="h-5 w-5" />
          </span>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold"
            :class="statusBadgeClass(t.status, isOverdue(t))"
          >
            {{ statusLabel(t.status, isOverdue(t)) }}
          </span>
        </div>

        <h3 class="text-body-strong text-neutral-900 mb-1.5 line-clamp-2">{{ t.title }}</h3>

        <div class="space-y-1 text-caption text-neutral-500">
          <div class="flex items-center gap-1.5">
            <component :is="typeIcon(t.type)" class="h-3.5 w-3.5" />
            {{ typeLabel(t.type) }} ·
            {{ t.source === 'standalone' ? $t('training.types.standalone') : $t('training.types.fromWorklist') }}
          </div>
          <div class="flex items-center gap-1.5">
            <CalendarDaysIcon class="h-3.5 w-3.5" />
            {{ $t('training.due') }}
            {{
              formatDateShort(t.deadline)
            }}
          </div>
        </div>
      </div>
</div>
     </div>

     <teleport to="body">
      <div
        v-if="showDetail && selectedTraining"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
        aria-hidden="true"
      >
        <div
          class="bg-white w-full sm:max-w-2xl rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
          role="dialog"
          aria-modal="true"
          aria-label="Training detail"
        >
          <div
            class="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-neutral-100"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="inline-flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0"
                :class="
                  selectedTraining.type === 'sop'
                    ? 'bg-brand-50 text-brand-700'
                    : selectedTraining.type === 'video'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-amber-50 text-amber-600'
                "
              >
                <component :is="typeIcon(selectedTraining.type)" class="h-4 w-4" />
              </span>
              <h2 class="text-h3 text-neutral-900 truncate">{{ selectedTraining.title }}</h2>
            </div>
            <button
              class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 flex-shrink-0"
              aria-label="Close"
              @click="closeDetail"
            >
              <XCircleIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="p-4 sm:p-6 space-y-4">
            <div
              v-if="isOverdue(selectedTraining)"
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger-50 text-caption text-danger-600"
            >
              <ExclamationTriangleIcon class="h-4 w-4 flex-shrink-0" />
              <span>{{ $t('training.overdueMessage') }}</span>
            </div>

            <div class="flex items-center gap-3 text-caption text-neutral-500">
              <span class="flex items-center gap-1"
                ><component :is="typeIcon(selectedTraining.type)" class="h-3.5 w-3.5" />
                {{ typeLabel(selectedTraining.type) }}</span
              >
              <span class="flex items-center gap-1"
                ><CalendarDaysIcon class="h-3.5 w-3.5" />
                {{ $t('training.deadline', { date: formatDateShort(selectedTraining.deadline) }) }}</span
              >
            </div>

            <div
              class="rounded-lg bg-neutral-50 border border-neutral-200 p-4 sm:p-6 min-h-[200px]"
            >
              <OptTrainingViewer
                :content-id="selectedTraining.training_content_id"
                :content-type="selectedTraining.type"
                @loaded="contentLoaded = true"
                @error="contentLoaded = false"
              />
            </div>

            <div
              v-if="selectedTraining.source === 'worklist' && selectedTraining.worklist_item_id"
              class="flex items-center gap-1.5 text-caption text-brand-600"
            >
              <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" />
              <span class="font-semibold"
                >{{ $t('training.relatedToWorklist', { id: selectedTraining.worklist_item_id }) }}</span
              >
            </div>

            <p class="text-body text-neutral-600">
              {{ $t('training.description') }}
            </p>

            <div
              v-if="selectedTraining.status !== 'completed'"
              class="space-y-3 pt-3 border-t border-neutral-100"
            >
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="selectedTraining.status === 'not_started'"
                  class="flex-1 sm:flex-none px-4 py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5 min-h-touch"
                  @click="updateStatus('in_progress')"
                >
                  <PlayIcon class="h-4 w-4" /> {{ $t('training.startTraining') }}
                </button>
                <button
                  v-if="selectedTraining.status === 'in_progress'"
                  class="flex-1 sm:flex-none px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg text-button hover:bg-neutral-50 transition-colors min-h-touch"
                  @click="updateStatus('not_started')"
                >
                  {{ $t('training.markNotStarted') }}
                </button>
              </div>

              <label
                class="flex items-start gap-2.5 px-3 py-3 rounded-lg cursor-pointer"
                :class="contentLoaded ? 'bg-neutral-50' : 'bg-neutral-100 opacity-60'"
              >
                <input
                  v-model="completionChecked"
                  type="checkbox"
                  :disabled="!contentLoaded"
                  class="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
                />
                <div>
                  <span class="text-body-strong text-neutral-900"
                    >{{ $t('training.readUnderstood') }}</span
                  >
                  <p class="text-caption text-neutral-500">
                    <template v-if="contentLoaded">
                      {{ $t('training.confirmReview') }}
                    </template>
                    <template v-else>
                      {{ $t('training.contentRequired') }}
                    </template>
                  </p>
                </div>
              </label>

              <button
                :disabled="!completionChecked || !contentLoaded"
                class="w-full py-2.5 rounded-lg text-button transition-colors"
                :class="
                  completionChecked && contentLoaded
                    ? 'bg-success-600 text-white hover:bg-success-700'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                "
                @click="markCompleteWithCheck"
              >
                {{ $t('training.markComplete') }}
              </button>
            </div>

            <div
              v-else
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-success-50 text-caption text-success-600"
            >
              <CheckCircleSolid class="h-4 w-4" />
              <span
                >{{ $t('training.completedOn', { date: selectedTraining.completed_on ? formatDateTime(selectedTraining.completed_on) : '--' }) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </teleport>
</template>
