# OptiFlow OS

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/src/assets/branding/logo-dark.svg">
    <img src="frontend/src/assets/branding/logo.svg" alt="OptiFlow OS Logo" width="320" />
  </picture>
</p>

**Enterprise Workflow Operating System for Indian MSMEs**

AI-Powered Operations, HRMS, Task Management, Training & Business Execution Platform

---

## Table of Contents

- [Overview](#overview)
- [Vision](#vision)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [User Roles](#user-roles)
- [Authentication Flow](#authentication-flow)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [API Documentation](#api-documentation)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Error Handling](#error-handling)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

OptiFlow OS is a modern workflow, operations, and HRMS platform purpose-built for **Indian MSMEs** (Micro, Small & Medium Enterprises). It replaces spreadsheets, WhatsApp-based operations, manual follow-ups, and disconnected software with a single unified execution platform.

### The Problem

Most MSMEs struggle because:

- Tasks are not tracked
- Accountability is unclear
- SOPs are not followed
- Training is inconsistent
- Reporting is delayed
- Managers spend time following up instead of managing

### The Solution

OptiFlow OS solves these problems through structured workflows, real-time visibility, automation, and role-based accountability. It provides three integrated panels — **Doer** (frontline), **Captain** (manager), and **Admin** (owner) — each tailored to the needs of that role.

### Target Audience

- Manufacturing units
- Logistics and distribution companies
- Retail chains and warehouses
- Service businesses
- Any MSME with 10–500 employees

---

## Vision

To become the operating system for Indian MSMEs — the single platform where work is assigned, tracked, executed, reviewed, and improved.

### Mission

Replace fragmented tooling with an integrated execution platform that makes every employee accountable, every process visible, and every manager effective.

### Platform Goals

- **Zero tasks lost** — every assignment tracked from creation to completion
- **Real-time visibility** — managers know what's happening without asking
- **Automatic escalation** — problems surface before they become crises
- **Consistent execution** — SOPs and checklists ensure quality
- **Data-driven decisions** — insights replace gut feelings

---

## Features

### Authentication & Profile

| Feature | Description |
|---|---|
| Email/Mobile Login | Secure authentication with employee credentials |
| OTP Verification | Two-factor verification via OTP |
| Forgot / Reset Password | Self-service password recovery |
| Profile Wizard | First-time profile completion flow |
| Session Management | 30-minute idle timeout with warning |
| Role Switching | Multi-role users can switch between panels |
| Language Selection | English, Hindi, and Hinglish support |

### Doer Panel (Frontline Employee)

| Module | Description |
|---|---|
| **Dashboard** | Daily summary, pending tasks, attendance status, recent notifications |
| **My Tasks** | Task list with priority, status, due dates; filter by status/priority |
| **Create Task** | Raise tasks for self or request delegation |
| **Task Detail** | Full task view with description, comments, attachments, status actions |
| **My Worklist** | Daily/weekly/monthly checklist execution with SOP links |
| **Attendance** | Check-in/check-out with work mode (WFO/WFH), correction requests |
| **Leave Management** | Apply for leave, view balance, assign buddy, track status |
| **Training** | View assigned training modules, track progress, complete SOPs |
| **Help Tickets** | Raise support tickets, track resolution, add comments |
| **Notifications** | Real-time alerts for tasks, leave, tickets, training |
| **Profile** | View/edit personal details, theme/language preferences |

### Captain Panel (Team Leader / Manager)

| Module | Description |
|---|---|
| **Dashboard** | Team performance KPIs, rescue queue summary, pending approvals |
| **Rescue Queue** | Auto-generated alerts for delayed/blocked tasks with severity levels |
| **Rescue Detail** | Full context on at-risk tasks: send reminders, reassign, escalate |
| **Team Roster** | View team members, their workload, and performance |
| **Member Detail** | Individual employee view: tasks, attendance, training progress |
| **Worklist Management** | Assign and manage SOP checklists for team members |
| **Leave Approvals** | Approve or reject leave requests, manage buddy transfers |
| **Attendance Monitor** | Team-wide attendance view, late arrivals, correction requests |
| **Training Assignment** | Assign training modules to team members |
| **Tickets** | View and respond to team help tickets |

### Admin Panel (Business Owner / Administrator)

| Module | Description |
|---|---|
| **Dashboard** | Organization-wide KPIs, alerts, and summary |
| **Employee Management** | Full employee lifecycle: create, edit, disable, offboard |
| **Employee Detail** | Complete employee profile with performance data |
| **Department Management** | Create and manage departments, assign heads |
| **Leave Management** | Organization-wide leave calendar, approvals, reports |
| **Tickets** | All tickets with assignment, escalation, resolution |
| **Attendance** | Full attendance overview, corrections, reports |
| **Training** | Create and assign training content, track completion |
| **Insights Overview** | Organization-wide analytics and trends |
| **Doer 360°** | Individual employee performance view |
| **Captain Index** | Team leader effectiveness scoring |
| **Department Analytics** | Per-department metrics and comparisons |
| **Weekly Review** | Automated weekly performance summary |
| **Control Center** | System settings, role permissions, audit logs, exception monitor |
| **Notifications** | Broadcast notifications to employees |

### Rescue Management

A unique OptiFlow concept — **automated intervention triggers** when:

- Tasks become overdue
- Employees are blocked
- Deadlines are missed
- Performance drops below thresholds

Severity levels: `soft` → `warning` → `high_risk` → `admin_escalation`

Captains receive actionable alerts with context, enabling intervention before problems become critical.

### Notifications

- Real-time alerts via SSE/WebSocket
- Task, rescue, leave, ticket, training, and system notifications
- Unread count badge
- Mark read / mark all read
- Per-category notification preferences

### Offline Support

- Offline mutation queue with localStorage persistence
- Pending sync indicator
- Automatic sync when connectivity returns
- Graceful degradation with mock data fallback

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Auth   │  │   Doer   │  │ Captain  │  │  Admin   │  │    UI    │ │
│  │  Layout  │  │  Layout  │  │  Layout  │  │  Layout  │  │ Library  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘ │
│       │              │              │              │                    │
│  ┌────┴──────────────┴──────────────┴──────────────┴────────────────┐ │
│  │                    DefaultLayout.vue (Shell)                      │ │
│  │  ┌──────────┐ ┌──────────────────┐ ┌──────────┐ ┌─────────────┐ │ │
│  │  │ Sidebar  │ │  <router-view/>  │ │BottomNav │ │ Notification│ │ │
│  │  │(desktop) │ │   (page content) │ │ (mobile) │ │ Center      │ │ │
│  │  └──────────┘ └──────────────────┘ └──────────┘ └─────────────┘ │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pinia   │  │  Vue     │  │  Axios   │  │  Vue     │  │  i18n    │ │
│  │  Stores  │  │  Router  │  │  Client  │  │  i18n    │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / JSON API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Frappe / Django)                       │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Auth   │  │  Task    │  │Rescue    │  │Attendance│  │  Leave   │ │
│  │  Service │  │  Service │  │ Service  │  │ Service  │  │ Service  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Employee │  │ Training │  │  Ticket  │  │Worklist  │  │Notifs    │ │
│  │ Service  │  │ Service  │  │  Service │  │ Service  │  │ Service  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                     Database Layer (PostgreSQL)                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

The frontend is a **Vue 3 Single Page Application** built with TypeScript, organized as:

- **Layouts** — shell components that provide consistent chrome (sidebar, header, nav)
- **Pages** — route-level components, one per view, lazy-loaded per role
- **Components** — reusable UI primitives (`Opt*` prefix) and domain components
- **Stores** — Pinia stores for state management with persistence
- **Services** — API service layer with caching, deduplication, retry, and mock fallback
- **Composables** — reusable Vue composition functions for cross-cutting concerns
- **Utils** — formatters, validators, permissions, logging, analytics, error tracking

### Backend Architecture

The backend is a **Frappe / Django** application exposing RESTful JSON API endpoints. The frontend communicates via Axios through a centralized API client with interceptors for auth tokens, CSRF, and retry logic.

### Data Flow

```
User Action
    │
    ▼
Vue Component (Page)
    │  calls store action
    ▼
Pinia Store
    │  calls service method
    ▼
Service (e.g., taskService)
    │  via BaseService: cache check → dedup → withRetry
    ▼
API Client (apiGet/apiPost/...)
    │  Axios instance: auth header + CSRF + timeout
    ▼
HTTP Request
    │  to Frappe/Django backend
    ▼
Backend API Handler
    │  processes request
    ▼
Database (PostgreSQL)
    │
    ▼
Response
    │  wraps in ApiResponse<T> { message, status, error? }
    ▼
API Client → unwrap response
    │
    ▼
Service → cache result
    │
    ▼
Store → update reactive state
    │
    ▼
Vue Reactivity → re-render UI
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Vue 3 | ^3.5.34 | UI Framework (Composition API) |
| TypeScript | ^6.0.3 | Type Safety |
| Vite | ^8.0.12 | Build Tool & Dev Server |
| Pinia | ^3.0.4 | State Management |
| Vue Router | ^4.6.4 | Client-Side Routing |
| Axios | ^1.7.9 | HTTP Client |
| Tailwind CSS | ^3.4.19 | Utility-First CSS |
| Headless UI | ^1.7.23 | Accessible UI Primitives |
| Heroicons | ^2.2.0 | SVG Icon Set |
| vue-i18n | ^11.4.4 | Internationalization |
| Sentry | ^10.56.0 | Error Tracking |
| web-vitals | ^5.3.0 | Web Vitals Monitoring |

### Backend (Planned / In Development)

| Technology | Purpose |
|---|---|
| Frappe / Django | Application Framework |
| PostgreSQL | Primary Database |
| Redis | Caching & Real-time |
| WebSocket / SSE | Real-time Notifications |

### Development & Quality

| Technology | Purpose |
|---|---|
| ESLint | Code Linting |
| Prettier | Code Formatting |
| vue-tsc | Type Checking |
| Vitest | Unit & Integration Tests |
| Playwright | E2E Testing |
| rollup-plugin-visualizer | Bundle Analysis |

### Infrastructure (Planned)

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-Service Orchestration |
| Nginx | Reverse Proxy |
| GitHub Actions | CI/CD |

---

## Folder Structure

```
optiflow-os/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance, interceptors, helpers
│   │   │   ├── endpoints.ts           # All API endpoint constants
│   │   │   ├── types.ts               # ApiResponse, PaginatedResponse
│   │   │   └── index.ts               # Re-exports
│   │   │
│   │   ├── assets/                    # Static assets (images, icons)
│   │   │
│   │   ├── components/
│   │   │   ├── common/                # Design system primitives
│   │   │   │   ├── OptButton.vue
│   │   │   │   ├── OptCard.vue
│   │   │   │   ├── OptInput.vue
│   │   │   │   ├── OptModal.vue
│   │   │   │   ├── OptTable.vue
│   │   │   │   ├── OptToast.vue
│   │   │   │   └── ... (28 total)
│   │   │   └── navigation/            # Navigation components
│   │   │       ├── AppHeader.vue
│   │   │       ├── AppSidebar.vue
│   │   │       ├── BottomNav.vue
│   │   │       ├── NotificationCenter.vue
│   │   │       └── ... (9 total)
│   │   │
│   │   ├── composables/               # Reusable composition functions
│   │   │   ├── useApi.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useSessionTimeout.ts
│   │   │   └── ... (10 total)
│   │   │
│   │   ├── layouts/
│   │   │   ├── DefaultLayout.vue      # Main shell (shared)
│   │   │   ├── AuthLayout.vue         # Auth pages layout
│   │   │   ├── DoerLayout.vue         # Doer panel wrapper
│   │   │   ├── CaptainLayout.vue      # Captain panel wrapper
│   │   │   └── AdminLayout.vue        # Admin panel wrapper
│   │   │
│   │   ├── locales/
│   │   │   ├── en.json                # English
│   │   │   ├── hi.json                # Hindi (हिन्दी)
│   │   │   └── hinglish.json          # Hinglish
│   │   │
│   │   ├── mock/                      # Mock data for development
│   │   │   ├── employees.ts
│   │   │   ├── tasks.ts
│   │   │   ├── attendance.ts
│   │   │   ├── leave.ts
│   │   │   ├── tickets.ts
│   │   │   ├── training.ts
│   │   │   ├── rescue.ts
│   │   │   └── ... (10 files)
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/                  # 5 pages
│   │   │   ├── doer/                  # 12 pages
│   │   │   ├── captain/               # 10 pages
│   │   │   └── admin/                 # 17 pages (4 sub-pages)
│   │   │
│   │   ├── plugins/
│   │   │   └── i18n.ts                # Vue i18n setup
│   │   │
│   │   ├── router/
│   │   │   └── index.ts              # Routes, guards, nav items
│   │   │
│   │   ├── services/                  # API service layer
│   │   │   ├── BaseService.ts         # Abstract base: cache, dedup, retry
│   │   │   ├── authService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── attendanceService.ts
│   │   │   ├── leaveService.ts
│   │   │   ├── ticketService.ts
│   │   │   ├── trainingService.ts
│   │   │   ├── rescueService.ts
│   │   │   ├── employeeService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── worklistService.ts
│   │   │   ├── realtimeService.ts     # SSE + WebSocket
│   │   │   └── config.ts             # Mock mode detection
│   │   │
│   │   ├── stores/                    # Pinia state management
│   │   │   ├── useStore.ts            # Root: auth, UI, theme, language
│   │   │   ├── taskStore.ts
│   │   │   ├── ticketStore.ts
│   │   │   ├── attendanceStore.ts
│   │   │   ├── rescueStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   ├── offlineStore.ts
│   │   │   ├── adminStore.ts
│   │   │   └── workflowStore.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── tailwind.css           # Tailwind entry + component classes
│   │   │   └── tokens.css             # Design tokens, dark mode, high-contrast
│   │   │
│   │   ├── types/
│   │   │   └── index.ts              # All TypeScript interfaces & types
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.ts          # Enums & constants
│   │   │   ├── formatters.ts         # Date/time formatters
│   │   │   ├── validators.ts         # Form validators
│   │   │   ├── permissions.ts        # Role-based access control
│   │   │   ├── logger.ts            # Structured logging
│   │   │   ├── analytics.ts         # Event tracking
│   │   │   ├── errorTracking.ts     # Sentry + fallback
│   │   │   ├── performance.ts       # Performance marks
│   │   │   └── webVitalsReporter.ts # CLS, FCP, LCP, TTFB, INP
│   │   │
│   │   ├── App.vue                   # Root component
│   │   └── main.ts                   # App bootstrap
│   │
│   ├── public/                       # Public static files
│   ├── index.html                    # HTML entry point
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.js            # Tailwind configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .env.example                  # Environment variable template
│   └── package.json                  # Dependencies & scripts
│
├── docs/                             # Documentation
│   ├── adr/                          # Architecture Decision Records
│   ├── components/                   # Component library docs
│   ├── design-system/                # Design token docs
│   ├── frontend/                     # Frontend architecture docs
│   ├── prd/                          # Product Requirements Document
│   ├── routes/                       # Route mapping
│   ├── screens/                      # Screen inventory
│   ├── uiux/                         # UI/UX specifications
│   └── workflows/                    # Workflow-to-UI mapping
│
├── README.md
└── CLAUDE.md                         # AI-assisted development guide
```

---

## User Roles

### Doer (Frontline Employee)

**Level:** 0

**Responsibilities:**
- Execute assigned tasks and worklist items
- Maintain daily attendance (check-in / check-out)
- Apply for leave with buddy assignment
- Complete assigned training modules
- Raise help tickets for issues
- Update task status and add comments

**Permissions:**

| Feature | Permission |
|---|---|
| Create Tasks | ✅ |
| View Own Tasks | ✅ |
| Apply for Leave | ✅ |
| View Own Attendance | ✅ |
| Raise Tickets | ✅ |
| View Training | ✅ |
| Assign Tasks | ❌ |
| Approve Leave | ❌ |
| View All Attendance | ❌ |
| Manage Employees | ❌ |

### Captain (Team Leader / Manager)

**Level:** 1

**Responsibilities:**
- Monitor team task execution and performance
- Manage rescue queue — intervene on delayed/blocked tasks
- Approve or reject leave requests
- Monitor team attendance
- Assign training to team members
- Manage team worklists
- View team tickets and respond

**Permissions:**

| Feature | Permission |
|---|---|
| Create Tasks | ✅ |
| Assign Tasks | ✅ |
| Review Tasks | ✅ |
| Approve/Reject Leave | ✅ |
| View All Attendance | ✅ |
| Assign Tickets | ✅ |
| Resolve Tickets | ✅ |
| View All Employees | ✅ |
| Assign Training | ✅ |
| Escalate Rescue | ✅ |
| Reassign Rescue | ✅ |
| View Insights | ✅ |
| Delete Tasks | ❌ |
| Manage Employees | ❌ |
| Manage Departments | ❌ |
| System Settings | ❌ |

### Admin (Business Owner / Administrator)

**Level:** 2

**Responsibilities:**
- Full employee lifecycle management
- Department creation and management
- Organization-wide analytics and insights
- System configuration and control center
- Broadcast notifications
- Audit log review

**Permissions:**

| Feature | Permission |
|---|---|
| All Doer Features | ✅ |
| All Captain Features | ✅ |
| Create/Edit/Delete Employees | ✅ |
| Manage Departments | ✅ |
| View All Insights | ✅ |
| Manage System Settings | ✅ |
| View Audit Logs | ✅ |
| Broadcast Notifications | ✅ |
| Escalate Leave | ✅ |
| Delete Tasks | ✅ |

---

## Authentication Flow

### Login Process

```
User enters credentials
        │
        ▼
    LoginView.vue
        │  calls authService.login()
        ▼
    authService
        │  POST /api/method/optiflow.api.auth.login
        ▼
    Backend validates credentials
        │
        ├── Success → Returns user data + token
        │              │
        │              ▼
        │          Store token (localStorage)
        │          Store user (Pinia + localStorage)
        │              │
        │              ▼
        │          Redirect to role home (/doer, /captain, /admin)
        │
        └── Failure → Show error toast
                        │
                        ▼
                    Prompt for OTP verification
```

### Session Validation

```
Router.beforeEach()
    │
    ├── Route requires auth?
    │      ├── Yes → User authenticated?
    │      │           ├── Yes → Role matches?
    │      │           │           ├── Yes → ✅ Proceed
    │      │           │           └── No  → 🔄 Redirect to role home
    │      │           └── No  → 🔄 Redirect to /login (preserve deep-link)
    │      └── No  → User authenticated?
    │                   ├── Yes → Is public auth path?
    │                   │           ├── Yes → 🔄 Redirect to role home
    │                   │           └── No  → ✅ Proceed
    │                   └── No  → ✅ Proceed
    │
    ▼
    Route loaded via dynamic import()
        │
        ├── Success → Render page component
        └── Failure → Lazy load fallback → Show error page
```

### Session Timeout

- **Idle timeout:** 30 minutes
- **Warning:** 60-second countdown modal before expiry
- **On expiry:** Clear auth state, redirect to `/login`
- **Reset:** Any user activity resets the timer

### Route Protection

- All routes behind auth gates use meta tags: `{ requiresAuth: true, role: 'doer' | 'captain' | 'admin' }`
- Role-specific route trees ensure users can only access their panel
- Lazy loading with chunk-load failure fallback prevents white screens

---

## State Management

OptiFlow uses **Pinia** with a modular store architecture.

### Store Overview

| Store | Domain | Persistence |
|---|---|---|
| `useStore` | Auth, UI state, theme, language, notification prefs | localStorage |
| `taskStore` | Delegation, checklist, FMS tasks | Session |
| `ticketStore` | Help tickets with comments | Session |
| `attendanceStore` | Check-in/out, logs, corrections | localStorage (session) |
| `rescueStore` | Rescue records | Session |
| `notificationStore` | Notifications, realtime subscription | Session |
| `offlineStore` | Offline mutation queue | localStorage |
| `adminStore` | Employee CRUD | Session |
| `workflowStore` | Onboarding, rescue, leave workflows | Session |

### State Architecture

```
┌─────────────────────────────────────────────┐
│              Pinia Store Pattern              │
│                                              │
│  Store                                         │
│  ├── State (ref/reactive)                     │
│  ├── Getters (computed)                       │
│  ├── Actions (async)                          │
│  │   ├── fetch* → service → update state      │
│  │   ├── create* → service → optimistic UI    │
│  │   └── update* → service → invalidate cache │
│  └── Hydration (localStorage on init)         │
└─────────────────────────────────────────────┘
```

### Caching Strategy

- **Service-level cache:** 30-second TTL for lists, 60-second for details
- **Deduplication:** In-flight request dedup prevents duplicate API calls
- **Invalidation:** Cache invalidated on mutations (create/update/delete)
- **Persistence:** Auth state and preferences persisted to localStorage

### Loading & Error States

Every store implements:

- `loading: boolean` — tracks async operation state
- `error: string | null` — captures error messages
- `pendingSync: boolean` — offline queue presence

---

## API Documentation

### Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:8000` |
| Production | `https://api.optiflowos.com` |

### Standard Response Format

```json
{
  "message": { ... },
  "status": "success" | "error",
  "error": "Error message if status is error"
}
```

### Authentication

All authenticated endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

CSRF protection via cookie-based token for Frappe/Django backend.

### Endpoints

#### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/method/optiflow.api.auth.login` | Login with credentials |
| POST | `/api/method/optiflow.api.auth.verify_otp` | Verify OTP |
| POST | `/api/method/optiflow.api.auth.forgot_password` | Request password reset |
| POST | `/api/method/optiflow.api.auth.reset_password` | Reset password |
| GET | `/api/method/optiflow.api.auth.profile` | Get user profile |

#### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.tasks.list` | List all tasks |
| GET | `/api/method/optiflow.api.tasks.detail/:id` | Get task detail |
| POST | `/api/method/optiflow.api.tasks.create` | Create new task |
| PUT | `/api/method/optiflow.api.tasks.update/:id` | Update task |

#### Rescue

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.rescue.list` | List rescue records |
| GET | `/api/method/optiflow.api.rescue.detail/:id` | Get rescue detail |
| POST | `/api/method/optiflow.api.rescue.remind/:id` | Send reminder |
| POST | `/api/method/optiflow.api.rescue.reassign/:id` | Reassign task |
| POST | `/api/method/optiflow.api.rescue.escalate/:id` | Escalate rescue |
| POST | `/api/method/optiflow.api.rescue.resolve/:id` | Resolve rescue |

#### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.attendance.log` | Get attendance logs |
| GET | `/api/method/optiflow.api.attendance.history` | Get attendance history |
| POST | `/api/method/optiflow.api.attendance.check_in` | Check in |
| POST | `/api/method/optiflow.api.attendance.check_out` | Check out |
| POST | `/api/method/optiflow.api.attendance.submit_correction` | Submit attendance correction |
| GET | `/api/method/optiflow.api.attendance.correction` | Get corrections |

#### Leave

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.leave.list` | List leave requests |
| POST | `/api/method/optiflow.api.leave.apply` | Apply for leave |
| POST | `/api/method/optiflow.api.leave.submit` | Submit leave with buddy |
| PUT | `/api/method/optiflow.api.leave.approve/:id` | Approve leave |
| PUT | `/api/method/optiflow.api.leave.reject/:id` | Reject leave |
| POST | `/api/method/optiflow.api.leave.:id/escalate` | Escalate leave |
| POST | `/api/method/optiflow.api.leave.:id/archive` | Archive leave |

#### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.employees.list` | List employees |
| GET | `/api/method/optiflow.api.employees.detail/:id` | Get employee detail |
| POST | `/api/method/optiflow.api.employees.create` | Create employee |
| PUT | `/api/method/optiflow.api.employees.update/:id` | Update employee |
| DELETE | `/api/method/optiflow.api.employees.delete/:id` | Delete employee |

#### Training

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.training.list` | List training assignments |
| POST | `/api/method/optiflow.api.training.assign` | Assign training |
| PUT | `/api/method/optiflow.api.training.progress/:id` | Update progress |
| GET | `/api/method/optiflow.api.training.content/:id` | Get training content |
| POST | `/api/method/optiflow.api.training.complete/:id` | Mark training complete |

#### Tickets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.tickets.list` | List tickets |
| GET | `/api/method/optiflow.api.tickets.detail/:id` | Get ticket detail |
| POST | `/api/method/optiflow.api.tickets.create` | Create ticket |
| PUT | `/api/method/optiflow.api.tickets.update/:id` | Update ticket |
| POST | `/api/method/optiflow.api.tickets.comment/:id` | Add comment |
| POST | `/api/method/optiflow.api.tickets.:id/close` | Close ticket |
| POST | `/api/method/optiflow.api.tickets.:id/reopen` | Reopen ticket |
| POST | `/api/method/optiflow.api.tickets.:id/assign` | Assign ticket |
| POST | `/api/method/optiflow.api.tickets.:id/escalate` | Escalate ticket |

#### Worklists

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.worklists.list` | List worklists |
| POST | `/api/method/optiflow.api.worklists.create` | Create worklist |
| PUT | `/api/method/optiflow.api.worklists.update/:id` | Update worklist |

#### Departments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.departments.list` | List departments |
| POST | `/api/method/optiflow.api.departments.create` | Create department |
| PUT | `/api/method/optiflow.api.departments.update/:id` | Update department |

#### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/method/optiflow.api.notifications.list` | List notifications |
| PUT | `/api/method/optiflow.api.notifications.read/:id` | Mark notification read |
| PUT | `/api/method/optiflow.api.notifications.read_all` | Mark all notifications read |

---

## Installation Guide

### Prerequisites

- **Node.js** 20 or higher
- **npm** 9+ or **pnpm** 8+
- **Git**
- (For backend) Frappe Bench / Python 3.10+

### Clone Repository

```bash
git clone https://github.com/your-org/optiflow-os.git
cd optiflow-os/frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env.development
```

Edit `.env.development` with your local settings (see [Environment Variables](#environment-variables)).

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output will be in `frontend/dist/`.

### Type Check

```bash
npx vue-tsc --noEmit
```

### Lint

```bash
npm run lint
```

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Preview Production Build

```bash
npm run preview
```

---

## Environment Variables

| Variable | Purpose | Required | Default | Dev | Prod |
|---|---|---|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:8000` | `http://localhost:8000` | `https://api.optiflowos.com` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | No | `15000` | `30000` | `15000` |
| `VITE_ENABLE_MOCK` | Enable mock data fallback | No | `true` | `true` | `false` |
| `VITE_OFFICE_START_TIME` | Office start time for late calculation | No | `09:00` | `09:00` | `09:00` |
| `VITE_DEFAULT_LANGUAGE` | Default UI language | No | `en` | `en` | `en` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check then build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Error Handling

### Layered Error Strategy

```
┌─────────────────────────────────────────────┐
│                 UI Layer                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Loading  │ │  Empty   │ │   Retry      │ │
│  │ Skeleton │ │  State   │ │   Button     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
├─────────────────────────────────────────────┤
│               Store Layer                     │
│  ┌─────────────────────────────────────────┐ │
│  │  loading ref  │  error ref  │  retry fn │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│             Service Layer                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐ │
│  │Cache │ │Dedup │ │Retry │ │Mock Fallbk │ │
│  └──────┘ └──────┘ └──────┘ └────────────┘ │
├─────────────────────────────────────────────┤
│            API Client Layer                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Auth     │ │ CSRF     │ │ 401 Redirect │ │
│  │ Intercep │ │ Intercep │ │  + Retry     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└─────────────────────────────────────────────┘
```

### Every Page Must Handle

- **Loading State** — Skeleton or spinner while data fetches
- **Error State** — Error message with retry option
- **Empty State** — Meaningful placeholder when no data exists
- **Retry State** — User-triggered retry on failure

### Global Error Tracking

- **Sentry** integration for production error capture
- **Fallback buffer** with dedup, throttle, and rate limiting
- **Chunk load failures** caught by router-level error handler
- **Network errors** trigger automatic retry (up to 2 attempts with exponential backoff)

### Service Retry Logic

- Transient errors (408, 429, 502, 503, 504): automatic retry up to 3 times
- Exponential backoff: 1s → 2s → 4s
- Network errors: fall back to mock data in development

---

## Security

### Authentication & Authorization

| Layer | Mechanism |
|---|---|
| Authentication | JWT Bearer token (localStorage) |
| CSRF Protection | Cookie-based CSRF token (Frappe/Django) |
| Route Guards | Role-based route restrictions |
| Feature Permissions | Fine-grained feature-level access control |
| Session Timeout | 30-minute idle timeout with warning |

### Role Hierarchy

```
admin (2) ─── Full system access
   │
captain (1) ─ Team management, approvals, monitoring
   │
  doer (0) ── Task execution, self-service
```

### Feature Permissions Matrix

```typescript
const featurePermissions = {
  'tasks.create':       ['doer', 'captain', 'admin'],
  'tasks.assign':       ['captain', 'admin'],
  'tasks.review':       ['captain', 'admin'],
  'tasks.delete':       ['admin'],
  'leave.approve':      ['captain', 'admin'],
  'leave.reject':       ['captain', 'admin'],
  'employees.create':   ['admin'],
  'employees.edit':     ['admin'],
  'employees.delete':   ['admin'],
  'system.settings':    ['admin'],
  'audit.logs':         ['admin'],
  // ... 24 total feature permissions
}
```

### Security Principles

- **Least privilege** — users only see what their role permits
- **Defense in depth** — route guards + store checks + API authorization
- **Secure communication** — HTTPS in production, CSRF protection
- **Session security** — tokens in Authorization header only, not in DOM
- **Audit logging** — all admin actions logged for traceability

---

## Performance

### Targets

| Metric | Target |
|---|---|
| Login | < 2 seconds |
| Dashboard Load | < 3 seconds |
| Route Transition | < 500ms |
| API Response | < 200ms (cached) |

### Optimization Techniques

| Technique | Implementation |
|---|---|
| Code Splitting | Per-route dynamic imports via `lazyLoad()` |
| Lazy Loading | All pages loaded on-demand, not upfront |
| API Caching | Service-level cache with 30-60s TTL |
| Request Deduplication | Prevents duplicate in-flight API calls |
| Bundle Analysis | `rollup-plugin-visualizer` for size tracking |
| PWA Support | `vite-plugin-pwa` for offline capability |
| Web Vitals | CLS, FCP, LCP, TTFB, INP monitoring |

### Web Vitals Monitoring

- **CLS** (Cumulative Layout Shift) — visual stability
- **FCP** (First Contentful Paint) — perceived load speed
- **LCP** (Largest Contentful Paint) — main content load
- **TTFB** (Time to First Byte) — server responsiveness
- **INP** (Interaction to Next Paint) — interactivity

---

## Testing

### Unit & Integration Tests

- **Framework:** Vitest
- **Environment:** jsdom
- **Utilities:** @vue/test-utils
- **Coverage:** @vitest/coverage-v8

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E Tests

- **Framework:** Playwright
- **Setup:** Configured via `@playwright/test`

```bash
npm run test:e2e
```

### Manual QA Checklist

- Loading states display correctly
- Error states show with retry options
- Empty states render meaningful messages
- All routes accessible per role
- Navigation guards work cross-role
- Form validation fires correctly
- Offline mode degrades gracefully
- Theme toggle (light/dark/high-contrast) works
- Language switching (en/hi/hinglish) works

---

## Deployment

### Development

```bash
cd frontend
npm install
cp .env.example .env.development
npm run dev           # http://localhost:5173
```

### Production Build

```bash
cd frontend
npm install
npm run build         # Outputs to frontend/dist/
```

### Deployment Options

#### Static Hosting (Vercel / Netlify / Cloudflare Pages)

```bash
npm run build
# Deploy the frontend/dist/ directory
# Configure SPA fallback: all routes → index.html
```

#### Docker (Planned)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration (SPA)

```nginx
server {
    listen 80;
    server_name app.optiflowos.com;

    root /var/www/optiflowos/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Rollback Strategy

1. Previous build version is preserved in deployment artifact
2. Quick rollback via pointing reverse proxy to previous build
3. Database rollback managed by backend migration tooling

---

## Monitoring

### Current

| Tool | Purpose |
|---|---|
| Sentry | Error tracking and crash reporting |
| Web Vitals | Frontend performance monitoring |
| Analytic Events | Page views, feature usage, error rates |
| Console Logger | Structured logging with levels |

### Planned

| Tool | Purpose |
|---|---|
| Grafana | Dashboard and metrics visualization |
| Prometheus | Metrics collection |
| Loki | Log aggregation |
| Uptime Robot | Service health monitoring |
| Health Checks | Periodic API endpoint verification |

---

## Roadmap

### Current Phase — Production Hardening

- Runtime stability improvements
- Full API integration across all modules
- Loading / error / empty state completeness
- Security hardening and audit
- Performance optimization

### Next Release — v1.0

| Feature | Status |
|---|---|
| Rescue Management | ✅ |
| Worklist Management | ✅ |
| Training System | ✅ |
| Attendance Tracking | ✅ |
| Leave Management | ✅ |
| Help Desk | ✅ |
| Employee Management | ✅ |
| Department Management | ✅ |
| Notifications | ✅ |
| Multi-language (EN/HI/Hinglish) | ✅ |
| Dark Mode | ✅ |
| High-Contrast Mode | ✅ |
| Offline Support | ✅ |
| PWA Support | ✅ |
| Real-time Notifications | 🔄 In Progress |

### Future

| Feature | Priority |
|---|---|
| AI Task Prioritization | High |
| AI Rescue Prediction | High |
| AI Performance Analysis | High |
| AI Workflow Recommendations | Medium |
| Advanced Analytics Dashboard | High |
| Mobile Apps (Android/iOS) | Medium |
| Push Notifications | Medium |
| Automated Escalation | Medium |
| Biometric Attendance | Low |
| Payroll Integration | Medium |
| WhatsApp Integration | High |

### Long-Term Vision

- Industry-specific workflow templates
- Marketplace for extensions and integrations
- API ecosystem for third-party connectors
- AI-driven business process automation
- Multi-factory / multi-location support
- Supply chain integration

---

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use the design system components (`Opt*` prefix)
- Implement all required states: loading, empty, error, retry
- Ensure TypeScript strict mode passes (`vue-tsc --noEmit`)
- Write meaningful tests for new functionality
- Update documentation when adding/changing features

### Code Quality

```bash
# Type check
npx vue-tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Test
npm test
```

### PR Checklist

- [ ] Types pass (`vue-tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] All states implemented (loading, empty, error, retry)
- [ ] Mobile responsive
- [ ] No console errors or warnings
- [ ] Follows design system conventions

---

## License

**Private Proprietary Software**

Copyright © OptiFlow Technologies

All Rights Reserved.

This software and its source code are confidential and proprietary. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without prior written permission from OptiFlow Technologies.

---

## Support

### Documentation

- [Frontend Architecture](docs/frontend/MASTER_FRONTEND_ARCHITECTURE.md)
- [Component Library](docs/components/COMPONENT_LIBRARY.md)
- [Design System](docs/design-system/DESIGN_SYSTEM.md)
- [Route Map](docs/routes/ROUTES_MAP.md)
- [Screen Inventory](docs/screens/SCREEN_INVENTORY.md)
- [UI/UX Specification](docs/uiux/UI_UX_SPECIFICATION.md)
- [Workflow Mapping](docs/workflows/WORKFLOW_UI_MAPPING.md)
- [Architecture Decisions](docs/adr/)

### Channels

| Channel | Contact |
|---|---|
| **Email** | support@optiflowos.com |
| **Issue Tracker** | GitHub Issues |
| **Help Desk** | Built-in ticketing system within the platform |

### Getting Help

- Check the built-in help tickets module
- Consult the documentation in the `docs/` directory
- Raise a ticket through the platform's Help Desk
- Contact support for critical issues

---

*Built with Vue 3, TypeScript, and ❤️ for Indian MSMEs.*
