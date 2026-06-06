<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { getEmployees } from '../../services'
import { getLeaveRequests } from '../../services/leaveService'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import type { LeaveRequest, LeaveStatus } from '../../types'
import { useWorkflowStore } from '../../stores/workflowStore'
import PendingSyncChip from '../../components/common/PendingSyncChip.vue'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { formatDateShort } from '../../utils/formatters'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const { t } = useI18n()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)
const empId = computed(() => currentEmployee.value?.employee_id ?? '')
const empName = computed(() => currentEmployee.value?.name ?? '')
const workflowStore = useWorkflowStore()

interface LeaveBalance {
  type: string
  total: number
  used: number
  remaining: number
  color: string
  bg: string
}

const balances = ref<LeaveBalance[]>([])
const buddies = ref<{ id: string; name: string; designation: string; dept: string }[]>([])

const myRequests = computed(() =>
  workflowStore.leaveRequests.filter((r) => r.employee_id === empId.value),
)

async function fetchBalances() {
  try {
    const leaveRequests = await getLeaveRequests()
    const used: Record<string, number> = {}
    leaveRequests.forEach((r) => {
      used[r.leave_type] = (used[r.leave_type] || 0) + r.total_days
    })
    const balanceDefs: { type: string; total: number; color: string; bg: string }[] = [
      { type: 'Casual Leave', total: 12, color: 'text-success-600', bg: 'bg-success-50' },
      { type: 'Sick Leave', total: 10, color: 'text-warning-500', bg: 'bg-warning-50' },
      { type: 'Earned Leave', total: 15, color: 'text-brand-700', bg: 'bg-brand-50' },
    ]
    balances.value = balanceDefs.map((b) => ({
      ...b,
      used: used[b.type] || 0,
      remaining: b.total - (used[b.type] || 0),
    }))
  } catch {
    balances.value = []
  }
}

async function fetchBuddies() {
  try {
    const employees = await getEmployees()
    buddies.value = employees
      .filter((e: any) => e.roles?.includes('doer') || e.designation)
      .map((e: any) => ({
        id: e.employee_id || e.id,
        name: e.name,
        designation: e.designation || e.role || '',
        dept: e.department || e.dept || '',
      }))
  } catch {
    buddies.value = []
  }
}

const loading = ref(false)
const error = ref('')
const showApplyForm = ref(false)
const formType = ref('Casual Leave')
const formStart = ref('')
const formEnd = ref('')
const formReason = ref('')
const formBuddy = ref('')
const formErrors = ref<Record<string, string>>({})
const formSubmitted = ref(false)
const buddySearch = ref('')
const showBuddyDropdown = ref(false)
const rejectDetail = ref<string | null>(null)

const filteredBuddies = computed(() =>
  buddies.value.filter(
    (b) =>
      b.name.toLowerCase().includes(buddySearch.value.toLowerCase()) ||
      b.designation.toLowerCase().includes(buddySearch.value.toLowerCase()),
  ),
)

const selectedBalance = computed(() => balances.value.find((b) => b.type === formType.value))

const formDays = computed(() => {
  if (!formStart.value || !formEnd.value) return 0
  const start = new Date(formStart.value + 'T00:00:00')
  const end = new Date(formEnd.value + 'T00:00:00')
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
})

const hasSufficientBalance = computed(() => {
  if (!selectedBalance.value) return true
  return selectedBalance.value.remaining >= formDays.value
})

const buddyName = computed(() => buddies.value.find((b) => b.id === formBuddy.value)?.name ?? '')

const leaveTypeTranslationKeys: Record<string, string> = {
  'Casual Leave': 'leave.leaveTypes.casual',
  'Sick Leave': 'leave.leaveTypes.sick',
  'Earned Leave': 'leave.leaveTypes.earned',
}

function leaveTypeLabel(type: string): string {
  return t(leaveTypeTranslationKeys[type] || type)
}

function handleBuddyBlur() {
  showBuddyDropdown.value = false
}

function openApplyForm() {
  showApplyForm.value = true
  formSubmitted.value = false
  formErrors.value = {}
  formType.value = 'Casual Leave'
  formStart.value = ''
  formEnd.value = ''
  formReason.value = ''
  formBuddy.value = ''
  buddySearch.value = ''
}

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

const {
  paginated: paginatedRequests,
  totalPages: requestsTotalPages,
  currentPage: requestsCurrentPage,
  totalItems: requestsTotalItems,
  goTo: requestsGoTo,
} = usePagination(myRequests, 20)

watch(myRequests, () => requestsGoTo(1))

async function fetchLeave() {
  loading.value = true
  error.value = ''
  startTimeout()
  try {
    await workflowStore.fetchLeaveRequests()
    if (timedOut.value) throw new Error('Request timed out')
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : t('leave.loadError')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(() => {
  fetchLeave()
  fetchBalances()
  fetchBuddies()
})

async function submitLeave() {
  formErrors.value = {}
  if (!formType.value) formErrors.value['type'] = t('leave.validation.selectLeaveType')
  if (!formStart.value) formErrors.value['start'] = t('leave.validation.selectStartDate')
  if (!formEnd.value) formErrors.value['end'] = t('leave.validation.selectEndDate')
  if (formStart.value && formEnd.value && formDays.value <= 0)
    formErrors.value['end'] = t('leave.validation.endAfterStart')
  if (!formReason.value) formErrors.value['reason'] = t('leave.validation.reasonRequired')
  if (!formBuddy.value) formErrors.value['buddy'] = t('leave.validation.selectBuddy')
  if (formDays.value > (selectedBalance.value?.remaining ?? 999))
    formErrors.value['balance'] = t('leave.validation.insufficientBalance')
  if (formDays.value > (selectedBalance.value?.remaining ?? 999)) return
  if (Object.keys(formErrors.value).length > 0) return
  await workflowStore.submitLeaveRequest({
    employee_id: currentEmployee.value?.employee_id ?? '',
    employee_name: currentEmployee.value?.name ?? '',
    leave_type: formType.value,
    start_date: formStart.value,
    end_date: formEnd.value,
    reason: formReason.value,
    buddy_id: formBuddy.value,
    buddy_name: buddies.value.find((b) => b.id === formBuddy.value)?.name || '',
  })
  formSubmitted.value = true
}

function closeForm() {
  showApplyForm.value = false
}

function statusBadgeClass(status: LeaveStatus): string {
  switch (status) {
    case 'approved':
      return 'bg-success-50 text-success-600'
    case 'rejected':
      return 'bg-danger-50 text-danger-600'
    case 'pending':
      return 'bg-warning-50 text-warning-500'
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
      <h1 class="text-h2 text-neutral-900">{{ $t('leave.title') }}</h1>
      <button
        class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors min-h-touch"
        @click="openApplyForm"
      >
        <CalendarDaysIcon class="h-4 w-4" />
        {{ $t('leave.applyForLeave') }}
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        v-for="b in balances"
        :key="b.type"
        class="bg-white rounded-lg shadow-card p-4 flex items-center justify-between"
      >
        <div>
          <p class="text-caption text-neutral-500">{{ leaveTypeLabel(b.type) }}</p>
          <p class="text-display mt-1" :class="b.color">{{ b.remaining }}</p>
          <p class="text-caption text-neutral-400">{{ $t('leave.usedOfTotal', { used: b.used, total: b.total }) }}</p>
        </div>
        <div
          class="h-10 w-10 rounded-full flex items-center justify-center text-caption font-bold"
          :class="b.bg + ' ' + b.color"
        >
          {{ Math.round((b.used / b.total) * 100) }}%
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-3 p-4" aria-live="polite">
      <OptSkeleton variant="rectangular" height="20px" />
      <OptSkeleton variant="rectangular" height="16px" />
      <OptSkeleton variant="rectangular" height="16px" />
      <OptSkeleton variant="rectangular" height="16px" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="card p-6 text-center" role="alert" aria-live="polite">
      <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
      <p class="text-body-strong text-neutral-900 mb-1">{{ $t('leave.failedToLoad') }}</p>
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchLeave"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <div v-else class="bg-white rounded-lg shadow-card">
      <div class="p-4 sm:p-6 border-b border-neutral-100">
        <h2 class="text-h3 text-neutral-900">{{ $t('leave.myRequests') }}</h2>
      </div>

      <OptEmptyState v-if="myRequests.length === 0" type="leave" :title="$t('leave.emptyState.noRequests')" :description="$t('leave.emptyState.tapToApply')" :action-label="$t('leave.applyLeave')" @action="showApplyForm = true" />

      <div v-else class="divide-y divide-neutral-100">
        <div
          v-for="req in paginatedRequests"
          :key="req.id"
          class="p-4 sm:p-5 hover:bg-neutral-50 transition-colors"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-body-strong text-neutral-900">{{ leaveTypeLabel(req.leave_type) }}</span>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold"
                  :class="statusBadgeClass(req.status)"
                >
                  {{ $t('leave.statusDisplay.' + req.status) }}
                </span>
                <PendingSyncChip entity-type="leave" :entity-id="req.id" />
              </div>
              <p class="text-caption text-neutral-500">
                {{
                  formatDateShort(req.start_date)
                }}
                <template v-if="req.start_date !== req.end_date">
                  —
                  {{
                    formatDateShort(req.end_date)
                  }}
                </template>
                <span class="ml-1"
                  >· {{ req.total_days }} {{ $t('leave.' + (req.total_days === 1 ? 'day' : 'days')) }}</span
                >
              </p>
              <p class="text-caption text-neutral-400 mt-0.5">
                {{ $t('leave.buddy', { name: req.buddy_name }) }}
                <span v-if="req.rejection_reason" class="block text-danger-600 mt-1"
                  >{{ $t('leave.form.reason') }}: {{ req.rejection_reason }}</span
                >
              </p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                v-if="req.status === 'approved'"
                class="text-caption text-success-600 font-semibold whitespace-nowrap"
                >{{ $t('leave.tasksTransferred') }}</span
              >
              <button
                v-if="req.status === 'rejected' && req.rejection_reason"
                class="text-caption text-brand-600 font-semibold whitespace-nowrap hover:text-brand-700"
                @click="rejectDetail = req.id"
              >
                {{ $t('leave.viewReason') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <OptPagination
        :current-page="requestsCurrentPage"
        :total-pages="requestsTotalPages"
        :total-items="requestsTotalItems"
        :page-size="20"
        @page-change="requestsCurrentPage = $event"
      />
    </div>

    <teleport to="body">
      <div
        v-if="showApplyForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
        aria-hidden="true"
      >
        <div
          class="bg-white w-full sm:max-w-lg rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
          role="dialog" aria-modal="true" aria-label="Apply for Leave"
        >
          <div class="flex items-center justify-between p-4 border-b border-neutral-100">
            <h2 class="text-h3 text-neutral-900">{{ $t('leave.applyForLeave') }}</h2>
            <button class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400" @click="closeForm" aria-label="Close">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div v-if="formSubmitted" class="p-6 text-center">
            <CheckCircleSolid class="h-12 w-12 text-success-600 mx-auto mb-3" />
            <p class="text-body-strong text-neutral-900 mb-1">{{ $t('leave.leaveRequested') }}</p>
            <p class="text-body text-neutral-500 mb-4">
              {{ $t('leave.pendingMessage', { name: buddyName }) }}
            </p>
            <button
              class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700"
              @click="closeForm"
            >
              {{ $t('common.done') }}
            </button>
          </div>

          <form v-else class="p-4 space-y-4" @submit.prevent="submitLeave">
            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1">{{ $t('leave.form.leaveType') }}</label>
              <select
                v-model="formType"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                :class="formErrors['type'] ? 'border-danger-500' : ''"
                :id="'input-type'"
                :aria-describedby="formErrors['type'] ? 'error-type' : undefined"
              >
                <option value="Casual Leave">{{ $t('leave.leaveTypes.casual') }}</option>
                <option value="Sick Leave">{{ $t('leave.leaveTypes.sick') }}</option>
                <option value="Earned Leave">{{ $t('leave.leaveTypes.earned') }}</option>
              </select>
              <p v-if="formErrors['type']" class="text-caption text-danger-600 mt-1" :id="'error-type'">
                {{ formErrors['type'] }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-caption font-semibold text-neutral-700 mb-1"
                  >{{ $t('leave.form.startDate') }}</label
                >
                <input
                  v-model="formStart"
                  type="date"
                  class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  :class="formErrors['start'] ? 'border-danger-500' : ''"
                  :id="'input-start'"
                  :aria-describedby="formErrors['start'] ? 'error-start' : undefined"
                />
                <p v-if="formErrors['start']" class="text-caption text-danger-600 mt-1" :id="'error-start'">
                  {{ formErrors['start'] }}
                </p>
              </div>
              <div>
                <label class="block text-caption font-semibold text-neutral-700 mb-1">{{ $t('leave.form.endDate') }}</label>
                <input
                  v-model="formEnd"
                  type="date"
                  class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  :class="formErrors['end'] ? 'border-danger-500' : ''"
                  :id="'input-end'"
                  :aria-describedby="formErrors['end'] ? 'error-end' : undefined"
                />
                <p v-if="formErrors['end']" class="text-caption text-danger-600 mt-1" :id="'error-end'">
                  {{ formErrors['end'] }}
                </p>
              </div>
            </div>

            <div
              v-if="formStart && formEnd && formDays > 0"
              class="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50 text-caption"
            >
              <span class="text-neutral-500">{{ $t('leave.form.totalDays') }}</span>
              <span class="font-semibold text-neutral-900">{{ formDays }}</span>
            </div>

            <div
              v-if="selectedBalance && formDays > selectedBalance.remaining"
              class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger-50 text-caption text-danger-600"
            >
              <ExclamationTriangleIcon class="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span
                >{{ $t('leave.form.insufficientBalance', { type: selectedBalance.type, remaining: selectedBalance.remaining }) }}</span
              >
            </div>

            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('leave.form.reason') }} <span class="text-danger-500">*</span></label
              >
              <textarea
                v-model="formReason"
                rows="3"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none resize-none"
                :class="formErrors['reason'] ? 'border-danger-500' : ''"
                :placeholder="$t('leave.form.reasonPlaceholder')"
                :id="'input-reason'"
                :aria-describedby="formErrors['reason'] ? 'error-reason' : undefined"
              />
              <p v-if="formErrors['reason']" class="text-caption text-danger-600 mt-1" :id="'error-reason'">
                {{ formErrors['reason'] }}
              </p>
            </div>

            <div class="relative">
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('leave.form.buddy') }} <span class="text-danger-500">*</span></label
              >
              <div class="relative">
                <MagnifyingGlassIcon
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                />
                <input
                  v-model="buddySearch"
                  type="text"
                  :placeholder="$t('leave.form.searchByName')"
                  class="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  :class="formErrors['buddy'] ? 'border-danger-500' : ''"
                  @focus="showBuddyDropdown = true"
                  @blur="handleBuddyBlur"
                  :id="'input-buddy'"
                  :aria-describedby="formErrors['buddy'] ? 'error-buddy' : undefined"
                />
              </div>
              <div
                v-if="showBuddyDropdown && filteredBuddies.length > 0"
                class="absolute z-10 top-full mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-elevated max-h-48 overflow-y-auto"
              >
                <button
                  v-for="b in filteredBuddies"
                  :key="b.id"
                  type="button"
                  class="w-full text-left px-3 py-2.5 hover:bg-neutral-50 text-body text-neutral-700 flex items-center gap-2"
                  @mousedown.prevent="formBuddy = b.id; buddySearch = b.name; showBuddyDropdown = false"
                >
                  <UserIcon class="h-4 w-4 text-neutral-400" />
                  <div>
                    <span class="font-medium">{{ b.name }}</span>
                    <span class="text-caption text-neutral-400 ml-1"
                      >· {{ b.designation }}, {{ b.dept }}</span
                    >
                  </div>
                </button>
              </div>
              <div
                v-if="formBuddy && !showBuddyDropdown"
                class="flex items-center gap-1.5 mt-1.5 text-caption text-neutral-500"
              >
                <CheckCircleSolid class="h-3.5 w-3.5 text-success-600" />
                {{ $t('leave.form.selected', { name: buddyName }) }}
              </div>
              <p v-if="formErrors['buddy']" class="text-caption text-danger-600 mt-1" :id="'error-buddy'">
                {{ formErrors['buddy'] }}
              </p>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
            >
              {{ $t('leave.form.submit') }}
            </button>
          </form>
        </div>
      </div>
    </teleport>
</template>
