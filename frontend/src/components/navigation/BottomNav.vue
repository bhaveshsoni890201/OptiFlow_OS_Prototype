<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const routeLoaders: Record<string, () => Promise<any>> = {
  '/doer': () => import('../../pages/doer/DoerHome.vue'),
  '/doer/tasks': () => import('../../pages/doer/MyTasks.vue'),
  '/doer/attendance': () => import('../../pages/doer/AttendanceView.vue'),
  '/doer/training': () => import('../../pages/doer/TrainingView.vue'),
  '/doer/profile': () => import('../../pages/doer/DoerProfile.vue'),
  '/captain': () => import('../../pages/captain/CaptainDashboard.vue'),
  '/captain/rescue': () => import('../../pages/captain/RescueQueue.vue'),
  '/captain/team': () => import('../../pages/captain/TeamRoster.vue'),
  '/captain/leave-approvals': () => import('../../pages/captain/LeaveApprovals.vue'),
  '/captain/profile': () => import('../../pages/doer/DoerProfile.vue'),
  '/admin': () => import('../../pages/admin/AdminDashboard.vue'),
  '/admin/insights': () => import('../../pages/admin/InsightsOverview.vue'),
  '/admin/employees': () => import('../../pages/admin/EmployeeManagement.vue'),
  '/admin/tickets': () => import('../../pages/admin/AdminTicketsView.vue'),
  '/admin/profile': () => import('../../pages/doer/DoerProfile.vue'),
}

function preloadRoute(to: string) {
  const loader = routeLoaders[to]
  if (loader) loader().catch(() => {})
}
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  AcademicCapIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  UserIcon,
  TicketIcon,
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ClockIcon as ClockIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  PresentationChartLineIcon as PresentationChartLineIconSolid,
  UserIcon as UserIconSolid,
  TicketIcon as TicketIconSolid,
} from '@heroicons/vue/24/solid'

const props = defineProps<{
  panelName: 'doer' | 'captain' | 'admin'
}>()

const route = useRoute()

interface BottomNavItem {
  label: string
  outlineIcon: unknown
  solidIcon: unknown
  to: string
}

const panelItems: Record<string, BottomNavItem[]> = {
  doer: [
    { label: 'Home', outlineIcon: HomeIcon, solidIcon: HomeIconSolid, to: '/doer' },
    {
      label: 'Tasks',
      outlineIcon: ClipboardDocumentListIcon,
      solidIcon: ClipboardDocumentListIconSolid,
      to: '/doer/tasks',
    },
    {
      label: 'Attendance',
      outlineIcon: ClockIcon,
      solidIcon: ClockIconSolid,
      to: '/doer/attendance',
    },
    {
      label: 'Training',
      outlineIcon: AcademicCapIcon,
      solidIcon: AcademicCapIconSolid,
      to: '/doer/training',
    },
    {
      label: 'More',
      outlineIcon: EllipsisHorizontalIcon,
      solidIcon: EllipsisHorizontalIconSolid,
      to: '/doer/profile',
    },
  ],
  captain: [
    {
      label: 'Dashboard',
      outlineIcon: ChartBarIcon,
      solidIcon: ChartBarIconSolid,
      to: '/captain',
    },
    {
      label: 'Rescue',
      outlineIcon: ExclamationTriangleIcon,
      solidIcon: ExclamationTriangleIconSolid,
      to: '/captain/rescue',
    },
    {
      label: 'Team',
      outlineIcon: UserGroupIcon,
      solidIcon: UserGroupIconSolid,
      to: '/captain/team',
    },
    {
      label: 'Approvals',
      outlineIcon: CalendarDaysIcon,
      solidIcon: CalendarDaysIconSolid,
      to: '/captain/leave-approvals',
    },
    {
      label: 'More',
      outlineIcon: EllipsisHorizontalIcon,
      solidIcon: EllipsisHorizontalIconSolid,
      to: '/captain/profile',
    },
  ],
  admin: [
    {
      label: 'Dashboard',
      outlineIcon: ChartBarIcon,
      solidIcon: ChartBarIconSolid,
      to: '/admin',
    },
    {
      label: 'Insights',
      outlineIcon: PresentationChartLineIcon,
      solidIcon: PresentationChartLineIconSolid,
      to: '/admin/insights',
    },
    { label: 'Employees', outlineIcon: UserIcon, solidIcon: UserIconSolid, to: '/admin/employees' },
    { label: 'Tickets', outlineIcon: TicketIcon, solidIcon: TicketIconSolid, to: '/admin/tickets' },
    {
      label: 'More',
      outlineIcon: EllipsisHorizontalIcon,
      solidIcon: EllipsisHorizontalIconSolid,
      to: '/admin/profile',
    },
  ],
}

const items = computed(() => panelItems[props.panelName] ?? panelItems.doer)

function isActive(item: BottomNavItem): boolean {
  if (item.label === 'More') {
    return false
  }
  return route.path === item.to || route.path.startsWith(item.to + '/')
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <ul class="flex items-center justify-around h-14">
      <li v-for="item in items" :key="item.to" class="flex-1">
        <router-link
          :to="item.to"
          class="flex flex-col items-center justify-center gap-0.5 h-full pt-1 pb-0.5"
          :class="isActive(item) ? 'text-primary-600' : 'text-neutral-500'"
          @mouseenter="preloadRoute(item.to)"
        >
          <component :is="isActive(item) ? item.solidIcon : item.outlineIcon" class="w-5 h-5" />
          <span class="text-[10px] font-medium leading-tight">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
