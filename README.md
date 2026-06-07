<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/branding/logo-dark.svg">
    <img src="frontend/src/assets/branding/logo.svg" alt="OptiFlow OS Logo" width="340">
  </picture>

  <br>

  **The Operating System for Indian MSMEs**

  <br>

  <a href="#quick-start"><img src="https://img.shields.io/badge/dev-server-2563EB?style=flat-square" alt="Dev Server"></a>
  <a href="frontend/package.json"><img src="https://img.shields.io/badge/vue-3-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3"></a>
  <a href="frontend/package.json"><img src="https://img.shields.io/badge/typescript-6-3178C6?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="frontend/package.json"><img src="https://img.shields.io/badge/vite-8-646CFF?style=flat-square&logo=vite" alt="Vite"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-proprietary-6B7280?style=flat-square" alt="License"></a>

  <br>

  <p>
    <b>Doer</b> &nbsp;·&nbsp; <b>Captain</b> &nbsp;·&nbsp; <b>Admin</b> &nbsp;—&nbsp; three panels, one platform.
  </p>
</div>

---

## Overview

OptiFlow OS is a workflow, operations, and HRMS platform built for **Indian MSMEs** (10–500 employees). It replaces spreadsheets, WhatsApp-based coordination, and disconnected tools with a single execution platform.

**Three integrated panels:**

| Role | Panel | Who |
|------|-------|-----|
| **Doer** | Task execution, attendance, leave, training | Frontline employees |
| **Captain** | Team monitoring, approvals, rescue queue | Managers / Team leaders |
| **Admin** | Employee lifecycle, departments, analytics, system config | Business owners / Admins |

**The problem it solves:**

Tasks go untracked, accountability is unclear, SOPs aren't followed, and managers spend more time following up than managing. OptiFlow provides structured workflows, real-time visibility, automatic escalation, and role-based accountability.

**Target:** Manufacturing units, logistics, retail chains, warehouses, and service businesses with 10–500 employees.

---

## Quick Start

```bash
git clone https://github.com/your-org/optiflow-os.git
cd optiflow-os/frontend
npm install
cp .env.example .env.development
npm run dev
```

The app runs at **`http://localhost:3000`**.

### Demo Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | `EMP-0001` | `Pass@123` |
| Captain | `EMP-0002` | `Pass@123` |
| Doer | `EMP-0004` | `Pass@123` |

### Build for Production

```bash
npm run build     # Outputs to frontend/dist/
npm run preview   # Preview production build
```

### Run Checks

```bash
npx vue-tsc --noEmit   # Type check
npm run lint            # Lint
npm test                # Unit tests
npm run test:e2e        # E2E tests (Playwright)
```

---

## Screenshots

### Authentication

| Login | Mobile OTP |
|-------|-----------|
| <img src="screens/auth/login-page.png" alt="Login page" width="300"> | <img src="screens/auth/mobile-otp-login.png" alt="Mobile OTP login" width="300"> |

### Doer Panel

| Dashboard | My Tasks | My Worklist |
|-----------|----------|-------------|
| <img src="screens/doer/Doer-Panel-Dashboard.png" alt="Doer Dashboard" width="240"> | <img src="screens/doer/Doer-Panel-My-Tasks.png" alt="Doer Tasks" width="240"> | <img src="screens/doer/Doer-Panel-My-Worklist.png" alt="Doer Worklist" width="240"> |

| Attendance | Leave | Training |
|------------|-------|----------|
| <img src="screens/doer/Doer-Panel-Attendance.png" alt="Doer Attendance" width="240"> | <img src="screens/doer/Doer-Panel-Leave.png" alt="Doer Leave" width="240"> | <img src="screens/doer/Doer-Panel-Training.png" alt="Doer Training" width="240"> |

| Help Tickets | Notifications | Profile |
|--------------|---------------|---------|
| <img src="screens/doer/Doer-Panel-Help-Tickets.png" alt="Doer Tickets" width="240"> | <img src="screens/doer/Doer-Panel-Notifications.png" alt="Doer Notifications" width="240"> | <img src="screens/doer/Doer-Panel-Profile.png" alt="Doer Profile" width="240"> |

### Captain Panel

| Dashboard | Rescue Queue | Team |
|-----------|-------------|------|
| <img src="screens/captain/captain-dashboard.png" alt="Captain Dashboard" width="240"> | <img src="screens/captain/captain-rescue.png" alt="Captain Rescue" width="240"> | <img src="screens/captain/captain-team.png" alt="Captain Team" width="240"> |

| Worklists | Leave Approvals | Attendance |
|-----------|----------------|------------|
| <img src="screens/captain/captain-worklists.png" alt="Captain Worklists" width="240"> | <img src="screens/captain/captain-leave-approvals.png" alt="Captain Leave Approvals" width="240"> | <img src="screens/captain/captain-attendance.png" alt="Captain Attendance" width="240"> |

| Training | Tickets | Profile |
|----------|---------|---------|
| <img src="screens/captain/captain-training.png" alt="Captain Training" width="240"> | <img src="screens/captain/captain-tickets.png" alt="Captain Tickets" width="240"> | <img src="screens/captain/Captain-Profile.png" alt="Captain Profile" width="240"> |

### Admin Panel

| Dashboard | Employees | Departments |
|-----------|-----------|-------------|
| <img src="screens/admin/admin-dashboard.png" alt="Admin Dashboard" width="240"> | <img src="screens/admin/admin-employees.png" alt="Admin Employees" width="240"> | <img src="screens/admin/admin-departments.png" alt="Admin Departments" width="240"> |

| Attendance | Leave | Training |
|------------|-------|----------|
| <img src="screens/admin/admin-attendance.png" alt="Admin Attendance" width="240"> | <img src="screens/admin/admin-leave.png" alt="Admin Leave" width="240"> | <img src="screens/admin/admin-training.png" alt="Admin Training" width="240"> |

| Tickets | Insights | Control Center |
|---------|----------|----------------|
| <img src="screens/admin/admin-tickets.png" alt="Admin Tickets" width="240"> | <img src="screens/admin/admin-insights.png" alt="Admin Insights" width="240"> | <img src="screens/admin/admin-control-center.png" alt="Admin Control Center" width="240"> |

---

## Architecture

### Role Hierarchy & Data Flow

```mermaid
graph TD
    subgraph Frontend["Vue 3 SPA (TypeScript)"]
        A[Auth Layout] --> D[Default Layout]
        D --> E[Doer Layout]
        D --> F[Captain Layout]
        D --> G[Admin Layout]
        E --> H[Task / Attendance / Leave / Training / Tickets]
        F --> I[Rescue Queue / Team / Approvals / Monitoring]
        G --> J[Employees / Departments / Analytics / Control Center]
    end

    subgraph Backend["Frappe / Django REST API"]
        K[Auth Service]
        L[Task Service]
        M[Rescue Service]
        N[Attendance Service]
        O[Leave Service]
        P[Employee Service]
        Q[Training Service]
        R[Ticket Service]
        S[Notification Service]
    end

    D -->|Axios + Bearer token| K
    H --> L & N & O & Q & R
    I --> M & N & O & Q
    J --> P & S
    K --> T[(PostgreSQL)]
    L --> T
    M --> T
    N --> T
```

### Key Workflows

```mermaid
graph LR
    subgraph Rescue["Rescue Escalation"]
        A1[Task Overdue] --> B1[Soft Alert]
        B1 --> C1[Warning]
        C1 --> D1[High Risk]
        D1 --> E1[Admin Escalation]
    end

    subgraph Leave["Leave + Buddy"]
        A2[Apply Leave] --> B2[Assign Buddy]
        B2 --> C2[Captain Approves]
        C2 --> D2[Auto-escalate if delayed]
    end

    subgraph Training["Training Lifecycle"]
        A3[Admin Assigns] --> B3[Doer Completes]
        B3 --> C3[Progress Tracked]
        C3 --> D3[Completion Recorded]
    end
```

### Frontend Layers

```
Pages (lazy-loaded per route)
  └─ Stores (Pinia — state + cache + persistence)
       └─ Services (BaseService — cache TTL 30s, dedup, retry 3×)
            └─ API Client (Axios — auth header, CSRF, timeout, 401 redirect)
                 └─ Backend (Frappe/Django REST endpoints)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI** | Vue 3 + TypeScript + Vite 8 | Composition API, strict typing, fast builds |
| **Styling** | Tailwind CSS 3 + Headless UI | Utility-first CSS, accessible primitives |
| **State** | Pinia 3 + Vue Router 4 | Modular stores, lazy routes, auth guards |
| **HTTP** | Axios | Interceptors, retry, CSRF |
| **i18n** | vue-i18n 11 | EN / HI / Hinglish |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **Monitoring** | Sentry + web-vitals | Error tracking, performance metrics |
| **Backend** | Frappe / Django + PostgreSQL | REST API (planned / in development) |

---

## Modules

| Module | Doer | Captain | Admin |
|--------|------|---------|-------|
| Task Management | ✅ Execute | ✅ Assign & Review | ✅ Full access |
| Attendance | ✅ Check in/out | ✅ Monitor team | ✅ Org-wide view |
| Leave | ✅ Apply + Buddy | ✅ Approve/Reject | ✅ Manage |
| Training | ✅ Complete | ✅ Assign | ✅ Create & assign |
| Help Tickets | ✅ Raise | ✅ Respond | ✅ Full resolution |
| Worklists | ✅ Execute checklists | ✅ Manage assignments | — |
| Rescue Queue | — | ✅ Monitor & escalate | ✅ Oversight |
| Employee Mgmt | — | ✅ View team | ✅ Full lifecycle |
| Departments | — | — | ✅ Create & manage |
| Analytics | — | ✅ Team insights | ✅ Org-wide analytics |
| Control Center | — | — | ✅ Settings, roles, audit logs |
| Notifications | ✅ Personal | ✅ Team | ✅ Broadcast |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_API_TIMEOUT` | `15000` | Request timeout (ms) |
| `VITE_ENABLE_MOCK` | `true` | Mock data fallback in dev |
| `VITE_OFFICE_START_TIME` | `09:00` | Late arrival threshold |
| `VITE_DEFAULT_LANGUAGE` | `en` | Default UI language |

---

## Project Structure

```
optiflow-os/
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client, endpoints, types
│   │   ├── assets/         # Branding assets (logo, favicon)
│   │   ├── components/     # Design system (Opt*) + navigation
│   │   ├── composables/    # Reusable Vue composition functions
│   │   ├── layouts/        # AuthLayout, DefaultLayout, role layouts
│   │   ├── locales/        # en.json, hi.json, hinglish.json
│   │   ├── mock/           # Development mock data
│   │   ├── pages/          # auth/, doer/, captain/, admin/
│   │   ├── router/         # Route definitions + guards
│   │   ├── services/       # API service layer (cache, dedup, retry)
│   │   ├── stores/         # Pinia stores (auth, tasks, attendance, ...)
│   │   ├── styles/         # Tailwind entry + design tokens
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Formatters, validators, permissions, logger
│   ├── public/             # Static assets (favicon.svg)
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/                   # Architecture, design system, workflows
├── screens/                # Screenshot gallery
└── CLAUDE.md               # AI-assisted development guide
```

---

## Roadmap

| Phase | Focus |
|-------|-------|
| **Current** | Production hardening — API integration, error/loading/empty states, security audit |
| **v1.0** | All modules complete (rescue, worklist, training, attendance, leave, tickets, notifications, multi-language, dark mode, offline, PWA) |
| **Next** | AI prioritization & rescue prediction, advanced analytics, WhatsApp integration |
| **Future** | Mobile apps, biometric attendance, payroll integration, supply chain, multi-location |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

### PR Checklist

- [ ] `vue-tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] Implements loading, empty, error, and retry states
- [ ] Mobile responsive
- [ ] Follows design system conventions

---

## Documentation

- [Frontend Architecture](docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md)
- [Component Library](docs/components/COMPONENT_LIBRARY.md)
- [Design System](docs/design-system/DESIGN_SYSTEM.md)
- [Route Map](docs/routes/ROUTES_MAP.md)
- [Screen Inventory](docs/screens/SCREEN_INVENTORY.md)
- [UI/UX Specification](docs/uiux/UI_UX_SPECIFICATION.md)
- [Workflow Mapping](docs/workflows/WORKFLOW_UI_MAPPING.md)
- [Architecture Decisions](docs/adr/)

---

## License

**Proprietary Software** — Copyright © OptiFlow Technologies. All rights reserved.

See [LICENSE](LICENSE) for terms.

---

## Support

- **Email:** support@optiflowos.com
- **Issues:** GitHub Issues
- **In-app:** Built-in Help Desk ticketing system

---

<div align="center">
  <sub>Built with Vue 3, TypeScript, and Tailwind CSS for Indian MSMEs.</sub>
</div>
