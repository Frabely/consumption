# Login Auth Target State

This document defines the binding target behavior for the login/session overhaul.
It is the implementation artifact for roadmap step 1 and is the source of truth for steps 2+.

## Scope
- Keep users signed in across normal app restarts.
- Maintain predictable and safe logout/expiry behavior.
- Keep behavior deterministic for online and offline startup.

## Session Model (Target Behavior)
- Session is stored in `localStorage`.
- Session is validated at app startup.
- Session TTL is `90 days` with `rolling expiry`.
- On expiry, user is immediately logged out and must log in again.

## Startup Flow
1. Read session from `localStorage`.
2. Validate schema and required fields strictly.
3. If invalid: clear session, set auth state to `unauthenticated`.
4. If valid: hydrate store, set auth state to `authenticated`.
5. If online: run backend/Firebase validation.
6. If offline and a login/network request fails: do not log in, keep state `unauthenticated`, and show a clear "connection required" message.

## Security Rules
- Do not persist secrets/tokens beyond required session metadata.
- On manipulated/invalid session data: clear session immediately, logout, emit warning log.
- PIN/login errors are generic (no sensitive detail disclosure).

## Logout Rules
- Logout must remove all persisted session keys.
- Logout must reset auth-related Redux state.
- Logout must propagate across tabs using `storage` event synchronization.

## Authorization/Guards
- Protected routes/features use centralized guard decisions.
- If role is downgraded, access to `BuildingConsumption` is revoked immediately.

## Observability
- Emit events for:
- login success/failure
- rehydration success/failure
- session invalidation
- logout reason (manual, expiry, invalid session)

## Acceptance Criteria for Step 1
- Target behavior is documented and agreed.
- Rules for startup, expiry, logout, offline login handling, and guard behavior are explicit.
- Next implementation steps can reference this file without ambiguity.
