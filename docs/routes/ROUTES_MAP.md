# OptiFlow OS — Frontend Route Map

> **Scope:** Vue 3 + Vue Router 4 — lazy-loaded components, RBAC guards, panel-scoped layouts.
> **Last updated:** 2026-06-03

---

## 1. Route Table

| Path | Name | Component | Lazy-Load Import | Meta |
|---|---|---|---|---|
| `/` | `root` | `LoginPage` | `@/views/auth/LoginPage.vue` | `{ title: "Login", icon: "mdi-login", guest: true }` |
| `/login` | `login` | `LoginPage` | `@/views/auth/LoginPage.vue` | `{ title: "Login", icon: "mdi-login", guest: true }` |
| `/otp-verify` | `otpVerify` | `OtpVerifyPage` | `@/views/auth/OtpVerifyPage.vue` | `{ title: "Verify OTP", icon: "mdi-shield-lock", guest: true }` |
| `/forgot-password` | `forgotPassword` | `ForgotPasswordPage` | `@/views/auth/ForgotPasswordPage.vue` | `{ title: "Forgot Password", icon: "mdi-lock-reset", guest: true }` |
| `/reset-password` | `resetPassword` | `ResetPasswordPage` | `@/views/auth/ResetPasswordPage.vue` | `{ title: "Reset Password", icon: "mdi-lock-reset", guest: true }` |
| `/profile-wizard` | `profileWizard` | `ProfileWizardPage` | `@/views/auth/ProfileWizardPage.vue` | `{ title: "Complete Profile", icon: "mdi-account-edit", roles: ["doer", "captain", "admin"] }` |
| `/doer` | `doerHome` | `DoerDashboard` | `@/views/doer/DoerDashboard.vue` | `{ title: "Dashboard", icon: "mdi-view-dashboard", roles: ["doer"] }` |
| `/doer/tasks` | `doerTasks` | `MyTasksPage` | `@/views/doer/MyTasksPage.vue` | `{ title: "My Tasks", icon: "mdi-checkbox-marked", roles: ["doer"] }` |
| `/doer/tasks/:id` | `doerTaskDetail` | `TaskDetailPage` | `@/views/doer/TaskDetailPage.vue` | `{ title: "Task Detail", icon: "mdi-file-document", roles: ["doer"] }` |
| `/doer/tasks/create` | `doerTaskCreate` | `CreateDelegationTaskPage` | `@/views/doer/CreateDelegationTaskPage.vue` | `{ title: "Create Task", icon: "mdi-plus-circle", roles: ["doer"] }` |
| `/doer/worklist` | `doerWorklist` | `MyWorklistPage` | `@/views/doer/MyWorklistPage.vue` | `{ title: "My Worklist", icon: "mdi-format-list-bulleted", roles: ["doer"] }` |
| `/doer/worklist/:id` | `doerWorklistItem` | `WorklistItemDetailPage` | `@/views/doer/WorklistItemDetailPage.vue` | `{ title: "Worklist Item", icon: "mdi-file-document", roles: ["doer"] }` |
| `/doer/attendance` | `doerAttendance` | `AttendanceViewPage` | `@/views/doer/AttendanceViewPage.vue` | `{ title: "Attendance", icon: "mdi-clock-check", roles: ["doer"] }` |
| `/doer/leave` | `doerLeave` | `LeaveViewPage` | `@/views/doer/LeaveViewPage.vue` | `{ title: "Leave", icon: "mdi-beach", roles: ["doer"] }` |
| `/doer/leave/apply` | `doerLeaveApply` | `LeaveApplyFormPage` | `@/views/doer/LeaveApplyFormPage.vue` | `{ title: "Apply Leave", icon: "mdi-plus", roles: ["doer"] }` |
| `/doer/training` | `doerTraining` | `TrainingViewPage` | `@/views/doer/TrainingViewPage.vue` | `{ title: "Training", icon: "mdi-school", roles: ["doer"] }` |
| `/doer/training/:id` | `doerTrainingDetail` | `TrainingDetailPage` | `@/views/doer/TrainingDetailPage.vue` | `{ title: "Training Detail", icon: "mdi-file-document", roles: ["doer"] }` |
| `/doer/tickets` | `doerTickets` | `HelpTicketsPage` | `@/views/doer/HelpTicketsPage.vue` | `{ title: "Help Tickets", icon: "mdi-ticket", roles: ["doer"] }` |
| `/doer/tickets/create` | `doerTicketCreate` | `RaiseTicketFormPage` | `@/views/doer/RaiseTicketFormPage.vue` | `{ title: "Raise Ticket", icon: "mdi-plus", roles: ["doer"] }` |
| `/doer/tickets/:id` | `doerTicketDetail` | `TicketDetailPage` | `@/views/doer/TicketDetailPage.vue` | `{ title: "Ticket Detail", icon: "mdi-file-document", roles: ["doer"] }` |
| `/doer/notifications` | `doerNotifications` | `NotificationsViewPage` | `@/views/doer/NotificationsViewPage.vue` | `{ title: "Notifications", icon: "mdi-bell", roles: ["doer"] }` |
| `/doer/profile` | `doerProfile` | `DoerProfilePage` | `@/views/doer/DoerProfilePage.vue` | `{ title: "Profile", icon: "mdi-account", roles: ["doer"] }` |
| `/captain` | `captainDashboard` | `CaptainDashboardPage` | `@/views/captain/CaptainDashboardPage.vue` | `{ title: "Dashboard", icon: "mdi-view-dashboard", roles: ["captain"] }` |
| `/captain/rescue` | `captainRescueQueue` | `RescueQueuePage` | `@/views/captain/RescueQueuePage.vue` | `{ title: "Rescue Queue", icon: "mdi-lifebuoy", roles: ["captain"] }` |
| `/captain/rescue/:id` | `captainRescueDetail` | `RescueDetailPage` | `@/views/captain/RescueDetailPage.vue` | `{ title: "Rescue Detail", icon: "mdi-file-document", roles: ["captain"] }` |
| `/captain/team` | `captainTeam` | `TeamRosterPage` | `@/views/captain/TeamRosterPage.vue` | `{ title: "Team Roster", icon: "mdi-account-group", roles: ["captain"] }` |
| `/captain/team/:id` | `captainMemberDetail` | `MemberDetailPage` | `@/views/captain/MemberDetailPage.vue` | `{ title: "Member Detail", icon: "mdi-account", roles: ["captain"] }` |
| `/captain/worklists` | `captainWorklists` | `WorklistManagementPage` | `@/views/captain/WorklistManagementPage.vue` | `{ title: "Worklists", icon: "mdi-format-list-bulleted", roles: ["captain"] }` |
| `/captain/worklists/create` | `captainWorklistCreate` | `WorklistCreateFormPage` | `@/views/captain/WorklistCreateFormPage.vue` | `{ title: "Create Worklist", icon: "mdi-plus", roles: ["captain"] }` |
| `/captain/worklists/:id/edit` | `captainWorklistEdit` | `WorklistEditFormPage` | `@/views/captain/WorklistEditFormPage.vue` | `{ title: "Edit Worklist", icon: "mdi-pencil", roles: ["captain"] }` |
| `/captain/training` | `captainTraining` | `TrainingAssignmentPage` | `@/views/captain/TrainingAssignmentPage.vue` | `{ title: "Training", icon: "mdi-school", roles: ["captain"] }` |
| `/captain/leave-approvals` | `captainLeaveApprovals` | `LeaveApprovalsPage` | `@/views/captain/LeaveApprovalsPage.vue` | `{ title: "Leave Approvals", icon: "mdi-beach", roles: ["captain"] }` |
| `/captain/attendance` | `captainAttendance` | `AttendanceMonitorPage` | `@/views/captain/AttendanceMonitorPage.vue` | `{ title: "Attendance", icon: "mdi-clock-check", roles: ["captain"] }` |
| `/captain/attendance/corrections` | `captainAttendanceCorrections` | `AttendanceCorrectionsPage` | `@/views/captain/AttendanceCorrectionsPage.vue` | `{ title: "Corrections", icon: "mdi-clock-edit", roles: ["captain"] }` |
| `/captain/tickets` | `captainTickets` | `CaptainTicketsPage` | `@/views/captain/CaptainTicketsPage.vue` | `{ title: "Tickets", icon: "mdi-ticket", roles: ["captain"] }` |
| `/captain/tickets/:id` | `captainTicketDetail` | `CaptainTicketDetailPage` | `@/views/captain/CaptainTicketDetailPage.vue` | `{ title: "Ticket Detail", icon: "mdi-file-document", roles: ["captain"] }` |
| `/captain/notifications` | `captainNotifications` | `CaptainNotificationsPage` | `@/views/captain/CaptainNotificationsPage.vue` | `{ title: "Notifications", icon: "mdi-bell", roles: ["captain"] }` |
| `/captain/profile` | `captainProfile` | `CaptainProfilePage` | `@/views/captain/CaptainProfilePage.vue` | `{ title: "Profile", icon: "mdi-account", roles: ["captain"] }` |
| `/admin` | `adminDashboard` | `AdminDashboardPage` | `@/views/admin/AdminDashboardPage.vue` | `{ title: "Dashboard", icon: "mdi-view-dashboard", roles: ["admin"] }` |
| `/admin/insights` | `adminInsights` | `InsightsOverviewPage` | `@/views/admin/InsightsOverviewPage.vue` | `{ title: "Insights", icon: "mdi-chart-bar", roles: ["admin"] }` |
| `/admin/insights/doer-360` | `adminDoer360` | `Doer360ViewPage` | `@/views/admin/Doer360ViewPage.vue` | `{ title: "Doer 360", icon: "mdi-account-details", roles: ["admin"] }` |
| `/admin/insights/captain-index` | `adminCaptainIndex` | `CaptainIndexViewPage` | `@/views/admin/CaptainIndexViewPage.vue` | `{ title: "Captain Index", icon: "mdi-account-star", roles: ["admin"] }` |
| `/admin/insights/departments` | `adminDeptAnalytics` | `DepartmentAnalyticsPage` | `@/views/admin/DepartmentAnalyticsPage.vue` | `{ title: "Departments", icon: "mdi-domain", roles: ["admin"] }` |
| `/admin/insights/weekly-review` | `adminWeeklyReview` | `WeeklyReviewViewPage` | `@/views/admin/WeeklyReviewViewPage.vue` | `{ title: "Weekly Review", icon: "mdi-calendar-week", roles: ["admin"] }` |
| `/admin/employees` | `adminEmployees` | `EmployeeManagementPage` | `@/views/admin/EmployeeManagementPage.vue` | `{ title: "Employees", icon: "mdi-account-multiple", roles: ["admin"] }` |
| `/admin/employees/:id` | `adminEmployeeDetail` | `EmployeeDetailPage` | `@/views/admin/EmployeeDetailPage.vue` | `{ title: "Employee Detail", icon: "mdi-account", roles: ["admin"] }` |
| `/admin/departments` | `adminDepartments` | `DepartmentManagementPage` | `@/views/admin/DepartmentManagementPage.vue` | `{ title: "Departments", icon: "mdi-domain", roles: ["admin"] }` |
| `/admin/attendance` | `adminAttendance` | `AdminAttendanceViewPage` | `@/views/admin/AdminAttendanceViewPage.vue` | `{ title: "Attendance", icon: "mdi-clock-check", roles: ["admin"] }` |
| `/admin/leave` | `adminLeave` | `AdminLeaveViewPage` | `@/views/admin/AdminLeaveViewPage.vue` | `{ title: "Leave", icon: "mdi-beach", roles: ["admin"] }` |
| `/admin/tickets` | `adminTickets` | `AdminTicketsViewPage` | `@/views/admin/AdminTicketsViewPage.vue` | `{ title: "Tickets", icon: "mdi-ticket", roles: ["admin"] }` |
| `/admin/training` | `adminTraining` | `AdminTrainingViewPage` | `@/views/admin/AdminTrainingViewPage.vue` | `{ title: "Training", icon: "mdi-school", roles: ["admin"] }` |
| `/admin/control-center` | `adminControlCenter` | `ControlCenterPage` | `@/views/admin/ControlCenterPage.vue` | `{ title: "Control Center", icon: "mdi-tune", roles: ["admin"] }` |
| `/admin/control-center/permissions` | `adminPermissions` | `RolePermissionsPage` | `@/views/admin/RolePermissionsPage.vue` | `{ title: "Permissions", icon: "mdi-shield-account", roles: ["admin"] }` |
| `/admin/control-center/settings` | `adminSettings` | `SystemSettingsPage` | `@/views/admin/SystemSettingsPage.vue` | `{ title: "Settings", icon: "mdi-cog", roles: ["admin"] }` |
| `/admin/control-center/audit-logs` | `adminAuditLogs` | `AuditLogsPage` | `@/views/admin/AuditLogsPage.vue` | `{ title: "Audit Logs", icon: "mdi-text-search", roles: ["admin"] }` |
| `/admin/control-center/exceptions` | `adminExceptions` | `ExceptionMonitorPage` | `@/views/admin/ExceptionMonitorPage.vue` | `{ title: "Exceptions", icon: "mdi-alert-circle", roles: ["admin"] }` |
| `/admin/notifications` | `adminNotifications` | `AdminNotificationsPage` | `@/views/admin/AdminNotificationsPage.vue` | `{ title: "Notifications", icon: "mdi-bell", roles: ["admin"] }` |
| `/admin/profile` | `adminProfile` | `AdminProfilePage` | `@/views/admin/AdminProfilePage.vue` | `{ title: "Profile", icon: "mdi-account", roles: ["admin"] }` |
| `/notifications` | `notificationsCenter` | `NotificationsCenterPage` | `@/views/shared/NotificationsCenterPage.vue` | `{ title: "Notifications", icon: "mdi-bell", roles: ["doer", "captain", "admin"] }` |
| `/settings` | `userSettings` | `UserSettingsPage` | `@/views/shared/UserSettingsPage.vue` | `{ title: "Settings", icon: "mdi-cog", roles: ["doer", "captain", "admin"] }` |

### 1.1 Catch-All / 404

| Path | Name | Component | Lazy-Load Import | Meta |
|---|---|---|---|---|
| `/:pathMatch(.*)*` | `notFound` | `NotFoundPage` | `@/views/errors/NotFoundPage.vue` | `{ title: "Page Not Found" }` |

---

## 2. Navigation Guards — RBAC

```typescript
// src/router/guards.ts
import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const GUEST_ONLY_ROUTES = ['login', 'otpVerify', 'forgotPassword', 'resetPassword']

export function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: (path?: string) => void,
): void {
  const auth = useAuthStore()

  // 1. Redirect authenticated users away from guest pages
  if (GUEST_ONLY_ROUTES.includes(to.name as string) && auth.isAuthenticated) {
    return panelHomeRedirect(auth.user!.role, next)
  }

  // 2. Require authentication for all guarded routes
  if (!auth.isAuthenticated) {
    return next('/login')
  }

  // 3. Block access when profile-wizard is required
  if (auth.requiresProfileCompletion && to.name !== 'profileWizard') {
    return next('/profile-wizard')
  }
  if (!auth.requiresProfileCompletion && to.name === 'profileWizard') {
    return panelHomeRedirect(auth.user!.role, next)
  }

  // 4. Role-based access control
  const routeRoles = to.meta.roles as string[] | undefined
  if (routeRoles && !routeRoles.includes(auth.user!.role)) {
    return panelHomeRedirect(auth.user!.role, next)
  }

  next()
}

function panelHomeRedirect(role: string, next: (path?: string) => void) {
  const homes: Record<string, string> = {
    doer: '/doer',
    captain: '/captain',
    admin: '/admin',
  }
  next(homes[role] ?? '/')
}
```

### Guard Registration

```typescript
// src/router/index.ts
router.beforeEach(requireAuth)
```

### Meta Field Reference

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Page title (used in `<title>` + breadcrumbs) |
| `icon` | `string` | Material Design Icon key |
| `roles` | `string[]` | Allowed roles; `undefined` = public |
| `guest` | `boolean` | `true` = unauthenticated users only |
| `layout` | `string` | Panel layout override (`auth`, `doer`, `captain`, `admin`, `default`) |
| `parent` | `string` | Logical parent route name (for breadcrumb ancestry) |

---

## 3. Panel Route Config Constants

Used to dynamically render sidebar navigation and bottom-nav tabs per panel.

### 3.1 Auth / Public Routes

```typescript
// src/router/config/authRoutes.ts
export const authRoutes = [
  { path: '/login',       name: 'login',          meta: { title: 'Login',          icon: 'mdi-login' } },
  { path: '/otp-verify',  name: 'otpVerify',       meta: { title: 'Verify OTP',     icon: 'mdi-shield-lock' } },
  { path: '/forgot-password', name: 'forgotPassword', meta: { title: 'Forgot Password', icon: 'mdi-lock-reset' } },
  { path: '/reset-password',  name: 'resetPassword',  meta: { title: 'Reset Password',  icon: 'mdi-lock-reset' } },
]
```

### 3.2 Doer Panel — Sidebar & Bottom Nav

```typescript
// src/router/config/doerRoutes.ts
export const doerSidebar: PanelRoute[] = [
  { path: '/doer',                   name: 'doerHome',         meta: { title: 'Dashboard',    icon: 'mdi-view-dashboard', badge: false } },
  { path: '/doer/tasks',             name: 'doerTasks',        meta: { title: 'My Tasks',     icon: 'mdi-checkbox-marked', badge: 'pending' } },
  { path: '/doer/worklist',          name: 'doerWorklist',     meta: { title: 'My Worklist',  icon: 'mdi-format-list-bulleted', badge: 'count' } },
  { path: '/doer/attendance',        name: 'doerAttendance',   meta: { title: 'Attendance',   icon: 'mdi-clock-check', badge: false } },
  { path: '/doer/leave',             name: 'doerLeave',        meta: { title: 'Leave',        icon: 'mdi-beach', badge: false } },
  { path: '/doer/training',          name: 'doerTraining',     meta: { title: 'Training',     icon: 'mdi-school', badge: 'due' } },
  { path: '/doer/tickets',           name: 'doerTickets',      meta: { title: 'Help Tickets', icon: 'mdi-ticket', badge: 'open' } },
]

export const doerBottomNav: PanelRoute[] = [
  { path: '/doer',           name: 'doerHome',     meta: { title: 'Home',         icon: 'mdi-home' } },
  { path: '/doer/tasks',     name: 'doerTasks',    meta: { title: 'Tasks',        icon: 'mdi-checkbox-marked' } },
  { path: '/doer/worklist',  name: 'doerWorklist', meta: { title: 'Worklist',     icon: 'mdi-format-list-bulleted' } },
  { path: '/doer/tickets',   name: 'doerTickets',  meta: { title: 'Tickets',      icon: 'mdi-ticket' } },
  { path: '/doer/profile',   name: 'doerProfile',  meta: { title: 'Profile',      icon: 'mdi-account' } },
]
```

### 3.3 Captain Panel — Sidebar & Bottom Nav

```typescript
// src/router/config/captainRoutes.ts
export const captainSidebar: PanelRoute[] = [
  { path: '/captain',                      name: 'captainDashboard',     meta: { title: 'Dashboard',        icon: 'mdi-view-dashboard', badge: false } },
  { path: '/captain/rescue',               name: 'captainRescueQueue',   meta: { title: 'Rescue Queue',     icon: 'mdi-lifebuoy', badge: 'urgent' } },
  { path: '/captain/team',                 name: 'captainTeam',          meta: { title: 'Team Roster',      icon: 'mdi-account-group', badge: false } },
  { path: '/captain/worklists',            name: 'captainWorklists',     meta: { title: 'Worklists',        icon: 'mdi-format-list-bulleted', badge: false } },
  { path: '/captain/training',             name: 'captainTraining',      meta: { title: 'Training',         icon: 'mdi-school', badge: 'pending' } },
  { path: '/captain/leave-approvals',      name: 'captainLeaveApprovals', meta: { title: 'Leave Approvals', icon: 'mdi-beach', badge: 'pending' } },
  { path: '/captain/attendance',           name: 'captainAttendance',    meta: { title: 'Attendance',       icon: 'mdi-clock-check', badge: false } },
  { path: '/captain/tickets',              name: 'captainTickets',       meta: { title: 'Tickets',          icon: 'mdi-ticket', badge: 'open' } },
]

export const captainBottomNav: PanelRoute[] = [
  { path: '/captain',            name: 'captainDashboard', meta: { title: 'Home',      icon: 'mdi-home' } },
  { path: '/captain/rescue',     name: 'captainRescueQueue', meta: { title: 'Rescue', icon: 'mdi-lifebuoy' } },
  { path: '/captain/team',       name: 'captainTeam',     meta: { title: 'Team',      icon: 'mdi-account-group' } },
  { path: '/captain/worklists',  name: 'captainWorklists', meta: { title: 'Worklists', icon: 'mdi-format-list-bulleted' } },
  { path: '/captain/profile',    name: 'captainProfile',  meta: { title: 'Profile',   icon: 'mdi-account' } },
]
```

### 3.4 Admin Panel — Sidebar & Bottom Nav

```typescript
// src/router/config/adminRoutes.ts
export const adminSidebar: PanelRoute[] = [
  // Core
  { path: '/admin',                       name: 'adminDashboard',   meta: { title: 'Dashboard',      icon: 'mdi-view-dashboard', badge: false } },
  // Insights
  { path: '/admin/insights',              name: 'adminInsights',    meta: { title: 'Insights',       icon: 'mdi-chart-bar', badge: false, group: 'analytics' } },
  { path: '/admin/insights/doer-360',     name: 'adminDoer360',     meta: { title: 'Doer 360',       icon: 'mdi-account-details', badge: false, group: 'analytics' } },
  { path: '/admin/insights/captain-index', name: 'adminCaptainIndex', meta: { title: 'Captain Index', icon: 'mdi-account-star', badge: false, group: 'analytics' } },
  { path: '/admin/insights/departments',  name: 'adminDeptAnalytics', meta: { title: 'Departments',  icon: 'mdi-domain', badge: false, group: 'analytics' } },
  { path: '/admin/insights/weekly-review', name: 'adminWeeklyReview', meta: { title: 'Weekly Review', icon: 'mdi-calendar-week', badge: false, group: 'analytics' } },
  // People
  { path: '/admin/employees',             name: 'adminEmployees',   meta: { title: 'Employees',      icon: 'mdi-account-multiple', badge: false, group: 'people' } },
  { path: '/admin/departments',           name: 'adminDepartments', meta: { title: 'Departments',    icon: 'mdi-domain', badge: false, group: 'people' } },
  // Operations
  { path: '/admin/attendance',            name: 'adminAttendance',  meta: { title: 'Attendance',     icon: 'mdi-clock-check', badge: false, group: 'ops' } },
  { path: '/admin/leave',                 name: 'adminLeave',       meta: { title: 'Leave',          icon: 'mdi-beach', badge: false, group: 'ops' } },
  { path: '/admin/tickets',               name: 'adminTickets',     meta: { title: 'Tickets',        icon: 'mdi-ticket', badge: 'open', group: 'ops' } },
  { path: '/admin/training',              name: 'adminTraining',    meta: { title: 'Training',       icon: 'mdi-school', badge: false, group: 'ops' } },
  // Control
  { path: '/admin/control-center',        name: 'adminControlCenter', meta: { title: 'Control Center', icon: 'mdi-tune', badge: false, group: 'control' } },
]

export const adminBottomNav: PanelRoute[] = [
  { path: '/admin',                name: 'adminDashboard',    meta: { title: 'Home',       icon: 'mdi-home' } },
  { path: '/admin/insights',       name: 'adminInsights',     meta: { title: 'Insights',   icon: 'mdi-chart-bar' } },
  { path: '/admin/employees',      name: 'adminEmployees',    meta: { title: 'Employees',  icon: 'mdi-account-multiple' } },
  { path: '/admin/control-center', name: 'adminControlCenter', meta: { title: 'Control',   icon: 'mdi-tune' } },
  { path: '/admin/profile',        name: 'adminProfile',      meta: { title: 'Profile',    icon: 'mdi-account' } },
]
```

### 3.5 TypeScript Type

```typescript
// src/router/config/types.ts
export interface PanelRoute {
  path: string
  name: string
  meta: {
    title: string
    icon: string
    badge?: false | 'count' | 'pending' | 'open' | 'due' | 'urgent'
    group?: string  // sidebar group key (admin only)
  }
  children?: PanelRoute[]
}
```

---

## 4. Breadcrumb — Route Change Tracking

```typescript
// src/composables/useBreadcrumbs.ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { breadcrumbOverrides } from '@/router/config/breadcrumbs'

export interface Breadcrumb {
  label: string
  path?: string
}

export function useBreadcrumbs(overrides?: Breadcrumb[]) {
  const route = useRoute()

  return computed<Breadcrumb[]>(() => {
    if (overrides) return overrides

    // Derive breadcrumbs from the matched route tree
    const crumbs: Breadcrumb[] = route.matched
      .filter((r) => r.name && r.meta?.title)
      .map((r) => ({
        label: (r.meta.title as string) ?? r.name as string,
        path: r.path === route.path ? undefined : r.path,
      }))

    // Apply manual overrides for parametric routes
    if (breadcrumbOverrides[route.name as string]) {
      const idx = crumbs.length - 1
      crumbs[idx] = { ...crumbs[idx], ...breadcrumbOverrides[route.name as string] }
    }

    return crumbs
  })
}
```

### Breadcrumb Override Map

```typescript
// src/router/config/breadcrumbs.ts
export const breadcrumbOverrides: Record<string, Partial<{ label: string; path: string }>> = {
  doerTaskDetail:       { label: 'Task #{id}' },
  doerWorklistItem:    { label: 'Worklist Item' },
  doerTrainingDetail:  { label: 'Training Module' },
  doerTicketDetail:    { label: 'Ticket #{id}' },
  captainRescueDetail: { label: 'Rescue #{id}' },
  captainMemberDetail: { label: 'Team Member' },
  captainWorklistEdit: { label: 'Edit Worklist' },
  captainTicketDetail: { label: 'Ticket #{id}' },
  adminEmployeeDetail: { label: 'Employee Detail' },
  adminDoer360:        { label: 'Doer 360°' },
  adminCaptainIndex:   { label: 'Captain Index' },
}
```

---

## 5. Layout Resolution

```typescript
// src/router/config/layouts.ts
import type { RouteRecordRaw } from 'vue-router'

export const panelLayouts: Record<string, string> = {
  doer:    'DoerLayout',
  captain: 'CaptainLayout',
  admin:   'AdminLayout',
}

export function resolveLayout(route: RouteRecordRaw): string {
  const panel = route.path.split('/')[1] // 'doer' | 'captain' | 'admin'
  return panelLayouts[panel] ?? 'DefaultLayout'
}
```

---

## 6. Route Import Map (Full)

```typescript
// Auto-generated — src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Auth
  { path: '/',                  name: 'root',              component: () => import('@/views/auth/LoginPage.vue'),              meta: { title: 'Login', icon: 'mdi-login', guest: true } },
  { path: '/login',             name: 'login',             component: () => import('@/views/auth/LoginPage.vue'),              meta: { title: 'Login', icon: 'mdi-login', guest: true } },
  { path: '/otp-verify',        name: 'otpVerify',         component: () => import('@/views/auth/OtpVerifyPage.vue'),          meta: { title: 'Verify OTP', icon: 'mdi-shield-lock', guest: true } },
  { path: '/forgot-password',   name: 'forgotPassword',     component: () => import('@/views/auth/ForgotPasswordPage.vue'),    meta: { title: 'Forgot Password', icon: 'mdi-lock-reset', guest: true } },
  { path: '/reset-password',    name: 'resetPassword',      component: () => import('@/views/auth/ResetPasswordPage.vue'),     meta: { title: 'Reset Password', icon: 'mdi-lock-reset', guest: true } },
  { path: '/profile-wizard',    name: 'profileWizard',      component: () => import('@/views/auth/ProfileWizardPage.vue'),    meta: { title: 'Complete Profile', icon: 'mdi-account-edit', roles: ['doer','captain','admin'] } },

  // Doer
  { path: '/doer',              name: 'doerHome',          component: () => import('@/views/doer/DoerDashboard.vue'),                meta: { title: 'Dashboard', icon: 'mdi-view-dashboard', roles: ['doer'] } },
  { path: '/doer/tasks',        name: 'doerTasks',         component: () => import('@/views/doer/MyTasksPage.vue'),                   meta: { title: 'My Tasks', icon: 'mdi-checkbox-marked', roles: ['doer'] } },
  { path: '/doer/tasks/:id',    name: 'doerTaskDetail',    component: () => import('@/views/doer/TaskDetailPage.vue'),                meta: { title: 'Task Detail', icon: 'mdi-file-document', roles: ['doer'] } },
  { path: '/doer/tasks/create', name: 'doerTaskCreate',    component: () => import('@/views/doer/CreateDelegationTaskPage.vue'),      meta: { title: 'Create Task', icon: 'mdi-plus-circle', roles: ['doer'] } },
  { path: '/doer/worklist',     name: 'doerWorklist',      component: () => import('@/views/doer/MyWorklistPage.vue'),                meta: { title: 'My Worklist', icon: 'mdi-format-list-bulleted', roles: ['doer'] } },

  // ... all routes follow the same lazy-import pattern
]

export default routes
```

---

## 7. Route Index

| # | Group | Count |
|---|---|---|
| 1 | Auth / Public | 6 |
| 2 | Doer Panel | 14 |
| 3 | Captain Panel | 13 |
| 4 | Admin Panel | 20 |
| 5 | Shared | 2 |
| 6 | 404 Catch-All | 1 |
| | **Total** | **56** |

## Routes Added (Remediation)

| Panel | Route | Name | Purpose |
|---|---|---|---|
| Doer | /doer/tickets/:id | DoerTicketDetail | View help ticket detail |
| Captain | /captain/team/add | AddMember | Add new team member |
| Admin | /admin/tickets/:id | AdminTicketDetail | View and manage ticket detail |
| Admin | /admin/notifications | AdminNotifications | Shared notifications view |
