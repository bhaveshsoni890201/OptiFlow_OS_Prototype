<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../../stores/useStore'

const appVersion = import.meta.env.VITE_APP_VERSION || '0.1.0'

const routeLoaders: Record<string, () => Promise<any>> = {
  '/doer': () => import('../../pages/doer/DoerHome.vue'),
  '/doer/tasks': () => import('../../pages/doer/MyTasks.vue'),
  '/doer/worklist': () => import('../../pages/doer/MyWorklist.vue'),
  '/doer/attendance': () => import('../../pages/doer/AttendanceView.vue'),
  '/doer/leave': () => import('../../pages/doer/LeaveView.vue'),
  '/doer/training': () => import('../../pages/doer/TrainingView.vue'),
  '/doer/tickets': () => import('../../pages/doer/HelpTickets.vue'),
  '/doer/notifications': () => import('../../pages/doer/NotificationsView.vue'),
  '/doer/profile': () => import('../../pages/doer/DoerProfile.vue'),
  '/captain': () => import('../../pages/captain/CaptainDashboard.vue'),
  '/captain/rescue': () => import('../../pages/captain/RescueQueue.vue'),
  '/captain/team': () => import('../../pages/captain/TeamRoster.vue'),
  '/captain/worklists': () => import('../../pages/captain/WorklistManagement.vue'),
  '/captain/leave-approvals': () => import('../../pages/captain/LeaveApprovals.vue'),
  '/captain/attendance': () => import('../../pages/captain/AttendanceMonitor.vue'),
  '/captain/training': () => import('../../pages/captain/TrainingAssignment.vue'),
  '/captain/tickets': () => import('../../pages/captain/CaptainTickets.vue'),
  '/captain/profile': () => import('../../pages/doer/DoerProfile.vue'),
  '/admin': () => import('../../pages/admin/AdminDashboard.vue'),
  '/admin/insights': () => import('../../pages/admin/InsightsOverview.vue'),
  '/admin/employees': () => import('../../pages/admin/EmployeeManagement.vue'),
  '/admin/departments': () => import('../../pages/admin/DepartmentAnalytics.vue'),
  '/admin/attendance': () => import('../../pages/admin/AdminAttendance.vue'),
  '/admin/leave': () => import('../../pages/admin/AdminLeaveView.vue'),
  '/admin/control-center': () => import('../../pages/admin/ControlCenter.vue'),
  '/admin/tickets': () => import('../../pages/admin/AdminTicketsView.vue'),
  '/admin/training': () => import('../../pages/admin/AdminTrainingView.vue'),
  '/admin/profile': () => import('../../pages/doer/DoerProfile.vue'),
}

function preloadRoute(to: string) {
  const loader = routeLoaders[to]
  if (loader) loader().catch(() => {})
}
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BellIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  TicketIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon,
  QueueListIcon,
  ClockIcon,
  PresentationChartLineIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  panelName: 'doer' | 'captain' | 'admin'
}>()

const route = useRoute()
const router = useRouter()
const store = useStore()
const collapsed = ref(false)

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  label: string
  icon: unknown
  to: string
}

const panelNavGroups: Record<string, NavGroup[]> = {
  doer: [
    {
      label: 'Main',
      items: [
        { label: 'Home', icon: HomeIcon, to: '/doer' },
        { label: 'My Tasks', icon: ClipboardDocumentListIcon, to: '/doer/tasks' },
        { label: 'My Worklist', icon: QueueListIcon, to: '/doer/worklist' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Attendance', icon: ClockIcon, to: '/doer/attendance' },
        { label: 'Leave', icon: CalendarDaysIcon, to: '/doer/leave' },
      ],
    },
    {
      label: 'Learning',
      items: [
        { label: 'Training', icon: AcademicCapIcon, to: '/doer/training' },
      ],
    },
    {
      label: 'Support',
      items: [
        { label: 'Help Tickets', icon: TicketIcon, to: '/doer/tickets' },
        { label: 'Notifications', icon: BellIcon, to: '/doer/notifications' },
        { label: 'Profile', icon: UserIcon, to: '/doer/profile' },
      ],
    },
  ],
  captain: [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', icon: ChartBarIcon, to: '/captain' },
        { label: 'Rescue', icon: ExclamationTriangleIcon, to: '/captain/rescue' },
        { label: 'Team', icon: UserGroupIcon, to: '/captain/team' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Worklists', icon: QueueListIcon, to: '/captain/worklists' },
        { label: 'Leave Approvals', icon: CalendarDaysIcon, to: '/captain/leave-approvals' },
        { label: 'Attendance', icon: ClockIcon, to: '/captain/attendance' },
      ],
    },
    {
      label: 'Learning',
      items: [
        { label: 'Training & SOPs', icon: AcademicCapIcon, to: '/captain/training' },
      ],
    },
    {
      label: 'Support',
      items: [
        { label: 'Tickets', icon: TicketIcon, to: '/captain/tickets' },
        { label: 'Profile', icon: UserIcon, to: '/captain/profile' },
      ],
    },
  ],
  admin: [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', icon: ChartBarIcon, to: '/admin' },
        { label: 'Insights', icon: PresentationChartLineIcon, to: '/admin/insights' },
        { label: 'Employees', icon: UserIcon, to: '/admin/employees' },
        { label: 'Departments', icon: BuildingOfficeIcon, to: '/admin/departments' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Attendance', icon: ClockIcon, to: '/admin/attendance' },
        { label: 'Leave', icon: CalendarDaysIcon, to: '/admin/leave' },
        { label: 'Control Center', icon: WrenchScrewdriverIcon, to: '/admin/control-center' },
      ],
    },
    {
      label: 'Support',
      items: [
        { label: 'Tickets', icon: TicketIcon, to: '/admin/tickets' },
        { label: 'Training', icon: AcademicCapIcon, to: '/admin/training' },
        { label: 'Profile', icon: UserIcon, to: '/admin/profile' },
      ],
    },
  ],
}

const navGroups = computed(() => panelNavGroups[props.panelName] ?? panelNavGroups.doer)

const currentEmployee = computed(() => store.user.employee)

const initials = computed(() => {
  const name = currentEmployee.value?.name || 'U'
  return name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase()
})

const statusDot = computed(() => 'bg-success-500')

const panelColors: Record<string, string> = {
  doer: 'bg-blue-600',
  captain: 'bg-amber-600',
  admin: 'bg-slate-700',
}

const panelBadge = computed(() => panelColors[props.panelName])

const themeIcons: Record<string, unknown> = {
  light: SunIcon,
  dark: MoonIcon,
  'high-contrast': ShieldCheckIcon,
}

function isActive(item: NavItem): boolean {
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

function confirmLogout() {
  store.clearAuth()
  router.push('/login')
}

const sidebarWidth = computed(() => (collapsed.value ? 'w-16' : 'w-60'))

const transitionClass = 'transition-all duration-200 ease-in-out'
</script>

<template>
  <aside
    class="hidden md:flex flex-col bg-white border-r border-neutral-200 h-full overflow-hidden z-40"
    :class="[sidebarWidth, transitionClass]"
  >
    <!-- Profile section -->
    <div
      class="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 shrink-0"
      :class="collapsed ? 'justify-center px-2' : ''"
    >
      <div class="relative shrink-0">
        <div
          class="flex items-center justify-center w-9 h-9 text-sm font-bold text-white rounded-full shrink-0"
          :class="panelBadge"
        >
          {{ initials }}
        </div>
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
          :class="statusDot"
        />
      </div>
      <div v-if="!collapsed" class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-neutral-900 truncate">
          {{ currentEmployee?.name || 'User' }}
        </p>
        <p class="text-caption text-neutral-500 truncate">
          {{ currentEmployee?.department || currentEmployee?.designation || panelName }}
        </p>
      </div>
    </div>

    <!-- Nav groups -->
    <nav class="flex-1 overflow-y-auto py-2">
      <template v-for="group in navGroups" :key="group.label">
        <div v-if="!collapsed" class="px-4 pt-3 pb-1">
          <span class="text-caption font-semibold text-neutral-400 uppercase tracking-wider">{{ group.label }}</span>
        </div>
        <ul class="space-y-0.5 px-2">
          <li v-for="item in group.items" :key="item.to">
            <router-link
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg group relative"
              :class="collapsed ? 'justify-center px-2' : ''"
              :title="collapsed ? item.label : undefined"
              @mouseenter="preloadRoute(item.to)"
            >
              <span
                v-if="isActive(item) && collapsed"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                :class="panelBadge"
              />
              <component
                :is="item.icon"
                class="w-5 h-5 shrink-0"
                :class="
                  isActive(item)
                    ? 'text-primary-600'
                    : 'text-neutral-500 group-hover:text-neutral-700'
                "
              />
              <span
                v-if="!collapsed"
                class="truncate"
                :class="
                  isActive(item)
                    ? 'text-primary-600 font-medium'
                    : 'text-neutral-600 group-hover:text-neutral-800'
                "
              >{{ item.label }}</span>
              <span
                v-if="isActive(item) && !collapsed"
                class="absolute inset-y-1 right-0 w-0.5 rounded-l-full"
                :class="panelBadge"
              />
            </router-link>
          </li>
        </ul>
      </template>
    </nav>

    <!-- Footer -->
    <div class="border-t border-neutral-200 shrink-0">
      <!-- Theme toggle -->
      <button
        type="button"
        class="flex items-center justify-center w-full h-11 px-4 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        :class="collapsed ? 'px-2' : 'gap-2'"
        aria-label="Toggle theme"
        @click="store.toggleTheme()"
      >
        <component :is="themeIcons[store.ui.theme] || SunIcon" class="w-4 h-4 shrink-0" />
        <span v-if="!collapsed" class="truncate capitalize">{{ store.ui.theme }} mode</span>
      </button>

      <!-- Logout -->
      <button
        type="button"
        class="flex items-center justify-center w-full h-11 px-4 text-sm text-neutral-500 hover:text-danger-600 hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-danger-500"
        :class="collapsed ? 'px-2' : 'gap-2'"
        aria-label="Log out"
        @click="confirmLogout"
      >
        <ArrowLeftOnRectangleIcon class="w-4 h-4 shrink-0" />
        <span v-if="!collapsed" class="truncate">Log out</span>
      </button>

      <!-- Collapse toggle -->
      <button
        type="button"
        class="flex items-center justify-center w-full h-11 px-4 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 border-t border-neutral-100"
        :class="collapsed ? 'px-2' : 'gap-2'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="collapsed = !collapsed"
      >
        <component :is="collapsed ? ChevronRightIcon : ChevronLeftIcon" class="w-4 h-4 shrink-0" />
        <span v-if="!collapsed" class="truncate">Collapse</span>
      </button>

      <!-- Version (expanded only) -->
      <div v-if="!collapsed" class="px-4 py-2">
        <div class="text-xs text-neutral-400">v{{ appVersion }}</div>
      </div>
    </div>
  </aside>
</template>