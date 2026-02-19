# Login Overhaul Manual QA Checklist

Date: 2026-02-19
Branch: `feature/login-overhaul`

## Scope

Manual verification checklist for auth startup, persistence, role-guarding, and runtime session behavior.

## Preconditions

- Build is up to date with branch head.
- Test users available:
  - Admin user (building access)
  - Non-admin user (no building access)
- Browser devtools available to toggle offline/online mode.

## Checklist

1. Fresh start without persisted session

- Steps:
  - Clear `localStorage`.
  - Reload app.
- Expected:
  - App shows login flow.
  - No boot flicker into protected content.
- Status: `pending`

2. Persisted session rehydration

- Steps:
  - Login successfully.
  - Reload browser tab.
- Expected:
  - User stays logged in.
  - Default car is restored.
- Status: `pending`

3. Browser restart session persistence

- Steps:
  - Login successfully.
  - Close browser fully.
  - Reopen app URL.
- Expected:
  - Session is restored when not expired.
- Status: `pending`

4. Expired session handling

- Steps:
  - Force persisted session `expiresAt` to past timestamp.
  - Reload app.
- Expected:
  - Session is cleared.
  - App lands on login/home unauthenticated state.
- Status: `pending`

5. Cross-tab logout sync

- Steps:
  - Open app in two tabs with authenticated session.
  - Trigger logout in tab A.
- Expected:
  - Tab B is also logged out.
  - No stale protected view remains.
- Status: `pending`

6. Building guard for non-admin

- Steps:
  - Login as non-admin.
  - Navigate to building page (directly or via UI state).
- Expected:
  - Guard redirects/falls back to home.
- Status: `pending`

7. Building guard for admin

- Steps:
  - Login as admin.
  - Navigate to building page.
- Expected:
  - Access allowed.
- Status: `pending`

8. Session validation fallback

- Steps:
  - Simulate backend unavailable during validation.
  - Keep app open after startup.
- Expected:
  - No hard logout on temporary validation-unavailable state.
  - App remains stable.
- Status: `pending`

9. Rollout-flag off behavior

- Steps:
  - Set `NEXT_PUBLIC_AUTH_SESSION_ROLLOUT_ENABLED=false`.
  - Start app and login.
- Expected:
  - Session persistence/rehydration is disabled.
  - Auth status remains runtime-only for current session.
- Status: `pending`

## Notes

- This checklist requires interactive browser execution and cannot be fully verified in CLI-only automation.
