<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { useTicketStore } from '../../stores/ticketStore'
import { createHelpTicket } from '../../services'
import {
  PlusIcon,
  XMarkIcon,
  ChevronRightIcon,
  PaperClipIcon,
  ClockIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
} from '@heroicons/vue/24/outline'
import {
  CheckCircleIcon as CheckCircleSolid,
  ExclamationTriangleIcon,
  XCircleIcon as XCircleSolid,
} from '@heroicons/vue/24/solid'
import type { HelpTicket, TicketStatus, Priority } from '../../types'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { formatDateShort, formatDateTime } from '../../utils/formatters'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const { t } = useI18n()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)
const empId = computed(() => currentEmployee.value?.employee_id ?? '')
const empName = computed(() => currentEmployee.value?.name ?? '')

const ticketStore = useTicketStore()
const loading = ref(true)

async function retry() {
  error.value = ''
  loading.value = true
  await nextTick()
  await ticketStore.fetchTickets()
  loading.value = false
}

onMounted(async () => {
  loading.value = true
  try {
    await ticketStore.fetchTickets()
  } catch {
    error.value = t('helpTickets.loadError')
  } finally {
    loading.value = false
  }
})

const showRaiseForm = ref(false)
const formCategory = ref('')
const formSubject = ref('')
const formDescription = ref('')
const formPriority = ref<Priority>('medium')
const formAttachments = ref<File[]>([])
const formErrors = ref<Record<string, string>>({})
const formSubmitted = ref(false)
const error = ref('')
const selectedTicket = ref<HelpTicket | null>(null)
const showDetail = ref(false)
const newComment = ref('')

const ticketList = computed(() => ticketStore.tickets)

const {
  paginated: paginatedTickets,
  totalPages: ticketsTotalPages,
  currentPage: ticketsCurrentPage,
  totalItems: ticketsTotalItems,
  goTo: ticketsGoTo,
} = usePagination(ticketList, 20)

watch(ticketList, () => ticketsGoTo(1))

const categories: string[] = ['Software Bug', 'Network Issue', 'Equipment', 'Training', 'HR', 'Other']

const categoryKeyMap: Record<string, string> = {
  'Software Bug': 'softwareBug',
  'Network Issue': 'networkIssue',
  'Equipment': 'equipment',
  'Training': 'training',
  'HR': 'hr',
  'Other': 'other'
}

function categoryDisplay(cat: string): string {
  const key = categoryKeyMap[cat]
  return key ? t('helpTickets.categoryOptions.' + key) : cat
}

function openRaiseForm() {
  showRaiseForm.value = true
  formSubmitted.value = false
  formErrors.value = {}
  formCategory.value = ''
  formSubject.value = ''
  formDescription.value = ''
  formPriority.value = 'medium'
  formAttachments.value = []
}

async function submitTicket() {
  formErrors.value = {}
  error.value = ''
  if (!formCategory.value) formErrors.value['category'] = t('helpTickets.validation.categoryRequired')
  if (!formSubject.value.trim()) {
    formErrors.value['subject'] = t('helpTickets.validation.subjectRequired')
  } else if (formSubject.value.trim().length < 3) {
    formErrors.value['subject'] = t('helpTickets.validation.subjectMinLength')
  } else if (formSubject.value.length > 200) {
    formErrors.value['subject'] = t('helpTickets.validation.subjectMaxLength')
  }
  if (!formDescription.value.trim()) formErrors.value['description'] = t('helpTickets.validation.descriptionRequired')
  if (Object.keys(formErrors.value).length > 0) return
  const newTicket: Partial<HelpTicket> = {
    id: `TKT-${Date.now()}`,
    category: formCategory.value,
    subject: formSubject.value.trim(),
    description: formDescription.value.trim(),
    priority: formPriority.value,
    raised_by: empId.value,
    status: 'open',
    comments: [],
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
  }
  try {
    await createHelpTicket(newTicket)
    await ticketStore.fetchTickets()
    const created = ticketStore.tickets.find((t) => t.id === newTicket.id)
    if (created) await ticketStore.autoAssignByCategory(created)
    formSubmitted.value = true
  } catch {
    error.value = t('helpTickets.loadError')
  }
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) formAttachments.value.push(...Array.from(input.files))
}

function removeAttachment(idx: number) {
  formAttachments.value.splice(idx, 1)
}

function openDetail(t: HelpTicket) {
  selectedTicket.value = t
  showDetail.value = true
  newComment.value = ''
}

function closeDetail() {
  showDetail.value = false
  selectedTicket.value = null
}

function addComment() {
  if (!newComment.value.trim() || !selectedTicket.value) return
  ticketStore.addComment(
    selectedTicket.value.id,
    currentEmployee.value?.name || 'You',
    newComment.value,
  )
  newComment.value = ''
}

function statusIcon(status: TicketStatus) {
  switch (status) {
    case 'open':
      return ExclamationCircleIcon
    case 'in_review':
      return ChatBubbleLeftEllipsisIcon
    case 'escalated':
      return ExclamationTriangleIcon
    case 'resolved':
      return CheckCircleSolid
    case 'closed':
      return CheckCircleIcon
    default:
      return ExclamationCircleIcon
  }
}

function statusColor(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'text-info-600 bg-info-50'
    case 'in_review':
      return 'text-brand-700 bg-brand-50'
    case 'escalated':
      return 'text-danger-600 bg-danger-50'
    case 'resolved':
      return 'text-success-600 bg-success-50'
    case 'closed':
      return 'text-neutral-500 bg-neutral-100'
  }
}

function statusBadgeClass(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return 'bg-info-50 text-info-600'
    case 'in_review':
      return 'bg-brand-50 text-brand-700'
    case 'escalated':
      return 'bg-danger-50 text-danger-600'
    case 'resolved':
      return 'bg-success-50 text-success-600'
    case 'closed':
      return 'bg-neutral-100 text-neutral-500'
  }
}

function statusLabel(status: TicketStatus): string {
  switch (status) {
    case 'open':
      return t('helpTickets.statusLabels.open')
    case 'in_review':
      return t('helpTickets.statusLabels.inReview')
    case 'escalated':
      return t('helpTickets.statusLabels.escalated')
    case 'resolved':
      return t('helpTickets.statusLabels.resolved')
    case 'closed':
      return t('helpTickets.statusLabels.closed')
    default:
      return ''
  }
}

import { formatRelativeTime, formatDateShort } from '../../utils/formatters'

function formatRelativeTimeOverride(dateStr: string): string {
  return formatRelativeTime(dateStr)
}

function formatDateShortOverride(dateStr: string): string {
  return formatRelativeTime(dateStr)
}
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="text-h2 text-neutral-900">{{ $t('helpTickets.title') }}</h1>
    <button
      class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors min-h-touch"
      @click="openRaiseForm"
    >
      <PlusIcon class="h-4 w-4" />
      {{ $t('helpTickets.raiseTicket') }}
    </button>
  </div>

   <!-- Loading state -->
   <div v-if="loading" class="space-y-3" aria-live="polite">
     <OptSkeleton variant="rectangular" height="80px" />
     <OptSkeleton variant="rectangular" height="80px" />
     <OptSkeleton variant="rectangular" height="80px" />
   </div>

   <!-- Error state -->
   <div v-else-if="error" class="bg-white rounded-lg shadow-card p-8 text-center" role="alert" aria-live="polite">
     <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
     <p class="text-body-strong text-neutral-900 mb-1">{{ $t('helpTickets.error.somethingWentWrong') }}</p>
     <p class="text-body text-neutral-500">{{ error }}</p>
     <div class="flex items-center gap-2">
       <button
         class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
         @click="retry"
       >
         {{ $t('common.retry') }}
       </button>
       <button
         class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
         @click="error = ''"
       >
         {{ $t('helpTickets.error.dismiss') }}
       </button>
     </div>
   </div>

  <div v-else-if="ticketStore.tickets.length === 0" class="bg-white rounded-lg shadow-card p-8 text-center">
    <ChatBubbleLeftEllipsisIcon class="h-12 w-12 text-neutral-300 mx-auto mb-3" />
    <p class="text-body-strong text-neutral-900 mb-1">{{ $t('helpTickets.noTickets') }}</p>
    <p class="text-body text-neutral-500">
      {{ $t('helpTickets.emptyMessage') }}
    </p>
    <button
      class="mt-4 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
      @click="openRaiseForm"
    >
      {{ $t('helpTickets.raiseTicket') }}
    </button>
  </div>

  <div v-else class="space-y-3">
    <div
      v-for="t in paginatedTickets"
      :key="t.id"
      class="bg-white rounded-lg shadow-card p-4 cursor-pointer transition-all hover:shadow-card-hover active:scale-[0.99]"
      @click="openDetail(t)"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold"
              :class="statusBadgeClass(t.status)"
              >{{ statusLabel(t.status) }}</span
            >
            <span class="text-caption text-neutral-400">{{ categoryDisplay(t.category) }}</span>
          </div>
          <h3 class="text-body-strong text-neutral-900 mb-1">{{ t.subject }}</h3>
          <div class="flex items-center gap-3 text-caption text-neutral-400">
            <span class="flex items-center gap-1"
              ><ClockIcon class="h-3.5 w-3.5" /> {{ $t('helpTickets.raisedDate', { date: formatDateShortOverride(t.created_on) }) }}</span
            >
            <span class="flex items-center gap-1"
              ><ArrowPathIcon class="h-3.5 w-3.5" /> {{ $t('helpTickets.updatedDate', { date: formatDateShortOverride(t.updated_on) }) }}</span
            >
            <span v-if="t.comments.length" class="flex items-center gap-1"
              ><ChatBubbleLeftEllipsisIcon class="h-3.5 w-3.5" /> {{ t.comments.length }}</span
            >
          </div>
        </div>
        <ChevronRightIcon class="h-5 w-5 text-neutral-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  </div>

    <OptPagination
      :current-page="ticketsCurrentPage"
      :total-pages="ticketsTotalPages"
      :total-items="ticketsTotalItems"
      :page-size="20"
      @page-change="ticketsCurrentPage = $event"
    />

  <teleport to="body">
    <div
      v-if="showRaiseForm"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
      aria-hidden="true"
    >
      <div
        class="bg-white w-full sm:max-w-lg rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
        role="dialog" aria-modal="true" aria-label="Raise a Ticket"
      >
        <div class="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 class="text-h3 text-neutral-900">{{ $t('helpTickets.form.title') }}</h2>
          <button
            class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"
            @click="showRaiseForm = false"
            aria-label="Close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div v-if="formSubmitted" class="p-6 text-center">
          <CheckCircleSolid class="h-12 w-12 text-success-600 mx-auto mb-3" />
          <p class="text-body-strong text-neutral-900 mb-1">{{ $t('helpTickets.success.title') }}</p>
          <p class="text-body text-neutral-500 mb-4">
            {{ $t('helpTickets.success.detail') }}
          </p>
          <button
            class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700"
            @click="showRaiseForm = false"
          >
            {{ $t('common.done') }}
          </button>
        </div>

        <form v-else class="p-4 space-y-4" @submit.prevent="submitTicket">
          <div>
            <label class="block text-caption font-semibold text-neutral-700 mb-1"
              >{{ $t('helpTickets.form.category') }} <span class="text-danger-500">*</span></label
            >
            <select
              v-model="formCategory"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
              :class="formErrors['category'] ? 'border-danger-500' : ''"
              :id="'input-category'"
              :aria-describedby="formErrors['category'] ? 'error-category' : undefined"
            >
              <option value="">{{ $t('helpTickets.form.categoryPlaceholder') }}</option>
              <option v-for="c in categories" :key="c" :value="c">{{ categoryDisplay(c) }}</option>
            </select>
            <p v-if="formErrors['category']" class="text-caption text-danger-600 mt-1" :id="'error-category'">
              {{ formErrors['category'] }}
            </p>
          </div>

          <div>
            <label class="block text-caption font-semibold text-neutral-700 mb-1">Priority</label>
            <select
              v-model="formPriority"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label class="block text-caption font-semibold text-neutral-700 mb-1"
              >{{ $t('helpTickets.form.subject') }} <span class="text-danger-500">*</span></label
            >
            <input
              v-model="formSubject"
              type="text"
              :placeholder="$t('helpTickets.form.subjectPlaceholder')"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
              :class="formErrors['subject'] ? 'border-danger-500' : ''"
              :id="'input-subject'"
              :aria-describedby="formErrors['subject'] ? 'error-subject' : undefined"
            />
            <p v-if="formErrors['subject']" class="text-caption text-danger-600 mt-1" :id="'error-subject'">
              {{ formErrors['subject'] }}
            </p>
          </div>

          <div>
            <label class="block text-caption font-semibold text-neutral-700 mb-1"
              >{{ $t('helpTickets.form.description') }} <span class="text-danger-500">*</span></label
            >
            <textarea
              v-model="formDescription"
              rows="4"
              class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none resize-none"
              :class="formErrors['description'] ? 'border-danger-500' : ''"
              :placeholder="$t('helpTickets.form.descriptionPlaceholder')"
              :id="'input-description'"
              :aria-describedby="formErrors['description'] ? 'error-description' : undefined"
            />
            <p v-if="formErrors['description']" class="text-caption text-danger-600 mt-1" :id="'error-description'">
              {{ formErrors['description'] }}
            </p>
          </div>

          <div>
            <label class="block text-caption font-semibold text-neutral-700 mb-1"
              >{{ $t('helpTickets.form.attachments') }}</label
            >
            <label
              class="flex items-center gap-2 px-3 py-2.5 border border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 text-body text-neutral-500"
            >
              <DocumentArrowUpIcon class="h-5 w-5" />
              <span>{{ $t('helpTickets.form.uploadPrompt') }}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                multiple
                class="hidden"
                @change="handleFileUpload"
              />
            </label>
            <div v-if="formAttachments.length" class="mt-2 space-y-1.5">
              <div
                v-for="(file, idx) in formAttachments"
                :key="idx"
                class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-50 text-caption text-neutral-600"
              >
                <span class="flex items-center gap-1.5"
                  ><PaperClipIcon class="h-3.5 w-3.5" /> {{ file.name }}</span
                >
                <button
                  class="text-neutral-400 hover:text-danger-600"
                  @click="removeAttachment(idx)"
                  aria-label="Remove attachment"
                >
                  <XMarkIcon class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
          >
            {{ $t('helpTickets.form.submit') }}
          </button>
        </form>
      </div>
    </div>
  </teleport>

  <teleport to="body">
    <div
      v-if="showDetail && selectedTicket"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
      aria-hidden="true"
    >
      <div
        class="bg-white w-full sm:max-w-2xl rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
        role="dialog" aria-modal="true" aria-label="Ticket detail"
      >
        <div
          class="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-neutral-100"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold whitespace-nowrap"
              :class="statusBadgeClass(selectedTicket.status)"
              >{{ statusLabel(selectedTicket.status) }}</span
            >
            <h2 class="text-h3 text-neutral-900 truncate">{{ selectedTicket.subject }}</h2>
          </div>
          <button
            class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 flex-shrink-0"
            @click="closeDetail"
            aria-label="Close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div class="text-caption text-neutral-400 flex items-center gap-3">
            <span>{{ categoryDisplay(selectedTicket.category) }}</span>
            <span>·</span>
            <span class="flex items-center gap-1"
              ><ClockIcon class="h-3.5 w-3.5" /> {{ $t('helpTickets.raisedDate', { date: formatDateTime(selectedTicket.created_on) }) }}</span
            >
            <span>·</span>
            <span class="flex items-center gap-1"
              ><ArrowPathIcon class="h-3.5 w-3.5" /> {{ $t('helpTickets.updatedDate', { date: formatDateShortOverride(selectedTicket.updated_on) }) }}</span
            >
          </div>

          <p class="text-body text-neutral-700 whitespace-pre-wrap">
            {{ selectedTicket.description }}
          </p>

          <div v-if="selectedTicket.attachments?.length" class="flex flex-wrap gap-2">
            <span
              v-for="att in selectedTicket.attachments"
              :key="att.id"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 text-caption text-neutral-600"
            >
              <PaperClipIcon class="h-3.5 w-3.5" /> {{ att.filename }}
            </span>
          </div>

          <div
            v-if="selectedTicket.resolution_notes"
            class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-success-50 text-caption"
          >
            <CheckCircleSolid class="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
            <div>
              <span class="font-semibold text-success-600">{{ $t('helpTickets.resolution') }}</span>
              <p class="text-neutral-600 mt-0.5">{{ selectedTicket.resolution_notes }}</p>
              <p v-if="selectedTicket.resolved_on" class="text-neutral-400 mt-0.5">
                Resolved {{ formatRelativeTimeOverride(selectedTicket.resolved_on) }}
              </p>
            </div>
          </div>

          <!-- Reopen (within 7 days of close) -->
          <div
            v-if="selectedTicket.status === 'closed' && (Date.now() - new Date(selectedTicket.updated_on).getTime()) < 7 * 24 * 60 * 60 * 1000"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200"
          >
            <span class="text-caption text-amber-700">This ticket is closed. You can reopen it within 7 days.</span>
            <button
              class="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-caption font-medium hover:bg-amber-700 transition-colors"
              @click="ticketStore.reopenTicket(selectedTicket.id); closeDetail()"
            >
              Reopen
            </button>
          </div>

          <!-- Satisfaction Survey -->
          <div
            v-if="(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && !selectedTicket.satisfaction_score"
            class="px-3 py-2.5 rounded-lg bg-brand-50 border border-brand-200"
          >
            <p class="text-caption font-semibold text-brand-700 mb-2">Rate your experience</p>
            <div class="flex items-center gap-2">
              <button
                v-for="score in 5" :key="score"
                class="w-8 h-8 rounded-full text-sm font-bold transition-colors"
                :class="selectedTicket.satisfaction_score && selectedTicket.satisfaction_score >= score
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-100'"
                @click="ticketStore.submitSatisfaction(selectedTicket.id, score)"
              >
                {{ score }}
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-neutral-100">
            <h3 class="text-body-strong text-neutral-900 mb-3">
              {{ $t('helpTickets.commentsCount', { count: selectedTicket.comments.length }) }}
            </h3>

            <OptEmptyState v-if="selectedTicket.comments.length === 0" type="comments" :title="$t('helpTickets.noComments')" />

            <div class="space-y-3 max-h-48 overflow-y-auto mb-3">
              <div v-for="c in selectedTicket.comments" :key="c.id" class="flex gap-2.5">
                <div
                  class="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-caption font-bold flex-shrink-0"
                >
                  {{
                    c.author
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                  }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-body-strong text-neutral-900 text-[13px]">{{ c.author }}</span>
                    <span class="text-caption text-neutral-400">{{
                      formatDateShortOverride(c.created_on)
                    }}</span>
                  </div>
                  <p class="text-body text-neutral-600">{{ c.text }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <input
                v-model="newComment"
                type="text"
                :placeholder="$t('helpTickets.addComment')"
                class="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                @keydown.enter.prevent="addComment"
              />
              <button
                :disabled="!newComment.trim()"
                class="px-4 py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
                :class="!newComment.trim() ? 'cursor-not-allowed' : ''"
                @click="addComment"
              >
                {{ $t('helpTickets.send') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
