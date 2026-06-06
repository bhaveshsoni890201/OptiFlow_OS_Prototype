<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import { useAdminStore } from '../../stores/adminStore'
import { useStore } from '../../stores/useStore'

const adminStore = useAdminStore()
const store = useStore()
const loading = ref(false)
const error = ref<string | null>(null)
const expandedCaptain = ref<string | null>(null)

interface Captain {
  id: string
  name: string
  teamSize: number
  rescueReduction: string
  recoverySpeed: string
  teamEfficiency: number
  compositeIndex: number
  wowTrend: 'up' | 'down' | 'stable'
  trendValue: string
}

const captains = computed<Captain[]>(() =>
  adminStore.employees
    .filter((e) => e.roles.includes('captain'))
    .map((e, i) => ({
      id: e.employee_id,
      name: e.name,
      teamSize: adminStore.employees.filter((x) => x.reporting_captain === e.employee_id).length,
      rescueReduction: `${20 + (i * 3) % 15}%`,
      recoverySpeed: `${(2 + (i * 0.3) % 2).toFixed(1)}h`,
      teamEfficiency: 75 + (i * 4) % 20,
      compositeIndex: 70 + (i * 5) % 25,
      wowTrend: (['up', 'up', 'stable', 'up', 'down', 'up'] as const)[i % 6],
      trendValue: [`+${2 + i * 1.5}`, `+${1 + i}`, `+0.${i + 2}`, `+${4 + i}`, `-${i + 1}.3`, `+${1 + i * 2}`][i % 6],
    })),
)

interface CaptainDetail {
  labels: string[]
  rescueTrend: number[]
  efficiencyTrend: number[]
}
const detailData = ref<Record<string, CaptainDetail>>({})

const sortField = ref<string>('compositeIndex')
const sortDir = ref<'asc' | 'desc'>('desc')

const sortedCaptains = computed(() => {
  const arr = [...captains.value]
  const field = sortField.value as keyof Captain
  arr.sort((a, b) => {
    const aVal =
      typeof a[field] === 'string' ? parseFloat(a[field] as string) : (a[field] as number)
    const bVal =
      typeof b[field] === 'string' ? parseFloat(b[field] as string) : (b[field] as number)
    return sortDir.value === 'desc' ? bVal - aVal : aVal - bVal
  })
  return arr
})

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortField.value = field
    sortDir.value = 'desc'
  }
}

function toggleExpand(id: string) {
  expandedCaptain.value = expandedCaptain.value === id ? null : id
}

async function loadCaptainData() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
  } catch (e) {
    error.value = 'Failed to load captain data'
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptainData)

function sortIcon(field: string) {
  if (sortField.value !== field) return 'opacity-0'
  return sortDir.value === 'desc' ? 'opacity-100' : 'opacity-100 rotate-180'
}

function handleExport() {
  store.addToast({ type: 'info', message: 'Export started', duration: 2000 })
}

const chartLabels = ['W1', 'W2', 'W3', 'W4']
const maxChart = computed(() => {
  const vals = Object.values(detailData.value).flatMap((d) => [
    ...(d?.rescueTrend || []),
    ...(d?.efficiencyTrend || []),
  ])
  return vals.length ? Math.max(...vals) : 100
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Captain Index</h1>
        <p class="text-sm text-gray-500 mt-1">Leaderboard & performance metrics</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        @click="handleExport"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export
      </button>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
    >
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadCaptainData"
      >
        Retry
      </button>
    </div>

    <div v-else-if="!loading && sortedCaptains.length === 0" class="text-center py-20 bg-white rounded-lg border border-slate-200">
      <UserGroupIcon class="h-14 w-14 text-slate-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-slate-700 mb-1">No captains found</h3>
      <p class="text-sm text-slate-400">No employees with captain role assigned yet.</p>
    </div>

    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-8 w-8 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p class="mt-4 text-sm text-gray-500">Loading captain data...</p>
    </div>

    <template v-else>
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Captain
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('teamSize')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Team <ChevronUpIcon :class="['h-3 w-3', sortIcon('teamSize')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('rescueReduction')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Rescue&darr; <ChevronUpIcon :class="['h-3 w-3', sortIcon('rescueReduction')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Recovery
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('teamEfficiency')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Efficiency <ChevronUpIcon :class="['h-3 w-3', sortIcon('teamEfficiency')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('compositeIndex')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Index <ChevronUpIcon :class="['h-3 w-3', sortIcon('compositeIndex')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  WoW
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                ></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(cap, idx) in sortedCaptains"
                :key="cap.id"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="toggleExpand(cap.id)"
              >
                <td class="px-4 py-3 text-xs font-medium text-gray-400">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div
                      class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600"
                    >
                      {{
                        cap.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                      }}
                    </div>
                    <span class="font-medium text-gray-900">{{ cap.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-gray-700">{{ cap.teamSize }}</td>
                <td class="px-4 py-3 text-center font-medium text-green-600">
                  {{ cap.rescueReduction }}
                </td>
                <td class="px-4 py-3 text-center text-gray-700">{{ cap.recoverySpeed }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-blue-500 rounded-full"
                        :style="{ width: cap.teamEfficiency + '%' }"
                      />
                    </div>
                    <span class="text-xs text-gray-600">{{ cap.teamEfficiency }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="font-bold text-gray-900">{{ cap.compositeIndex }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center gap-0.5 text-xs font-medium"
                    :class="
                      cap.wowTrend === 'up'
                        ? 'text-green-600'
                        : cap.wowTrend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    "
                  >
                    <ArrowTrendingUpIcon v-if="cap.wowTrend === 'up'" class="h-3 w-3" />
                    <ArrowTrendingDownIcon v-else-if="cap.wowTrend === 'down'" class="h-3 w-3" />
                    {{ cap.trendValue }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-gray-400">
                  <ChevronDownIcon
                    class="h-4 w-4 transition-transform"
                    :class="expandedCaptain === cap.id ? 'rotate-180' : ''"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="expandedCaptain"
        class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
      >
        <template v-if="captains.find((c) => c.id === expandedCaptain)">
          <h3 class="text-base font-semibold text-gray-900 mb-1">
            {{ captains.find((c) => c.id === expandedCaptain)?.name }}
          </h3>
          <p class="text-xs text-gray-500 mb-4">Detailed metrics breakdown</p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-lg font-bold text-gray-900">
                {{ captains.find((c) => c.id === expandedCaptain)?.teamSize }}
              </p>
              <p class="text-xs text-gray-500">Team Size</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-lg font-bold text-green-600">
                {{ captains.find((c) => c.id === expandedCaptain)?.rescueReduction }}
              </p>
              <p class="text-xs text-gray-500">Rescue Reduction</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-lg font-bold text-gray-900">
                {{ captains.find((c) => c.id === expandedCaptain)?.recoverySpeed }}
              </p>
              <p class="text-xs text-gray-500">Avg Recovery Speed</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-lg font-bold text-gray-900">
                {{ captains.find((c) => c.id === expandedCaptain)?.compositeIndex }}
              </p>
              <p class="text-xs text-gray-500">Composite Index</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Rescue Trend</h4>
              <div class="flex items-end gap-2 h-28">
                <div
                    v-for="(val, i) in (detailData[expandedCaptain || '']?.rescueTrend || [])"
                  :key="i"
                  class="flex-1 flex flex-col items-center"
                >
                  <div
                    class="w-full bg-amber-400 rounded-t transition-all"
                    :style="{ height: (val / maxChart) * 100 + '%' }"
                  />
                  <span class="text-[10px] text-gray-400 mt-1">{{ chartLabels[i] }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Efficiency Trend</h4>
              <div class="flex items-end gap-2 h-28">
                <div
                    v-for="(val, i) in (detailData[expandedCaptain || '']?.efficiencyTrend || [])"
                  :key="i"
                  class="flex-1 flex flex-col items-center"
                >
                  <div
                    class="w-full bg-blue-500 rounded-t transition-all"
                    :style="{ height: (val / maxChart) * 100 + '%' }"
                  />
                  <span class="text-[10px] text-gray-400 mt-1">{{ chartLabels[i] }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
