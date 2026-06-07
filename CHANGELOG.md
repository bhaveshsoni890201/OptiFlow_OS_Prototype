# Changelog

All notable changes to OptiFlow OS are documented in this file.

**Versioning**: [Semantic Versioning (MAJOR.MINOR.PATCH)](https://semver.org/)
**Format**: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
**Repository**: [README](README.md) · [Roadmap](ROADMAP.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

---

## Release Philosophy

| Bump | When | Example |
|------|------|---------|
| **MAJOR** | Breaking API/architecture changes, license changes, new edition releases | 1.0.0 → 2.0.0 |
| **MINOR** | New features, module additions, UI overhauls, non-breaking API additions | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes, security patches, performance improvements, documentation | 1.0.0 → 1.0.1 |

Pre-release suffixes: `-alpha.N`, `-beta.N`, `-rc.N` (e.g., `1.0.0-beta.1`)

---

## [Unreleased]

### Added

- GitHub Actions CI workflow (lint, type-check, test, build)
- Issue templates (Bug Report, Feature Request)
- Pull request template
- Dependabot / Renovate dependency scanning
- Pre-commit hooks (lint-staged, type-check)
- Docker Compose setup for full-stack development
- Frappe/Django backend scaffolding
- PWA service worker and manifest (vite-plugin-pwa configuration)

### In Progress

- Real-time notification service integration (SSE + WebSocket subscription)
- Server-side rate limiting (auth endpoints, API)
- Auth token migration from localStorage to httpOnly cookie

---

## [0.8.0] — 2026-06-07 — Governance & Community Foundation

### Added

- `CODE_OF_CONDUCT.md` — Enforcement framework, governance model, reporting process, escalation hierarchy, 4-level enforcement, Open Core governance policy
- `CONTRIBUTING.md` — 991-line comprehensive contribution guide: development setup, branching strategy, Conventional Commits (11 types, 30 scopes), PR process, code standards, testing requirements, Open Core contribution policy, contributor recognition tiers
- `SECURITY.md` — Vulnerability reporting, severity definitions (24h–90d SLA), RBAC analysis, data classification (6 categories), localStorage audit (7 keys), CSP/header roadmap, dependency audit, 4-phase security roadmap (SOC 2, ISO 27001, DPDP Act)
- `LICENSE.md` — Open Core + Dual License (AGPL v3 Community + Commercial Enterprise), trademark protection, branding requirements, white-label restrictions, SaaS resale prohibition, competitive use clause, AI module licensing, marketplace governance
- `LICENSE-AGPL.md` — Full GNU Affero General Public License v3 text

### Changed

- `README.md` — Complete rewrite: 888-line enterprise README with 8 badges, 10 Mermaid diagrams (architecture, 6 workflows, service layer, data flow), 29-screenshot gallery with captions, 34-row permission matrix, FAQ section, documentation hub
- Repository standardized with 6 governance documents (was 0)

---

## [0.7.0] — 2026-06-07 — Branding & Documentation Infrastructure

### Added

- **Branding assets**: `src/assets/branding/` with `logo.svg`, `logo-dark.svg`, `logo-light.svg`, `logo-mark.svg`, `logo.png`, `favicon.svg`
- **Screenshot gallery**: 29 images across `screens/auth/`, `screens/doer/`, `screens/captain/`, `screens/admin/`, `screens/branding/`
- **Documentation folders**: `docs/screens/` with per-module README files

### Changed

- **AuthLayout.vue** — Replaced inline SVG checkmark with proper brand logo (import-based Vite asset path)
- **AppHeader.vue** — Replaced hardcoded "O" div with brand logo, added `whitespace-nowrap` support
- **AppSidebar.vue** — Added brand bar at top with expanded/collapsed logo variants
- **`public/favicon.svg`** — Updated gradient to match brand colors
- **`index.html`** — Added `apple-touch-icon`, `application-name` meta tags
- **`src/assets/logo.svg`** — Redesigned with single-line "OptiFlow OS" text (was two-line "OptiFlow" + "OS")

### Fixed

- Logo SVG "OptiFlow OS" text rendering split across two lines
- Image asset paths using raw `/src/assets/` (now Vite `import` + `:src` binding — broken in production builds)
- All 29 screenshot paths referenced in README verified

---

## [0.6.0] — 2026-06-04 — Control Center & System Settings

### Added

- **Control Center hub** (`AdminControlCenter.vue`) with 4 sub-pages:
  - **Audit Logs** — Action log viewer with severity filtering and date range
  - **System Settings** — Organization configuration (company name, work hours, leave types, ticket categories, localization)
  - **Role Permissions** — Role-based permission matrix management
  - **Exception Monitor** — Error monitoring and alerting dashboard
- **Department Management** (`DepartmentManagement.vue`, `DepartmentAnalytics.vue`) — Full CRUD with per-department metrics
- **Weekly Review** (`WeeklyReviewView.vue`) — Automated weekly performance summary
- **Doer 360°** (`Doer360View.vue`) — Per-employee performance view across tasks, attendance, training, tickets
- **Captain Index** (`CaptainIndexView.vue`) — Team leader effectiveness scoring

### Changed

- `router/index.ts` — Added 4 control center sub-routes, department analytics route, weekly review route
- `adminStore.ts` — Extended with employee CRUD operations

---

## [0.5.0] — 2026-06-03 — Insights & Analytics

### Added

- **Insights Overview** (`InsightsOverview.vue`) — Multi-tab analytics dashboard (Overview, Trends, Issues) with organization-wide metrics
- **Department Analytics** — Per-department performance comparison (task completion, attendance, training)
- **realTimeService.ts** — SSE + WebSocket connection manager with auto-reconnection and pub/sub event system
- **Performance monitoring** — Route timing via `performance.ts`, Web Vitals reporter (CLS, FCP, LCP, TTFB, INP)
- **Analytics events** — Page view tracking, feature event tracking, error rate snapshots via `analytics.ts`
- **webVitalsReporter.ts** — Frontend performance monitoring integration

### Changed

- `vite.config.ts` — Added manual chunk splitting for admin sub-pages (control-center, employees, insights, tickets, training, leave)
- `utils/errorTracking.ts` — Enhanced with Sentry `beforeSend` sanitization (URL stripping, user anonymization)

---

## [0.4.0] — 2026-06-02 — Rescue & Escalation Engine

### Added

- **Rescue Queue** (`RescueQueue.vue`) — Auto-generated alerts for delayed/blocked tasks with severity ladder (soft → warning → high_risk → admin_escalation)
- **Rescue Detail** (`RescueDetail.vue`) — Full context view with action buttons: remind, reassign, escalate, resolve
- **rescueStore.ts** — Pinia store managing rescue records with optimistic updates and auto-generation from overdue tasks
- **rescueService.ts** — API layer with mock data fallback (`mock/rescue.ts`)
- **workflowStore.ts** — Orchestration store for multi-step workflows:
  - Leave workflow (apply → buddy → approve → auto-escalate after 48h → auto-archive after 6 months)
  - Buddy transfer with auto-revert detection
  - Onboarding workflow tracking
  - Rescue actions (remind, reassign, escalate)
- **Worklist Management** (`WorklistManagement.vue`) — Captain-side worklist CRUD and team assignment
- **Training Assignment** (`TrainingAssignment.vue`) — Captain-side module assignment with team view
- **Captain Tickets** (`CaptainTickets.vue`) — Captain-facing ticket queue

### Changed

- `router/index.ts` — Added rescue detail route, training assignment route, worklist management route
- `AppSidebar.vue` — Added rescue, worklist, and training nav items for captain panel
- `BottomNav.vue` — Added captain-specific navigation items

---

## [0.3.0] — 2026-05-30 — Training & Help Desk

### Added

- **Training System** — Full module across three panels:
  - Doer: `TrainingView.vue` — View assigned modules, track progress, SOP/video/guide content
  - Captain: `TrainingAssignment.vue` — Assign training to team members
  - Admin: `AdminTrainingView.vue` — Create and manage training content
  - `OptTrainingViewer.vue` — Shared content viewer (SOP text, video, guides)
  - `trainingService.ts` — API layer with mock data (`mock/training.ts`, `mock/trainingContent.ts`)
- **Help Desk** — Multi-panel ticketing system:
  - Doer: `HelpTickets.vue`, `TicketDetail.vue` — Raise, track, comment, rate resolution
  - Captain: `CaptainTickets.vue` — Respond to team tickets
  - Admin: `AdminTicketsView.vue`, `AdminTicketDetail.vue` — Full lifecycle management
  - `ticketStore.ts` — Optimistic updates, auto-assign by category, mention detection
  - `ticketService.ts` — API layer with mock data (`mock/tickets.ts`)
- **Worklist System**:
  - Doer: `MyWorklist.vue` — Daily/weekly/monthly checklist execution with SOP links
  - `worklistService.ts` — API layer with mock data

### Changed

- `router/index.ts` — Added training and ticket detail routes across all roles
- `AppSidebar.vue` — Added training and tickets nav groups

---

## [0.2.0] — 2026-05-25 — Operations Management

### Added

- **Attendance Module** — Complete multi-panel implementation:
  - Doer: `AttendanceView.vue` — Check-in/check-out with WFO/WFH mode, monthly calendar, correction requests
  - Captain: `AttendanceMonitor.vue` — Team-wide attendance view, late arrivals, corrections
  - Admin: `AdminAttendance.vue` — Full organization attendance overview
  - `attendanceStore.ts` — State management with sessionStorage persistence, optimistic toggle
  - `attendanceService.ts` — API layer with mock data (`mock/attendance.ts`)
- **Leave Management** — Full lifecycle:
  - Doer: `LeaveView.vue` — Apply leave, view balance, assign buddy, track status
  - Captain: `LeaveApprovals.vue` — Approve/reject, buddy transfer management
  - Admin: `AdminLeaveView.vue` — Organization-wide leave calendar, approvals
  - `leaveService.ts` — API layer with mock data (`mock/leave.ts`)
- **Employee Management**:
  - Admin: `EmployeeManagement.vue`, `EmployeeDetail.vue` — Full lifecycle CRUD
  - Captain: `TeamRoster.vue`, `MemberDetail.vue` — Team view and drill-down
  - `adminStore.ts` — Employee CRUD with optimistic updates
  - `employeeService.ts`, `departmentService.ts` — API layer
- **My Tasks** (Doer): `MyTasks.vue`, `TaskDetail.vue`, `CreateTaskView.vue` — Full task management supporting delegation, checklist, and FMS task types
- **Doer Profile**: `DoerProfile.vue` — Personal details, theme toggle, language selection, notification preferences

### Changed

- `router/index.ts` — Added all role-specific route trees (12 doer, 12 captain, 17 admin routes)
- `layouts/` — Added `DoerLayout.vue`, `CaptainLayout.vue`, `AdminLayout.vue` as thin wrappers around `DefaultLayout.vue`

---

## [0.1.0] — 2026-05-20 — Foundation & Authentication

### Added

- **Project scaffold**: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS + Vue Router
- **Design system**: 22 `Opt*` common components (`OptButton`, `OptInput`, `OptTable`, `OptModal`, `OptCard`, `OptToast`, etc.)
- **Design tokens**: 276-line CSS custom property system (`styles/tokens.css`) covering brand colors, neutral ramp, semantic colors, typography scale, spacing, dark mode, high-contrast mode, reduced-motion
- **Layout system**: `AuthLayout.vue`, `DefaultLayout.vue`, plus 3 role layout wrappers
- **Navigation components**: `AppSidebar.vue` (collapsible, role-based groups), `AppHeader.vue` (responsive, desktop+mobile), `BottomNav.vue` (mobile 5-item nav), `FabQuickAdd.vue` (mobile FAB with bottom sheet), `NotificationCenter.vue` (slide-over panel)
- **Authentication** — 5-page flow:
  - `LoginView.vue` — Employee ID + password login with tabbed Password/OTP modes
  - `OtpVerifyView.vue` — 6-digit OTP input with paste support, cooldown timer
  - `ForgotPasswordView.vue` — 3-step recovery workflow (identify → verify → reset)
  - `ResetPasswordView.vue` — Token-based password reset with strength meter
  - `ProfileWizard.vue` — 4-step post-login setup (welcome → contact → bank → documents)
  - `authService.ts` — Login, OTP verify, forgot/reset password, profile with mock fallback
- **Session management** — 30-minute idle timeout with 60-second countdown warning modal (`SessionTimeoutModal.vue`, `useSessionTimeout.ts`)
- **Router infrastructure**: 50+ route definitions, `beforeEach` guard (auth check + role isolation + deep-link preservation), `lazyLoad()` error boundary, chunk-load failure page
- **Service layer**: `BaseService.ts` with in-memory cache (30s TTL), request dedup, retry with exponential backoff (3 attempts), network error → mock fallback
- **API client**: Axios-based (`api/client.ts`) with Bearer token interceptor, CSRF cookie handling, 401 auto-redirect, retry on transient errors
- **Authorization**: 24 feature flags in `utils/permissions.ts` across 3 roles, `canUseFeature()` utility
- **Error tracking**: Sentry integration with `beforeSend` sanitization, error buffer (50 entries, sessionStorage), dedup (5s), throttle (10/30s), global rate limit (50/60s)
- **Offline support**: `offlineStore.ts` — mutation queue with localStorage persistence, auto-sync on reconnect; `OfflineBanner.vue` with retry countdown (30s); `PendingSyncChip.vue`
- **Internationalization**: 3 locales (EN 618 keys, HI, Hinglish) via vue-i18n 11, `LanguageSwitcher.vue` component
- **Theme system**: Light, Dark (`.dark` class), High-Contrast (`[data-theme="high-contrast"]`) — independent from dark mode
- **Mock data**: 10 mock files covering all modules (employees, tasks, attendance, leave, tickets, training, rescue)
- **Utilities**: Formatters (`formatDate*`, `formatTime`, `formatRelative`), validators, constants (typed arrays), structured logger (debug/info/warn/error, level filtering)
- **Health monitoring**: `useHealthCheck.ts` (60s backend health polling), `HealthBanner.vue`
- **Doer Dashboard**: `DoerHome.vue` — Daily summary with pending tasks, attendance status, recent notifications
- **Captain Dashboard**: `CaptainDashboard.vue` — Team KPIs, rescue summary, pending approvals
- **Admin Dashboard**: `AdminDashboard.vue` — Organization-wide KPIs and alerts
- **Notifications**: `NotificationsView.vue` (Doer), `AdminNotificationsView.vue` (Admin), `notificationStore.ts` with SSE subscription
- **Doer Home**: Quick stats cards, pending items, role-based greetings

### Infrastructure

- Vite configuration with manual chunk splitting (21 page chunks, 3 vendor chunks)
- ESLint flat config (Vue + TypeScript + Prettier)
- Prettier config (semi:false, singleQuote, trailingComma:all, printWidth:100)
- Vitest configuration (jsdom, coverage v8, `@` alias)
- Playwright E2E test config (`e2e/critical-paths.spec.ts`)
- `rollup-plugin-visualizer` for bundle analysis
- Environment variables (7 vars documented in `.env.example`)
- `CLAUDE.md` — AI-assisted development guide

---

## Release Process

```
Feature Development (feature/*)
        │ PR into develop
        ▼
  develop branch (continuous integration)
        │
        ├── Release Candidate (release/v*)
        │       │
        │       ▼
        │   QA + Staging Testing
        │       │
        │       ▼
        │   Production Release (main + tag)
        │
        └── Hotfix (hotfix/*, from main)
                │
                ▼
            Emergency fix → main + develop
```

### Pre-Release Checklist

- [ ] All tests pass (`npm test && npm run test:e2e`)
- [ ] Type check passes (`npx vue-tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Changelog updated with release notes
- [ ] Version bumped in `frontend/package.json`
- [ ] README screenshots updated if UI changed
- [ ] Security review completed for new features
- [ ] Migration guide written (if breaking changes)

---

## Version History Summary

| Version | Date | Milestone |
|---------|------|-----------|
| 0.1.0 | 2026-05-20 | Foundation & Authentication |
| 0.2.0 | 2026-05-25 | Operations Management |
| 0.3.0 | 2026-05-30 | Training & Help Desk |
| 0.4.0 | 2026-06-02 | Rescue & Escalation Engine |
| 0.5.0 | 2026-06-03 | Insights & Analytics |
| 0.6.0 | 2026-06-04 | Control Center & System Settings |
| 0.7.0 | 2026-06-07 | Branding & Documentation Infrastructure |
| 0.8.0 | 2026-06-07 | Governance & Community Foundation |
| **1.0.0** | _Target_ | **Public MVP — All core modules complete** |

---

## Future Release Framework

### 1.0.0 — Public MVP (Target)

- [ ] PWA service worker + manifest configured
- [ ] Server-side rate limiting
- [ ] CSP + HSTS + security headers
- [ ] Auth token migration to httpOnly cookie
- [ ] Server-side input validation
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Docker Compose for full-stack dev
- [ ] Production deployment guide
- [ ] 90%+ type coverage on all pages
- [ ] Load testing results published

### 1.1.0 — Enhanced Intelligence

- [ ] AI Task Prioritization
- [ ] AI Rescue Prediction (proactive alerts)
- [ ] AI Performance Analysis
- [ ] Advanced Analytics Dashboard

### 1.2.0 — Platform Expansion

- [ ] Mobile Apps (Android/iOS)
- [ ] Push Notifications
- [ ] WhatsApp Integration
- [ ] Payroll Integration

### 2.0.0 — Enterprise Platform

- [ ] Multi-factory / multi-location support
- [ ] Marketplace for Extensions
- [ ] AI Workflow Recommendations
- [ ] SOC 2 + ISO 27001 readiness
- [ ] SSO / SAML / OIDC
- [ ] 2FA / TOTP

---

## Changelog Governance

### For Contributors

When submitting a PR that changes functionality:

1. Add an entry under `[Unreleased]` in the appropriate category
2. Use the same commit type as your Conventional Commit:
   - `feat:` → **Added**
   - `fix:` → **Fixed**
   - `security:` → **Security**
   - `perf:` → **Performance**
   - `docs:` → **Documentation**
   - `refactor:` → **Refactoring**
   - `test:` → **Testing**
   - `chore:` → **Infrastructure**
   - `i18n:` → **Changed** (under localization subsection)
3. Format: `- **Module**: Brief description (#PR-number)`
4. Mention breaking changes with a `### Breaking Changes` section

### For Maintainers

- Every release must update CHANGELOG.md before tagging
- Move `[Unreleased]` entries into the new version section on release
- Include migration notes for breaking changes
- Link to relevant issues/PRs in changelog entries
- Document deprecations with timelines

---

*OptiFlow OS — Operating System for Indian MSMEs*

*Copyright © OptiFlow Technologies. All rights reserved.*
