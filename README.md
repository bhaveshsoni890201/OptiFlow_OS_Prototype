<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/branding/logo-dark.svg">
  <img src="frontend/src/assets/branding/logo.svg" alt="OptiFlow OS" width="340">
</picture>

<br>

# Operating System for Indian MSMEs

<br>

<!-- Badges -->
<a href="#quick-start"><img src="https://img.shields.io/badge/getting%20started-2563EB?style=flat-square" alt="Getting Started"></a>
<a href="frontend/package.json"><img src="https://img.shields.io/badge/version-0.1.0-6B7280?style=flat-square" alt="Version"></a>
<a href="frontend/package.json"><img src="https://img.shields.io/badge/vue-3-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3"></a>
<a href="frontend/package.json"><img src="https://img.shields.io/badge/typescript-6-3178C6?style=flat-square&logo=typescript" alt="TypeScript"></a>
<a href="frontend/package.json"><img src="https://img.shields.io/badge/vite-8-646CFF?style=flat-square&logo=vite" alt="Vite"></a>
<a href="frontend/package.json"><img src="https://img.shields.io/badge/tailwind-3-06B6D4?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"></a>
<a href="frontend/node_modules/vue-router"><img src="https://img.shields.io/badge/pinia-3-FFD859?style=flat-square" alt="Pinia"></a>
<a href="docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md"><img src="https://img.shields.io/badge/docs-architecture-2563EB?style=flat-square" alt="Docs"></a>
<a href="#license"><img src="https://img.shields.io/badge/license-proprietary-6B7280?style=flat-square" alt="License"></a>

<br>

<b>Doer</b> &nbsp;·&nbsp; <b>Captain</b> &nbsp;·&nbsp; <b>Admin</b> &nbsp;—&nbsp; Three panels, one platform for frontline operations.

<br>

<a href="#screenshots">📸 Screenshots</a>
&nbsp;·&nbsp; <a href="#quick-start">🚀 Quick Start</a>
&nbsp;·&nbsp; <a href="#system-architecture">🏗️ Architecture</a>
&nbsp;·&nbsp; <a href="#roadmap">🗺️ Roadmap</a>
&nbsp;·&nbsp; <a href="#contributing">🤝 Contributing</a>
&nbsp;·&nbsp; <a href="docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md">📖 Docs</a>

</div>

---

## Table of Contents

- [Why OptiFlow OS](#why-optiflow-os)
- [Who It's For](#who-its-for)
- [Core Modules](#core-modules)
- [Screenshots](#screenshots)
- [System Architecture](#system-architecture)
- [Product Workflows](#product-workflows)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Role Permissions](#role-permissions)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Documentation Hub](#documentation-hub)

---

## Why OptiFlow OS

Indian MSMEs run on spreadsheets, WhatsApp groups, and manual follow-ups. Tasks get lost, attendance is tracked on paper, leave requests vanish in chat threads, and managers spend more time chasing updates than managing work. There is no single source of truth.

**OptiFlow OS replaces that chaos with a structured execution platform.**

| Pain Point | How OptiFlow Solves It |
|------------|----------------------|
| Tasks are assigned verbally or over WhatsApp | Structured task creation with priority, status, due dates, and assignment tracking |
| No one knows who is doing what | Role-based dashboards with real-time visibility for Doers, Captains, and Admins |
| Attendance is on paper or sporadic GPS | Digital check-in/check-out with WFO/WFH modes, correction requests, and team-wide monitoring |
| Leave requests disappear in chat | Formal leave workflow: apply → buddy assignment → captain approval → auto-escalation |
| SOPs are PDFs nobody reads | Training modules with SOP content, video, and guides; tracked completion and progress |
| Blocked tasks go unnoticed | Rescue queue auto-alerts captains when tasks are overdue or at risk; escalate to admin if needed |
| Issues get raised but never resolved | Help desk ticketing with priority, assignment, comments, escalation, and SLA tracking |
| Managers lack visibility | Insights dashboard, weekly reviews, Doer 360° performance view, department analytics |
| No accountability structure | Three-tier role hierarchy (Doer → Captain → Admin) with granular feature permissions |
| Training is inconsistent | Admin creates modules, captains assign, doers complete — progress tracked end-to-end |

### What Makes It Different

- **Rescue Management** — automated intervention triggers when tasks go overdue. Captains receive alerts with full context before problems escalate.
- **Worklist + Checklist + SOP** — daily/weekly/monthly structured checklists linked to SOP documents, enforced at the execution level.
- **Buddy Transfer for Leave** — employees assign a buddy before leave, ensuring coverage. If the buddy reverts before leave ends, the system auto-restores.
- **Offline-First Mutations** — queue actions when offline, auto-sync when connectivity returns. No data loss.
- **Three-Role Design** — Doer (frontline), Captain (manager), Admin (owner) — each panel is a focused experience, not a bloated dashboard.

---

## Who It's For

| Segment | Use Case |
|---------|----------|
| 🏭 **Manufacturing units** | Track production tasks, SOP compliance, shift attendance |
| 📦 **Logistics & distribution** | Route checklists, delivery tracking, driver attendance |
| 🏪 **Retail chains & warehouses** | Store operations checklists, stock task management, multi-location teams |
| 🛠️ **Service businesses** | Job assignment, field attendance, client escalation tracking |
| 🏢 **Any MSME with 10–500 employees** | All of the above — single platform for operations + HRMS |

---

## Core Modules

### Doer Panel — Frontline Employee

| Module | Description | Pages |
|--------|-------------|-------|
| **Dashboard** | Daily summary: pending tasks, attendance status, recent notifications, quick actions | `DoerHome.vue` |
| **My Tasks** | Task list with priority/status/due-date filters. Supports delegation, checklist, and FMS task types | `MyTasks.vue`, `TaskDetail.vue`, `CreateTaskView.vue` |
| **My Worklist** | Daily/weekly/monthly checklist execution with embedded SOP links | `MyWorklist.vue` |
| **Attendance** | Check-in/check-out with WFO/WFH mode toggle, monthly calendar, correction requests | `AttendanceView.vue` |
| **Leave** | Apply for leave, view balance, assign buddy, track approval status | `LeaveView.vue` |
| **Training** | View assigned modules, track progress, complete SOP/video/guide content | `TrainingView.vue` |
| **Help Tickets** | Raise tickets, track resolution, add comments, rate resolution | `HelpTickets.vue`, `TicketDetail.vue` |
| **Notifications** | Real-time alerts for tasks, leave, tickets, training; per-category preferences | `NotificationsView.vue` |
| **Profile** | View/edit personal details, theme/language preferences, notification settings | `DoerProfile.vue` |

### Captain Panel — Team Leader / Manager

| Module | Description | Pages |
|--------|-------------|-------|
| **Dashboard** | Team KPIs, rescue queue summary, pending leave approvals, attendance snapshot | `CaptainDashboard.vue` |
| **Rescue Queue** | Auto-generated alerts for delayed/blocked tasks. Severity: soft → warning → high_risk → admin_escalation | `RescueQueue.vue`, `RescueDetail.vue` |
| **Team** | Team roster with member workload, performance, and detail drill-down | `TeamRoster.vue`, `MemberDetail.vue` |
| **Worklists** | Create, edit, and assign SOP checklists to team members | `WorklistManagement.vue` |
| **Leave Approvals** | Approve/reject leave, manage buddy transfers, auto-escalation after 48h | `LeaveApprovals.vue` |
| **Attendance Monitor** | Team-wide attendance view, late arrivals, correction requests | `AttendanceMonitor.vue` |
| **Training Assignment** | Assign training modules to team members, track completion | `TrainingAssignment.vue` |
| **Tickets** | View, assign, and respond to team help tickets | `CaptainTickets.vue` |

### Admin Panel — Business Owner / Administrator

| Module | Description | Pages |
|--------|-------------|-------|
| **Dashboard** | Organization-wide KPIs, alerts, system health | `AdminDashboard.vue` |
| **Employee Management** | Full lifecycle: create, edit, disable, offboard; role assignment | `EmployeeManagement.vue`, `EmployeeDetail.vue` |
| **Department Management** | Create and manage departments, assign heads | `DepartmentManagement.vue`, `DepartmentAnalytics.vue` |
| **Insights** | Org-wide analytics, trends, and reports | `InsightsOverview.vue` |
| **Doer 360°** | Per-employee performance view (tasks, attendance, training, tickets) | `Doer360View.vue` |
| **Captain Index** | Team leader effectiveness scoring | `CaptainIndexView.vue` |
| **Weekly Review** | Automated weekly performance summary | `WeeklyReviewView.vue` |
| **Attendance** | Full organization attendance overview, corrections, reports | `AdminAttendance.vue` |
| **Leave** | Org-wide leave calendar, multi-level approvals | `AdminLeaveView.vue` |
| **Training** | Create and assign training content, track org-wide completion | `AdminTrainingView.vue` |
| **Tickets** | Full ticket queue: assignment, escalation, resolution | `AdminTicketsView.vue`, `AdminTicketDetail.vue` |
| **Control Center** | System settings, role permissions, audit logs, exception monitor | `ControlCenter.vue` + 4 sub-pages |
| **Notifications** | Broadcast notifications to all employees | `AdminNotificationsView.vue` |

### Cross-Cutting Modules

| Module | Description |
|--------|-------------|
| **Authentication** | Employee ID + password login, OTP verification, forgot/reset password, profile wizard (5 screens) |
| **Rescue Management** | Automated delay/block detection with severity ladder. Captains intervene via reminder/reassign/escalate. Admin can override. |
| **Offline Support** | Mutation queue persists to localStorage; auto-syncs on reconnection. Graceful degradation with mock data fallback. |
| **Multi-Language** | English, Hindi (हिन्दी), Hinglish — full UI translation across all modules |
| **Theme** | Light, Dark, and High-Contrast modes with system preference detection |

---

## Screenshots

### Authentication

| Login | Mobile OTP |
|-------|-----------|
| <img src="screens/auth/login-page.png" alt="Login page" width="300"> | <img src="screens/auth/mobile-otp-login.png" alt="Mobile OTP login" width="300"> |
| Employee ID + password login with demo credentials | OTP verification for mobile-based authentication |

### Doer Panel

| Dashboard | My Tasks | My Worklist |
|-----------|----------|-------------|
| <img src="screens/doer/Doer-Panel-Dashboard.png" alt="Doer Dashboard" width="240"> | <img src="screens/doer/Doer-Panel-My-Tasks.png" alt="My Tasks" width="240"> | <img src="screens/doer/Doer-Panel-My-Worklist.png" alt="My Worklist" width="240"> |
| Daily summary with pending tasks, attendance status, and notifications | Task list with priority, status, due-date filters across all task types | Structured checklist execution with SOP links |

| Attendance | Leave | Training |
|------------|-------|----------|
| <img src="screens/doer/Doer-Panel-Attendance.png" alt="Attendance" width="240"> | <img src="screens/doer/Doer-Panel-Leave.png" alt="Leave" width="240"> | <img src="screens/doer/Doer-Panel-Training.png" alt="Training" width="240"> |
| Check-in/check-out with WFO/WFH modes and monthly calendar | Leave application with buddy assignment and balance view | Training modules with progress tracking and content viewer |

| Help Tickets | Notifications | Profile |
|--------------|---------------|---------|
| <img src="screens/doer/Doer-Panel-Help-Tickets.png" alt="Help Tickets" width="240"> | <img src="screens/doer/Doer-Panel-Notifications.png" alt="Notifications" width="240"> | <img src="screens/doer/Doer-Panel-Profile.png" alt="Profile" width="240"> |
| Support ticket system with priority, comments, and rating | Real-time alerts across all modules with category preferences | Personal details, theme toggle, language selection |

### Captain Panel

| Dashboard | Rescue Queue | Team |
|-----------|-------------|------|
| <img src="screens/captain/captain-dashboard.png" alt="Captain Dashboard" width="240"> | <img src="screens/captain/captain-rescue.png" alt="Rescue Queue" width="240"> | <img src="screens/captain/captain-team.png" alt="Team Roster" width="240"> |
| Team KPIs, rescue alerts, pending approvals at a glance | Auto-detected task delays with severity: soft → warning → high_risk → admin_escalation | Team member list with workload, performance, and drill-down |

| Worklists | Leave Approvals | Attendance |
|-----------|----------------|------------|
| <img src="screens/captain/captain-worklists.png" alt="Worklist Management" width="240"> | <img src="screens/captain/captain-leave-approvals.png" alt="Leave Approvals" width="240"> | <img src="screens/captain/captain-attendance.png" alt="Attendance Monitor" width="240"> |
| Create and assign SOP checklists to team members | Approve/reject leave with buddy transfer management | Team-wide attendance with late arrivals and corrections |

| Training | Tickets | Profile |
|----------|---------|---------|
| <img src="screens/captain/captain-training.png" alt="Training Assignment" width="240"> | <img src="screens/captain/captain-tickets.png" alt="Captain Tickets" width="240"> | <img src="screens/captain/Captain-Profile.png" alt="Captain Profile" width="240"> |
| Assign training modules and track team completion | Respond to and assign team help tickets | Captain profile and preferences |

### Admin Panel

| Dashboard | Employees | Departments |
|-----------|-----------|-------------|
| <img src="screens/admin/admin-dashboard.png" alt="Admin Dashboard" width="240"> | <img src="screens/admin/admin-employees.png" alt="Employee Management" width="240"> | <img src="screens/admin/admin-departments.png" alt="Department Management" width="240"> |
| Organization-wide KPIs, alerts, and system health | Full employee lifecycle: create, edit, disable, offboard | Create and manage departments, assign heads |

| Attendance | Leave | Training |
|------------|-------|----------|
| <img src="screens/admin/admin-attendance.png" alt="Admin Attendance" width="240"> | <img src="screens/admin/admin-leave.png" alt="Admin Leave" width="240"> | <img src="screens/admin/admin-training.png" alt="Admin Training" width="240"> |
| Full organization attendance overview and corrections | Org-wide leave calendar and management | Create training modules and track org-wide completion |

| Tickets | Insights | Control Center |
|---------|----------|----------------|
| <img src="screens/admin/admin-tickets.png" alt="Admin Tickets" width="240"> | <img src="screens/admin/admin-insights.png" alt="Insights" width="240"> | <img src="screens/admin/admin-control-center.png" alt="Control Center" width="240"> |
| Full ticket lifecycle: assign, escalate, resolve | Organization-wide analytics, trends, and reports | System settings, role permissions, audit logs |

---

## System Architecture

### Role Hierarchy

```mermaid
graph TD
    A[Admin Level 2] -->|Manages| B[Captain Level 1]
    B -->|Supervises| C[Doer Level 0]
    style A fill:#475569,color:#fff
    style B fill:#D97706,color:#fff
    style C fill:#2563EB,color:#fff
```

### Frontend Architecture

```mermaid
graph TD
    subgraph Auth["Authentication (5 pages)"]
        A1[Login] --> A2[OTP Verify]
        A1 --> A3[Forgot Password]
        A3 --> A4[Reset Password]
        A2 --> A5[Profile Wizard]
    end

    subgraph Shell["DefaultLayout.vue (Shell)"]
        S1[AppSidebar] --- S2[AppHeader]
        S2 --- S3["&lt;router-view/&gt;"]
        S3 --- S4[BottomNav]
        S3 --- S5[NotificationCenter]
    end

    subgraph Panels["Role Panels"]
        D[DoerLayout] --> D1["12 pages<br/>Tasks, Attendance, Leave, Training, Tickets"]
        C2[CaptainLayout] --> C3["12 pages<br/>Rescue, Team, Approvals, Monitor"]
        A6[AdminLayout] --> A7["17 pages<br/>Employees, Insights, Control Center"]
    end

    Shell --> D
    Shell --> C2
    Shell --> A6

    subgraph Data["Data Layer"]
        P[Pinia Stores<br/>9 stores] --> S[Services<br/>13 services]
        S --> API[API Client<br/>Axios + Interceptors]
        API --> BE[Backend<br/>Frappe/Django REST API]
    end

    D1 --> P
    C3 --> P
    A7 --> P
```

### Service Layer

```mermaid
graph LR
    subgraph Stores["Pinia Stores (9)"]
        US[useStore]
        TS[taskStore]
        RS[rescueStore]
        AS[attendanceStore]
        WS[workflowStore]
        OS[offlineStore]
        NS[notificationStore]
        TKS[ticketStore]
        ADS[adminStore]
    end

    subgraph Services["Service Layer (13)"]
        BS[BaseService<br/>Cache 30s TTL<br/>Dedup + Retry 3x]
        AUTH[authService]
        TASK[taskService]
        RESC[rescueService]
        ATT[attendanceService]
        LV[leaveService]
        EMP[employeeService]
        TRN[trainingService]
        TKT[ticketService]
        WL[worklistService]
        DEP[departmentService]
        NOT[notificationService]
        RT[realtimeService]
    end

    subgraph Mock["Mock Data Fallback<br/>(when VITE_ENABLE_MOCK=true<br/>or network error)"]
        M1[tasks.ts]
        M2[attendance.ts]
        M3[leave.ts]
        M4[tickets.ts]
        M5[training.ts]
        M6[rescue.ts]
        M7[employees.ts]
    end

    BS -->|fetchList/fetchOne| M1 & M2 & M3 & M4 & M5 & M6 & M7
    BS -->|mutate| API[Real API Endpoints]
    API --> BACKEND[Frappe/Django Backend]
    BACKEND --> DB[(PostgreSQL)]

    AUTH --> BS
    TASK --> BS
    RESC --> BS
    ATT --> BS
    LV --> BS
    EMP --> BS
    TRN --> BS
    TKT --> BS
    WL --> BS
    DEP --> BS
    NOT --> BS

    US & TS & RS & AS & WS & OS & NS & TKS & ADS --> AUTH & TASK & RESC & ATT & LV & EMP & TRN & TKT & WL & DEP & NOT & RT
```

### Client-Side Data Flow

```mermaid
sequenceDiagram
    participant P as Page (Vue Component)
    participant S as Pinia Store
    participant SV as Service
    participant BS as BaseService
    participant API as API Client (Axios)
    participant BE as Backend

    P->>S: dispatch action
    S->>SV: call service method
    SV->>BS: fetchList() / fetchOne() / mutate()
    BS->>API: apiGet / apiPost / ...
    API->>BE: HTTP Request
    BE-->>API: Response
    API-->>BS: ApiResponse<T>
    BS-->>SV: unwrapped data
    SV-->>S: update reactive state
    S-->>P: Vue reactivity re-renders UI

    Note over BS,API: On network error or VITE_ENABLE_MOCK=true
    BS-->>SV: return mock data
    SV-->>S: update state with mock
    S-->>P: UI renders with fallback data
```

---

## Product Workflows

### Task Lifecycle

```mermaid
graph LR
    A[Create Task] --> B{Assigned To}
    B -->|Doer| C[In Progress]
    B -->|Captain Review| D[Under Review]
    C --> E[Completed]
    D --> E
    E --> F[Resolved]
    F --> G{Overdue?}
    G -->|No| H[Done]
    G -->|Yes| I[Rescue Triggered]
    I --> J[Captain Reminder]
    J --> K[Reassign / Escalate]
```

### Rescue Management

```mermaid
graph TD
    A[Task Overdue or Blocked] --> B{Severity Check}
    B -->|soft| C[Toast Alert]
    B -->|warning| D[Captain Dashboard Alert]
    B -->|high_risk| E[Notification + Email]
    B -->|admin_escalation| F[Admin Alert]

    C & D & E & F --> G[Captain Reviews Rescue Detail]
    G --> H{Action}
    H --> I[Send Reminder]
    H --> J[Reassign Task]
    H --> K[Escalate to Admin]
    H --> L[Resolve Rescue]
```

### Leave + Buddy Workflow

```mermaid
graph TD
    A[Employee Applies Leave] --> B[Select Dates + Type]
    B --> C[Assign Buddy]
    C --> D{Within 48h?}
    D -->|Yes| E[Captain Approves/Rejects]
    D -->|No| F[Auto-Escalate to Admin]
    E --> G{Buddy Reverted?}
    G -->|Yes| H[Auto-Restore Tasks]
    G -->|No| I[Leave Active]
    F --> J[Admin Approves/Rejects]
    H --> K[Leave Complete]
    I --> K
    J --> K
```

### Training Lifecycle

```mermaid
graph LR
    A[Admin Creates Module] --> B[Captain Assigns to Team]
    B --> C[Doer Views Content]
    C --> D{Content Type}
    D -->|SOP| E[Read & Acknowledge]
    D -->|Video| F[Watch & Mark Complete]
    D -->|Guide| G[Read & Complete]
    E & F & G --> H[Progress Updated]
    H --> I[Marked Complete]
```

### Ticket Flow

```mermaid
graph TD
    A[Doer Raises Ticket] --> B{Category}
    B -->|Technical| C[Auto-Assigned to IT]
    B -->|HR| D[Auto-Assigned to HR]
    B -->|Operations| E[Auto-Assigned to Captain]
    C & D & E --> F[Captain/Admin Responds]
    F --> G{Resolution}
    G -->|Resolved| H[Doer Rates Experience]
    G -->|Needs Escalation| I[Escalate to Admin]
    I --> J[Admin Resolves]
    H --> K[Ticket Closed]
    J --> K
```

### Attendance Flow

```mermaid
graph LR
    A[Doer Checks In] --> B{Work Mode}
    B -->|WFO| C[Office Attendance Logged]
    B -->|WFH| D[Home Attendance Logged]
    A --> E[Doer Checks Out]
    C & D --> E
    E --> F{Correction Needed?}
    F -->|Yes| G[Submit Correction]
    G --> H[Captain Reviews]
    H --> I[Approved/Rejected]
    F -->|No| J[Attendance Complete]
```

---

## Technology Stack

### Frontend

| Technology | Version | Why It's Used |
|-----------|---------|---------------|
| **Vue 3** | ^3.5.34 | Composition API for clean, reactive component logic |
| **TypeScript** | ^6.0.3 | End-to-end type safety across the entire codebase |
| **Vite** | ^8.0.12 | Sub-second HMR during development; fast production builds with code splitting |
| **Pinia** | ^3.0.4 | Modular state management with TypeScript support and localStorage persistence |
| **Vue Router** | ^4.6.4 | Lazy-loaded routes per role; auth guards; deep-link preservation |
| **Axios** | ^1.7.9 | HTTP client with interceptors for auth tokens, CSRF, retry, and error handling |
| **Tailwind CSS** | ^3.4.19 | Utility-first CSS for rapid UI development; consistent design tokens |
| **Headless UI** | ^1.7.23 | Accessible, unstyled UI primitives for modals, dropdowns, and menus |
| **vue-i18n** | ^11.4.4 | Full internationalization with 3 locales (EN, HI, Hinglish) |
| **Sentry** | ^10.56.0 | Production error tracking with source maps |

### Backend (Planned)

| Technology | Purpose |
|-----------|---------|
| **Frappe / Django** | Application framework with built-in admin, permission system, and REST API |
| **PostgreSQL** | Primary relational database |
| **Redis** | Caching and real-time pub/sub for notifications |

### Development & Quality

| Technology | Purpose |
|-----------|---------|
| **ESLint + Prettier** | Code quality and formatting enforcement |
| **vue-tsc** | TypeScript type checking for Vue SFCs |
| **Vitest + jsdom** | Unit and integration tests |
| **Playwright** | End-to-end browser tests |
| **Design Token System** | 276-line CSS custom property system covering brand colors, typography, spacing, dark mode, high-contrast, reduced-motion |

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** 9+ (or **pnpm** 8+)
- **Git**

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/optiflow-os.git
cd optiflow-os/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.development
```

Edit `.env.development` with your settings (see [Environment Variables](#environment-variables)).

### Run

```bash
# Start development server
npm run dev
```

The app runs at **`http://localhost:3000`**.

### Demo Credentials

| Role | Employee ID | Password |
|------|-------------|----------|
| **Admin** | `EMP-0001` | `Pass@123` |
| **Captain** | `EMP-0002` | `Pass@123` |
| **Doer** | `EMP-0004` | `Pass@123` |

### Production Build

```bash
npm run build       # Outputs to frontend/dist/
npm run preview     # Preview production build locally
```

### Run Checks

```bash
npx vue-tsc --noEmit   # TypeScript type check (must pass)
npm run lint            # ESLint
npm test                # Unit tests (Vitest)
npm run test:e2e        # E2E tests (Playwright)
npm run test:coverage   # With coverage report
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_API_TIMEOUT` | `15000` | API request timeout in ms |
| `VITE_ENABLE_MOCK` | `true` | Enable mock data fallback (set `false` for real API) |
| `VITE_OFFICE_START_TIME` | `09:00` | Office start time for late arrival calculation |
| `VITE_DEFAULT_LANGUAGE` | `en` | Default UI language (`en`, `hi`, `hinglish`) |
| `VITE_SENTRY_DSN` | — | Sentry DSN for production error tracking |
| `VITE_APP_VERSION` | `0.1.0` | App version displayed in sidebar |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Edit `port` in `vite.config.ts` |
| API calls failing | Set `VITE_ENABLE_MOCK=true` in `.env.development` to use mock data |
| OTP verification fails | Mock OTP is `111111` for any mobile number |
| Blank page after login | Check browser console; ensure redirect role matches route tree |

---

## Role Permissions

| Feature | Doer | Captain | Admin |
|---------|------|---------|-------|
| View own tasks | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Assign tasks to others | ❌ | ✅ | ✅ |
| Review team tasks | ❌ | ✅ | ✅ |
| Delete tasks | ❌ | ❌ | ✅ |
| Apply for leave | ✅ | ✅ | ✅ |
| Approve/reject leave | ❌ | ✅ | ✅ |
| Escalate leave | ❌ | ✅ | ✅ |
| Archive leave | ❌ | ❌ | ✅ |
| Check in/out attendance | ✅ | ✅ | ✅ |
| View team attendance | ❌ | ✅ | ✅ |
| Submit attendance correction | ✅ | — | — |
| Approve corrections | ❌ | ✅ | ✅ |
| Raise help tickets | ✅ | ✅ | ✅ |
| Assign tickets | ❌ | ✅ | ✅ |
| Resolve tickets | ❌ | ✅ | ✅ |
| Escalate tickets | ❌ | ✅ | ✅ |
| View training | ✅ | ✅ | ✅ |
| Assign training | ❌ | ✅ | ✅ |
| Create training modules | ❌ | ❌ | ✅ |
| Rescue: view queue | ❌ | ✅ | ✅ |
| Rescue: send reminder | ❌ | ✅ | ✅ |
| Rescue: reassign | ❌ | ✅ | ✅ |
| Rescue: escalate | ❌ | ✅ | ✅ |
| Rescue: resolve | ❌ | ✅ | ✅ |
| View employees | ❌ | ✅ (team) | ✅ (all) |
| Create/edit/delete employees | ❌ | ❌ | ✅ |
| Manage departments | ❌ | ❌ | ✅ |
| View insights | ❌ | ✅ (team) | ✅ (org) |
| System settings | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Broadcast notifications | ❌ | ❌ | ✅ |
| Theme (light/dark/high-contrast) | ✅ | ✅ | ✅ |
| Language (EN/HI/Hinglish) | ✅ | ✅ | ✅ |
| Offline mutation queue | ✅ | ✅ | ✅ |

---

## Project Structure

```
optiflow-os/
│
├── frontend/                          # Vue 3 SPA
│   ├── src/
│   │   ├── api/                       # Axios client, endpoint constants, response types
│   │   ├── assets/branding/           # Centralized branding assets (logo, favicon)
│   │   ├── components/
│   │   │   ├── common/                # 22 design system components (Opt* prefix)
│   │   │   ├── navigation/            # Sidebar, header, bottom nav, notifications
│   │   │   └── training/              # Training content viewer
│   │   ├── composables/              # 10 reusable composition functions
│   │   ├── layouts/                   # AuthLayout, DefaultLayout, 3 role layouts
│   │   ├── locales/                   # en.json, hi.json, hinglish.json
│   │   ├── mock/                      # 10 mock data files (development fallback)
│   │   ├── pages/
│   │   │   ├── auth/                  # 5 pages (login, OTP, forgot/reset password, wizard)
│   │   │   ├── doer/                  # 12 pages
│   │   │   ├── captain/               # 12 pages
│   │   │   └── admin/                 # 17 pages (4 control center sub-pages)
│   │   ├── router/                    # 425+ route definitions with auth guards
│   │   ├── services/                  # 13 services (BaseService pattern)
│   │   ├── stores/                    # 9 Pinia stores
│   │   ├── styles/                    # Design tokens + Tailwind entry
│   │   ├── types/                     # All TypeScript interfaces
│   │   └── utils/                     # Formatters, validators, permissions, logger
│   ├── public/                        # Static assets (favicon.svg)
│   ├── index.html
│   ├── vite.config.ts
│   ├── .env.example
│   └── package.json
│
├── screens/                           # Screenshot gallery (29 images)
│   ├── auth/                          # Login, OTP
│   ├── doer/                          # 9 screenshots
│   ├── captain/                       # 9 screenshots
│   ├── admin/                         # 9 screenshots
│   └── branding/                      # Logo assets
│
├── docs/                              # Architecture, design system, workflows
│   ├── adr/                           # Architecture Decision Records
│   ├── components/                    # Component documentation
│   ├── design-system/                 # Design token documentation
│   ├── frontend/                      # Frontend architecture
│   ├── prd/                           # Product Requirements Document
│   ├── routes/                        # Route mapping
│   ├── screens/                       # Screen inventory
│   ├── uiux/                          # UI/UX specifications
│   └── workflows/                     # Workflow-to-UI mapping
│
├── README.md                          # This file
└── CLAUDE.md                          # AI-assisted development guide
```

---

## Roadmap

### Current Phase — Production Hardening

- Full API integration across all modules (all services use BaseService with mock fallback)
- Error handling completeness: loading, empty, error, retry states everywhere
- Security hardening and audit
- Bundle optimization and code splitting

### v1.0 — Feature Complete

| Module | Status |
|--------|--------|
| Rescue Management | ✅ Complete |
| Worklist + Checklist Management | ✅ Complete |
| Training System | ✅ Complete |
| Attendance Tracking | ✅ Complete |
| Leave Management | ✅ Complete |
| Help Desk / Tickets | ✅ Complete |
| Employee Management | ✅ Complete |
| Department Management | ✅ Complete |
| Notifications (SSE/WebSocket) | 🔄 Real-time subscription implemented |
| Multi-Language (EN/HI/Hinglish) | ✅ Complete |
| Dark Mode + High-Contrast | ✅ Complete |
| Offline Mutation Queue | ✅ Complete |
| Design System (22 components) | ✅ Complete |

### Next — Enhanced Intelligence

| Feature | Priority |
|---------|----------|
| AI Task Prioritization | High |
| AI Rescue Prediction (proactive alerts) | High |
| AI Performance Analysis | High |
| AI Workflow Recommendations | Medium |
| Advanced Analytics Dashboard | High |

### Future — Platform Expansion

| Feature | Priority |
|---------|----------|
| Mobile Apps (Android/iOS) | Medium |
| Push Notifications | Medium |
| Automated Escalation Rules | Medium |
| Biometric Attendance | Low |
| Payroll Integration | Medium |
| WhatsApp Integration | High |
| PWA (Service Worker + Manifest) | Planned (deps installed) |
| Industry-Specific Workflow Templates | Long-term |
| Marketplace for Extensions | Long-term |
| Multi-Factory / Multi-Location | Long-term |

---

## FAQ

### What is OptiFlow OS?

OptiFlow OS is a workflow, operations, and HRMS platform for Indian MSMEs. It replaces spreadsheets, WhatsApp-based coordination, and disconnected tools with a single execution platform featuring three role-based panels.

### Who is it for?

Manufacturing units, logistics companies, retail chains, warehouses, and service businesses with 10–500 employees. Any organization that needs structured task management, attendance tracking, leave management, training, and operational visibility.

### Can I self-host?

Yes. The frontend is a Vue 3 SPA that connects to a Frappe/Django backend. You can run both on your own infrastructure. See the [Quick Start](#quick-start) section to get started with the frontend.

### Is it open source?

This is a **proprietary** product. Source code access is governed by the license terms. We may open-source specific components in the future.

### How does Rescue work?

The Rescue system automatically detects tasks that are overdue, blocked, or at risk. It assigns a severity level (soft → warning → high_risk → admin_escalation) and surfaces them in the Captain's Rescue Queue with full context (task details, delay duration, assigned employee). Captains can send reminders, reassign tasks, or escalate to admin. Admin has final oversight.

### How do Worklists work?

Admins and Captains create structured checklists (daily, weekly, monthly) linked to SOP documents. These are assigned to Doers who execute them shift by shift. Each checklist item can include an SOP document link for reference. Completion is tracked in real-time.

### Can employees work offline?

Yes. The app queues mutations (task updates, attendance actions, etc.) in localStorage when offline. When connectivity returns, the queue auto-syncs. Mock data ensures the UI remains functional during network outages.

### What languages are supported?

English (EN), Hindi (हिन्दी), and Hinglish. Language can be switched per user from the profile or auth page.

---

## Contributing

We welcome contributions. Please see our guidelines:

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

### PR Checklist

Before submitting a pull request:

- [ ] `vue-tsc --noEmit` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (ESLint)
- [ ] `npm test` passes (unit tests)
- [ ] All states implemented: loading, empty, error, retry
- [ ] Mobile responsive (test at 375px, 768px, 1280px)
- [ ] Follows `Opt*` design system conventions
- [ ] No console errors or warnings

### Development Workflow

```bash
npx vue-tsc --noEmit   # Type check
npm run lint            # Lint
npm run format          # Format (Prettier)
npm test                # Test
```

---

## Security

- **Authentication:** JWT Bearer tokens stored in localStorage, restored on page refresh via profile API call
- **Session:** 30-minute idle timeout with 60-second warning modal; auto-logout on expiry
- **Authorization:** Role-based route guards + feature-level permissions (24 permissions across 3 roles)
- **CSRF:** Cookie-based CSRF token sent with all mutation requests
- **API:** Bearer token in `Authorization` header; 401 response triggers session clear + redirect
- **Error Handling:** Sentry integration for production; sensitive data is never logged
- **Audit Logging:** All admin actions logged for traceability

See [SECURITY.md](SECURITY.md) for full details.

---

## License

**Proprietary Software**

Copyright © OptiFlow Technologies. All rights reserved.

This software and its source code are confidential and proprietary. Unauthorized copying, distribution, or use is prohibited without prior written permission.

See [LICENSE](LICENSE) for full terms.

---

## Documentation Hub

| Resource | Description |
|----------|-------------|
| 📖 [Frontend Architecture](docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md) | Complete frontend architecture documentation |
| 🎨 [Component Library](docs/components/COMPONENT_LIBRARY.md) | Design system component catalog |
| 🎯 [Design System](docs/design-system/DESIGN_SYSTEM.md) | Design tokens, dark mode, typography |
| 🗺️ [Route Map](docs/routes/ROUTES_MAP.md) | All routes with guards and permissions |
| 📸 [Screen Inventory](docs/screens/SCREEN_INVENTORY.md) | Complete screen-by-screen inventory |
| ✨ [UI/UX Specification](docs/uiux/UI_UX_SPECIFICATION.md) | UI/UX guidelines and patterns |
| 🔄 [Workflow Mapping](docs/workflows/WORKFLOW_UI_MAPPING.md) | Business workflow to UI mapping |
| 📐 [Architecture Decisions](docs/adr/) | Architecture Decision Records |
| 🗺️ [Roadmap](ROADMAP.md) | Product roadmap and milestones |

---

<br>

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="#screenshots">📸 Screenshots</a>
      </td>
      <td align="center">
        <a href="#quick-start">🚀 Quick Start</a>
      </td>
      <td align="center">
        <a href="#system-architecture">🏗️ Architecture</a>
      </td>
      <td align="center">
        <a href="#roadmap">🗺️ Roadmap</a>
      </td>
      <td align="center">
        <a href="docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md">📖 Docs</a>
      </td>
      <td align="center">
        <a href="https://github.com/your-org/optiflow-os/issues">🐛 Issues</a>
      </td>
    </tr>
  </table>

  <br>

  <sub>
    Built with Vue 3, TypeScript, and Tailwind CSS &nbsp;·&nbsp;
    Copyright &copy; OptiFlow Technologies &nbsp;·&nbsp;
    <a href="mailto:support@optiflowos.com">support@optiflowos.com</a>
  </sub>
</div>
