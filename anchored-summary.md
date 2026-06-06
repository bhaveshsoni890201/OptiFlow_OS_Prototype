## Goal
- Complete Phase 1 Critical Fixes for the Doer Panel. 7 of 8 done. CR-02 (API wiring) remains.

## Constraints & Preferences
- Code changes permitted — now in build mode.
- Only Phase 1 scope items. Build verified: `vue-tsc --noEmit` (0 errors) + `vite build` (1.95s).

## Progress
### Completed (Phase 1 — Critical Fixes)
- **CR-01**: TicketDetail route — Already registered at `router/index.ts:98`.
- **CR-03**: Auth store — Replaced `employees[3]`/`EMP-0004` with `useStore().user.employee` across 11 pages.
- **CR-04**: Dynamic dates — Replaced hardcoded dates with `new Date()` across 11 pages.
- **CR-05**: DoerLayout shell — Removed redundant outer wrappers from all 11 pages. Layout (`DefaultLayout.vue`) already provides `max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6` — pages duplicated this with `page-container` or `max-w-content mx-auto`. 3 pages with `page-container` and 5 pages with `max-w-content mx-auto` wrapper divs were cleaned up. 3 pages with sticky bottom bars (CreateTaskView, TaskDetail, TicketDetail) kept their custom layouts.
- **CR-06**: Design tokens — `gray-*` → `neutral-*` in AttendanceView, LeaveView, TrainingView, HelpTickets, DoerProfile.
- **CR-07**: TicketDetail styling — Complete rewrite with Doer design conventions.
- **CR-08**: Emoji removal — Removed `👋`/`🎉` from DoerHome + CSS.

### Remaining (Phase 1)
- **CR-02**: API Wiring — Replace mock imports (`../../mock/data`) with API calls (`../../api/...`) across all pages. Largest effort.

### Phase 2+ (Not Started)
- 31 additional items from the Improvement Plan across High/Medium/Low priority.

## Architecture
```
DoerLayout.vue (panelName="doer")
  └── DefaultLayout.vue
        ├── AppSidebar (desktop, hidden <md)
        ├── AppHeader (sticky, hamburger+bell)
        ├── <main class="flex-1 overflow-y-auto pb-16 md:pb-0">
        │     <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        │       <router-view />    ← pages render here, NO redundant outer wrappers
        ├── BottomNav (mobile, hidden md+)
        ├── FabQuickAdd (mobile, hidden md+)
        └── NotificationCenter (slide-over, teleported)
```

## Key Decisions
- CR-05 approach: Remove page-level container wrappers rather than changing DefaultLayout. The layout already provides spacing — pages were double-wrapping.
- Pages with sticky bottom action bars (TaskDetail, CreateTaskView) retain `min-h-screen bg-neutral-50` since their sticky bars must be positioned outside the layout's padding.
- Next Phase 2 priorities: DoerLayout Doer-specific navigation (sidebar uses generic routes), wire FAB actions, NotificationCenter integration with store.

## Next Steps
- CR-02 (API wiring) — the last Phase 1 item. Requires replacing mock data imports with API service calls across all 11 pages. Largest effort (estimated 2-3 days).
