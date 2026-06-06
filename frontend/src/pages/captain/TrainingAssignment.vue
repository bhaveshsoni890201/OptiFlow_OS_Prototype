<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

interface TrainingContent {
  id: string
  title: string
  type: 'sop' | 'safety' | 'technical' | 'compliance'
  linkedWorklists: string[]
  duration: string
}

interface MemberTraining {
  memberId: string
  memberName: string
  memberAvatar: string
  statuses: Record<string, 'completed' | 'in_progress' | 'overdue' | 'pending'>
}

const loading = ref(true)
const error = ref<string | null>(null)
const selectedContent = ref<string[]>([])
const selectedMembers = ref<string[]>([])
const deadline = ref('')
const assignStep = ref<'select' | 'confirm' | 'done'>('select')

const trainingLibrary = ref<TrainingContent[]>([
  {
    id: 't1',
    title: 'Pre-flight Inspection SOP',
    type: 'sop',
    linkedWorklists: ['Daily Inspections'],
    duration: '45 min',
  },
  {
    id: 't2',
    title: 'Fuel Handling Safety',
    type: 'safety',
    linkedWorklists: ['Fuel Management Log'],
    duration: '30 min',
  },
  {
    id: 't3',
    title: 'Avionics Diagnostics v3',
    type: 'technical',
    linkedWorklists: [],
    duration: '60 min',
  },
  {
    id: 't4',
    title: 'Compliance Reporting Standards',
    type: 'compliance',
    linkedWorklists: ['Safety Drill Review'],
    duration: '20 min',
  },
  {
    id: 't5',
    title: 'Tool Control Protocol',
    type: 'sop',
    linkedWorklists: ['Tool Inventory Audit'],
    duration: '25 min',
  },
])

const members = ref<MemberTraining[]>([
  {
    memberId: 'm1',
    memberName: 'Alex Rivera',
    memberAvatar: 'AR',
    statuses: {
      t1: 'completed',
      t2: 'completed',
      t3: 'in_progress',
      t4: 'pending',
      t5: 'completed',
    },
  },
  {
    memberId: 'm2',
    memberName: 'Sarah Chen',
    memberAvatar: 'SC',
    statuses: { t1: 'overdue', t2: 'in_progress', t3: 'pending', t4: 'pending', t5: 'completed' },
  },
  {
    memberId: 'm3',
    memberName: 'Marcus Johnson',
    memberAvatar: 'MJ',
    statuses: { t1: 'completed', t2: 'pending', t3: 'pending', t4: 'pending', t5: 'in_progress' },
  },
  {
    memberId: 'm4',
    memberName: 'Priya Patel',
    memberAvatar: 'PP',
    statuses: {
      t1: 'completed',
      t2: 'completed',
      t3: 'completed',
      t4: 'completed',
      t5: 'completed',
    },
  },
  {
    memberId: 'm5',
    memberName: 'Lisa Park',
    memberAvatar: 'LP',
    statuses: { t1: 'in_progress', t2: 'overdue', t3: 'pending', t4: 'pending', t5: 'pending' },
  },
])

const typeColors: Record<string, string> = {
  sop: 'bg-blue-50 text-blue-700 border-blue-200',
  safety: 'bg-amber-50 text-amber-700 border-amber-200',
  technical: 'bg-violet-50 text-violet-700 border-violet-200',
  compliance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const statusColors: Record<string, string> = {
  completed: 'text-emerald-600 bg-emerald-50',
  in_progress: 'text-blue-600 bg-blue-50',
  overdue: 'text-red-600 bg-red-50',
  pending: 'text-slate-400 bg-slate-50',
}

const statusIcons: Record<string, any> = {
  completed: CheckCircleIcon,
  in_progress: ClockIcon,
  overdue: ExclamationTriangleIcon,
  pending: ClockIcon,
}

function getMemberCompletion(member: MemberTraining): number {
  const statuses = Object.values(member.statuses)
  const completed = statuses.filter((s) => s === 'completed').length
  return statuses.length > 0 ? Math.round((completed / statuses.length) * 100) : 0
}

function getContentCompletion(contentId: string): {
  completed: number
  total: number
  pct: number
} {
  const total = members.value.length
  const completed = members.value.filter((m) => m.statuses[contentId] === 'completed').length
  return { completed, total, pct: Math.round((completed / total) * 100) }
}

function handleAssign() {
  assignStep.value = 'confirm'
}

function confirmAssign() {
  assignStep.value = 'done'
  selectedContent.value = []
  selectedMembers.value = []
  deadline.value = ''
}

async function loadTraining() {
  loading.value = true
  error.value = null
  try {
    await new Promise((r) => setTimeout(r, 400))
  } catch {
    error.value = 'Failed to load training data'
  } finally {
    loading.value = false
  }
}

onMounted(loadTraining)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading training...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadTraining()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Training Assignment</h1>
          <p class="text-sm text-slate-500">
            {{ trainingLibrary.length }} modules &middot; {{ members.length }} members
          </p>
        </div>
      </div>

      <!-- Assign flow -->
      <div
        v-if="assignStep !== 'done'"
        class="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <h2 class="text-sm font-semibold text-slate-900">Assign Training</h2>

        <!-- Step: Select Content -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Content</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <label
              v-for="item in trainingLibrary"
              :key="item.id"
              class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                selectedContent.includes(item.id)
                  ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300'
              "
            >
              <input
                v-model="selectedContent"
                type="checkbox"
                :value="item.id"
                class="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 capitalize"
                  :class="typeColors[item.type]"
                  >{{ item.type }}</span
                >
              </div>
              <span class="text-xs text-slate-400">{{ item.duration }}</span>
            </label>
          </div>
        </div>

        <!-- Step: Select Members -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Members</p>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="m in members"
              :key="m.memberId"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-sm"
              :class="
                selectedMembers.includes(m.memberId)
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              "
            >
              <input v-model="selectedMembers" type="checkbox" :value="m.memberId" class="hidden" />
              {{ m.memberName }}
            </label>
          </div>
        </div>

        <!-- Deadline -->
        <div class="flex items-center gap-3">
          <label class="text-xs font-medium text-slate-500">Deadline</label>
          <input
            v-model="deadline"
            type="date"
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div class="flex justify-end">
          <button
            :disabled="selectedContent.length === 0 || selectedMembers.length === 0"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="handleAssign"
          >
            <AcademicCapIcon class="w-4 h-4" /> Assign Training
          </button>
        </div>
      </div>

      <!-- Assign Confirmation -->
      <div
        v-if="assignStep === 'confirm'"
        class="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
      >
        <p class="text-sm text-slate-700">
          Assign <strong>{{ selectedContent.length }}</strong> module(s) to
          <strong>{{ selectedMembers.length }}</strong> member(s)
          <span v-if="deadline">
            by <strong>{{ deadline }}</strong></span
          >?
        </p>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            @click="assignStep = 'select'"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="confirmAssign"
          >
            Confirm
          </button>
        </div>
      </div>

      <!-- Assign Done -->
      <div
        v-if="assignStep === 'done'"
        class="bg-white rounded-xl border border-emerald-200 p-5 text-center"
      >
        <CheckCircleIcon class="w-12 h-12 text-emerald-500 mx-auto mb-2" />
        <p class="text-sm font-medium text-slate-900">Training assigned successfully!</p>
        <button class="mt-3 text-sm text-blue-600 hover:underline" @click="assignStep = 'select'">
          Assign more
        </button>
      </div>

      <!-- Completion Matrix -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="p-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-900">Completion Tracking</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[600px]">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Member
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  %
                </th>
                <th
                  v-for="item in trainingLibrary"
                  :key="item.id"
                  class="text-center px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider max-w-[100px] truncate"
                  :title="item.title"
                >
                  {{ item.title }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="member in members" :key="member.memberId" class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700"
                    >
                      {{ member.memberAvatar }}
                    </div>
                    <span class="text-sm text-slate-900">{{ member.memberName }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="text-sm font-medium"
                    :class="
                      getMemberCompletion(member) >= 80
                        ? 'text-emerald-600'
                        : getMemberCompletion(member) >= 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                    "
                    >{{ getMemberCompletion(member) }}%</span
                  >
                </td>
                <td v-for="item in trainingLibrary" :key="item.id" class="px-3 py-3 text-center">
                  <component
                    :is="statusIcons[member.statuses[item.id] ?? 'pending']"
                    class="w-4 h-4 mx-auto"
                    :class="statusColors[member.statuses[item.id] ?? 'pending']"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
