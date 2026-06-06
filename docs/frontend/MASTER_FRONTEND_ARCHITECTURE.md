# OptiFlow OS — Frontend Architecture Master Document

**Version:** 1.0  
**Last Updated:** 2026-06-03  
**Status:** Approved

---

## 1. Project Overview

OptiFlow OS is an operational intelligence platform for manufacturing and logistics environments. The frontend delivers a real-time, responsive, and role-aware interface for monitoring production lines, managing tasks, tracking inventory, and orchestrating workflows across factory floor to executive dashboards.

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|---|
| Framework | **Vue 3.5+** | Reactive, performant, excellent Composition API DX |
| Language | **TypeScript 5.6+** | Type safety across stores, API layer, component props |
| UI Kit | **HeadlessUI + Heroicons** | Accessible headless components with full Tailwind styling control |
| Styling | **Tailwind CSS 3.4+** | Utility-first, responsive, small production bundle |
| State | **Pinia 3** | TypeScript-first stores, devtools, modular by design |
| Routing | **Vue Router 4** | Lazy loading, navigation guards, per-route meta |
| Build | **Vite 8** | Instant HMR, optimized builds, first-class PWA support |
| HTTP | **Axios** | Typed HTTP client with interceptors, auth header injection |
| Testing | **Vitest + Playwright** | Unit, integration, and E2E coverage |
| Package | **npm** | Standard package manager, widely supported |

---

## 2. Directory Structure

```
frontend/src/
├── App.vue                        # Root component — layout shell, auth gate, global listeners
├── main.ts                        # Entry point — app bootstrap, plugin registration
│
├── assets/
│   ├── logo.svg                   # OptiFlow OS brand logo
│   └── hero.png                   # Hero illustration
│
├── styles/
│   ├── tokens.css                 # Design tokens as CSS custom properties (colors, spacing, typography)
│   └── tailwind.css               # Tailwind directives, global resets
│
├── types/
│   └── index.ts                   # All TypeScript type definitions (domain models, UI types)
│
├── utils/
│   ├── index.ts                   # Barrel export
│   ├── constants.ts               # Task states, ticket lifecycle, priority, frequency constants
│   ├── formatters.ts              # Date, time, delay, relative time formatters
│   ├── permissions.ts             # Role-based access control helpers
│   └── validators.ts              # Form validation rules (required, email, mobile, IFSC, dates)
│
├── router/
│   └── index.ts                   # Vue Router creation, global guards, scroll behavior, all route definitions
│
├── stores/
│   ├── useStore.ts                # Current authenticated user, session, preferences
│   ├── taskStore.ts               # Task CRUD, assignment, status transitions
│   ├── workflowStore.ts           # Workflow management, checklist engine
│   ├── rescueStore.ts             # Rescue queue, reminders, escalation
│   ├── adminStore.ts              # Employee management, departments, settings
│   └── notificationStore.ts       # In-app notifications, badge counts
│
├── composables/
│   ├── index.ts                   # Barrel export
│   ├── useApi.ts                  # Generic API composable — typed GET/POST/PUT/PATCH/DELETE
│   ├── useDebounce.ts             # Debounced reactive ref for search input
│   └── useNotify.ts               # Toast notification helper wrapping notificationStore
│
├── components/
│   ├── common/                    # Reusable UI primitives (OptButton, OptInput, OptModal, etc.)
│   ├── navigation/                # App shell (AppHeader, AppSidebar, BottomNav, FabQuickAdd, etc.)
│   ├── charts/                    # Chart widget components
│   ├── dashboard/                 # Dashboard-specific widgets
│   ├── forms/                     # Form-specific components
│   ├── rescue/                    # Rescue queue card components
│   ├── tables/                    # Data table components
│   └── tasks/                     # Task card and workflow components
│
├── pages/                         # Route-level page components (one per route, lazy-loaded)
│   ├── auth/                      # Login, OTP, Forgot/Reset Password, Profile Wizard (5 views)
│   ├── doer/                      # Doer Home, Tasks, Worklist, Attendance, Leave, Training, Tickets (11 views)
│   ├── captain/                   # Dashboard, Rescue, Team, Worklists, Training, Leave Approvals (10 views)
│   └── admin/                     # Dashboard, Insights, Employees, Departments, Control Center (17 views)
│
├── api/                          # HTTP client and endpoint definitions
│   ├── index.ts                  # Barrel export
│   ├── client.ts                 # Axios instance setup, interceptors, token injection, typed helpers
│   ├── endpoints.ts              # All API endpoint path constants
│   └── types.ts                  # ApiResponse, PaginatedResponse, ApiError types
│
├── mock/                          # Domain-split mock data for development
│   ├── index.ts                  # Barrel export
│   ├── employees.ts              # Employee profiles and current user
│   ├── tasks.ts                  # Delegation, checklist, FMS tasks and worklists
│   ├── attendance.ts             # Attendance logs and correction requests
│   ├── leave.ts                  # Leave requests and buddy transfers
│   ├── tickets.ts                # Help tickets with comments
│   ├── training.ts               # Training assignments and captain KPI snapshots
│   ├── rescue.ts                 # Rescue records and notifications
│   └── data.ts                   # Legacy re-export file (backward compatible)
```

---

## 3. Architecture Decisions

### 3.1 Vue 3 + Composition API

All components use `<script setup lang="ts">`. The Composition API provides better TypeScript inference, logical grouping via composables, and tree-shakeable reactivity — all critical for a large codebase. Options API is explicitly disallowed.

### 3.2 Pinia over Vuex

Pinia is chosen over Vuex 3/4 for:
- Full TypeScript support without unwieldy wrapper types
- No mutations boilerplate — actions mutate state directly
- Modular stores with no namespace nesting
- Built-in devtools integration
- Plugin ecosystem (persistence middleware via `pinia-plugin-persistedstate`)

### 3.3 HeadlessUI Component Patterns

HeadlessUI is the primary component library. Usage conventions:
- Components are prefixed with `Opt` (OptButton, OptInput, OptModal) for OptiFlow custom components
- Forms follow standard web form patterns: label → input → helper/error
- HeadlessUI provides accessible primitives: Dialog, Listbox, Menu, Popover, Switch, Tabs
- Heroicons used for all iconography — import by name and render as components
- Custom wrappers extend HeadlessUI primitives where needed

### 3.4 Tailwind for Utility-First Responsive Design

- Every pixel value is defined as a Tailwind token — no magic values in components
- Responsive variants (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) used directly in templates
- Complex responsive patterns extracted to reusable utility classes in `utilities.css`
- `@apply` used sparingly — only for layout primitives that repeat verbatim

### 3.5 TypeScript Strategy

- `strict: true` in tsconfig — no opting out per-file
- All types defined in a single `types/index.ts` file covering domain models, UI types
- Composable functions typed with generics for full type inference
- Store state, getters, and actions fully typed

---

## 4. Component Architecture

### 4.1 Atomic Design Pattern

Components are organized by domain and usage pattern:

| Layer | Responsibility | Example |
|---|---|---|---|
| **Common** | Generic reusable UI primitives | `OptButton`, `OptInput`, `OptModal`, `OptBadge` |
| **Navigation** | App shell components | `AppHeader`, `AppSidebar`, `BottomNav` |
| **Domain** | Domain-specific widgets | Rescue cards, task cards, dashboard widgets |
| **Pages** | Route-level views, data fetching, layout | `DoerHome.vue`, `CaptainDashboard.vue` |
| **Layouts** | Page chrome and structure | `DefaultLayout`, `DoerLayout`, `CaptainLayout` |

### 4.2 Naming Conventions

| Pattern | Rule | Example |
|---|---|---|---|
| Component prefix | `Opt` prefix for common components | `OptButton`, `OptModal` |
| Common file suffix | PascalCase | `OptButton.vue`, `OptInput.vue` |
| Page files suffix | PascalCase + `View` or descriptive | `DoerHome.vue`, `LoginView.vue` |
| Layout files suffix | PascalCase + `Layout` | `DoerLayout`, `AdminLayout` |
| Composables prefix | `use` + PascalCase | `useApi`, `useDebounce` |
| Stores suffix | PascalCase + `Store` by Pinia convention | `taskStore`, `rescueStore` |
| API modules | Lowercase | `client.ts`, `endpoints.ts` |
| Constants | camelCase | `taskStates`, `rescueSeverities` |

### 4.3 File Organization

- One component per file
- Test file co-located: `OButton.spec.ts` beside `OButton.vue`
- Story file co-located: `OButton.story.vue` beside `OButton.vue`
- Components are grouped by atomic layer within `components/`

### 4.4 Template Conventions

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props/Emits (typed via defineProps/defineEmits)
// 3. Composables
// 4. Store references
// 5. Reactive state
// 6. Computed
// 7. Functions (public → private)
// 8. Lifecycle hooks
</script>

<template>
  <!-- Semantic HTML, one root element, conditional wrappers -->
</template>

<style scoped>
/* Scoped styles only when Tailwind utilities are insufficient */
</style>
```

---

## 5. State Management

### 5.1 Store Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Pinia Instance                       │
├──────────┬──────────────┬─────────────┬─────────────────┤
│  useStore │  taskStore   │ rescueStore │ workflowStore   │
│ (auth,   │  (tasks,     │ (rescue     │ (checklists,    │
│  session) │  checklist,  │  queue,     │  worklists,     │
│           │  FMS)        │  reminders) │  generation)    │
├──────────┴──────────────┴─────────────┴─────────────────┤
│  notificationStore   │   adminStore                      │
│  (in-app notifs,     │   (employees, departments,        │
│   badge counts)      │    settings, permissions)          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Store Responsibilities

| Store | Primary State | Key Actions |
|---|---|---|---|
| `useStore` | User, session, role, language, preferences | `login`, `logout`, `setRole`, `setLanguage` |
| `taskStore` | Delegation/checklist/FMS tasks, filters, sort | `fetchTasks`, `createTask`, `updateStatus` |
| `rescueStore` | Rescue records, active/resolved queue | `fetchRecords`, `sendReminder`, `escalate`, `reassign`, `resolve`, `generateFromOverdueTasks` |
| `workflowStore` | Worklists, checklist engine, generation | `fetchWorklists`, `createWorklist`, `generateChecklistInstances` |
| `notificationStore` | In-app notifications, badge counts | `fetchNotifications`, `markRead`, `addNotification` |
| `adminStore` | Employees, departments, settings | `fetchEmployees`, `createEmployee`, `updateSettings` |

### 5.3 Optimistic Updates

Mutations that affect the task queue, order assignment, and inventory transfers use optimistic updates:

1. Apply mutation to local state immediately
2. Assign a temporary client-side ID
3. Send API request
4. On success: replace temp ID with server ID
5. On failure: rollback to previous state, show error toast, retry dialog

Implementation via `taskStore` action wrapper:
```ts
async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const previous = this.items.get(taskId)
  this.patchItem(taskId, { status, _optimistic: true })
  try {
    const result = await api.updateTaskStatus(taskId, status)
    this.patchItem(taskId, { id: result.id, _optimistic: false })
  } catch (error) {
    this.patchItem(taskId, previous)
    enqueueOffline('updateTaskStatus', { taskId, status })
    throw error
  }
}
```

### 5.4 Offline Queue

The `offlineStore` manages a persistent IndexedDB-backed queue:

- Mutations that fail due to network error are enqueued with timestamp + priority
- A Web Worker (`offline-sync.ts`) processes the queue FIFO when connectivity returns
- Conflicts are surfaced via the conflict resolution UI in `organisms/OConflictResolver.vue`
- The queue survives page refresh via Dexie.js persistence

### 5.5 Real-Time Updates

- WebSocket connection via `useWebSocket` composable
- Automatic reconnection with exponential backoff (1s → 30s max)
- Incoming events update Pinia stores directly
- Fallback: notification poller Web Worker (30s interval when WS disconnected)

---

## 6. Routing Architecture

### 6.1 Router Setup

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes,
})
```

### 6.2 Route Configuration

Routes are defined as typed arrays with eager permission resolution:

```ts
{
  path: '/production/lines/:id',
  name: RouteNames.PRODUCTION_LINE_DETAIL,
  meta: {
    title: 'lineDetail',
    permissions: ['production:read'],
    panel: 'production',
    layout: 'app',
    breadcrumb: ['production', 'lineDetail'],
    dirtyGuard: false,
  },
  component: () => import('@/views/production/LineDetailView.vue'),
}
```

### 6.3 Navigation Guards

| Guard | Purpose | File |
|---|---|---|
| `authGuard` | Redirect unauthenticated to `/auth/login` | `guards.ts` |
| `permissionGuard` | Check route meta.permissions against user role | `guards.ts` |
| `dirtyGuard` | Warn if unsaved form exists (uses `uiStore.dirtyForms`) | `guards.ts` |
| `featureGuard` | Block routes behind feature flags | `guards.ts` |

### 6.4 Lazy Loading

All view components use dynamic `import()` — no eager-loaded views. Vite handles automatic code-splitting per route chunk.

### 6.5 RBAC via Route Meta

Route `meta.permissions` is an array of permission strings. The `permissionGuard` compares them against the user's resolved permission set from `useStore`. If any permission is missing, redirect to `/forbidden`.

---

## 7. Design System Integration

### 7.1 Design Tokens

Tokens are defined in `styles/tokens.css` as CSS custom properties, then aliased to Tailwind theme values:

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a5f;
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-status-ok: #22c55e;
  --color-status-warn: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-idle: #94a3b8;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-devanagari: 'Noto Sans Devanagari', 'Inter', sans-serif;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  --z-dropdown: 50;
  --z-modal: 100;
  --z-toast: 150;
}
```

### 7.2 Tailwind Configuration

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          900: 'var(--color-primary-900)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
        },
        status: {
          ok: 'var(--color-status-ok)',
          warn: 'var(--color-status-warn)',
          error: 'var(--color-status-error)',
          idle: 'var(--color-status-idle)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        devanagari: ['var(--font-devanagari)'],
      },
    },
  },
}
```

### 7.3 Dark Mode

Dark mode uses a `data-theme="dark"` attribute on `<html>`:

```css
[data-theme="dark"] {
  --color-surface: #0f172a;
  --color-surface-muted: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
}
```

Toggled via `useTheme.ts` composable, persisted to localStorage. Tailwind's `darkMode: 'class'` strategy maps to a `.dark` class on `html`.

### 7.4 High-Contrast Mode

Triggered via `prefers-contrast: more` or manual toggle:

```css
[data-theme="high-contrast"],
@media (prefers-contrast: more) {
  --color-text-primary: #000000;
  --color-text-muted: #1a1a1a;
  --color-border: #000000;
  --color-surface: #ffffff;
  --color-surface-muted: #f0f0f0;
}
```

---

## 8. Responsive Strategy

### 8.1 Mobile-First Approach

All layouts are built mobile-first with progressively enhanced breakpoints:

| Breakpoint | Min Width | Target |
|---|---|---|
| `xs` | 0 | Small phones (360px) |
| `sm` | 480px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops / landscape tablets |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1440px | Large desktops / widescreen |

### 8.2 Adaptive Navigation Patterns

| Viewport | Navigation Mode |
|---|---|
| `< 768px` | Bottom tab bar (5 primary panels), sidebar replaced by slide-out drawer |
| `768px – 1024px` | Collapsed sidebar (icons only), top panel switcher |
| `> 1024px` | Expanded sidebar with labels, command palette (Cmd+K) |

### 8.3 Responsive Component Patterns

- **Data tables** collapse to card lists at `< 768px` (column visibility driven by `useBreakpoints`)
- **Forms** switch from multi-column to single-column layout at `< 768px`
- **Modals** render as full-screen sheets on mobile
- **Charts** resize via ResizeObserver, switching from detailed to summary views
- **Tooltips** render as bottom sheets on touch devices

---

## 9. Performance Strategy

### 9.1 Targets

| Metric | Target | Measurement |
|---|---|---|
| First Contentful Paint | `< 1.5s` | Lighthouse, RUM |
| Largest Contentful Paint | `< 2.5s` | Lighthouse, RUM |
| Time to Interactive (3G) | `< 2.0s` | WebPageTest |
| Bundle size (initial) | `< 200 KB gzip` | Vite bundle analysis |
| Total JS (all routes) | `< 600 KB gzip` | Vite bundle analysis |

### 9.2 Code Splitting

- **Per-route**: Every view is a lazy-loaded chunk
- **Vendor splitting**: Frappe UI, date-fns, chart library → separate vendor chunks
- **Component-level**: Heavy organisms (OTaskBoard, OLineTimeline) loaded via `defineAsyncComponent`
- **Store-level**: Stores not imported on the critical path are deferred

### 9.3 Lazy Loading Patterns

```vue
<script setup lang="ts">
const OTaskBoard = defineAsyncComponent(() =>
  import('@/components/organisms/OTaskBoard.vue')
)
</script>
```

### 9.4 Bundle Optimization

- `rollupOptions.output.manualChunks` in Vite config splits Frappe UI, Pinia, Vue Router, charting libs
- SVGs inlined as components (vite-svg-loader) — no separate HTTP requests
- Font subsetting for Inter and Noto Sans Devanagari
- Image assets optimized at build time via `vite-imagetools`

### 9.5 Skeleton Screens

Every list, detail, and dashboard page renders `<OSkeleton>` placeholders matching the final layout while data loads. Skeletons are defined as template slots in the `ListPageTemplate` and `DetailPageTemplate`.

### 9.6 Runtime Optimizations

- `v-memo` on static list items
- `shallowRef` for large arrays that are replaced (not mutated per-element)
- `computed` with explicit dependencies — no reactive chains deeper than 3 levels
- Virtual scrolling via Frappe DataTable for lists exceeding 200 rows

---

## 10. Accessibility

### 10.1 Target

**WCAG 2.1 Level AA** — measured per CI pipeline with axe-core (via Playwright) and periodic manual audits.

### 10.2 Keyboard Navigation

- All interactive elements focusable via sequential Tab order
- Arrow-key navigation in data tables, kanban boards, dropdowns
- Escape closes modals, dropdowns, popovers
- Enter/Space activates buttons and toggles
- Skip-to-content link as first focusable element
- Visible focus indicators (3px outline, high-contrast color)

### 10.3 Screen Reader Support

- All icons use `aria-hidden="true"` with descriptive text in `<span class="sr-only">`
- Dynamic content updates announced via `aria-live="polite"` regions
- Form inputs have associated `<label>` elements (never `placeholder` as label)
- Modals trap focus and restore focus on close
- Toast notifications use `role="alert"` and `aria-live="assertive"`
- Data tables use `<caption>`, `scope`, and proper `<th>` relationships

### 10.4 Color Contrast

- All text meets **4.5:1** minimum contrast ratio (AA normal text)
- Large text (≥18px bold or ≥24px regular) meets **3:1**
- UI components and graphical objects meet **3:1**
- Contrast violations caught by axe-core in CI

### 10.5 High-Contrast Mode

In addition to the manual toggle, the app respects `prefers-contrast: more` media query. In high-contrast mode:
- All borders visible (no borderless cards)
- Status indicators use shape + text in addition to color
- Charts use patterns + labels instead of color-only legends

---

## 11. Localization

### 11.1 Supported Locales

| Code | Language | Script | Notes |
|---|---|---|---|
| `en` | English | Latin | Default, fallback |
| `hi` | Hindi | Devanagari | Full translation |
| `hinglish` | Hinglish | Latin | Code-mixed Hindi-English, transliterated Hindi |

### 11.2 Translation Management

- Flat JSON files in `locales/` keyed by dot-notation path
- `useLocalization` composable wraps vue-i18n with OptiFlow extensions
- Fallback chain: `hi` → `en`, `hinglish` → `hi` → `en`
- Missing keys logged to console in development only

### 11.3 View Original Pattern

For technical terms (part numbers, machine codes, system messages) that should not be translated:

```json
{
  "machine.status.running": "Running",
  "machine.status.running__hi": "चालू",
  "machine.status.running__hinglish": "Chaloo",
  "machine.code": "MC-{code}"
}
```

The `__{locale}` suffix preserves the View Original pattern — critical terms always include the English identifier alongside the translation.

### 11.4 Devanagari Text Handling

- `font-devanagari` utility class applies Noto Sans Devanagari with adjusted line-height (1.8 vs 1.5 for Latin)
- CSS `word-break: break-word` for long compound words in Hindi
- Number formatting follows locale: `hi` uses Indian numbering system (lakh/crore)
- Date formatting: `hi` uses DD/MM/YYYY, `en` uses MM/DD/YYYY or configurable

### 11.5 RTL Readiness

Although Hindi is left-to-right, the infrastructure supports future RTL languages (Arabic, Urdu):
- CSS logical properties (`margin-inline-start` over `margin-left`)
- Flexbox `gap` over margin-based spacing
- No hardcoded `left`/`right` in JavaScript

---

## 12. Mock Data & Development

### 12.1 Mock Architecture

Currently, each Pinia store contains inline mock data with simulated async delays (`await new Promise(r => setTimeout(r, N))`). Stores import mock arrays directly from `src/mock/`.

### 12.2 Mock Data Layer

- Mock data is split by domain into 7 files under `src/mock/`
- Each file exports typed arrays matching the TypeScript interfaces in `src/types/`
- A barrel export (`src/mock/index.ts`) and legacy re-export (`src/mock/data.ts`) provide backward compatibility
- The mock layer is controlled by the `VITE_ENABLE_MOCK` environment variable
- Stores use the API layer (`src/api/`) when `VITE_ENABLE_MOCK=false`

```
┌──────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Component   │ ──► │   Store     │ ──► │  api/client.ts  │
└──────────────┘     └─────────────┘     └────────┬────────┘
                                                  │
                                      ┌───────────┴───────────┐
                                      │  VITE_ENABLE_MOCK     │
                                      │  = true       = false │
                                      │     │             │   │
                                      │  mock/data   real API │
                                      └───────────────────────┘
```

---

## 13. Build & Deployment

### 13.1 Vite Configuration

```ts
// vite.config.ts — key features
export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: false }),                      // bundle analysis
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor': ['@headlessui/vue', '@heroicons/vue'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
```

### 13.2 PWA Setup (Planned)

- `vite-plugin-pwa` is installed in devDependencies
- Service worker registration and offline strategy are not yet implemented
- Future: Network-first for API, Cache-first for static assets

### 13.3 Docker Support (Planned)

Docker support to be added in a future phase. Current deployment is via static build served by any web server.

### 13.4 Deployment Targets

| Target | Build Command |
|---|---|
| Development | `npm run dev` |
| Production | `npm run build` |

Environment-specific variables in `.env.{mode}` files:
```
VITE_API_BASE_URL=https://api.optiflowos.com
VITE_API_TIMEOUT=15000
VITE_ENABLE_MOCK=false
VITE_OFFICE_START_TIME=09:00
VITE_DEFAULT_LANGUAGE=en
```

### 13.5 CI/CD (Planned)

- Lint: `npm run lint` (ESLint + prettier)
- Unit test: `npm run test` (Vitest)
- E2E test: `npm run test:e2e` (Playwright)
- Build: `npm run build`

---

## Appendix A: Key Technology Versions

| Technology | Min Version | Notes |
|---|---|---|---|
| Node.js | 18+ | Engine requirement |
| npm | 9+ | Package manager |
| Vue | 3.5 | Composition API with `<script setup>` |
| TypeScript | 5.6 | strict mode enabled |
| HeadlessUI | 1.7 | Accessible Vue primitives |
| Heroicons | 2.2 | SVG icon components |
| Tailwind CSS | 3.4 | JIT mode |
| Pinia | 3.0 | setup stores only |
| Vue Router | 4.6 | lazy-loaded routes |
| Vite | 8.0 | Fast HMR and builds |
| Vitest | 3.1 | Unit testing |
| Playwright | 1.52 | E2E testing |
| Axios | 1.7 | HTTP client |

## Appendix B: Error Handling Patterns

| Layer | Strategy | User Experience |
|---|---|---|
| API client | Axios interceptor normalizes errors → `AppError` | Unified error toast |
| Store action | try/catch → rollback optimistic update | Snackbar with retry action |
| Route guard | Redirect to fallback, log to Sentry | `/forbidden` or `/error` page |
| Component | Error boundary (`onErrorCaptured`) | Inline error state with retry |
| Global | `window.onerror` + `unhandledrejection` capture | Logged, no crash |

## Appendix C: Key Design Principles

1. **Type every boundary** — every API response, store action param, component prop is typed.
2. **Compose, don't inherit** — use composables and slots, never extend components.
3. **Optimism with rollback** — every mutation has a revert path.
4. **Mobile-first, tablet-ready** — design for the smallest screen first.
5. **Accessibility is not optional** — every PR must pass axe-core checks.
6. **Locales are first-class** — no hardcoded strings, ever.
7. **Mock without friction** — developers toggle mock/real API with an env var.
