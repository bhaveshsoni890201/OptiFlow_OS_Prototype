# PRODUCT REQUIREMENTS DOCUMENT
# OptiFlow OS
## Business Operating System for Indian MSMEs
### Frappe & ERPNext Edition · Version 2.0

**Document Status:** Production-Ready

| Field | Value |
|---|---|
| Product | OptiFlow OS |
| Document Type | Product Requirement Document (PRD) |
| Phase | Phase 1 — Core Platform |
| Version | 2.0 (Frappe / ERPNext) |
| Target Market | Indian MSMEs |
| Panels Covered | Doer Panel · Captain Panel · Admin Panel |
| Technology Stack | Frappe Framework · ERPNext (optional) · Vue.js · Frappe UI · Tailwind CSS · PostgreSQL / MariaDB |
| Document Status | Production-Ready |

---

## Document Version History

### Revision Log

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 2.0 | 2026-06-02 | Product Team | Complete rewrite for the Frappe / ERPNext stack; added Vue.js frontend, PostgreSQL data layer, technical architecture diagrams, and updated module specifications. |

### Approvals

| Action | Name | Role / Title | Date |
|---|---|---|---|
| Prepared By | Product Team | Product Management | June 2026 |
| Reviewed By | — | Engineering Lead | — |
| Approved By | — | Product Owner | — |

---

## 1. Executive Summary

OptiFlow OS is an execution-focused Business Operating System built on the Frappe Framework and optionally leveraging ERPNext for standard ERP capabilities. It is designed specifically for Indian MSMEs to solve core operational challenges: delayed execution, lack of accountability, workforce continuity gaps, and unstructured task management.

The system provides three intuitive panels (Doer, Captain, Admin) on a mobile-first platform that requires minimal training. By using Frappe's low-code capabilities and ERPNext's proven modules, OptiFlow OS delivers rapid implementation, scalability, and a modern user experience through Vue.js and Frappe UI.

## 2. Product Vision

OptiFlow OS becomes the default execution system for Indian MSMEs, replacing informal WhatsApp- and verbal-based work tracking with a structured, accountable, and real-time operational platform. It empowers every employee to know what to do, ensures work never stops when someone is absent, and gives business owners complete visibility into operational health.

## 3. Business Objectives

| Objective | Success Metric |
|---|---|
| Reduce task delays by 50% within 3 months | Rescue queue size decrease week-over-week |
| Achieve 90%+ employee daily active usage | Platform daily active users / total employees |
| Zero operational disruption during employee absence | Leave continuity success rate ≥ 95% |
| Enable data-driven Captain performance management | Captain Operational Index adoption by all managers |
| Shorten implementation time to < 2 weeks | Use Frappe/ERPNext standard modules and customisation |

## 4. Product Scope

### In Scope (Phase 1)

| Area | Description |
|---|---|
| Core Platform | Doer, Captain, Admin panels on Frappe Framework |
| Identity & Access | Employee ID generation, role-based access, workspace switcher |
| Task Management | Delegation (one-time) tasks, Checklist (recurring) tasks, FMS (workflow) tasks |
| Worklist & Auto-Checklist | Captain-assigned worklists that auto-generate recurring checklists |
| Rescue Architecture | Automatic delay detection, rescue queue for Captains, carry-forward alerts |
| Attendance & Leave | Integrated with ERPNext HR or custom Frappe module |
| Buddy System | Temporary task transfer during leave, auto-revert |
| Training & SOPs | Assign and track training content linked to worklists |
| Help Tickets | Internal operational issue escalation |
| Insights & Analytics | Dashboards for employees, Captains, and Admins |
| Multi-language | English, Hindi, Hinglish with "View Original" |
| Frappe/ERPNext Integration | Use Frappe's REST API, background jobs, event hooks |

### Out of Scope (Phase 1)

- Real-time chat / messaging
- Social feed or activity wall
- Advanced workflow automation (beyond simple FMS)
- AI-based predictions (Phase 2)
- Geo-fencing or facial recognition attendance
- Multi-company / enterprise hierarchy

## 5. User Personas and Roles

| Persona | Role | Panel | Key Needs |
|---|---|---|---|
| Ramesh (Field Worker) | Doer | Doer Panel | Simple task list, mark done, log attendance, apply leave, Hindi interface |
| Priya (Team Leader) | Captain | Captain Panel | Monitor team delays, send reminders, reassign tasks, approve leave |
| Anjali (Business Owner) | Admin | Admin Panel | See overall operational health, drill down into departments, manage permissions |
| Raj (HR Manager) | Admin+Captain | Admin Panel | Manage employee master, leave policies, attendance corrections |

## 6. Functional Requirements

### 6.1 Identity & Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | System auto-generates unique Employee ID (e.g., EMP-0001) on account creation |
| AUTH-02 | Login via Employee ID+Password or Mobile OTP |
| AUTH-03 | Email address is optional |
| AUTH-04 | Workspace switcher in top navigation for multi-role users |
| AUTH-05 | Role-based access control (RBAC) using Frappe's built-in permission system |

### 6.2 Doer Panel – Task Execution

| ID | Requirement |
|---|---|
| TASK-01 | Employee can create a Delegation task with title, priority, due date, attachments |
| TASK-02 | Due date cannot be in the past; "Next follow-up date" limited to current working week |
| TASK-03 | Task states: Pending → In Progress → Blocked → Escalated → Completed → Reviewed |
| TASK-04 | Checklist tasks are auto-generated from assigned Worklist (daily/weekly/monthly) |
| TASK-05 | Checklist tasks cannot be postponed; marking done creates next instance |
| TASK-06 | FMS tasks appear when a workflow stage becomes due |
| TASK-07 | Global "Quick Add Task" floating button available on all Doer screens |

### 6.3 Captain Panel – Rescue & Coordination

| ID | Requirement |
|---|---|
| CAP-01 | Captain dashboard shows Rescue alerts, critical delays, no-activity flags |
| CAP-02 | Rescue module groups delayed tasks: Delegation Rescue, Checklist Rescue, FMS Rescue |
| CAP-03 | Each Rescue card displays employee, delay days, priority, last activity, reminder count |
| CAP-04 | One-click reminder engine sends contextual reminders (soft → warning → escalation) |
| CAP-05 | Captain can reassign tasks, escalate to Admin, or mark as resolved |
| CAP-06 | Captain creates Worklists for each employee/role; Checklist Engine auto-generates tasks |
| CAP-07 | Captain can assign training and SOPs to team members |
| CAP-08 | Captain approves or rejects leave requests; may override buddy selection |

### 6.4 Admin Panel – Governance & Insights

| ID | Requirement |
|---|---|
| ADM-01 | Admin sees company-wide operational health, pending approvals, exception alerts |
| ADM-02 | Insights tab provides Overview, Doer 360°, Captain Index, Department, Weekly Review |
| ADM-03 | Admin can create/edit/disable employees and Captains, manage departments |
| ADM-04 | Control Center for role permissions, system settings, audit logs, exception monitoring |
| ADM-05 | Attendance correction requests require Admin or Captain approval |
| ADM-06 | Language switcher (EN/HI/Hinglish) applies to all panels; "View Original" on translated content |

### 6.5 Attendance & Leave

| ID | Requirement |
|---|---|
| ATT-01 | Employee checks in/out manually (Phase 1) with work mode (WFO/WFH) |
| ATT-02 | Late entry detected based on office start time (configurable by Admin) |
| ATT-03 | Attendance correction request flow: employee submits → Captain/Admin approves → record updated |
| ATT-04 | Leave application requires leave type, dates, reason, and buddy selection |
| ATT-05 | On approval, Buddy Transfer Engine moves active tasks to buddy; auto-reverts on return |

### 6.6 Training & Help Tickets

| ID | Requirement |
|---|---|
| TRN-01 | Training content (SOPs, videos, guides) linked to Worklist items or assigned standalone |
| TRN-02 | Employee sees assigned training, marks progress (Not started / In Progress / Completed) |
| TRN-03 | Captain tracks training completion and overdue assignments |
| TKT-01 | Employee raises Help Ticket (category, subject, description, attachments) |
| TKT-02 | Ticket lifecycle: Open → In Review → Escalated → Resolved → Closed |
| TKT-03 | Captain and Admin can comment, escalate, or close tickets |

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Page load < 2 seconds on 3G; API response < 500ms for 90% requests |
| Scalability | Support up to 10,000 employees per site; horizontal scaling via Frappe bench |
| Availability | 99.5% uptime for core operations; planned maintenance window notified |
| Security | HTTPS, bcrypt password hashing, session timeout 8 hours, audit logs for critical actions |
| Mobile readiness | Responsive design down to 375px; touch targets ≥ 44px; bottom navigation on mobile |
| Offline tolerance | Optimistic UI + retry queue for failed API calls |
| Localization | English, Hindi, Hinglish; date/number formats Indian locale |
| Accessibility | Screen reader support for basic navigation; high contrast mode optional |

## 8. Module Specifications (Frappe DocTypes)

| DocType | Purpose | Key Fields |
|---|---|---|
| Employee Profile | Extends Frappe/ERPNext User | employee_id, department, designation, reporting_captain, mobile, bank_details |
| Delegation Task | One-time operational task | title, description, priority, due_date, assigned_to, status, escalation_level |
| Worklist | Recurring responsibility template | title, description, kpi, frequency, sop_link, estimated_effort, assigned_to |
| Checklist Instance | Recurring task instance | worklist_item, due_date, status, completed_on |
| Rescue Record | Delayed task entry | linked_task_doctype, linked_task_name, delay_days, reminder_count, resolved_on |
| Attendance Log | Daily check-in/out | employee, date, check_in, check_out, work_mode, late_minutes |
| Leave Request | Leave application | employee, leave_type, start_date, end_date, reason, buddy, status |
| Buddy Transfer | Temporary task ownership | original_owner, buddy_owner, leave_request, transfer_start, transfer_end, task_reference |
| Help Ticket | Operational issue | category, subject, description, raised_by, status, resolution_notes |
| Training Assignment | SOP/training link | employee, training_content, status, deadline, completed_on |
| Captain KPI Snapshot | Weekly performance | captain, week_start, rescue_reduction, recovery_speed, team_efficiency |

## 9. Workflow Diagrams

### 9.1 Employee Onboarding Workflow

```
[Admin] → Create Employee (Frappe User + Employee Profile)
→ System assigns Employee ID
→ Employee receives login credentials (via SMS/Email)
→ Employee completes profile (mobile, bank, documents)
→ [Captain] assigns Worklist(s) → Checklist Engine creates recurring Checklist tasks
→ [Captain] assigns Training/SOPs
→ Employee starts daily execution
```

### 9.2 Daily Execution & Rescue

```
[System] → Notify employee of due checklist tasks (Frappe scheduler)
[Employee] → Create delegation tasks from informal requests
[Employee] → Execute tasks, mark done / add comments
[System] → If due date passed and not completed → move to Rescue queue
[Captain] → See Rescue dashboard → Send one-click reminder / reassign / escalate
[System] → Reminder escalation: soft → warning → high-risk → Admin escalation
[Captain] → Resolve task → Rescue record closed
```

### 9.3 Leave & Buddy Transfer

```
[Employee] → Create Leave Request (select buddy)
[Captain] → Approve Leave
[System] → Create Buddy Transfer records for all active tasks of employee
[System] → Assign those tasks to buddy (update assigned_to in Delegation/Checklist)
[Buddy] → Receives notification; works on tasks
[System] → On leave end date, reverse transfers (reassign to original employee)
[Employee] → Resumes ownership
```

## 10. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web (Vue.js) │  │  Mobile PWA  │  │   Desktop    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
│ HTTPS / REST / WebSockets
┌───────────────────────────▼─────────────────────────────────┐
│                    Frappe Framework (Python)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │ Scheduler    │  │ Event Hooks  │      │
│  │  Server      │  │ Jobs         │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Custom OptiFlow Apps (DocTypes)             │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
│ SQLAlchemy ORM
┌───────────────────────────▼─────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL (primary) or MariaDB (fallback)           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|---|---|
| Frappe as core platform | Low-code development, built-in RBAC, background jobs, REST API, multi-tenant ready |
| Vue.js + Frappe UI + Tailwind | Frappe UI provides pre-built components; Tailwind for rapid custom styling; Vue for reactive frontend |
| PostgreSQL primary | Better performance for analytical queries, JSONB support |
| ERPNext optional | Use only if client needs accounting, inventory, or advanced HR |
| Background jobs | For checklist generation, reminder emails/WhatsApp, rescue detection |

## 11. Technology Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Backend | Frappe Framework | v15 (latest stable) |
| ERP (optional) | ERPNext | v15, integrated via Frappe |
| Frontend Framework | Vue.js | v3 |
| UI Component Library | Frappe UI / HeadlessUI | Vue-based |
| Styling | Tailwind CSS | v3 |
| Database (primary) | PostgreSQL | 14+ |
| Database (fallback) | MariaDB | 10.6+ |
| Web Server | NGINX + Gunicorn | Bench default |
| Background Jobs | Redis + Frappe RQ | |
| File Storage | Local filesystem or S3 | |
| Notifications | Frappe Email, WhatsApp Business API | |
| Version Control | Git + Frappe Bench | Multi-site support |

## 12. Database Architecture

Use Frappe's DocType abstraction which creates corresponding database tables. PostgreSQL preferred due to better JSONB support for activity logs and analytical performance. MariaDB fallback for legacy compatibility.

Key indexes: assigned_to, status, due_date, delay_days, employee_id.

Frappe automatically manages migrations; developers define DocTypes via doctype.json files.

## 13. Security Requirements

| Area | Requirement |
|---|---|
| Authentication | Frappe built-in: password hashed with bcrypt; OTP via SMS/Email; session timeout configurable |
| Authorization | Frappe Role-Based Permissions: Doer, Captain, Admin. Field-level permissions for sensitive data |
| API Security | All REST endpoints require valid API key + secret or session token; rate limiting applied |
| Data Encryption | TLS 1.2+ for all traffic; sensitive fields encrypted at rest |
| Audit Logs | All critical actions logged via frappe.get_doc hooks |
| CSRF Protection | Frappe generates CSRF tokens for all state-changing requests |
| SQL Injection | Frappe ORM prevents injection |
| File Uploads | Allowed types: images, PDF, DOCX |

## 14. Integration Requirements

| Integration | Purpose | Method |
|---|---|---|
| WhatsApp Business API | Send reminders, approvals, escalations | HTTP webhook from Frappe |
| Biometric Devices (optional) | Attendance check-in/out via hardware | Custom Frappe integration |
| SMS Gateway | OTP for employees without WhatsApp | Frappe SMS settings |
| Email (SMTP) | Notifications, reports | Frappe Email Queue |

## 15. Deployment Architecture

### Production Environment (Single-site)

```
Load Balancer (optional) → NGINX (SSL termination) → Gunicorn (Frappe) → Redis (cache/RQ) → PostgreSQL
```

### Deployment Options

| Option | Use Case |
|---|---|
| Frappe Cloud (managed) | Fastest go-to-market, automatic backups, scaling |
| Self-hosted on AWS/Azure | Full control, data residency requirements |
| On-premises | Large MSMEs with strict compliance |

### Environment Checklist

- Python 3.10+
- Node.js 18+ (for building Vue.js assets)
- Redis (v6+)
- PostgreSQL 14+ or MariaDB 10.6+
- Bench CLI installed
- NGINX with SSL certificate

## 16. Development Roadmap

### Phase 1 (12 weeks) – Core Platform on Frappe

| Week | Activities |
|---|---|
| 1–2 | Setup Frappe bench, create custom app optiflow_core. Define DocTypes. Basic UI (Vue.js + Frappe UI). |
| 3–4 | Implement Authentication, Workspace Switcher, Doer Panel (Tasks, Worklist, Home feed). |
| 5–6 | Implement Checklist Engine (scheduler), Rescue detection logic, Captain Rescue module. |
| 7–8 | Attendance, Leave, Buddy Transfer (custom DocTypes), approval workflows. |
| 9–10 | Admin Panel: Insights, Control Center permissions, Language system. |
| 11–12 | Notifications (email, WhatsApp), testing, documentation, deployment automation. |

### Phase 2 (8 weeks) – AI & Advanced Features

- Delay prediction using historical data (Python scripts inside Frappe)
- Workload balancing suggestions
- Enhanced reporting (Frappe Report Builder)
- ERPNext integration for Payroll/Accounting

## 17. Milestones

| Milestone | Deliverable | Due Date |
|---|---|---|
| M1: Environment & Core DocTypes | Frappe bench running, custom app created, Employee DocType | Week 2 |
| M2: Doer Panel MVP | Employees can log in, view tasks, mark done, create delegation tasks | Week 5 |
| M3: Captain Rescue Module | Captains see rescue queue, send reminders, reassign tasks | Week 7 |
| M4: Leave & Buddy System | Leave application, approval, task transfer, auto-revert | Week 9 |
| M5: Admin Insights & Control | Dashboards, reports, user management, audit logs | Week 11 |
| M6: Production Release | Fully tested, deployed on Frappe Cloud, user documentation | Week 12 |

## 18. Risks and Assumptions

### Risks

| Risk | Probability | Mitigation |
|---|---|---|
| Frappe/ERPNext learning curve for team | Medium | Provide Frappe School training; allocate 2 weeks spike |
| PostgreSQL compatibility with Frappe v15 | Low | Frappe supports PG; fallback to MariaDB |
| Mobile UI performance with heavy Vue.js | Medium | Lazy load components, test on low-end devices |
| WhatsApp API reliability | Medium | Implement retry with exponential backoff; fallback to SMS |
| Buddy transfer complexity with large task volumes | Low | Use background jobs (RQ); limit to active tasks |

### Assumptions

| Assumption | Validation |
|---|---|
| MSME employees have smartphones with modern browser | Market data confirms >85% |
| Clients accept Frappe Cloud or self-hosting | Offer both options |
| Captains have basic digital literacy | Provide simple video tutorials |
| Attendance can be manual in Phase 1 | Acceptable fallback; biometric integration later |

## 19. Acceptance Criteria

### Functional Acceptance

- A Doer can create a delegation task and see it in their task list.
- A delayed task (by 1 day) automatically appears in the Captain's Rescue queue.
- Captain sends a reminder via one click; employee receives WhatsApp/in-app notification.
- Employee applies for leave, selects buddy; Captain approves → buddy sees transferred tasks.
- On leave end date, tasks revert to original employee.
- Admin views the "Weekly Review" report with top performers and delay departments.

### Technical Acceptance

- All Frappe DocTypes have appropriate permissions.
- API response time for task listing < 500ms under 100 concurrent users.
- PostgreSQL migration works without data loss.
- Frontend passes Lighthouse mobile performance score > 70.
- No SQL injection vulnerabilities.

### User Acceptance

- 5 MSME pilot users complete all core workflows without assistance.
- User satisfaction rating ≥ 4.5/5 (post-training).

## 20. Future Roadmap (Phase 2+)

| Phase | Features |
|---|---|
| Phase 2 | AI delay prediction, workload balancing, enhanced accounting integration (ERPNext), geo-fencing attendance |
| Phase 3 | Real-time chat, custom workflow builder, mobile offline mode, multi-company support |
| Phase 4 | Marketplace for MSME-specific plugins (industry SOPs, compliance templates) |
