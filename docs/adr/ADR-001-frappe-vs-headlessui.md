# ADR-001: Frappe UI vs HeadlessUI Resolution

**Status:** Accepted
**Date:** 2026-06-04
**Context:** The PRD specifies Frappe UI as the component library, but the actual package.json uses @headlessui/vue and @heroicons/vue. Frappe UI is not installed.

**Decision:** Use @headlessui/vue + @heroicons/vue as the primary UI library. Frappe UI CSS overrides are removed.

**Rationale:**
1. @headlessui/vue is already installed and working — no migration cost
2. Frappe UI requires Python/Frappe backend integration for full benefit
3. Current frontend is Vue 3 standalone without Frappe backend
4. Tailwind CSS + HeadlessUI provides equivalent accessible components
5. Frappe UI can be adopted in a future phase when Frappe backend is integrated

**Consequences:**
- frappe-ui-override.css deleted (dead code)
- Architecture docs updated to reflect real tech stack
- Future Frappe backend integration may add Frappe UI at that time
