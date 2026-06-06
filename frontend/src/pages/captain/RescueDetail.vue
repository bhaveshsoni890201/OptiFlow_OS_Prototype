<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const commentText = ref('')

interface ReminderEvent {
  id: string
  timestamp: string
  toneLevel: 'soft' | 'moderate' | 'firm' | 'admin'
  note: string
}

interface ActivityLogEntry {
  id: string
  type: 'reminder' | 'reassign' | 'escalate' | 'comment' | 'resolve'
  timestamp: string
  description: string
}

const escalationLevels = [
  {
    level: 0,
    label: 'Soft',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    description: 'Friendly nudge',
  },
  {
    level: 1,
    label: 'Warning',
    color: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    description: 'Formal notice',
  },
  {
    level: 2,
    label: 'High-Risk',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    description: 'Captain attention',
  },
  {
    level: 3,
    label: 'Admin',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    description: 'Admin override',
  },
]

const currentEscalation = ref(2)

const reminderHistory = ref<ReminderEvent[]>([
  {
    id: 'r1',
    timestamp: '2026-06-01 09:15',
    toneLevel: 'soft',
    note: 'Quick reminder about your pending task.',
  },
  {
    id: 'r2',
    timestamp: '2026-06-02 10:30',
    toneLevel: 'moderate',
    note: 'Second notice — task is now overdue.',
  },
  {
    id: 'r3',
    timestamp: '2026-06-03 08:00',
    toneLevel: 'firm',
    note: 'Final warning before escalation.',
  },
])

const activityLog = ref<ActivityLogEntry[]>([
  {
    id: 'a1',
    type: 'reminder',
    timestamp: '2026-06-03 08:00',
    description: 'Firm reminder sent — tone escalated to firm',
  },
  {
    id: 'a2',
    type: 'comment',
    timestamp: '2026-06-02 14:20',
    description: 'Captain commented: "Please prioritize this task."',
  },
  {
    id: 'a3',
    type: 'reminder',
    timestamp: '2026-06-02 10:30',
    description: 'Moderate reminder sent',
  },
  { id: 'a4', type: 'reminder', timestamp: '2026-06-01 09:15', description: 'Soft nudge sent' },
  {
    id: 'a5',
    type: 'reassign',
    timestamp: '2026-05-30 11:00',
    description: 'Reassigned from John to Sarah',
  },
])

const comments = ref([
  {
    id: 'c1',
    author: 'Captain',
    avatar: 'CP',
    text: 'Sarah, please complete the pre-flight inspection by EOD.',
    timestamp: '2026-06-02 14:20',
  },
  {
    id: 'c2',
    author: 'Sarah Chen',
    avatar: 'SC',
    text: 'Acknowledged, working on it. Need access to Bay 3.',
    timestamp: '2026-06-02 15:45',
  },
])

const toneLabels: Record<string, string> = {
  soft: 'Soft',
  moderate: 'Moderate',
  firm: 'Firm',
  admin: 'Admin',
}
const toneColors: Record<string, string> = {
  soft: 'bg-blue-50 text-blue-700 border-blue-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  firm: 'bg-orange-50 text-orange-700 border-orange-200',
  admin: 'bg-red-50 text-red-700 border-red-200',
}

function handleRemind() {
  const level = currentEscalation.value < 3 ? currentEscalation.value + 1 : 3
  currentEscalation.value = level as 0 | 1 | 2 | 3
}

async function loadDetail() {
  loading.value = true
  error.value = null
  try {
    await new Promise((r) => setTimeout(r, 400))
  } catch {
    error.value = 'Failed to load rescue detail'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading detail...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadDetail()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <!-- Back nav -->
      <button
        class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        @click="router.back()"
      >
        <ArrowLeftIcon class="w-4 h-4" /> Back to Rescue Queue
      </button>

      <!-- Task Header -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900">Pre-flight inspection — AC-201</h1>
              <span
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-red-500" /> Critical
              </span>
            </div>
            <p class="text-sm text-slate-500">Task #TSK-1042 &middot; Created 12 Jun 2026</p>
          </div>
          <span class="inline-flex items-center gap-1.5 text-sm text-red-600 font-semibold">
            <ClockIcon class="w-5 h-5" /> 5 days overdue
          </span>
        </div>

        <!-- Employee info -->
        <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700"
          >
            SC
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">Sarah Chen</p>
            <p class="text-xs text-slate-400">Flight Technician &middot; 4 active tasks</p>
          </div>
        </div>
      </div>

      <!-- Delay Timeline -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Delay Timeline</h2>
        <div class="relative">
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="relative flex items-start gap-4 pl-0">
              <div
                class="absolute left-4 -translate-x-1/2 w-3 h-3 rounded-full mt-1 z-10"
                :class="i === 1 ? 'bg-red-500 ring-4 ring-red-100' : 'bg-slate-300'"
              />
              <div class="ml-10">
                <p class="text-sm font-medium" :class="i === 1 ? 'text-red-700' : 'text-slate-600'">
                  {{ i === 1 ? 'Today — Overdue' : `Day ${i - 1} — No update` }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ new Date(Date.now() - (i - 1) * 86400000).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Escalation Ladder -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Escalation Ladder</h2>
        <div class="flex items-center gap-2">
          <div
            v-for="(level, idx) in escalationLevels"
            :key="level.level"
            class="flex-1 flex flex-col items-center gap-1.5"
          >
            <div
              class="w-full h-2 rounded-full transition-colors"
              :class="idx <= currentEscalation ? 'bg-red-500' : 'bg-slate-200'"
            />
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="idx === currentEscalation ? level.color : 'text-slate-400'"
            >
              {{ level.label }}
            </span>
            <span class="text-xs text-slate-400">{{ level.description }}</span>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Activity Log</h2>
        <div class="space-y-3">
          <div v-for="entry in activityLog" :key="entry.id" class="flex items-start gap-3 text-sm">
            <div
              class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              :class="
                entry.type === 'reminder'
                  ? 'bg-blue-400'
                  : entry.type === 'escalate'
                    ? 'bg-red-400'
                    : 'bg-slate-400'
              "
            />
            <div class="flex-1">
              <p class="text-slate-700">{{ entry.description }}</p>
              <p class="text-xs text-slate-400">{{ entry.timestamp }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reminder History -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Reminder History</h2>
        <div class="space-y-3">
          <div
            v-for="reminder in reminderHistory"
            :key="reminder.id"
            class="flex items-start justify-between gap-3"
          >
            <div class="space-y-1">
              <p class="text-sm text-slate-700">{{ reminder.note }}</p>
              <p class="text-xs text-slate-400">{{ reminder.timestamp }}</p>
            </div>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0"
              :class="toneColors[reminder.toneLevel]"
            >
              {{ toneLabels[reminder.toneLevel] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Comments</h2>
        <div class="space-y-4 mb-4">
          <div v-for="c in comments" :key="c.id" class="flex gap-3">
            <div
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0"
            >
              {{ c.avatar }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">{{ c.author }}</span>
                <span class="text-xs text-slate-400">{{ c.timestamp }}</span>
              </div>
              <p class="text-sm text-slate-600 mt-0.5">{{ c.text }}</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <input
            v-model="commentText"
            type="text"
            placeholder="Add a comment..."
            class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Action Bar -->
      <div
        class="sticky bottom-4 bg-white rounded-xl border border-slate-200 p-3 shadow-lg flex flex-wrap items-center gap-2"
      >
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
          @click="handleRemind"
        >
          <PaperAirplaneIcon class="w-4 h-4" /> Remind
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <UserGroupIcon class="w-4 h-4" /> Reassign
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors"
        >
          <ShieldExclamationIcon class="w-4 h-4" /> Escalate
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors ml-auto"
        >
          <CheckCircleIcon class="w-4 h-4" /> Resolve
        </button>
      </div>
    </div>
  </div>
</template>
