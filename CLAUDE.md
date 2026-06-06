## Goal
Complete Phase 1 Critical Fixes (all 8) + Maintenance Polish (9 of 13 items) + Layout Polish (all 4 items) for Doer Panel. Build verified.

## Constraints
- Code changes permitted — in build mode.
- Build verified: `vue-tsc --noEmit` (0 errors) + `vite build`.

## Progress
### Phase 1 — Critical Fixes (8/8 ✅)
- **CR-01**: TicketDetail route — already registered.
- **CR-02**: API Wiring — mock data → API calls across all pages.
- **CR-03**: Auth store — replaced hardcoded `EMP-0004` with `useStore().user.employee`.
- **CR-04**: Dynamic dates — replaced hardcoded dates with `new Date()`.
- **CR-05**: DoerLayout shell — removed redundant page wrappers; layout provides spacing.
- **CR-06**: Design tokens — `gray-*` → `neutral-*` across Doer pages.
- **CR-07**: TicketDetail styling — complete rewrite per Doer conventions.
- **CR-08**: Emoji removal — removed `👋`/`🎉` from DoerHome + CSS.

### MP — Maintenance Polish (9/13 ✅)
- **MP-05**: CreateTaskView — real file picker (replaced text-only with `<input type="file">`).
- **MP-06**: Calendar dots — bigger (`h-3 w-3 ring-1 ring-white`).
- **MP-07**: LeaveView buddy dropdown — race condition on reactive leave type (double-refetch guard).
- **MP-08**: Training filter — overdue tasks included in `not_started` status.
- **MP-09**: High-contrast — separated from dark mode; added `[data-theme="high-contrast"]` overrides in `tokens.css` + `tailwind.css`; toggle in DoerProfile calls `store.setTheme()`.
- **MP-10**: Notification preferences — persisted to `localStorage`; toggle in DoerProfile wired through `store.notificationPrefs`.
- **MP-11**: MyTasks filter/sort bar — overflow fix: sort button becomes icon-only on mobile.
- **MP-12**: TaskDetail block button — ambiguous one-button → two-step confirm flow.
- **MP-13**: Safe area — `pb-[env(safe-area-inset-bottom)]` on BottomNav, CreateTaskView, TaskDetail.

### MP — Not Done (4/13)
- **MP-01**: Dark mode toggle position — postponed to Phase 2.
- **MP-02**: Notifications bell color — requires design input.
- **MP-03**: PendingSyncChip — needs wire action.
- **MP-04**: LeaveView old date from leave — already handled by CR-04.

### LP — Layout Polish (5/5 ✅)
- **LP-01**: Dynamic date — already resolved by CR-04.
- **LP-02**: Attendance sidebar — responsive: inline on tablet+ (`md:contents`).
- **LP-03**: LeaveView icon import — fixed broken `CalendarDaysIcon` import.
- **LP-04**: Date formatting — centralized `formatters.ts` (formatDateShort, formatDateLong, formatDateWithWeekday, formatDateShortNoYear, formatDateTime, formatRelativeTime); replaced all inline `toLocaleDateString` calls across 11 Doer pages.
- **LP-05**: Reactive vs ref inconsistency — DoerProfile.vue `reactive()` → `ref()`, matching rest of Doer panel.
- **LP-06**: SOP link always external — MyWorklist.vue: added "View in App" button that opens SOP in an iframe overlay plus "Open in new tab" external link.

## Architecture
```
DoerLayout.vue (panelName="doer")
  └── DefaultLayout.vue
        ├── AppSidebar (desktop, hidden <md)
        ├── AppHeader (sticky, hamburger+bell)
        ├── <main class="flex-1 overflow-y-auto pb-16 md:pb-0">
        │     <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        │       <router-view />    ← pages render here, NO redundant outer wrappers
        ├── BottomNav (mobile, hidden md+; has safe-area padding)
        ├── FabQuickAdd (mobile, hidden md+)
        └── NotificationCenter (slide-over, teleported)
```

## Key Decisions
- **High-contrast mode** is independent of dark mode — uses `[data-theme="high-contrast"]` selector, not `prefers-color-scheme`.
- **Block button two-step** uses a confirm state (`blockConfirm`) rather than a modal/alert for simplicity.
- **Filter/sort overflow** fix: sort button collapses to icon-only at mobile, preserving the filter chip row.
- **Buddy dropdown race** fix: guard `refetchLeaveTypes()` behind `if (!leaveTypes.value.length)` to prevent the clean() observer from wiping state on re-entry.
- **Safe area** uses `env(safe-area-inset-bottom)` via CSS `pb-[env(...)]` on the bottom nav and sticky elements.
- **Date formatting centralization** (`formatters.ts`) — all 11 Doer pages now use shared formatters instead of inline `toLocaleDateString('en-IN', ...)`. New pages must import from `formatters.ts`.
- LP-04 spanned 11 pages: DoerHome, MyTasks, MyWorklist, TaskDetail, TicketDetail, TrainingView, LeaveView, AttendanceView, HelpTickets, CreateTaskView, DoerProfile — each had inline date formatting replaced with formatters.ts functions.

## Next Steps
- MP-01 (dark mode toggle position) — requires design decision on placement.
- MP-02 (notifications bell color) — needs design input.
- MP-03 (PendingSyncChip) — wire click action to trigger sync.
- Additional Improvement Plan items from Phase 2 (31 items).
