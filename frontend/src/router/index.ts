import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useStore } from '../stores/useStore'
import { defineComponent, h } from 'vue'

function lazyLoad(loader: () => Promise<any>): () => Promise<any> {
  return () =>
    loader().catch(() => ({
      default: defineComponent({
        setup() {
          return () =>
            h('div', { class: 'min-h-screen flex items-center justify-center p-8' }, [
              h('div', { class: 'text-center' }, [
                h('div', { class: 'text-danger-500 text-4xl mb-4' }, '\u26A0'),
                h('h2', { class: 'text-h2 text-neutral-900 mb-2' }, 'Page failed to load'),
                h('p', { class: 'text-body text-neutral-500 mb-4' }, 'A network error occurred while loading this page.'),
                h(
                  'a',
                  { href: '/login', class: 'inline-block px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors' },
                  'Go to Login',
                ),
              ]),
            ])
        },
      }),
    }))
}

const routes: RouteRecordRaw[] = [
  // Auth routes (no layout)
  {
    path: '/login',
    name: 'Login',
    component: lazyLoad(() => import('../pages/auth/LoginView.vue')),
    meta: { requiresAuth: false, title: 'Log In' },
  },
  {
    path: '/otp',
    name: 'OTP',
    component: lazyLoad(() => import('../pages/auth/OtpVerifyView.vue')),
    meta: { requiresAuth: false, title: 'Verify OTP' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: lazyLoad(() => import('../pages/auth/ForgotPasswordView.vue')),
    meta: { requiresAuth: false, title: 'Forgot Password' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: lazyLoad(() => import('../pages/auth/ResetPasswordView.vue')),
    meta: { requiresAuth: false, title: 'Reset Password' },
  },
  {
    path: '/profile-wizard',
    name: 'ProfileWizard',
    component: lazyLoad(() => import('../pages/auth/ProfileWizard.vue')),
    meta: { requiresAuth: true, title: 'Complete Profile' },
  },

  // Doer panel
  {
    path: '/doer',
    component: lazyLoad(() => import('../layouts/DoerLayout.vue')),
    meta: { requiresAuth: true, role: 'doer' },
    children: [
      {
        path: '',
        name: 'DoerHome',
        component: lazyLoad(() => import('../pages/doer/DoerHome.vue')),
        meta: { title: 'Home' },
      },
      {
        path: 'tasks',
        name: 'MyTasks',
        component: lazyLoad(() => import('../pages/doer/MyTasks.vue')),
        meta: { title: 'My Tasks' },
      },
      {
        path: 'tasks/create',
        name: 'CreateTask',
        component: lazyLoad(() => import('../pages/doer/CreateTaskView.vue')),
        meta: { title: 'New Task' },
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: lazyLoad(() => import('../pages/doer/TaskDetail.vue')),
        meta: { title: 'Task Detail' },
      },
      {
        path: 'worklist',
        name: 'DoerWorklist',
        component: lazyLoad(() => import('../pages/doer/MyWorklist.vue')),
        meta: { title: 'My Worklist' },
      },
      {
        path: 'worklist/:id',
        name: 'DoerWorklistItem',
        component: lazyLoad(() => import('../pages/doer/TaskDetail.vue')),
        meta: { title: 'Worklist Item' },
      },
      {
        path: 'attendance',
        name: 'DoerAttendance',
        component: lazyLoad(() => import('../pages/doer/AttendanceView.vue')),
        meta: { title: 'Attendance' },
      },
      {
        path: 'leave',
        name: 'DoerLeave',
        component: lazyLoad(() => import('../pages/doer/LeaveView.vue')),
        meta: { title: 'Leave' },
      },
      {
        path: 'training',
        name: 'DoerTraining',
        component: lazyLoad(() => import('../pages/doer/TrainingView.vue')),
        meta: { title: 'Training' },
      },
      {
        path: 'tickets',
        name: 'DoerTickets',
        component: lazyLoad(() => import('../pages/doer/HelpTickets.vue')),
        meta: { title: 'Help Tickets' },
      },
      {
        path: 'tickets/:id',
        name: 'DoerTicketDetail',
        component: lazyLoad(() => import('../pages/doer/TicketDetail.vue')),
        meta: { title: 'Ticket Detail' },
      },
      {
        path: 'profile',
        name: 'DoerProfile',
        component: lazyLoad(() => import('../pages/doer/DoerProfile.vue')),
        meta: { title: 'Profile' },
      },
      {
        path: 'notifications',
        name: 'DoerNotifications',
        component: lazyLoad(() => import('../pages/doer/NotificationsView.vue')),
        meta: { title: 'Notifications' },
      },
    ],
  },

  // Captain panel
  {
    path: '/captain',
    component: lazyLoad(() => import('../layouts/CaptainLayout.vue')),
    meta: { requiresAuth: true, role: 'captain' },
    children: [
      {
        path: '',
        name: 'CaptainDashboard',
        component: lazyLoad(() => import('../pages/captain/CaptainDashboard.vue')),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'rescue',
        name: 'RescueQueue',
        component: lazyLoad(() => import('../pages/captain/RescueQueue.vue')),
        meta: { title: 'Rescue' },
      },
      {
        path: 'rescue/:id',
        name: 'RescueDetail',
        component: lazyLoad(() => import('../pages/captain/RescueDetail.vue')),
        meta: { title: 'Rescue Detail' },
      },
      {
        path: 'team',
        name: 'TeamRoster',
        component: lazyLoad(() => import('../pages/captain/TeamRoster.vue')),
        meta: { title: 'Team' },
      },
      {
        path: 'team/add',
        name: 'AddMember',
        component: lazyLoad(() => import('../pages/admin/EmployeeManagement.vue')),
        meta: { title: 'Add Member' },
      },
      {
        path: 'team/:id',
        name: 'MemberDetail',
        component: lazyLoad(() => import('../pages/captain/MemberDetail.vue')),
        meta: { title: 'Team Member' },
      },
      {
        path: 'worklists',
        name: 'CaptainWorklists',
        component: lazyLoad(() => import('../pages/captain/WorklistManagement.vue')),
        meta: { title: 'Worklists' },
      },
      {
        path: 'training',
        name: 'CaptainTraining',
        component: lazyLoad(() => import('../pages/captain/TrainingAssignment.vue')),
        meta: { title: 'Training' },
      },
      {
        path: 'leave-approvals',
        name: 'LeaveApprovals',
        component: lazyLoad(() => import('../pages/captain/LeaveApprovals.vue')),
        meta: { title: 'Leave Approvals' },
      },
      {
        path: 'attendance',
        name: 'CaptainAttendance',
        component: lazyLoad(() => import('../pages/captain/AttendanceMonitor.vue')),
        meta: { title: 'Attendance' },
      },
      {
        path: 'tickets',
        name: 'CaptainTickets',
        component: lazyLoad(() => import('../pages/captain/CaptainTickets.vue')),
        meta: { title: 'Tickets' },
      },
      {
        path: 'profile',
        name: 'CaptainProfile',
        component: lazyLoad(() => import('../pages/doer/DoerProfile.vue')),
        meta: { title: 'Profile' },
      },
    ],
  },

  // Admin panel
  {
    path: '/admin',
    component: lazyLoad(() => import('../layouts/AdminLayout.vue')),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: lazyLoad(() => import('../pages/admin/AdminDashboard.vue')),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'insights',
        name: 'InsightsOverview',
        component: lazyLoad(() => import('../pages/admin/InsightsOverview.vue')),
        meta: { title: 'Insights' },
      },
      {
        path: 'insights/doer-360',
        name: 'Doer360View',
        component: lazyLoad(() => import('../pages/admin/Doer360View.vue')),
        meta: { title: 'Doer 360°' },
      },
      {
        path: 'insights/captain-index',
        name: 'CaptainIndexView',
        component: lazyLoad(() => import('../pages/admin/CaptainIndexView.vue')),
        meta: { title: 'Captain Index' },
      },
      {
        path: 'insights/departments',
        name: 'DepartmentAnalytics',
        component: lazyLoad(() => import('../pages/admin/DepartmentAnalytics.vue')),
        meta: { title: 'Departments' },
      },
      {
        path: 'insights/weekly-review',
        name: 'WeeklyReview',
        component: lazyLoad(() => import('../pages/admin/WeeklyReviewView.vue')),
        meta: { title: 'Weekly Review' },
      },
      {
        path: 'employees',
        name: 'EmployeeManagement',
        component: lazyLoad(() => import('../pages/admin/EmployeeManagement.vue')),
        meta: { title: 'Employees' },
      },
      {
        path: 'employees/:id',
        name: 'EmployeeDetail',
        component: lazyLoad(() => import('../pages/admin/EmployeeDetail.vue')),
        meta: { title: 'Employee Detail' },
      },
      {
        path: 'departments',
        name: 'DepartmentManagement',
        component: lazyLoad(() => import('../pages/admin/DepartmentManagement.vue')),
        meta: { title: 'Departments' },
      },
      {
        path: 'leave',
        name: 'AdminLeave',
        component: lazyLoad(() => import('../pages/admin/AdminLeaveView.vue')),
        meta: { title: 'Leave' },
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: lazyLoad(() => import('../pages/admin/AdminTicketsView.vue')),
        meta: { title: 'Tickets' },
      },
      {
        path: 'attendance',
        name: 'AdminAttendance',
        component: lazyLoad(() => import('../pages/admin/AdminAttendance.vue')),
        meta: { title: 'Attendance' },
      },
      {
        path: 'tickets/:id',
        name: 'AdminTicketDetail',
        component: lazyLoad(() => import('../pages/admin/AdminTicketDetail.vue')),
        meta: { title: 'Ticket Detail' },
      },
      {
        path: 'training',
        name: 'AdminTraining',
        component: lazyLoad(() => import('../pages/admin/AdminTrainingView.vue')),
        meta: { title: 'Training' },
      },
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: lazyLoad(() => import('../pages/admin/AdminNotificationsView.vue')),
        meta: { title: 'Notifications' },
      },
      {
        path: 'control-center',
        name: 'ControlCenter',
        component: lazyLoad(() => import('../pages/admin/ControlCenter.vue')),
        meta: { title: 'Control Center' },
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: lazyLoad(() => import('../pages/doer/DoerProfile.vue')),
        meta: { title: 'Profile' },
      },
    ],
  },

  // Root redirect
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

const publicAuthPaths = ['/login', '/otp', '/forgot-password', '/reset-password']

const roleHome: Record<string, string> = { doer: '/doer', captain: '/captain', admin: '/admin' }

router.beforeEach((to, from, next) => {
  const store = useStore()

  // Resolve effective meta by walking matched route records (children inherit from parents)
  const routeMeta = to.matched.reduce((acc, record) => {
    if (record.meta.requiresAuth !== undefined) acc.requiresAuth = record.meta.requiresAuth
    if (record.meta.role !== undefined) acc.role = record.meta.role
    return acc
  }, { requiresAuth: false, role: undefined as string | undefined })

  // 1. Requires auth but not authenticated → preserve deep-link, redirect to login
  if (routeMeta.requiresAuth && !store.isAuthenticated) {
    try {
      sessionStorage.setItem('optiflow-redirect', to.fullPath)
    } catch { /* sessionStorage unavailable */ }
    next('/login')
    return
  }

  // 2. Authenticated on public auth pages → redirect to their role home
  if (store.isAuthenticated && publicAuthPaths.includes(to.path)) {
    next(roleHome[store.currentRole] || '/doer')
    return
  }

  // 3. Role mismatch → redirect to user's role home
  if (routeMeta.requiresAuth && routeMeta.role && store.isAuthenticated) {
    const userRole = store.currentRole || ''
    if (userRole !== routeMeta.role) {
      next(roleHome[userRole] || '/doer')
      return
    }
  }

  next()
})

router.onError((err) => {
  if (err.message?.includes('Failed to fetch dynamically imported module') || err.message?.includes('Loading chunk')) {
    window.location.href = '/login?error=chunk-load'
  }
})

export default router

export const doerNavItems = [
  { path: '/doer', name: 'Home', icon: 'HomeIcon' },
  { path: '/doer/tasks', name: 'My Tasks', icon: 'ClipboardDocumentCheckIcon' },
  { path: '/doer/attendance', name: 'Attendance', icon: 'ClockIcon' },
  { path: '/doer/training', name: 'Training', icon: 'AcademicCapIcon' },
  { path: '/doer/profile', name: 'More', icon: 'EllipsisHorizontalCircleIcon' },
]

export const captainNavItems = [
  { path: '/captain', name: 'Dashboard', icon: 'Squares2X2Icon' },
  { path: '/captain/rescue', name: 'Rescue', icon: 'LifebuoyIcon' },
  { path: '/captain/team', name: 'Team', icon: 'UsersIcon' },
  { path: '/captain/tickets', name: 'Tickets', icon: 'TicketIcon' },
  { path: '/captain/profile', name: 'More', icon: 'EllipsisHorizontalCircleIcon' },
]

export const adminNavItems = [
  { path: '/admin', name: 'Dashboard', icon: 'Squares2X2Icon' },
  { path: '/admin/insights', name: 'Insights', icon: 'ChartBarIcon' },
  { path: '/admin/employees', name: 'Employees', icon: 'UsersIcon' },
  { path: '/admin/tickets', name: 'Tickets', icon: 'TicketIcon' },
  { path: '/admin/profile', name: 'More', icon: 'EllipsisHorizontalCircleIcon' },
]
