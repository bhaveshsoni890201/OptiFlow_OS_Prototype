<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import type { Worklist, Frequency } from '../../types'
import { getWorklists } from '../../services'
import { formatDateLong } from '../../utils/formatters'
import OptSkeleton from '../../components/common/OptSkeleton.vue'

const router = useRouter()
const store = useStore()
const currentEmployee = computed(() => store.user.employee)
const empId = computed(() => currentEmployee.value?.employee_id ?? '')
const loading = ref(true)
const frequencyFilter = ref<Frequency | 'all'>('all')

const worklists = ref<Worklist[]>([])

const frequencyMeta: Record<Frequency, { label: string; color: string; icon: string }> = {
  daily: { label: 'Daily', color: 'bg-brand-50 text-brand-600', icon: '~' },
  weekly: { label: 'Weekly', color: 'bg-info-50 text-info-600', icon: '#' },
  monthly: { label: 'Monthly', color: 'bg-success-50 text-success-600', icon: '#' },
}

const filteredWorklists = computed(() => {
  if (frequencyFilter.value === 'all') return worklists.value
  return worklists.value.filter((w) => w.frequency === frequencyFilter.value)
})

const frequencyCounts = computed(() => {
  const counts: Record<string, number> = {
    all: worklists.value.length,
    daily: 0,
    weekly: 0,
    monthly: 0,
  }
  worklists.value.forEach((w) => counts[w.frequency]++)
  return counts
})

function getNextDueDate(frequency: Frequency): string {
  const today = new Date()
  switch (frequency) {
    case 'daily':
      return formatDateLong(today)
    case 'weekly':
      return 'Week of Mon, 8 Jun'
    case 'monthly':
      return 'End of June 2026'
  }
}

function getAssignedByName(id: string) {
  return id
}

const selectedSopUrl = ref('')
const showSopViewer = ref(false)

function openSopInApp(url: string) {
  selectedSopUrl.value = url
  showSopViewer.value = true
}

function closeSopViewer() {
  showSopViewer.value = false
  selectedSopUrl.value = ''
}

const error = ref('')
const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

async function fetchMyWorklists() {
  error.value = ''
  loading.value = true
  startTimeout()
  try {
    const all = await getWorklists()
    if (timedOut.value) throw new Error('Request timed out')
    worklists.value = all.filter((w) => w.assigned_to === empId.value && w.active)
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : 'Could not load worklist. Please try again.'
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchMyWorklists)
</script>

<template>
  <div class="flex items-center justify-between mb-4">
      <h1 class="text-h1 text-neutral-900 flex items-center gap-2">
        <ClipboardDocumentListIcon class="w-6 h-6 text-brand-600" />
        My Worklist
      </h1>
    </div>

    <!-- Frequency legend -->
    <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-thin -mx-4 px-4">
      <button
        class="flex items-center gap-1.5 h-9 px-3 rounded-full text-caption font-semibold border transition-colors whitespace-nowrap min-h-touch"
        :class="
          frequencyFilter === 'all'
            ? 'bg-neutral-900 text-white border-neutral-900'
            : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900'
        "
        @click="frequencyFilter = 'all'"
      >
        All
        <span
          class="h-5 min-w-[18px] px-1 rounded-full text-overline flex items-center justify-center"
          :class="
            frequencyFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-500'
          "
          >{{ frequencyCounts.all }}</span
        >
      </button>
      <button
        v-for="(meta, key) in frequencyMeta"
        :key="key"
        class="flex items-center gap-1.5 h-9 px-3 rounded-full text-caption font-semibold border transition-colors whitespace-nowrap min-h-touch"
        :class="
          frequencyFilter === key
            ? `${meta.color} border-current`
            : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900'
        "
        @click="frequencyFilter = key as Frequency"
      >
        {{ meta.icon }} {{ meta.label }}
        <span
          class="h-5 min-w-[18px] px-1 rounded-full text-overline flex items-center justify-center"
          :class="frequencyFilter === key ? 'bg-black/10' : 'bg-neutral-200 text-neutral-500'"
          >{{ frequencyCounts[key] }}</span
        >
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="card p-8 text-center" role="alert" aria-live="polite">
      <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
      <p class="text-body-strong text-neutral-900 mb-1">Failed to load worklist</p>
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchMyWorklists"
      >
        <ArrowPathIcon class="h-4 w-4 inline mr-1" /> Retry
      </button>
    </div>

    <!-- Loading state -->
    <template v-else-if="loading">
      <div class="space-y-3" aria-live="polite">
        <div v-for="i in 3" :key="i" class="card p-4">
          <OptSkeleton variant="text" width="66%" :lines="1" />
          <div class="h-2" />
          <OptSkeleton variant="text" :lines="2" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="filteredWorklists.length === 0" class="empty-state">
      <ClipboardDocumentListIcon class="empty-state-icon" />
      <p class="empty-state-title">{{ $t('worklist.emptyState.noItems') }}</p>
      <p class="empty-state-description">
        {{
          frequencyFilter === 'all'
            ? $t('worklist.emptyState.notAssigned')
            : $t('worklist.emptyState.noFrequencyItems', { frequency: frequencyFilter })
        }}
      </p>
    </div>

    <!-- Worklist cards -->
    <div v-else class="space-y-3">
      <div
        v-for="item in filteredWorklists"
        :key="item.id"
        class="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer active:scale-[0.99]"
        @click="router.push(`/doer/worklist/${item.id}`)"
      >
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-h3 text-neutral-900 truncate">{{ item.title }}</h3>
            <span
              class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-caption font-semibold"
              :class="frequencyMeta[item.frequency].color"
            >
              {{ item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1) }}
            </span>
          </div>
          <div
            class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"
          >
            <ChevronRightIcon class="w-5 h-5 text-neutral-400" />
          </div>
        </div>

        <!-- KPI / Expected outcome -->
        <div v-if="item.kpi" class="mb-2">
          <p class="text-body text-neutral-600 flex items-center gap-1.5">
            <ExclamationTriangleIcon class="w-4 h-4 text-brand-600 shrink-0" />
            <span class="text-body-strong text-neutral-700">KPI:</span>
            {{ item.kpi }}
          </p>
        </div>

        <p v-if="item.description" class="text-body text-neutral-500 mb-3 line-clamp-2">
          {{ item.description }}
        </p>

        <!-- Meta info row -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-neutral-500">
          <span class="flex items-center gap-1">
            <CalendarDaysIcon class="w-3.5 h-3.5" />
            Next: {{ getNextDueDate(item.frequency) }}
          </span>
          <span v-if="item.estimated_effort" class="flex items-center gap-1">
            <ClockIcon class="w-3.5 h-3.5" />
            {{ item.estimated_effort }}
          </span>
          <span class="flex items-center gap-1">
            Assigned by {{ getAssignedByName(item.assigned_by) }}
          </span>
        </div>

        <!-- SOP / Training link -->
        <div v-if="item.sop_link" class="mt-3 pt-3 border-t border-neutral-100">
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors min-h-touch"
              @click.stop="openSopInApp(item.sop_link!)"
            >
              <BookOpenIcon class="w-4 h-4" />
              View in App
            </button>
            <a
              :href="item.sop_link"
              target="_blank"
              class="inline-flex items-center gap-1.5 p-1.5 rounded-lg text-caption font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors min-h-touch"
              @click.stop
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
          </a>
          </div>
        </div>
      </div>
    </div>

    <!-- SOP Viewer overlay -->
    <Teleport to="body">
      <div
        v-if="showSopViewer"
        role="dialog"
        aria-modal="true"
        aria-label="SOP / Training viewer"
        class="fixed inset-0 z-50 flex flex-col bg-white md:m-4 md:rounded-xl md:shadow-2xl md:max-w-4xl md:max-h-[90vh] md:mx-auto"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
          <h3 class="text-h3 text-neutral-900">SOP / Training</h3>
          <button
            aria-label="Close"
            class="p-2 -mr-2 text-neutral-500 hover:text-neutral-700 rounded-lg min-h-touch min-w-touch flex items-center justify-center"
            @click="closeSopViewer"
          >
            <XCircleIcon class="w-5 h-5" />
          </button>
        </div>
        <iframe
          :src="selectedSopUrl"
          class="flex-1 w-full bg-neutral-50"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
      <div
        v-if="showSopViewer"
        aria-hidden="true"
        class="fixed inset-0 bg-black/40 z-40 md:flex md:items-center md:justify-center"
        @click="closeSopViewer"
      ></div>
    </Teleport>
</template>
