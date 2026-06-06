# OptiFlow OS — UI/UX Design Specification

**For:** UI/UX & Figma Design Team
**Source:** OptiFlow OS Product Requirements Document v2.0 (Frappe / ERPNext Edition)
**Product:** OptiFlow OS — Business Operating System for Indian MSMEs
**Phase covered:** Phase 1 — Core Platform
**Panels:** Doer · Captain · Admin
**Platform priority:** Responsive web application (primary) — must be fully usable and optimized on desktop, laptop, tablet, and mobile. Responsive-first design approach; PWA-capable.
**Tech context:** Vue 3 · HeadlessUI (primary) · Frappe UI (reference) · Tailwind CSS
**Document status:** Design-ready specification

---

## How to Use This Document

This specification translates the OptiFlow OS PRD into a complete, self-contained design brief.

### Structure

1. **Design Foundations** — the design system (color, type, spacing, components, global states, accessibility, localization)
2. **Global Navigation & App Shell** — header, sidebars, bottom nav, FAB, notifications, footer
3. **Authentication & Onboarding** — entry screens common to all users
4. **Doer Panel** — every screen for the field worker / employee
5. **Captain Panel** — every screen for the team leader
6. **Admin Panel** — every screen for the business owner / HR
7. **Cross-Cutting Workflows** — end-to-end flows that span panels
8. **Component Deep Specs** — reusable cards, tables, forms, modals
9. **State, Responsive & Accessibility Matrices**
10. **PRD Traceability Map**

---

## Part A — Design Foundations

### 1. Product & Audience Context

OptiFlow OS replaces informal WhatsApp/verbal work tracking for Indian MSME workforces. Design must assume:

- Low digital literacy for many Doers. Favor large tap targets, icons + text labels, minimal jargon.
- Responsive-first, web-primary — fully usable from 360px up to ≥1440px.
- Trilingual interface — English, Hindi, Hinglish — with "View Original" affordance.
- Three mindsets: Doer = "what do I do now"; Captain = "who is delayed, rescue it"; Admin = "is the business healthy?"

### 2. Visual Language & Color System

**Brand & Primary:**
- primary/600: #2563EB (Indigo/Blue 600) — Primary buttons, active nav, links
- primary/700: #1D4ED8 — Pressed/hover primary
- primary/100: #DBEAFE — Selected-row tint, info chips
- primary/50: #EFF6FF — Subtle section backgrounds

**Semantic / Status Colors:**
- success/600: #16A34A — Completed, present, on-track, approved
- success/50: #F0FDF4 — Success banners
- warning/500: #F59E0B — Due-soon, late entry, soft reminder
- warning/50: #FFFBEB — Warning banners
- danger/600: #DC2626 — Overdue, escalated, blocked, rejected
- danger/50: #FEF2F2 — Error banners
- info/600: #0891B2 — Informational, in-progress
- neutral/900–50: Gray ramp — Text, borders, surfaces, disabled

**Task State Color Mapping:**
- Pending: neutral/500 (gray)
- In Progress: info/600 (blue)
- Blocked: warning/500 (amber + lock icon)
- Escalated: danger/600 (red + up-arrow)
- Completed: success/600 (green + check)
- Reviewed: primary/600 (blue outline + double-check)

**Rescue Severity Mapping:**
- Soft reminder: warning/300 (light amber)
- Warning: warning/500 (amber)
- High-risk: danger/500 (red)
- Admin escalation: danger/700 (deep red)

Severity is reinforced with icon + text label, never color alone.

### 3. Typography

- Latin font: Inter. Devanagari font: Noto Sans Devanagari.
- Line-height for Hindi: 1.5–1.6.

| Style | Size/line-height | Weight | Usage |
|---|---|---|---|
| Display | 28/36 | 700 | Dashboard greeting, empty-state headlines |
| H1 | 24/32 | 700 | Page titles |
| H2 | 20/28 | 600 | Section headers |
| H3 | 16/24 | 600 | Card titles, form group labels |
| Body | 14/22 | 400 | Default text |
| Body-strong | 14/22 | 600 | Emphasis, values |
| Caption | 12/16 | 400 | Metadata, timestamps |
| Overline/Label | 11/16 (600, +0.5 tracking, uppercase) | Chip labels, table headers |
| Button | 14/20 | 600 | All buttons |

Minimum readable body size on mobile: 14px.

### 4. Spacing, Grid & Layout

- Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Mobile gutter: 16px. Desktop gutter: 24px.
- Content max-width (desktop): 1280px centered.
- Card radius: 12px. Input radius: 8px. Chip/pill radius: full (999px).
- Touch targets: ≥ 44×44px. Spacing between targets: ≥ 8px.

**Breakpoints:**
| Token | Range | Device class |
|---|---|---|
| xs | 360–479px | Small mobile |
| sm | 480–767px | Large mobile |
| md | 768–1023px | Tablet portrait |
| lg | 1024–1279px | Tablet landscape / small laptop |
| xl | 1280–1439px | Laptop / desktop |
| 2xl | ≥1440px | Large desktop / wide |

### 5. Iconography & Imagery

- Line icons, 24px default (20px in dense tables, 28px in bottom nav).
- Required icon set: home, tasks/checklist, delegation, rescue, attendance/clock, leave/calendar, training/cap, ticket/help, insights/chart, employees/people, settings/gear, audit/shield, bell/notification, plus/add (FAB), reminder/megaphone, escalate/up-arrow, reassign/swap, buddy/handshake, language/globe, filter, search, more (kebab), back/chevron, attachment/paperclip, check, lock, warning-triangle.
- Avatars: circular, initials fallback with deterministic color.

### 6. Global Component Inventory

**Atoms:** Button (primary/secondary/tertiary/ghost/danger), Icon Button, Input, Select/Dropdown, Multi-select, Date picker, Radio, Checkbox, Toggle/Switch, Chip/Badge, Avatar, Tag, Progress bar, Spinner/Skeleton, Tooltip, Link, Divider.

**Molecules:** Form field, Search bar, Filter bar, Segmented control / Tabs, Pagination, Card header, List row, Stat/KPI tile, Empty state, Toast/Snackbar, Banner/Alert, Notification item, Language switcher, Workspace switcher, Attachment uploader, Comment/activity item.

**Organisms:** App header, Left sidebar (desktop), Bottom nav (mobile), FAB + quick-add sheet, Modal/Dialog, Bottom sheet (mobile), Side drawer, Data table, Rescue card, Task card, Checklist item, Leave request card, Ticket card, Training card, Dashboard widget grid, Chart widgets, Stepper/workflow tracker, Approval action bar.

### 7. Global Interaction & State Patterns

**Loading:** Skeleton screens for lists/cards/tables. Inline spinners for button actions. Full-page loader only on initial app boot.

**Empty:** Every list needs: friendly illustration + headline + supporting text + primary CTA.

**Error:** Field-level: red text + icon. Form-level: banner at top. API/network: non-blocking toast + retry. Permission: 403 state. Not found: 404 with "Go home" CTA.

**Success:** Toast/snackbar (auto-dismiss 3–4s). Inline success banner for multi-step completions. Micro-animation (check morph) for task done.

**Offline/Optimistic:** Actions apply immediately in UI, queue if offline, reconcile on reconnect. Show "Saved offline — will sync" indicator.

**Confirmation/Destructive:** Confirmation dialog with explicit consequence text + non-default destructive button.

### 8. Accessibility Baseline

- Contrast: text ≥ 4.5:1, large text/UI ≥ 3:1.
- Status never conveyed by color alone (pair with icon + label).
- Touch targets ≥ 44px; visible focus ring.
- Keyboard: full tab order, skip-to-content link, Esc closes dialogs.
- Screen reader: semantic landmarks, labeled form fields, aria-live for toasts.
- Motion: respect reduced-motion.
- Language: correct lang attribute when switching EN/HI.

### 9. Localization & Multilingual

- Language switcher in header (globe icon) + Settings. Options: English · हिंदी · Hinglish.
- "View Original" on translated content.
- All components accommodate +35% text expansion.
- Dates: DD-MMM-YYYY. Numbers in Indian locale (lakh/crore).

---

## Part B — Global Navigation & App Shell

### 10. App Header (Top Navigation)

Present on all authenticated screens.

- **Mobile:** hamburger/back · screen title · right cluster (search icon, bell, avatar).
- **Desktop:** product logo "OptiFlow OS" · breadcrumb · spacer · right cluster (workspace switcher, language switcher, search, bell, avatar menu).
- Workspace Switcher: shows current panel with dropdown for multi-role users.
- Header is sticky on scroll.

### 11. Left Sidebar (Desktop / Tablet)

- Vertical nav list with icon + label, active highlight.
- Collapsible to 64px icon rail on tablet.
- Nav contents per panel:
  - **Doer:** Home · My Tasks · My Worklist · Attendance · Leave · Training · Help Tickets · Notifications
  - **Captain:** Dashboard · Rescue · Team · Worklists · Training & SOPs · Leave Approvals · Attendance · Tickets
  - **Admin:** Dashboard · Insights · Employees · Departments · Attendance · Leave · Control Center · Tickets · Training

### 12. Bottom Navigation (Mobile)

- 3–5 items with icon + short label.
- Doer: Home · Tasks · Attendance · Training · More
- Captain: Dashboard · Rescue · Team · Approvals · More
- Admin: Dashboard · Insights · Employees · Tickets · More

### 13. Quick Add FAB (Doer screens)

- Circular FAB, primary/600, "+" icon, bottom-right, 56px.
- Opens bottom sheet: New Delegation Task, Apply Leave, Raise Help Ticket, Check-in/out.

### 14. Notification Center

- Right drawer (desktop) / full-screen sheet (mobile).
- Tabs: All · Tasks · Rescue · Leave · Tickets · System.
- Items: icon, title, context, timestamp, unread dot; tap → deep-link.

---

## Part C — Authentication & Onboarding

### 16. Login Screen

- Logo + tagline + segmented control (Password | Mobile OTP).
- Password tab: Employee ID + Password + "Forgot password?".
- OTP tab: Mobile number + "Send OTP" → OTP entry screen.
- Language switcher at top-right.

States: loading (spinner), error banner, success (redirect to home).

### 17. OTP Verification

- Masked mobile number. 4–6 box OTP input (auto-advance). Resend timer. "Verify & Continue" button.

### 18. Forgot/Reset Password

- Step 1: Enter Employee ID or mobile → send reset code.
- Step 2: OTP verify.
- Step 3: Set new password (strength meter).

### 19. First-Time Profile Completion (Onboarding Wizard)

- 4-step wizard with progress indicator:
  1. Welcome + Employee ID
  2. Contact (mobile, email)
  3. Bank details (sensitive, encrypted)
  4. Documents upload (Aadhaar etc.)
- Skip allowed only where deferrable.

---

## Part D — Doer Panel

### 20. Doer Home

- Greeting + attendance strip (Check In/Out).
- KPI tiles: Due Today, Overdue, In Progress, Completed.
- Due checklist tasks (auto-generated, no postpone).
- Pending delegations + FMS items.
- Alerts/reminders.
- Buddy tasks section ("Covering for [name]").

States: skeleton loading, empty ("No tasks yet — your Captain will assign your worklist soon"), all-done celebratory, offline with pending-sync chips.

### 21. My Tasks (List)

- Segmented tabs: Delegation · Checklist · FMS (with counts).
- Filters: status, priority, date range, search.
- Sort: due date (default), priority, last activity.
- Task cards with quick actions.

### 22. Create/Edit Delegation Task (Form)

Fields: title, description, priority, due date (no past), follow-up date (current week only), assigned to (self), attachments.
Validations on blur + submit.

### 23. Task Detail

- Header: title, type badge, priority, status.
- Status stepper: Pending → In Progress → Blocked → Escalated → Completed → Reviewed.
- Meta: due date, assigned to, reminder count, rescue badge.
- Description + attachments + activity timeline + comment box.
- Sticky action bar (mobile): primary action + secondary actions.

### 24. My Worklist

- List of recurring responsibilities with frequency, KPI, SOP link, next due.

### 25. Attendance

- Today card: big Check In/Out + work mode toggle (WFO/WFH).
- History calendar with dots (present/late/absent/leave).
- Correction request form per record.

### 26. Leave (Apply & Track)

- Leave balance summary + "Apply for Leave" button.
- Form: leave type, date range, reason, buddy selector.
- My requests list with status chips.

### 27. Training

- Filter: All · Not Started · In Progress · Completed · Overdue.
- Training cards + viewer (video/PDF/guide).

### 28. Help Tickets

- "Raise a Ticket" button → form: category, subject, description, attachments.
- My tickets list with status + detail view + comment thread.

### 29. Doer Profile & Settings

- Profile header + editable contact + masked sensitive fields + language/notification settings.

---

## Part E — Captain Panel

### 30. Captain Dashboard

- Alert tiles: Rescue queue size, Critical delays, No-activity flags, Pending approvals, Open tickets.
- Rescue summary widget (by type) + Team activity overview.
- Quick actions: Create Worklist, Assign Training, Review Approvals.

### 31. Rescue Queue

- Grouping tabs: Delegation Rescue · Checklist Rescue · FMS Rescue.
- Filter/sort: by employee, priority, delay days, severity.
- Rescue cards: employee, task title, delay days (prominent), priority, severity, action buttons (Remind, Reassign, Escalate, Resolve).
- One-click reminder with auto-escalation (soft → warning → high-risk → admin).
- Bulk actions (desktop): select multiple → batch actions.

### 32. Rescue Detail

- Full task info + delay timeline + escalation ladder + activity log + action bar.

### 33. Team Roster & Member Detail

- Team list/table + member detail with tasks, rescue history, attendance, leave, training progress.

### 34. Worklists (Create & Manage)

- List + create/edit form: title, description, KPI, frequency, assigned to (employee/role), SOP link, estimated effort.
- Checklist Engine auto-generates instances on save.

### 35. Training & SOP Assignment

- Training library + assignment flow (select content → select members → deadline).
- Completion tracking matrix.

### 36. Leave Approvals

- Pending list + detail view (employee, leave type, dates, reason, buddy, task count, balance, coverage).
- Actions: Approve, Reject (with reason), Override buddy.

### 37. Attendance (Team View & Corrections)

- Team table + correction queue (approve/reject).

### 38. Tickets (Captain)

- Queue + detail with comment thread + actions (Comment, Change status, Escalate, Close).

---

## Part F — Admin Panel

### 39. Admin Dashboard

- KPI row: Active usage %, Open rescues, Task delay rate, Leave continuity %, Late rate, Open exceptions.
- Operational health chart + Pending approvals + Exception alerts + Department snapshot.

### 40. Insights — Overview

- Executive KPIs + trends + top delay departments + top performers.

### 41. Insights — Doer 360°

- Complete employee view: completion rate, on-time %, rescues, attendance, training, workload.

### 42. Insights — Captain Index

- Leaderboard with composite score + per-metric breakdown.

### 43. Insights — Department

- Department metrics + comparison charts + drill-down to employees.

### 44. Insights — Weekly Review

- Week selector + executive summary + top performers + delay departments + trends + exceptions.

### 45. Employee Management

- Employee table (search/filter/bulk actions) + create/edit form.
- Fields: name, Employee ID (auto), mobile, email, department, designation, captain, role(s), bank (sensitive), status.
- Disable with confirmation.

### 46. Department Management

- Department list + add/edit/delete with reassignment guard.

### 47. Control Center

- **47.1 Role & Permissions:** Permission matrix (DocType × role), field-level toggles.
- **47.2 System Settings:** Company info, office hours, leave policies, localization, integration configs.
- **47.3 Audit Logs:** Filterable log table of critical actions.
- **47.4 Exception Monitoring:** Dashboard of repeated escalations, failed notifications, buddy failures.

### 48–50. Attendance Corrections, Leave Management, Tickets & Training Oversight

- Company-wide views with approve/override actions.

---

## Part G — Cross-Cutting Workflows

### W1. Employee Onboarding

Admin creates employee → System assigns ID → Send credentials → Employee completes profile → Captain assigns Worklist + Training → Employee starts.

### W2. Daily Execution & Rescue

System notifies → Employee executes → System detects delay → Moves to Rescue → Captain acts → Escalation ladder → Resolve.

### W3. Leave & Buddy Transfer

Employee applies → Captain approves → System transfers tasks → Buddy covers → System auto-reverts on return.

---

## Part H — Component Deep Specs

### 51. Task Card (Doer)

Anatomy: type icon · title · priority chip · status chip · meta row (due date, last activity) · quick action (checkbox) · optional rescue badge · pending-sync chip.
States: default, overdue, completed, blocked, escalated, loading, syncing.

### 52. Rescue Card (Captain)

Anatomy: employee avatar+name · task title+type · delay days (large, red) · severity border · action cluster (Remind, Reassign, Escalate, Resolve).
States: default, sending reminder, escalated, resolved (animates out), selected, error.

### 53. Data Table

Features: sortable columns, filters, search, selection, sticky header, pagination, density toggle, export.
Responsive: card-stack on mobile, full table on desktop.

### 54. Form Patterns

- Visible label + required asterisk + input + helper + error.
- Single column mobile, two-column desktop.
- Validate on blur + submit.
- Person selectors: searchable, avatar + name + meta.
- Date pickers: enforce business rules visually.

### 55. Modals, Sheets & Drawers

- Modal (desktop): centered, max 560px, focus-trapped.
- Bottom sheet (mobile): slides up, drag-handle, dismissible.
- Side drawer (desktop): right-side for detail/filters.
- Confirmation dialog: concise, destructive button, Cancel default.

### 56. Charts & Widgets

- KPI tile: label, value, trend, sparkline.
- Bar/stacked bar, line/area, donut, gauge, heat/calendar.
- Accessible data-table alternative for each chart.

### 57. Status Trackers (Steppers)

- Task: Pending → In Progress → Blocked → Escalated → Completed → Reviewed
- Ticket: Open → In Review → Escalated → Resolved → Closed
- Rescue: Soft → Warning → High-risk → Admin escalation

---

## Part I — Consolidated Matrices

### Screen × State Matrix

Every screen needs: Loading · Empty · Error · Success · Offline · Permission-denied.

Priority empty state copy:
- Doer Home (no worklist): "No tasks yet — your Captain will assign your worklist soon."
- Doer Home (all done): "All caught up for today"
- Rescue queue: "No tasks need rescue right now"
- Admin employees: "No employees yet — add your first."
- Insights (new deployment): "Not enough data yet — check back after activity is logged."

### Responsive Behavior Summary

| Region | Mobile (375) | Tablet (768) | Desktop (1440) |
|---|---|---|---|
| Primary nav | Bottom nav | Icon-rail sidebar | Labeled sidebar |
| Header | Compact | Logo + search | Full + breadcrumb |
| Lists | Stacked cards | 2-col cards | List/table |
| Tables | Card-stack | Reduced columns | Full feature |
| Forms | Single column | Single/2-col | Modal/drawer, 2-col |
| Dashboards | Stacked tiles | 2-col grid | Multi-col grid |
| Filters | Bottom sheet | Inline + sheet | Inline bar |

### Accessibility Checklist

- Logical heading hierarchy & landmarks
- All interactive elements keyboard-reachable with visible focus
- Labels on every input (not placeholder-only)
- Color never sole status indicator
- Contrast ≥ 4.5:1
- Touch targets ≥ 44px, ≥ 8px apart
- Live regions for toasts, async updates
- Charts have text/data-table alternatives
- Dialogs/sheets focus-trapped, Esc-closable

---

## Appendix: PRD Traceability Map

| PRD Requirement | Covered In |
|---|---|
| AUTH-01 | Login, Employee form, Onboarding W1 |
| AUTH-02 | Login, OTP |
| AUTH-03 | Login, Profile form |
| AUTH-04 | Workspace Switcher (Header) |
| AUTH-05 | RBAC (Control Center) |
| TASK-01–07 | Doer screens 20–24, 28 |
| CAP-01–08 | Captain screens 30–38 |
| ADM-01–06 | Admin screens 39–50 |
| ATT-01–05 | Attendance/Leave screens 25–26 |
| TRN-01–03 | Training screens 27, 35 |
| TKT-01–03 | Ticket screens 28, 38, 50 |
| NFR (all) | Design foundations, accessibility, responsive matrix |
