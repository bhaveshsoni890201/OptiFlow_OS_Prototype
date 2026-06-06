# OptiFlow OS — Frontend

Business Operating System for Indian MSMEs. Execution-focused platform with Doer, Captain, and Admin panels for workforce management in textile manufacturing and similar industries.

## Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Build:** Vite 5
- **State:** Pinia
- **Router:** Vue Router 4
- **UI:** HeadlessUI + Heroicons
- **Styling:** Tailwind CSS 3
- **Testing:** Vitest + Vue Test Utils + Playwright
- **HTTP:** Axios

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
cp ../.env.example .env.development  # or use existing .env files
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Testing

```bash
npm run test        # Unit tests (Vitest)
npm run test:coverage  # With coverage report
npm run test:e2e    # E2E tests (Playwright)
```

## Build

```bash
npm run build
npm run preview     # Preview production build
```

## Project Structure

```
src/
├── api/          # HTTP client and endpoint definitions
├── components/   # Reusable UI components
│   ├── common/   # Shared UI primitives (OptButton, OptInput, etc.)
│   ├── navigation/ # App shell (header, sidebar, bottom nav)
│   ├── charts/   # Chart widgets
│   ├── dashboard/ # Dashboard widgets
│   ├── forms/    # Form components
│   ├── rescue/   # Rescue-specific components
│   ├── tables/   # Data table components
│   └── tasks/    # Task-specific components
├── composables/  # Vue composables (useApi, useDebounce, etc.)
├── layouts/      # Panel layouts (Auth, Doer, Captain, Admin)
├── mock/         # Mock data for development
├── pages/        # Page views by panel
│   ├── auth/     # Login, OTP, reset, profile wizard
│   ├── doer/     # Employee workspace
│   ├── captain/  # Supervisor workspace
│   └── admin/    # Management workspace
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── styles/       # CSS tokens and Tailwind config
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## Panels

- **Doer Panel** — Task execution, attendance, leave, training, help tickets
- **Captain Panel** — Rescue coordination, team management, leave approvals
- **Admin Panel** — Governance, insights, employee management, control center

## Documentation

See `/docs/` for architecture, design system, PRD, and UI/UX specifications.
