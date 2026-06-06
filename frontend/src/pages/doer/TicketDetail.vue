<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { useTicketStore } from '../../stores/ticketStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  ArrowLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import type { HelpTicket } from '../../types'
import OptChip from '../../components/common/OptChip.vue'
import { getHelpTicket } from '../../services'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { formatDateTime, formatRelativeTime } from '../../utils/formatters'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { t } = useI18n()
const currentEmployee = computed(() => store.user.employee)
const ticketStore = useTicketStore()

const ticket = ref<HelpTicket | null>(null)
const loading = ref(true)
const notFound = ref(false)
const error = ref('')
const newComment = ref('')

const statusSteps = ['open', 'in_review', 'escalated', 'resolved', 'closed']

const statusDisplayKey: Record<string, string> = {
  open: 'open',
  in_review: 'inReview',
  escalated: 'escalated',
  resolved: 'resolved',
  closed: 'closed',
}

const currentStepIndex = computed(() => statusSteps.indexOf(ticket.value?.status || 'open'))

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

async function fetchTicket() {
  const id = route.params.id as string
  if (!id) {
    notFound.value = true
    loading.value = false
    return
  }
  error.value = ''
  loading.value = true
  startTimeout()
  try {
    const result = await getHelpTicket(id)
    if (timedOut.value) throw new Error('Request timed out')
    if (!result) {
      notFound.value = true
    } else {
      ticket.value = result
    }
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : t('ticketDetail.loadError')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchTicket)

function getStatusVariant(s: string) {
  const map: Record<string, any> = {
    open: 'pending' as const,
    in_review: 'in-progress' as const,
    escalated: 'escalated' as const,
    resolved: 'completed' as const,
    closed: 'reviewed' as const,
  }
  return map[s] || ('default' as const)
}

function addComment() {
  if (!newComment.value.trim() || !ticket.value) return
  ticket.value.comments.push({
    id: `C${Date.now()}`,
    author: currentEmployee.value?.name || 'You',
    text: newComment.value,
    created_on: new Date().toISOString(),
  })
  newComment.value = ''
}

function formatDate(d: string) {
  return formatDateTime(d)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
    <div
      class="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3"
    >
      <button
        class="p-1 -ml-1 text-neutral-500 hover:text-neutral-700 rounded-md min-h-touch min-w-touch flex items-center justify-center"
        aria-label="Back"
        @click="router.back()"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-h3 text-neutral-900 truncate flex-1">{{ loading ? '...' : ticket?.subject }}</h1>
    </div>

    <template v-if="loading">
      <div class="p-4 space-y-4">
        <OptSkeleton variant="rectangular" width="33%" height="24px" />
        <OptSkeleton variant="rectangular" height="16px" />
        <OptSkeleton variant="rectangular" width="75%" height="16px" />
        <OptSkeleton variant="rectangular" height="128px" />
      </div>
    </template>

    <div v-else-if="error" role="alert" aria-live="polite" class="card p-8 text-center">
      <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
      <p class="text-body-strong text-neutral-900 mb-1">{{ $t('ticketDetail.failedToLoad') }}</p>
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchTicket"
      >
        <ArrowPathIcon class="h-4 w-4 inline mr-1" /> {{ $t('common.retry') }}
      </button>
    </div>

    <template v-else-if="!ticket || notFound">
      <div class="empty-state">
        <ExclamationTriangleIcon class="empty-state-icon !text-danger-400" />
        <p class="empty-state-title">{{ $t('ticketDetail.notFound') }}</p>
        <p class="empty-state-description">{{ $t('ticketDetail.notFoundMessage') }}</p>
        <router-link
          to="/doer/tickets"
          class="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        >
          <ArrowLeftIcon class="w-4 h-4" /> {{ $t('ticketDetail.backToTickets') }}
        </router-link>
      </div>
    </template>

    <template v-else>
      <div class="p-4 space-y-5 max-w-content mx-auto">
        <div class="flex flex-wrap items-center gap-2">
          <OptChip :variant="getStatusVariant(ticket.status)" size="md">
            {{ ticket.status.replace('_', ' ') }}
          </OptChip>
          <span class="px-2 py-1 rounded text-caption font-semibold bg-brand-50 text-brand-600">
            {{ ticket.category }}
          </span>
        </div>

        <div class="card p-4">
          <p class="text-body text-neutral-700 whitespace-pre-wrap">{{ ticket.description }}</p>
        </div>

        <div class="card p-4">
          <h3 class="text-h3 mb-3">{{ $t('ticketDetail.statusProgress') }}</h3>
          <div class="flex items-center gap-2">
            <template v-for="(step, i) in statusSteps" :key="step">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold border-2 shrink-0 transition-all"
                  :class="
                    i < currentStepIndex
                      ? 'bg-success-600 border-success-600 text-white'
                      : i === currentStepIndex
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-neutral-300 text-neutral-400'
                  "
                >
                  <CheckCircleSolid v-if="i < currentStepIndex" class="w-4 h-4" />
                  <span v-else>{{ i + 1 }}</span>
                </div>
                <span
                  class="text-overline"
                  :class="i <= currentStepIndex ? 'text-neutral-700 font-semibold' : 'text-neutral-400'"
                >
                  {{ $t('ticketDetail.statusDisplay.' + statusDisplayKey[step]) }}
                </span>
              </div>
              <div
                v-if="i < statusSteps.length - 1"
                class="flex-1 h-0.5 rounded-full"
                :class="i < currentStepIndex ? 'bg-success-600' : i === currentStepIndex ? 'bg-brand-600' : 'bg-neutral-200'"
              ></div>
            </template>
          </div>
        </div>

        <div class="card p-4">
          <div class="flex items-center gap-2 mb-3">
            <ClockIcon class="w-4 h-4 text-neutral-400" />
            <h3 class="text-h3">{{ $t('ticketDetail.activityComments') }}</h3>
          </div>

          <div class="space-y-4 mb-4">
            <div v-for="comment in ticket.comments" :key="comment.id" class="flex gap-3">
              <div
                class="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-caption font-bold flex-shrink-0"
              >
                {{ (comment.author.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || comment.author[0]).toUpperCase() }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-body-strong text-neutral-900">{{ comment.author }}</span>
                  <span class="text-caption text-neutral-400">{{ formatDate(comment.created_on) }}</span>
                </div>
                <p class="text-body text-neutral-700">{{ comment.text }}</p>
              </div>
            </div>
            <OptEmptyState v-if="ticket.comments.length === 0" type="comments" :title="$t('ticketDetail.noComments')" />
          </div>

          <div class="flex gap-2">
            <input
              v-model="newComment"
              type="text"
              :placeholder="$t('ticketDetail.addComment')"
              aria-label="Add a comment"
              class="flex-1 h-10 text-body bg-white border border-neutral-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-neutral-400"
              @keyup.enter="addComment"
            />
            <button
              :disabled="!newComment.trim()"
              class="h-10 px-4 bg-brand-600 text-white rounded-lg text-button font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 min-h-touch"
              @click="addComment"
            >
              {{ $t('ticketDetail.send') }}
            </button>
          </div>
        </div>

        <div
          v-if="ticket.resolution_notes"
          class="card p-4 border-l-4 border-l-success-600 bg-gradient-to-r from-success-50/50 to-white"
        >
          <div class="flex items-center gap-2 mb-1">
            <CheckCircleIcon class="w-5 h-5 text-success-600" />
            <h3 class="text-h3 text-success-700">{{ $t('ticketDetail.resolution') }}</h3>
          </div>
          <p class="text-body text-neutral-600">{{ ticket.resolution_notes }}</p>
          <p v-if="ticket.resolved_on" class="text-caption text-success-500 mt-1">
            Resolved {{ formatDateTime(ticket.resolved_on) }}
          </p>
        </div>

        <!-- Reopen (within 7 days) -->
        <div
          v-if="ticket.status === 'closed' && (Date.now() - new Date(ticket.updated_on).getTime()) < 7 * 24 * 60 * 60 * 1000"
          class="card p-4 border border-amber-200 bg-amber-50"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-h3 text-amber-700">{{ $t('ticketDetail.reopenTitle') || 'Reopen Ticket' }}</h3>
              <p class="text-caption text-amber-600 mt-0.5">
                Closed {{ formatRelativeTime(ticket.updated_on) }}. You can reopen within 7 days.
              </p>
            </div>
            <button
              class="px-4 py-2 rounded-lg bg-amber-600 text-white text-button font-medium hover:bg-amber-700 transition-colors"
              @click="ticketStore.reopenTicket(ticket.id); fetchTicket()"
            >
              {{ $t('ticketDetail.reopen') || 'Reopen' }}
            </button>
          </div>
        </div>

        <!-- Satisfaction Survey -->
        <div
          v-if="(ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.satisfaction_score"
          class="card p-4 border border-brand-200 bg-brand-50"
        >
          <h3 class="text-h3 text-brand-700 mb-2">Rate your experience</h3>
          <div class="flex items-center gap-2">
            <button
              v-for="score in 5" :key="score"
              class="w-10 h-10 rounded-full text-sm font-bold transition-colors"
              :class="ticket.satisfaction_score && ticket.satisfaction_score >= score
                ? 'bg-brand-600 text-white'
                : 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-100'"
              @click="ticketStore.submitSatisfaction(ticket.id, score)"
            >
              {{ score }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
