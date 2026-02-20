# Codex Review Guidelines

## Goal
Use Codex as a strict review layer before merge, focusing on:
- engineering correctness,
- UI/UX quality,
- product/user impact.

## Severity
- P0: Data corruption, security issue, hard crash, unrecoverable flow break.
- P1: High-risk behavior regression, wrong business result, major UX blocker.
- P2: Medium risk, edge-case break, maintainability issue with near-term impact.
- P3: Minor quality issue, readability, consistency, low-risk polish.

## Required Review Angles
- Engineering:
  - async/state race conditions
  - error handling and fallback behavior
  - correctness of domain logic
  - test coverage for changed logic paths
- UI/UX:
  - loading/empty/error states
  - disabled/focus/keyboard behavior
  - responsive behavior on mobile/tablet
  - visual consistency for primary actions and dialogs
- PO/User:
  - user-visible behavior change is explicit and intended
  - copy/labels understandable and consistent
  - rollback and support impact documented

## PR Workflow
1. Run local checks and tests.
2. Ask Codex for a review of changed files and risks.
3. Record findings by severity in the PR template (`P0`..`P3`).
4. For `P0`/`P1`: either mark `none` explicitly or list concrete findings and keep gate unchecked until fixed.
5. Resolve or justify findings.
6. Complete all items in "Codex Review Gate".

## Suggested Codex Prompt
Use a prompt similar to:

```text
Review this PR diff like a strict senior engineer and product-focused UI reviewer.
Prioritize bugs, regressions, race conditions, UX blockers, and missing tests.
Return findings by severity (P0-P3) with file and line references.
```
