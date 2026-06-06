# OptiFlow OS — Screen Inventory

**Total screens (Phase 1):** 44 page views across 4 panels

---

## Auth Panel (5 screens)

| # | Screen | Route | Component | Status |
|---|---|---|---|---|
| 1 | Login | /login | LoginView.vue | ✅ Implemented |
| 2 | OTP Verification | /otp | OtpVerifyView.vue | ✅ Implemented |
| 3 | Forgot Password | /forgot-password | ForgotPasswordView.vue | ✅ Implemented |
| 4 | Reset Password | /reset-password | ResetPasswordView.vue | ✅ Implemented |
| 5 | Profile Completion Wizard | /profile-wizard | ProfileWizard.vue | ✅ Implemented |

## Doer Panel (11 screens)

| # | Screen | Route | Component | Status |
|---|---|---|---|---|
| 6 | Doer Home | /doer | DoerHome.vue | ✅ Implemented |
| 7 | My Tasks | /doer/tasks | MyTasks.vue | ✅ Implemented |
| 8 | Create Task | /doer/tasks/create | CreateTaskView.vue | ✅ Implemented |
| 9 | Task Detail | /doer/tasks/:id | TaskDetail.vue | ✅ Implemented |
| 10 | My Worklist | /doer/worklist | MyWorklist.vue | ✅ Implemented |
| 11 | Attendance | /doer/attendance | AttendanceView.vue | ✅ Implemented |
| 12 | Leave | /doer/leave | LeaveView.vue | ✅ Implemented |
| 13 | Training | /doer/training | TrainingView.vue | ✅ Implemented |
| 14 | Help Tickets | /doer/tickets | HelpTickets.vue | ✅ Implemented |
| 15 | Profile & Settings | /doer/profile | DoerProfile.vue | ✅ Implemented |
| 16 | Ticket Detail | /doer/tickets/:id | (TicketDetail.vue exists, route missing) | ⚠️ Route not registered |

## Captain Panel (11 screens)

| # | Screen | Route | Component | Status |
|---|---|---|---|---|
| 17 | Captain Dashboard | /captain | CaptainDashboard.vue | ✅ Implemented |
| 18 | Rescue Queue | /captain/rescue | RescueQueue.vue | ✅ Implemented |
| 19 | Rescue Detail | /captain/rescue/:id | RescueDetail.vue | ✅ Implemented |
| 20 | Team Roster | /captain/team | TeamRoster.vue | ✅ Implemented |
| 21 | Member Detail | /captain/team/:id | MemberDetail.vue | ✅ Implemented |
| 22 | Worklists | /captain/worklists | WorklistManagement.vue | ✅ Implemented |
| 23 | Training Assignment | /captain/training | TrainingAssignment.vue | ✅ Implemented |
| 24 | Leave Approvals | /captain/leave-approvals | LeaveApprovals.vue | ✅ Implemented |
| 25 | Attendance Monitor | /captain/attendance | AttendanceMonitor.vue | ✅ Implemented |
| 26 | Tickets | /captain/tickets | CaptainTickets.vue | ✅ Implemented |
| 27 | Add Team Member | /captain/team/add | (no component) | ❌ Route + component missing |

## Admin Panel (17 screens)

| # | Screen | Route | Component | Status |
|---|---|---|---|---|
| 28 | Admin Dashboard | /admin | AdminDashboard.vue | ✅ Implemented |
| 29 | Insights Overview | /admin/insights | InsightsOverview.vue | ✅ Implemented |
| 30 | Doer 360° | /admin/insights/doer-360 | Doer360View.vue | ✅ Implemented |
| 31 | Captain Index | /admin/insights/captain-index | CaptainIndexView.vue | ✅ Implemented |
| 32 | Department Analytics | /admin/insights/departments | DepartmentAnalytics.vue | ✅ Implemented |
| 33 | Weekly Review | /admin/insights/weekly-review | WeeklyReviewView.vue | ✅ Implemented |
| 34 | Employee Management | /admin/employees | EmployeeManagement.vue | ✅ Implemented |
| 35 | Employee Detail | /admin/employees/:id | EmployeeDetail.vue | ✅ Implemented |
| 36 | Department Management | /admin/departments | DepartmentManagement.vue | ✅ Implemented |
| 37 | Leave Management | /admin/leave | AdminLeaveView.vue | ✅ Implemented |
| 38 | Tickets Overview | /admin/tickets | AdminTicketsView.vue | ✅ Implemented |
| 39 | Training Oversight | /admin/training | AdminTrainingView.vue | ✅ Implemented |
| 40 | Control Center | /admin/control-center | ControlCenter.vue | ✅ Implemented |
| 41 | Profile & Settings | /admin/profile | DoerProfile.vue | ✅ Implemented |
| 42 | Ticket Detail | /admin/tickets/:id | (no component) | ❌ Route + component missing |
| 43 | Shared Notifications | /admin/notifications | (no component) | ❌ Route + component missing |
| 44 | Control Center — System Settings | /admin/control-center/settings | SystemSettings.vue | ✅ Implemented |
| 45 | Control Center — Role Permissions | /admin/control-center/permissions | RolePermissions.vue | ✅ Implemented |
| 46 | Control Center — Audit Logs | /admin/control-center/audit | AuditLogs.vue | ✅ Implemented |
| 47 | Control Center — Exception Monitor | /admin/control-center/exceptions | ExceptionMonitor.vue | ✅ Implemented |

---

## Summary

| Panel | Planned | Implemented | Missing Route |
|---|---|---|---|
| Auth | 5 | 5 | 0 |
| Doer | 11 | 10 | 1 (TicketDetail) |
| Captain | 11 | 10 | 1 (AddMember) |
| Admin | 17 | 15 | 2 (TicketDetail, SharedNotifications) |
| **Total** | **44** | **40** | **4** |

## Notable Gaps vs UI/UX Spec

- **Doer TicketDetail.vue** exists but route is not registered in router/index.ts
- **Captain AddMember** route and component both missing — needed for CAP-05 reassign flow
- **Admin TicketDetail** route and component both missing — needed for TKT-03 escalation flow
- **Admin SharedNotifications** route and component both missing — needed for notification deep-links
