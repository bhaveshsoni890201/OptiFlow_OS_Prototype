# ADR-002: API Layer Abstraction

**Status:** Accepted
**Date:** 2026-06-04
**Context:** All stores currently use `await new Promise(r => setTimeout(r, N))` to simulate API calls with mock data. No real HTTP client exists.

**Decision:** Create an API abstraction layer at `src/api/` with:
- Base client configuration (configurable base URL, auth headers)
- Endpoint constants
- Typed request/response helpers
- Retry and error handling middleware

**Rationale:**
1. Centralizes HTTP configuration in one place
2. Makes the transition from mock to real backend a config change, not a code rewrite
3. Provides consistent error handling and auth token management
4. Follows clean architecture separation of concerns

**Consequences:**
- All stores will be refactored to use the API layer
- Mock data files remain as fallback/test fixtures
- Environment variables control API base URL
