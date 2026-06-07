# Contributing to OptiFlow OS

**Welcome, and thank you for considering contributing to OptiFlow OS.**

OptiFlow OS is an open-core workflow, operations, and HRMS platform for Indian MSMEs. Our mission is to replace spreadsheets, WhatsApp-based coordination, and disconnected tools with a single execution platform that makes every employee accountable, every process visible, and every manager effective.

This document provides guidelines for contributing across all areas of the project — code, documentation, design, translations, security, and more.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We're Building](#what-were-building)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Repository Structure](#repository-structure)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Documentation Standards](#documentation-standards)
- [Testing Requirements](#testing-requirements)
- [UI & Design Contribution Standards](#ui--design-contribution-standards)
- [Security Contribution Rules](#security-contribution-rules)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Feature Proposal Guidelines](#feature-proposal-guidelines)
- [Open Core Contribution Policy](#open-core-contribution-policy)
- [Review Process](#review-process)
- [Release Process](#release-process)
- [Contributor Recognition](#contributor-recognition)
- [FAQ](#faq)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@optiflowos.com.

---

## What We're Building

OptiFlow OS is a **three-panel platform**:

| Role | Panel | Purpose |
|------|-------|---------|
| **Doer** | Frontline employee | Execute tasks, attendance, leave, training, tickets |
| **Captain** | Team leader | Monitor team, rescue queue, approvals, assignment |
| **Admin** | Business owner | Employee lifecycle, departments, analytics, control center |

Built with **Vue 3 + TypeScript + Tailwind CSS** on the frontend, with a planned **Frappe/Django** backend.

---

## Ways to Contribute

### Bug Reports

- Check existing issues before filing
- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include: environment, steps to reproduce, expected vs actual behavior, screenshots
- Tag with reproduction difficulty if possible

### Feature Requests

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the problem you're solving, not just the solution you want
- Identify which role(s) and module(s) are affected
- Consider whether it fits the Community or Enterprise edition

### Documentation

- README improvements, screenshot updates, architecture docs
- API documentation, component catalog, design system docs
- Translation fixes or additions (EN / HI / Hinglish)
- Keep screenshots up to date when UI changes

### UI & Design

- Design system component improvements
- Accessibility fixes
- Dark mode / high-contrast refinements
- Mobile responsiveness
- Branding consistency

### Testing

- Unit tests for stores, services, and utils
- Integration tests for page-level workflows
- E2E tests for critical user paths
- Manual QA for new features

### Security

- See [SECURITY.md](SECURITY.md) for vulnerability reporting
- Security hardening (CSP, headers, storage patterns)
- Dependency vulnerability scanning
- Security audit improvements

### Performance

- Bundle size optimization
- API caching improvements
- Route-level code splitting
- Web vitals improvement
- Memory leak fixes

### Localization

- English (en.json): 618 keys covering all modules
- Hindi (hi.json)
- Hinglish (hinglish.json)
- Improvements to existing translations welcome

### Code Contributions

- Frontend (Vue 3, TypeScript, Pinia, Tailwind)
- Backend (planned — Frappe/Django)
- Infrastructure (Docker, CI/CD, deployment)
- AI modules (planned — task prioritization, rescue prediction)

---

## Development Setup

### Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| Node.js | 20+ | Frontend development |
| npm | 9+ or pnpm 8+ | Package management |
| Git | Any | Version control |
| Frappe Bench | Latest | Backend development (if applicable) |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/optiflow-os.git
cd optiflow-os/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.development

# Start development server
npm run dev
```

The app runs at **`http://localhost:3000`**.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL |
| `VITE_API_TIMEOUT` | `15000` | Request timeout in ms |
| `VITE_ENABLE_MOCK` | `true` | Enable mock data (set `false` for real API) |
| `VITE_OFFICE_START_TIME` | `09:00` | Late arrival threshold |
| `VITE_DEFAULT_LANGUAGE` | `en` | Default UI language |
| `VITE_SENTRY_DSN` | — | Sentry DSN (for error tracking) |

### Available Scripts

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Type-check + production build
npm run preview          # Preview production build
npm run lint             # ESLint (Vue + TypeScript recommended)
npm run format           # Prettier (semi:false, singleQuote, trailingComma:all)
npm test                 # Vitest unit tests
npm run test:watch       # Tests in watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
```

### Code Quality Checks (run before committing)

```bash
npx vue-tsc --noEmit     # TypeScript type check
npm run lint             # ESLint
npm run format           # Prettier formatting
npm test                 # Unit tests
```

### Demo Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | `EMP-0001` | `Pass@123` |
| Captain | `EMP-0002` | `Pass@123` |
| Doer | `EMP-0004` | `Pass@123` |

### Debugging Tips

- **Mock data**: Set `VITE_ENABLE_MOCK=true` in `.env.development` (default)
- **Mock OTP**: Use `111111` for any mobile number
- **Real API**: Set `VITE_ENABLE_MOCK=false` and ensure backend is running
- **Console**: Structured logger at `utils/logger.ts` with configurable levels via `VITE_LOG_LEVEL`
- **DevTools**: Vue DevTools recommended for Pinia store inspection

---

## Repository Structure

```
optiflow-os/
│
├── frontend/                    # Vue 3 SPA
│   ├── src/
│   │   ├── api/                 # Axios client, endpoint constants, response types
│   │   ├── assets/              # Branding assets (logo, favicon)
│   │   ├── components/
│   │   │   ├── common/          # 22 design system components (Opt* prefix)
│   │   │   ├── navigation/      # Sidebar, header, bottom nav, notifications
│   │   │   └── training/        # Training content viewer
│   │   ├── composables/         # 10 reusable composition functions
│   │   ├── layouts/             # AuthLayout, DefaultLayout, 3 role layouts
│   │   ├── locales/             # en.json, hi.json, hinglish.json
│   │   ├── mock/                # 10 mock data files (development fallback)
│   │   ├── pages/
│   │   │   ├── auth/            # Login, OTP, forgot/reset password, wizard
│   │   │   ├── doer/            # 12 pages
│   │   │   ├── captain/         # 12 pages
│   │   │   └── admin/           # 17 pages (4 control center sub-pages)
│   │   ├── router/              # Routes, guards, navigation items
│   │   ├── services/            # 13 service classes (BaseService pattern)
│   │   ├── stores/              # 9 Pinia stores
│   │   ├── styles/              # Design tokens, Tailwind entry
│   │   ├── types/               # All TypeScript interfaces
│   │   └── utils/               # Formatters, validators, permissions, logger
│   ├── public/                  # Static assets (favicon.svg)
│   ├── e2e/                     # Playwright E2E tests
│   └── dist/                    # Production build output (gitignored)
│
├── screens/                     # Screenshot gallery (29 images)
├── docs/                        # Architecture, design system, workflows
└── frontend/package.json        # Dependencies, scripts, metadata
```

### Key Architectural Patterns

| Pattern | Convention | Example |
|---------|-----------|---------|
| **Components** | `Opt*` prefix for design system | `OptButton.vue`, `OptTable.vue` |
| **Stores** | Pinia with composition API | `useStore`, `taskStore`, `attendanceStore` |
| **Services** | Extend `BaseService` | `taskService`, `leaveService` |
| **API** | Axios client with interceptors | `apiGet`, `apiPost`, `apiPut` |
| **Permissions** | 24 feature flags per role | `canUseFeature(userRole, 'tasks.assign')` |
| **Error handling** | Loading / empty / error / retry states | `OptStateView.vue` |
| **Mock pattern** | Service falls back to mock on network error | `BaseService.fetchList()` |

---

## Branching Strategy

| Branch | Purpose | Base | Lifecycle |
|--------|---------|------|-----------|
| `main` | Production-ready code | — | Stable, protected |
| `develop` | Integration branch for features | `main` | Active development |
| `feature/*` | New features | `develop` | Merged via PR → `develop` |
| `bugfix/*` | Bug fixes | `develop` | Merged via PR → `develop` |
| `hotfix/*` | Critical production fixes | `main` | Merged → `main` + `develop` |
| `release/*` | Release preparation | `develop` | Merged → `main` + tagged |

### Branch Naming

```
feature/add-rescue-notifications
bugfix/fix-attendance-checkin-timezone
hotfix/critical-auth-session-bug
release/v1.0.0-beta
docs/update-api-endpoints
```

---

## Commit Convention

We use **Conventional Commits**. This enables automatic changelog generation and semantic versioning.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(captain): add rescue queue severity filter` |
| `fix` | Bug fix | `fix(doer): resolve attendance calendar date offset` |
| `docs` | Documentation | `docs(readme): update screenshot gallery` |
| `refactor` | Code change without feature/fix | `refactor(service): extract BaseService cache` |
| `test` | Adding or updating tests | `test(leave): add approval workflow tests` |
| `chore` | Maintenance, deps, config | `chore(deps): update vue-tsc to 3.2` |
| `style` | Formatting, linting | `style: apply prettier to all files` |
| `perf` | Performance improvement | `perf: lazy-load admin insight pages` |
| `i18n` | Translations | `i18n(hi): add attendance module translations` |
| `security` | Security fix | `security: sanitize error URLs in Sentry` |
| `ci` | CI/CD changes | `ci: add GitHub Actions test workflow` |

### Scopes

| Scope | Area |
|-------|------|
| `auth` | Authentication (login, OTP, session) |
| `doer` | Doer panel |
| `captain` | Captain panel |
| `admin` | Admin panel |
| `task` | Task management |
| `attendance` | Attendance module |
| `leave` | Leave module |
| `training` | Training module |
| `ticket` | Help tickets |
| `rescue` | Rescue management |
| `worklist` | Worklist / checklist |
| `notification` | Notifications |
| `employee` | Employee management |
| `department` | Department management |
| `insight` | Analytics and insights |
| `control-center` | System settings, audit logs |
| `service` | Service layer (BaseService, API) |
| `store` | Pinia stores |
| `component` | Design system components |
| `router` | Routing and guards |
| `i18n` | Translations and locales |
| `style` | Design tokens, CSS, theme |
| `permission` | RBAC and permissions |
| `readme` | README documentation |
| `docs` | Other documentation |
| `deps` | Dependencies |
| `ci` | CI/CD |

### Examples

```
feat(captain): add rescue queue severity filter

Add filter dropdown for rescue severity levels:
soft, warning, high_risk, admin_escalation.

Closes #42
```

```
fix(doer): resolve attendance calendar UTC offset

Dates were off by +5:30 in the monthly view for IST
timezone. Added timezone normalization in formatDateWithWeekday.

Fixes #87
```

```
docs: add captain panel screenshots to README gallery
```

```
chore(deps): pin vue-tsc to 3.2.8
```

---

## Pull Request Process

### Step-by-Step

1. **Fork** the repository (if external contributor)
2. **Create a branch** from `develop` (or `main` for hotfixes)
3. **Make your changes** following code standards
4. **Run quality checks** (see below)
5. **Update documentation** if changing UI, adding features, or modifying public APIs
6. **Update screenshots** if UI changes
7. **Write or update tests** for new or modified functionality
8. **Submit a Pull Request** to `develop` (or `main` for hotfixes)
9. **Address review feedback** — expect 1–3 rounds
10. **Squash merge** into target branch

### Quality Gates (must pass)

```bash
npx vue-tsc --noEmit        # Zero TypeScript errors
npm run lint                 # ESLint — zero errors
npm run format               # Prettier formatting
npm test                     # All unit tests pass
npm run test:e2e             # All E2E tests pass (if applicable)
```

### PR Template

When opening a PR, include:

```markdown
## Description
Brief description of changes.

## Type
- [ ] feat
- [ ] fix
- [ ] docs
- [ ] refactor
- [ ] test
- [ ] chore

## Modules Affected
- [ ] Auth
- [ ] Doer Panel
- [ ] Captain Panel
- [ ] Admin Panel
- [ ] Shared

## Screenshots
(if UI changes)

## Checklist
- [ ] vue-tsc --noEmit passes
- [ ] npm run lint passes
- [ ] npm test passes
- [ ] All states implemented (loading, empty, error, retry)
- [ ] Mobile responsive
- [ ] Follows Opt* design system conventions
- [ ] Documentation updated
- [ ] Screenshots updated (if UI changed)
- [ ] No console errors or warnings
```

### PR Size Guidelines

| Size | Lines Changed | Review Effort | Notes |
|------|--------------|---------------|-------|
| Small | < 100 | Quick | Preferred for most changes |
| Medium | 100–500 | Moderate | Acceptable for focused features |
| Large | 500–2000 | Significant | Needs justification |
| X-Large | > 2000 | Blocked | Must be broken into smaller PRs |

---

## Code Standards

### Vue 3 + Composition API

- Use `<script setup lang="ts">` for all components
- Use Composition API (`ref`, `computed`, `watch`) — no Options API
- Use `defineProps` / `defineEmits` with TypeScript generics
- Use `v-model` for form components
- Use Vue Router's `<router-link>` instead of `<a>` tags for internal navigation

### TypeScript

- Strict mode enabled (`vue-tsc --noEmit` must pass)
- Define interfaces in `types/index.ts` for shared types
- Use `defineProps<{ ... }>()` with typed props
- Avoid `any` — use `unknown` + type guards instead (warn-only in ESLint)
- Use `as const` for literal type arrays
- Prefer `interface` over `type` for object shapes

### Pinia Stores

- Use composition API syntax (`defineStore('name', () => { ... })`)
- Three sections: `state` (ref), `getters` (computed), `actions` (functions)
- Implement `loading`, `error`, and retry in every store
- Use `offlineStore` for offline mutation queuing
- Persist auth state via `localStorage` (interim — will migrate to httpOnly cookies)

### Services (BaseService Pattern)

- Extend `BaseService` for all API interactions
- Use `fetchList` / `fetchOne` for reads (cache + dedup + retry + mock fallback)
- Use `mutate` for writes (no mock fallback for mutations)
- Define all endpoint URLs in `api/endpoints.ts`

### Naming Conventions

| Asset | Convention | Example |
|-------|-----------|---------|
| Vue files | PascalCase | `OptButton.vue`, `MyTasks.vue` |
| TS/JS files | camelCase | `authService.ts`, `formatters.ts` |
| Components | `Opt*` prefix for design system | `OptModal`, `OptTable` |
| Layouts | `*Layout.vue` | `AuthLayout`, `DoerLayout` |
| Pages | Descriptive PascalCase | `LoginView.vue`, `RescueQueue.vue` |
| Stores | camelCase, `use*` prefix | `useStore`, `taskStore` |
| Services | camelCase | `taskService`, `leaveService` |
| Composables | camelCase, `use*` prefix | `usePagination`, `useDebounce` |
| CSS classes | kebab-case (Tailwind) | `text-neutral-900`, `bg-brand-600` |
| TypeScript types | PascalCase | `Employee`, `LoginResponse` |
| Environment variables | UPPER_SNAKE_CASE, `VITE_*` prefix | `VITE_API_BASE_URL` |

### File Organization

```
Component files:  One component per file
Page files:       One page per route
Store files:      One domain per store
Service files:    One domain per service
Mock files:       One domain per mock file
```

### Permissions

Always use the permission system when adding protected features:

```typescript
import { canUseFeature } from '@/utils/permissions'

// In a component
if (canUseFeature(store.currentRole, 'tasks.assign')) {
  // render assign button
}
```

### Error Handling

Every page must handle four states:

| State | Component | Implementation |
|-------|-----------|---------------|
| **Loading** | `OptStateView` or `OptSkeleton` | Show while `loading` is true |
| **Empty** | `OptEmptyState` | Show when data array is empty |
| **Error** | `OptStateView` | Show when `error` is non-null, with retry button |
| **Success** | Content | Show when data is loaded without error |

---

## Documentation Standards

### README Updates

When adding or changing features, update the relevant README sections:

- **Modules** — add rows to module tables
- **Screenshots** — add new screenshots to gallery
- **Quick Start** — update if installation steps change
- **Environment Variables** — add new vars
- **Role Permissions** — update feature matrix

### Screenshot Updates

When UI changes, update affected screenshots:

1. Capture at **1440×900** viewport
2. Save as PNG in `screens/{role}/`
3. Use descriptive kebab-case filenames: `captain-rescue-queue.png`
4. Keep images under 500KB
5. Captions and descriptions in README must match

### Changelog

Each release must update `CHANGELOG.md` with:

```markdown
## [x.y.z] - YYYY-MM-DD

### Added
- New features

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Security
- Security fixes
```

---

## Testing Requirements

### Unit Tests (Vitest)

| Target | Framework | Location |
|--------|-----------|----------|
| Stores | Vitest + Pinia | `src/stores/**/*.spec.ts` |
| Services | Vitest | `src/services/**/*.spec.ts` |
| Utils | Vitest | `src/utils/**/*.spec.ts` |
| Components | Vitest + @vue/test-utils | `src/components/**/*.spec.ts` |

**Coverage targets:**

| Area | Target |
|------|--------|
| Utils | 90%+ |
| Stores | 80%+ |
| Services | 80%+ |
| Components | 70%+ |

### E2E Tests (Playwright)

| Test | Location |
|------|----------|
| Critical user paths | `e2e/critical-paths.spec.ts` |
| Auth flow | `e2e/auth.spec.ts` |
| Doer workflows | `e2e/doer/*.spec.ts` |
| Captain workflows | `e2e/captain/*.spec.ts` |
| Admin workflows | `e2e/admin/*.spec.ts` |

### What to Test

**Stores:**
- Actions update state correctly
- Loading flags toggle
- Error states propagate
- Caching works (where applicable)

**Services:**
- API calls with correct parameters
- Mock fallback behavior
- Error handling and retry

**Utils:**
- Formatters produce correct output
- Validators pass/fail correctly
- Permissions check correctly for each role

**Components:**
- Renders with required props
- Handles empty/null data
- Emits events correctly

---

## UI & Design Contribution Standards

### Design System

All UI components must use the Opt* design system:

```typescript
// Import from the common index
import { OptButton, OptCard, OptModal } from '@/components/common'
```

Available components: `OptButton`, `OptInput`, `OptSelect`, `OptDatePicker`, `OptChip`, `OptAvatar`, `OptBadge`, `OptProgress`, `OptSpinner`, `OptSkeleton`, `OptModal`, `OptDrawer`, `OptBottomSheet`, `OptToast`, `OptBanner`, `OptTable`, `OptCard`, `OptKpiCard`, `OptFilterBar`, `OptTabs`, `OptPaginator`, `OptForm`, `OptEmptyState`, `OptStateView`

### Responsive Design

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 768px | BottomNav + FAB |
| Tablet | 768–1024px | Sidebar auto-collapse |
| Desktop | > 1024px | Full sidebar + header |

Test at: **375px** (mobile), **768px** (tablet), **1280px** (desktop)

### Accessibility

- All interactive elements must have `aria-label` or visible label
- Color contrast must meet WCAG AA (4.5:1 for text, 3:1 for large text)
- Focus indicators must be visible
- Keyboard navigation must work for all interactive elements
- Use `<button>` for actions, `<a>` for navigation
- Use semantic HTML (`<nav>`, `<main>`, `<header>`, `<aside>`)

### Branding Consistency

- Product name: **OptiFlow OS** (always with "OS", always capitalized)
- Must not be written as: "Optiflow", "optiflow", "OptiFlow" (without OS)
- Logo: Always use assets from `src/assets/branding/`
- Color: Primary brand color is `#2563EB` (blue-600)
- Never hardcode logo paths — import from `@/assets/branding/` via Vite

### Theme Support

All UI changes must support three themes:

| Theme | CSS Selector | Key Colors |
|-------|-------------|------------|
| Light | Default | White bg, `#171717` text |
| Dark | `.dark` class on `<html>` | Dark bg, light text |
| High-Contrast | `[data-theme="high-contrast"]` on `<html>` | Maximum contrast |

Use design tokens from `styles/tokens.css` rather than hardcoded colors.

---

## Security Contribution Rules

See [SECURITY.md](SECURITY.md) for complete security policies.

**Key rules for contributors:**

1. **Do not** commit secrets, tokens, or credentials to the repository
2. **Do not** log sensitive data (PII, tokens, passwords)
3. **Do not** expose internal error details to users
4. **Do** sanitize data before sending to error tracking (Sentry)
5. **Do** use `canUseFeature()` for permission-gated functionality
6. **Do** handle all states: loading, empty, error, retry
7. **Do** validate user input on both client and server side

**Prohibited actions:**
- Adding new `localStorage` or `sessionStorage` keys without review
- Using `v-html` with user-controlled content
- Bypassing route guards or permission checks client-side
- Exposing backend URLs, DSNs, or other infrastructure details

---

## Issue Reporting Guidelines

### Bug Reports

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Environment**: Browser, OS, device, app version
- **Steps to reproduce**: Numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What happens instead
- **Screenshots**: Before/after or error states
- **Console errors**: Check browser DevTools console
- **Network requests**: Check DevTools Network tab for API failures

### Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Problem statement**: What pain point does this solve?
- **Business value**: How does this help MSMEs?
- **Affected roles**: Doer, Captain, Admin, or all?
- **Affected modules**: Which modules does this touch?
- **Expected behavior**: Describe the ideal solution
- **Acceptance criteria**: How will we know it's done?
- **Mockups / wireframes**: Visual references if applicable
- **Implementation notes**: Optional technical approach

### Labels

| Label | Meaning |
|-------|---------|
| `bug` | Confirmed bug |
| `enhancement` | Feature request |
| `good first issue` | Good for new contributors |
| `help wanted` | Needs contributor |
| `needs-design` | Requires design input |
| `security` | Security-related |
| `documentation` | Documentation changes |
| `i18n` | Translation / localization |
| `performance` | Performance improvement |
| `discussion` | Needs community input |

---

## Feature Proposal Guidelines

All feature proposals (for both Community and Enterprise editions) must be submitted through GitHub Issues and include:

### Required Sections

1. **Problem Statement** — What is broken or missing? Why is it a problem for MSMEs?
2. **Business Value** — How does this improve the product? Quantify if possible.
3. **Expected Behavior** — Describe the feature end-to-end.
4. **Affected Roles** — Which roles interact with this feature?
5. **Affected Modules** — Which modules need changes?
6. **Screens / Components** — Which screens and components are involved?
7. **Acceptance Criteria** — How do we verify it's complete?
8. **Edition** — Does this belong in Community Edition or Enterprise Edition?

### Feature Lifecycle

```
Proposal → Discussion → Design → Approval → Implementation → Review → Release
```

---

## Open Core Contribution Policy

OptiFlow OS follows an **Open Core** model:

| Edition | License | Features | Contribution |
|---------|---------|----------|-------------|
| **Community** | AGPL v3 | All core modules | ✅ Full contributions welcome |
| **Enterprise** | Commercial | AI modules, advanced analytics, marketplace | ✅ Contributions welcome (code under commercial terms) |

### Community Edition Scope

Contributions to Community Edition features are **always welcome**:

- All Doer panel modules
- All Captain panel modules
- Admin panel (excluding enterprise features listed below)
- Authentication, notifications, offline support
- Multi-language support
- Design system components
- Documentation and testing

### Enterprise Feature Boundaries

The following features are **Enterprise Edition only**. Code contributions to these areas require a [Contributor License Agreement (CLA)](CLA.md):

- AI Task Prioritization
- AI Rescue Prediction
- AI Performance Analysis
- AI Workflow Recommendations
- Advanced Analytics Dashboard
- Marketplace for Extensions
- Custom Integration Framework

### Trademark and Branding

- **OptiFlow OS** name and logo may not be removed from the application UI
- White-labeling requires an Enterprise License
- See [LICENSE.md](LICENSE.md) Part III for complete trademark terms

---

## Review Process

### Who Reviews

| Area | Reviewer |
|------|----------|
| Frontend (Vue/TS) | Core maintainer |
| Architecture | Lead maintainer |
| Security | Security maintainer |
| Design/UI | Design reviewer |
| Documentation | Docs maintainer |

### Approval Requirements

| PR Type | Approvals Required | Additional |
|---------|-------------------|------------|
| Bug fix | 1 | Passing CI |
| Feature | 2 | Passing CI + QA sign-off |
| Security | 2 | Security review |
| Documentation | 1 | — |
| Refactor | 1 | Passing CI |

### What Reviewers Check

- [ ] Code follows conventions (naming, structure, patterns)
- [ ] TypeScript strict mode passes
- [ ] All states implemented (loading, empty, error, retry)
- [ ] Mobile responsive
- [ ] Accessibility basics covered
- [ ] No console errors or warnings
- [ ] Permissions checked for protected features
- [ ] Documentation updated
- [ ] Screenshots updated (if UI changed)
- [ ] Tests written for new functionality
- [ ] No security regressions

---

## Release Process

### Versioning

Follows **Semantic Versioning** (major.minor.patch):

| Bump | When | Example |
|------|------|---------|
| Major | Breaking API changes, rewrite | 1.0.0 → 2.0.0 |
| Minor | New features, non-breaking | 1.0.0 → 1.1.0 |
| Patch | Bug fixes, security, docs | 1.0.0 → 1.0.1 |

### Release Steps

1. **Create `release/v{x.y.z}` branch** from `develop`
2. **Freeze features** — only bug fixes and documentation
3. **Run full test suite**: `npm test && npm run test:e2e`
4. **Type check**: `npx vue-tsc --noEmit`
5. **Build**: `npm run build`
6. **Update CHANGELOG.md** with release notes
7. **Create PR** from `release/v{x.y.z}` into `main`
8. **Tag release**: `git tag v{x.y.z}`
9. **Merge PR** into `main`
10. **Backport** any fixes to `develop`

### Release Channels

| Channel | Frequency | Audience |
|---------|-----------|----------|
| `main` (stable) | Monthly | Production users |
| `develop` (nightly) | Continuous | Early adopters, testers |
| Feature branches | Per-feature | PR review |

---

## Contributor Recognition

### Ways We Recognize Contributors

| Tier | Criteria | Recognition |
|------|----------|-------------|
| 🥇 **Core Maintainer** | Sustained high-quality contributions over 6+ months | Write access, voting rights on roadmap |
| 🥈 **Active Contributor** | 5+ merged PRs | Named in release notes, contributor list |
| 🥉 **Contributor** | 1+ merged PRs | Listed in CONTRIBUTORS.md |
| 📝 **Documentation** | Docs/translations contributions | Named in docs acknowledgments |
| 🔒 **Security** | Valid vulnerability report | Hall of Fame listing |

### Hall of Fame

Contributors with significant impact will be recognized in [HALL_OF_FAME.md](HALL_OF_FAME.md) and on the project website.

---

## FAQ

### How do I start contributing?

1. Read this guide thoroughly
2. Browse [good first issues](https://github.com/your-org/optiflow-os/labels/good%20first%20issue)
3. Fork the repo, set up the [development environment](#development-setup)
4. Join our community chat (link TBD)
5. Start with documentation, tests, or small bug fixes

### How do I report a bug?

Open a GitHub Issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include environment details, steps to reproduce, and screenshots.

### How do I request a feature?

Open a GitHub Issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Focus on the problem you're solving, not just the solution.

### How do I run the project locally?

```bash
git clone https://github.com/your-org/optiflow-os.git
cd optiflow-os/frontend
npm install
cp .env.example .env.development
npm run dev
```

See [Development Setup](#development-setup) for details.

### How do I update screenshots?

1. Run the app locally at 1440×900 viewport
2. Navigate to the screen being updated
3. Capture a PNG screenshot
4. Save to `screens/{role}/{module}.png`
5. Update the README gallery if captions or descriptions changed

### How do I contribute to documentation?

- README: Edit `README.md` following the structure in [Documentation Standards](#documentation-standards)
- Architecture: Edit files in `docs/` following existing patterns
- Component docs: Edit files in `docs/components/`
- Ensure screenshots are updated if UI changed

### How do I become a maintainer?

Consistent, high-quality contributions over time. Start with small PRs, engage in code reviews, help other contributors, and demonstrate understanding of the architecture. Maintainers are appointed by existing maintainers.

### What license do contributions fall under?

Community Edition contributions are under **AGPL v3**. Enterprise Edition contributions require a CLA. See [LICENSE.md](LICENSE.md) and the [Open Core Contribution Policy](#open-core-contribution-policy).

### Do I need to sign a CLA?

For Community Edition contributions: **No** — contributing under the AGPL v3 is sufficient.

For Enterprise Edition contributions: **Yes** — a Contributor License Agreement is required. Contact licensing@optiflowos.com.

### How are decisions made?

- **Technical decisions**: Consensus among maintainers
- **Product decisions**: Maintainers + community input via GitHub Discussions
- **Roadmap prioritization**: Based on business value, community demand, and maintainer capacity

---

## Getting Help

| Channel | Purpose |
|---------|---------|
| GitHub Issues | Bug reports, feature requests |
| GitHub Discussions | Questions, ideas, architectural discussions |
| Community Chat | Real-time help (link TBD) |
| Stack Overflow | Technical questions (tag: optiflow-os) |

---

*Thank you for contributing to OptiFlow OS — the operating system for Indian MSMEs.*

*Every contribution, no matter how small, makes a difference.*

---

**OptiFlow OS** — Copyright © OptiFlow Technologies — [LICENSE](LICENSE.md) — [Code of Conduct](CODE_OF_CONDUCT.md)
