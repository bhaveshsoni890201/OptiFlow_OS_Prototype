# OptiFlow OS Security Policy

**Version 1.0 — Effective upon adoption**

---

## Overview

OptiFlow OS is a workflow, operations, and HRMS platform that handles sensitive employee data including personal information, attendance records, leave history, bank details, and training records. This document outlines our security posture, vulnerability reporting process, and secure development practices.

---

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|----------------|
| 0.1.x (current) | Active Development | ✅ Critical & High |
| Future 1.0.x | Release Target | ✅ All severities |

---

## Vulnerability Reporting

### How to Report

| Channel | Contact | Encryption |
|---------|---------|------------|
| **Email** | security@optiflowos.com | [PGP Key](https://optiflowos.com/.well-known/pgp-key.txt) |
| **GitHub** | Private vulnerability report via GitHub Issues | N/A |
| **In-App** | Built-in Help Desk > "Security Report" category | N/A |

We accept reports from security researchers, ethical hackers, and the general public. We commit to:

1. **Acknowledging** receipt within 24 hours
2. **Validating** the report within 3 business days
3. **Triaging** based on severity within 5 business days
4. **Releasing** a fix per the timeline below
5. **Disclosing** after the fix is released

### Severity & Response Timeline

| Severity | Examples | Response SLA | Fix Target | Disclosure |
|----------|----------|-------------|------------|-----------|
| **Critical** | RCE, authentication bypass, mass data exposure | 24h acknowledgment | 7 days | 14 days after fix |
| **High** | SQL injection, privilege escalation, sensitive data leak | 24h acknowledgment | 14 days | 30 days after fix |
| **Medium** | XSS, CSRF, misconfiguration | 72h acknowledgment | 30 days | 60 days after fix |
| **Low** | Information disclosure, missing headers, fingerprinting | 5 days acknowledgment | 90 days | 90 days after fix |

### What to Include

- Product version (from `frontend/package.json` or sidebar)
- Environment (self-hosted / SaaS / development)
- Steps to reproduce with clear screenshots or video
- Impact assessment
- Proof-of-concept code (if applicable)
- Suggested fix (optional)

### Scope

**In scope:**
- OptiFlow OS frontend (Vue 3 application)
- Authentication and authorization mechanisms
- API client and service layer
- Data storage and handling
- Session management

**Out of scope:**
- Third-party dependencies (report to respective maintainers)
- Frappe/Django backend (in development — report separately)
- Physical security
- Social engineering
- Denial-of-service attacks (use responsibly)
- Issues requiring physical access or local privilege escalation already obtained

---

## Security Response Process

```
Report Received
      │
      ▼
  [24h] Acknowledgment sent to reporter
      │
      ▼
  [3 days] Validation & Reproduction
      │
      ├── Valid confirmed → Severity Assessment → CVE Assignment
      │
      └── Invalid/duplicate → Report closed with explanation
               │
               ▼
    [5 days] Triage & Priority Assignment
               │
               ▼
    Patch Development
               │
               ▼
    [Per severity] Internal Testing (QA + Security)
               │
               ▼
    Patch Release (npm version bump)
               │
               ▼
    [Per severity] Public Disclosure (GitHub Advisory)
```

---

## Authentication Security

### Current Implementation

| Mechanism | Implementation | Status |
|-----------|---------------|--------|
| **Primary Auth** | Employee ID + password → JWT token | ✅ Implemented |
| **Secondary Auth** | Mobile OTP (6-digit, mocked as `111111`) | ✅ Implemented |
| **Session Token** | JWT stored in `localStorage` as `auth_token` | ⚠️ Interim |
| **Session Restore** | `getProfile()` on app mount rehydrates from token | ✅ Implemented |
| **Idle Timeout** | 30 minutes with 60-second countdown warning | ✅ Implemented |
| **Password Reset** | Token-based forgot/reset flow (mock in dev) | ✅ Implemented |
| **Profile Wizard** | First-time setup after login | ✅ Implemented |

### Known Gap: localStorage Token Storage

The JWT is currently stored in `localStorage` (see `frontend/src/api/client.ts:37`). This is **susceptible to XSS** — any injected script can read the token.

**Planned migration path:**

```
Current:  localStorage → Bearer header
Target:   httpOnly cookie (set by backend) → automatic cookie-based auth
```

**Why this is acceptable for v0.1:**
- No persistent XSS vectors identified in the codebase
- Vue's template compiler provides built-in output encoding
- CSP headers will be added in the next release
- The code explicitly notes this in a comment (client.ts:31-34)

### Password Policy

Current (v0.1):

| Policy | Applied | Notes |
|--------|---------|-------|
| Minimum length | 8 characters | Client-side validation in Reset/Forgot views |
| Uppercase required | ✅ | Client-side |
| Lowercase required | ✅ | Client-side |
| Digit required | ✅ | Client-side |
| Special character | ✅ | Client-side |
| Password strength meter | ✅ | Visual indicator |
| Account lockout | ❌ | Planned for v1.0 |
| Rate limiting | ⚠️ Client-side only (2s cooldown in LoginView) | Server-side planned |

### Session Management

| Property | Value |
|----------|-------|
| Token type | JWT Bearer |
| Token storage | `localStorage` (interim) → httpOnly cookie (target) |
| Token transmission | `Authorization: Bearer <token>` header |
| Session restore | `getProfile()` API call on app mount |
| Idle timeout | 30 minutes |
| Warning period | 60 seconds before expiry |
| Logout action | Clears `localStorage` + redirects to `/login` |
| Backend invalidation | ❌ Not yet implemented (planned) |

---

## Authorization Security

### Role-Based Access Control (RBAC)

OptiFlow OS implements a three-tier RBAC model with hierarchical permissions:

```
admin (level 2) ─── Full system access
   │
captain (level 1) ─ Team management, approvals, monitoring
   │
  doer (level 0) ── Task execution, self-service
```

### Enforcement Layers

| Layer | Mechanism | File |
|-------|-----------|------|
| **Route Guards** | `beforeEach` checks `requiresAuth` + `role` meta | `router/index.ts:358-393` |
| **Feature Permissions** | 24 granular feature flags per role | `utils/permissions.ts:36-62` |
| **Nav Groups** | Role-specific sidebar navigation items | `AppSidebar.vue:90-180` |
| **API Layer** | Backend authorization (future — Frappe/Django) | Planned |

### Route Protection

```typescript
// Current guard logic (router/index.ts)
1. Route requires auth + not authenticated → redirect to /login
2. Authenticated on public auth page → redirect to role home
3. Role mismatch → redirect to user's role home
```

### Feature Permission Matrix

| Feature | Doer | Captain | Admin |
|---------|------|---------|-------|
| `tasks.create` | ✅ | ✅ | ✅ |
| `tasks.assign` | ❌ | ✅ | ✅ |
| `tasks.review` | ❌ | ✅ | ✅ |
| `tasks.delete` | ❌ | ❌ | ✅ |
| `leave.approve` | ❌ | ✅ | ✅ |
| `employees.create` | ❌ | ❌ | ✅ |
| `system.settings` | ❌ | ❌ | ✅ |
| Full list | — | — | 24 features total |

### Privilege Escalation Protections

- **Route guards prevent URL manipulation** — a Doer cannot navigate to `/admin` by typing the URL
- **Role mismatch redirect** — if authenticated but wrong role, redirect to home
- **Feature-level checks** — components use `canUseFeature()` before rendering admin actions
- **No client-side role elevation** — `currentRole` is derived from the auth response, not user-modifiable

---

## Data Protection

### Data Classification

| Category | Sensitivity | Examples | Protection |
|----------|-------------|----------|------------|
| **Authentication** | High | Password hashes, JWT tokens | Hashed server-side (backend), Bearer header |
| **PII** | High | Name, mobile, email, address | Transmitted over HTTPS, stored in DB |
| **Bank Details** | Critical | Account number, IFSC, bank name | Masked in UI (`XXXXXXXXXXXX1234`), encrypted at rest (target) |
| **Attendance** | Medium | Check-in/out times, location | HTTPS only |
| **Leave** | Medium | Dates, type, reason, buddy | HTTPS only |
| **Training** | Low | Module completion, progress | HTTPS only |
| **Tickets** | Low-Medium | Issue descriptions, comments | HTTPS only |

### Sensitive Data Handling

**Bank Details** (from `types/index.ts:38-43`):
```typescript
interface BankDetails {
  account_holder: string
  account_number: string  // Masked in UI
  ifsc: string
  bank_name: string
}
```

**Current controls:**
- Account numbers are masked in mock data (`XXXXXXXXXXXX1234`)
- No sensitive data is logged in Sentry (Sentry `beforeSend` sanitizes user context)
- Error tracking throttle prevents data flood
- No PII in error messages

**Gaps:**
- No encryption at rest for bank details (backend not yet implemented)
- No field-level access control (all roles can see own profile)
- No audit trail for sensitive data access

### LocalStorage Data

| Key | Content | Risk | Recommendation |
|-----|---------|------|---------------|
| `auth_token` | JWT | **High** — session hijack if XSS | Migrate to httpOnly cookie |
| `optiflow-auth` | User state + role | **Medium** — PII exposure | Encrypt or minimize stored data |
| `optiflow-notif-prefs` | Notification preferences | **Low** | Acceptable |
| `optiflow-theme` | Theme choice | **Low** | Acceptable |
| `optiflow-error-buffer` | Error events (sessionStorage) | **Low** | Acceptable |
| `optiflow-attendance` | Daily attendance state (sessionStorage) | **Low** | Acceptable |
| `optiflow-offline-queue` | Pending mutations | **Medium** — replay risk | Validate on server |

### Encryption

| State | Current | Target |
|-------|---------|--------|
| **In transit** | HTTPS (production), HTTP (development) | TLS 1.3 minimum |
| **At rest (DB)** | Backend responsibility (not yet implemented) | AES-256 for sensitive fields |
| **At rest (localStorage)** | Plaintext | Encrypt auth_token + employee PII |
| **Backup** | Backend responsibility | Encrypted backups |

---

## Privacy Principles

| Principle | Implementation |
|-----------|---------------|
| **Data Minimization** | Only required employee fields are collected; no Aadhaar/PAN in current schema |
| **Least Privilege** | Doers see only their own data; Captains see team data; Admins see all |
| **Need-to-Know** | Bank details visible to employee and admin only |
| **Auditability** | Admin actions logged in Control Center (AuditLogs.vue) |
| **Retention Controls** | Leave records auto-archived after 6 months |
| **Right to Access** | Employees can view their own data via Profile module |
| **Portability** | All data accessible via REST API for export |

---

## API Security

### Current Implementation

| Control | Status | Details |
|---------|--------|---------|
| **Authentication** | ✅ | Bearer JWT token in `Authorization` header |
| **CSRF Protection** | ✅ | Cookie-based CSRF token sent as `X-CSRFToken` header |
| **HTTPS** | ⚠️ | Development uses HTTP; production will enforce HTTPS |
| **Input Validation** | ⚠️ | Client-side validation only; server-side planned |
| **Output Encoding** | ✅ | Vue template compiler auto-escapes HTML |
| **Rate Limiting** | ⚠️ | Client-side cooldown (2s) + retry on 429; server-side planned |
| **Request Timeout** | ✅ | 15s default, configurable via `VITE_API_TIMEOUT` |

### API Client Configuration

```typescript
// from api/client.ts
const client = axios.create({
  baseURL: VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
```

### Endpoint Security

All endpoints follow the pattern: `/api/method/optiflow.api.{module}.{action}`

**Endpoint categories:**

| Category | Count | Auth Required | CSRF Required |
|----------|-------|--------------|---------------|
| Auth (login, OTP, forgot, reset) | 5 | ❌ (public) | ✅ |
| Profile | 1 | ✅ | ✅ |
| CRUD endpoints (tasks, leave, etc.) | 30+ | ✅ | ✅ |

### CSRF Protection Flow

1. Backend sets `csrftoken` cookie on first GET request
2. Frontend reads cookie via `getCookie('csrftoken')`
3. Frontend sends token as `X-CSRFToken` header on mutating requests
4. Backend validates header matches cookie

---

## Frontend Security

### XSS Prevention

| Mechanism | Status |
|-----------|--------|
| Vue template auto-escaping | ✅ Built-in (double-mustache `{{ }}` escapes HTML) |
| `v-html` usage | ⚠️ Used in training content viewer (`OptTrainingViewer.vue`) — content is backend-controlled |
| CSP header | ❌ Not yet configured (planned) |
| DOM-based XSS | ✅ No `document.write` or `eval` usage |
| Input sanitization | ⚠️ Relies on Vue; explicit sanitization for rich content planned |

### Storage Security

| Storage | Content | Risk |
|---------|---------|------|
| `localStorage` | JWT, user state, preferences | Medium (XSS vector) |
| `sessionStorage` | Error buffer, redirect path, attendance state | Low |
| `document.cookie` | CSRF token (set by backend) | Low (httpOnly flag depends on backend config) |

### Client-Side Secrets

- No API keys, database credentials, or encryption keys in client code
- `VITE_SENTRY_DSN` is public by design (Sentry requires client-side DSN)
- All other secrets are server-side (backend not yet built)

### Route Security

- All protected routes have `requiresAuth: true` meta tag
- Role-specific routes have `role: 'doer' | 'captain' | 'admin'`
- Route guard catches unauthenticated access, redirects to `/login`
- Route guard catches role mismatch, redirects to appropriate home
- Catch-all `/login` redirect prevents 404 on direct URL access
- Chunk load failures show error page instead of white screen

---

## Infrastructure Security

### Environment Variables

| Variable | Sensitivity | Source | Notes |
|----------|-------------|--------|-------|
| `VITE_API_BASE_URL` | Low | `.env` | Public-facing API URL |
| `VITE_API_TIMEOUT` | Low | `.env` | Request timeout |
| `VITE_ENABLE_MOCK` | Low | `.env` | Mock mode flag |
| `VITE_SENTRY_DSN` | Low | `.env` | Public DSN (client-side) |
| `VITE_APP_VERSION` | Low | `.env` | Display version |
| `VITE_LOG_LEVEL` | Low | `.env` | Logging verbosity |

**Rules:**
- No production secrets in `.env` files committed to git
- `.env.example` contains placeholder values only
- Production secrets injected via CI/CD or container orchestration

### Production Deployment Checklist

- [ ] HTTPS enforced (TLS 1.3)
- [ ] CSP headers configured
- [ ] HSTS header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] `VITE_ENABLE_MOCK=false`
- [ ] Sentry DSN configured for error tracking
- [ ] Rate limiting enabled on backend
- [ ] Database encryption at rest enabled
- [ ] Regular security scanning configured

### Logging & Monitoring

| Layer | Tool | Content | Sensitive Data |
|-------|------|---------|---------------|
| **Error Tracking** | Sentry | Error events, stack traces | ❌ Sanitized (URL stripped to origin+path, user set to `{id: 'sanitized'}`) |
| **Error Buffer** | sessionStorage | Last 50 errors | ❌ No PII in stored events |
| **Console Logger** | `utils/logger.ts` | Debug/info/warn/error | ✅ No secrets logged |
| **Audit Logs** | Control Center | Admin actions | ⚠️ Verify no PII in action descriptions |
| **Web Vitals** | `web-vitals` | Performance metrics | ✅ No PII |

### Error Tracking Security (Sentry)

From `utils/errorTracking.ts:136-147`:

```typescript
beforeSend(event) {
  // Strip URL query parameters
  if (event.request?.url) {
    const url = new URL(event.request.url)
    event.request.url = `${url.origin}${url.pathname}`
  }
  // Sanitize user info
  if (event.user) {
    event.user = { id: 'sanitized' }
  }
  return event
}
```

Controls in place:
- Deduplication (5s window)
- Throttle (max 10 identical errors per 30s window)
- Global rate limit (max 50 errors per 60s)
- Buffer size limit (50 entries)
- URL sanitization (removes query params)
- User anonymization (replaces with `{id: 'sanitized'}`)
- No PII in error messages

**Gap:** URL paths may contain employee IDs (e.g., `/doer/tasks/TASK-001`). This is logged but not scrubbed. Consider sanitizing path segments that match known patterns (employee IDs, task IDs).

---

## Dependency Security

### Package Management

| Tool | Version | Notes |
|------|---------|-------|
| npm | 9+ | Lockfile: `package-lock.json` |
| Vite | 8.x | Build tool with dependency pre-bundling |

### Dependency Audit (v0.1)

| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| Vue 3 | ^3.5.34 | UI Framework | Low (mature, actively maintained) |
| Axios | ^1.7.9 | HTTP Client | Low (mature) |
| Pinia | ^3.0.4 | State Management | Low |
| Vue Router | ^4.6.4 | Routing | Low |
| @sentry/vue | ^10.56.0 | Error Tracking | Low |
| Tailwind CSS | ^3.4.19 | Styling | Low (build-time only) |
| vite-plugin-pwa | ^1.3.0 | PWA | Low (not yet configured) |
| Playwright | ^1.52.0 | E2E Testing | Low (dev only) |
| ESLint | ^10.4.1 | Linting | Low (dev only) |

**No known critical vulnerabilities** in the dependency tree at time of writing.

### Supply Chain Security

| Control | Status |
|---------|--------|
| npm audit | ✅ Run as part of CI |
| Lockfile (`package-lock.json`) | ✅ Committed to git |
| Dependency pinning (caret ranges) | ⚠️ Uses `^` ranges; consider lockfile integrity |
| SRI (Subresource Integrity) | ❌ Not configured (no CDN-loaded scripts) |
| Dependabot / Renovate | ❌ Not configured (planned) |
| SBOM generation | ❌ Not configured (planned) |

---

## Secure Development Guidelines

### Code Review Requirements

All pull requests must pass:

- [ ] `vue-tsc --noEmit` — TypeScript type safety
- [ ] `npm run lint` — ESLint static analysis
- [ ] `npm test` — Vitest unit + integration tests
- [ ] Security review for any code handling PII, auth, or permissions

### Input Validation

```typescript
// All user inputs validated before sending to API
// Patterns used in the codebase:
- Employee ID: trimmed, normalized (hyphen-insensitive for matching)
- Mobile: 10-digit numeric regex
- OTP: 6-digit numeric
- Password: scored (length, uppercase, lowercase, digit, special)
- Email: standard email format (optional field)
```

### Output Encoding

- Vue templates auto-escape content in `{{ }}` expressions
- `v-html` is used only in training content viewer — ensure content source is trusted (backend-controlled)
- No direct DOM manipulation that bypasses Vue's template system

### Error Handling

- All API calls wrapped in try/catch
- Errors normalized via `ServiceError` class
- User-facing errors are descriptive but do not leak internals
- Stack traces logged server-side (Sentry), never exposed to users
- Loading / error / empty states required on every page

### Rate Limiting

| Layer | Current | Target |
|-------|---------|--------|
| **Client-side** | 2s cooldown between login attempts | Maintain |
| **Client-side** | Retry with exponential backoff (1s→2s→4s) for 4xx/5xx | Maintain |
| **Server-side** | ❌ Not implemented | Rate limit auth endpoints per IP |
| **Server-side** | ❌ Not implemented | API rate limiting per token |

---

## Responsible Disclosure

### Researcher Guidelines

If you discover a security vulnerability in OptiFlow OS:

1. **Do not** exploit the vulnerability beyond what's necessary to demonstrate it
2. **Do not** access, modify, or exfiltrate data beyond the proof-of-concept
3. **Do not** publicly disclose the vulnerability before we've had reasonable time to fix it
4. **Do** provide clear, reproducible steps
5. **Do** allow us time to respond before any disclosure (see [timeline](#severity--response-timeline))

### Safe Harbor

We will not pursue legal action against security researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, or service disruption
- Report vulnerabilities promptly through our [reporting channels](#how-to-report)
- Do not exploit vulnerabilities beyond what is necessary to demonstrate them
- Do not publicly disclose before our fix is released

We will:

- Acknowledge your report within 24 hours
- Work with you to validate and reproduce the issue
- Keep you informed throughout the remediation process
- Credit you in our security advisories (unless you prefer to remain anonymous)

### Recognition

We maintain a **Security Hall of Fame** for researchers who report valid vulnerabilities:

- **Critical/High**: Named acknowledgment in release notes + LinkedIn recommendation
- **Medium**: Named acknowledgment in release notes
- **Low**: Anonymous acknowledgment (if desired)

---

## Security Roadmap

### Phase 1: MVP Security (Current — v0.1)

- [x] JWT-based authentication
- [x] Role-based route guards
- [x] Feature-level permission checks
- [x] Session idle timeout (30 min with warning)
- [x] CSRF protection (cookie-based)
- [x] Error tracking with Sentry
- [x] Error deduplication and throttling
- [x] Audit logging for admin actions

### Phase 2: Production Security (v1.0)

- [ ] CSP headers (Content-Security-Policy)
- [ ] HSTS headers
- [ ] X-Content-Type-Options: nosniff
- [ ] Migrate auth token from localStorage to httpOnly cookie
- [ ] Server-side rate limiting (login, API)
- [ ] Server-side input validation
- [ ] Password policy enforcement (server-side)
- [ ] Account lockout after N failed login attempts
- [ ] Session invalidation on backend logout
- [ ] SECCOMP/seccomp for sandboxing
- [ ] Automated dependency scanning (Dependabot/Renovate)

### Phase 3: Enterprise Security (v1.x)

- [ ] Encryption at rest for sensitive fields (bank details, PII)
- [ ] Field-level access control
- [ ] Audit trail for all data access (not just admin actions)
- [ ] 2FA / TOTP support
- [ ] SSO / SAML / OIDC integration
- [ ] IP-based access restrictions
- [ ] Role-based API key management
- [ ] Read-only audit user role
- [ ] Data export / portability API
- [ ] Automated penetration testing
- [ ] Bug bounty program

### Phase 4: Compliance Readiness (v2.0)

| Standard | Scope | Timeline |
|----------|-------|----------|
| **SOC 2 Type I** | Security, availability, confidentiality | Post v1.0 |
| **SOC 2 Type II** | 6-month observation period | Post SOC 2 Type I |
| **ISO 27001** | ISMS certification | Post SOC 2 |
| **GDPR Readiness** | Data subject rights, DPA, breach notification | Pre v1.0 SaaS launch |
| **India DPDP Act** | Personal data protection compliance | Pre v1.0 SaaS launch |

---

## Security FAQ

### How do I report a vulnerability?

Email **security@optiflowos.com** with details. We'll acknowledge receipt within 24 hours. See [How to Report](#how-to-report) for full details.

### How fast are security fixes released?

Critical fixes within 7 days, high within 14 days, medium within 30 days, low within 90 days. See the [severity timeline](#severity--response-timeline).

### Is my data encrypted?

Data in transit is encrypted via HTTPS in production. Data at rest encryption is a backend responsibility and will be implemented before production launch.

### How are permissions managed?

OptiFlow uses role-based access control (RBAC) with 24 granular feature flags across three tiers (Doer, Captain, Admin). Access is enforced at the route level, component level, and planned for the API layer. See [Authorization Security](#authorization-security).

### Where is the auth token stored?

Currently in `localStorage` as a JWT. This is an interim approach — we plan to migrate to httpOnly cookies for production. A code comment in `api/client.ts:31-34` documents this known gap.

### Can I configure SSO or 2FA?

Not yet. SSO/SAML/OIDC and TOTP-based 2FA are on the [Phase 3 roadmap](#phase-3-enterprise-security-v1x).

### How do you handle failed login attempts?

Currently, there is a 2-second client-side cooldown between login attempts. Server-side rate limiting and account lockout after N failures are planned for v1.0.

### What happens to my data if the service is discontinued?

All data is accessible via the REST API for export. For self-hosted instances, your data remains on your infrastructure. See [Data Protection](#data-protection) for retention policies.

---

## Contact

| Channel | Contact |
|---------|---------|
| **Security** | security@optiflowos.com |
| **Privacy** | privacy@optiflowos.com |
| **PGP Key** | https://optiflowos.com/.well-known/pgp-key.txt |
| **GitHub** | GitHub Issues (private vulnerability report) |

---

*OptiFlow OS — Operating System for Indian MSMEs*

*Copyright © OptiFlow Technologies. All rights reserved.*
