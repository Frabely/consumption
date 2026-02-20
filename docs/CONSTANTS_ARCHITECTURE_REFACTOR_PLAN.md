# Constants Architecture Refactor Plan

## Context
The current `constants/` folder mixes several concerns:
- immutable constants,
- mutable runtime cache/state,
- domain models and DTO-like types,
- i18n data and i18n typing,
- general-purpose utility functions.

This increases coupling, weakens type safety, and raises regression risk in auth/home/building flows.

## Goals
- Separate immutable constants from mutable runtime state.
- Separate common models from API/transport DTOs.
- Introduce typed i18n access and reduce direct raw JSON usage.
- Reduce global mutable module state and race-condition risk.
- Keep behavior stable while refactoring incrementally.

## Non-Goals
- No large UI redesign.
- No API schema changes.
- No breaking route/store contract changes in one step.

## Target Structure

```text
constants/
  db/
    collectionKeys.ts
  ui/
    modalState.ts
    page.ts
  common/
    carNames.ts

common/
  models/
    car.ts
    user.ts
    house.ts
    field.ts
    dataSet.ts
  dto/
    downloadBuildingCsvDto.ts

i18n/
  de/
    common.json
    home.json
    building.json
    errors.json
  index.ts
  types.ts

reference-data/
  cache/
    referenceDataStore.ts
  services/
    referenceDataLoader.ts

hooks/
  ui/
    useWindowDimensions.ts

utils/
  date/
    formatDate.ts
```

## Decision Rules
- `constants/` only for immutable values.
- No `export let` in constants modules.
- No runtime cache in constants modules.
- Common models must not include index-signature fallbacks that hide typing errors.
- DTOs must be explicit and named with `Dto` suffix if transport-shaped.
- i18n keys must be typed.

## Step-by-Step Migration

### Phase 1: Foundation (Safe extraction)
1. Extract DB key constants from `constants/constantData.tsx` into `constants/db/collectionKeys.ts`.
2. Keep compatibility re-exports temporarily from old files.
3. Add smoke tests for imports (no behavior change).

### Phase 2: Runtime cache decoupling
1. Move mutable exports (`cars`, `houses`, `loadingStations`, `DEFAULT_CAR`) into `reference-data/cache/referenceDataStore.ts`.
2. Move loaders (`loadMainPageData`, `ensureCarsLoaded`, `loadHouses`) into `reference-data/services/referenceDataLoader.ts`.
3. Replace direct module-global mutation call sites with store/service API calls.
4. Remove mutable exports from `constants/constantData.tsx`.

### Phase 3: Type split (Models vs DTO)
1. Split `constants/types.tsx` into `common/models/*` and `common/dto/*`.
2. Remove broad index signatures in `YearMonth` and `Language`.
3. Keep temporary barrel exports to reduce migration noise.
4. Migrate imports feature-by-feature.

### Phase 4: i18n hardening
1. Move `constants/de.json` into `i18n/de/*` per domain.
2. Introduce typed translation object (`type Translations = typeof deCommon & ...`) and access helper.
3. Replace direct `import de from "@/i18n"` incrementally.
4. Add lint or tests for missing translation keys.

### Phase 5: Utility cleanup
1. Move `constants/globalFunctions.tsx` to `utils/date/formatDate.ts`.
2. Move `hooks/useWindowDimensions.ts` to `hooks/ui/useWindowDimensions.ts` (or `components/shared/hooks/useWindowDimensions.ts` if team standard prefers co-location under shared UI).
3. Move `Dimension` type from mixed constants types into `common/models/ui/dimension.ts` (or `types/ui/dimension.ts`) and update hook imports.
4. Remove `constants/hooks.tsx` if not required.
5. Replace remaining legacy imports.

### Phase 6: Deletion and consolidation
1. Delete deprecated compatibility exports.
2. Delete old mixed files once all imports are migrated.
3. Run full regression suite and coverage check.

## Proposed File Actions

### Create
- `constants/db/collectionKeys.ts`
- `reference-data/cache/referenceDataStore.ts`
- `reference-data/services/referenceDataLoader.ts`
- `hooks/ui/useWindowDimensions.ts`
- `common/models/*.ts`
- `common/dto/*.ts`
- `i18n/index.ts`, `i18n/types.ts`, `i18n/de/*.json`
- `utils/date/formatDate.ts`

### Deprecate then remove
- `constants/constantData.tsx`
- `constants/types.tsx`
- `constants/globalFunctions.tsx`
- `constants/hooks.tsx`

## Risks and Mitigations
- Risk: Hidden behavior changes in data loading.
  - Mitigation: Keep compatibility layer until migration complete; add integration tests around Home/Menu/AddData.
- Risk: Broken translation references.
  - Mitigation: typed key access + migration in small PRs.
- Risk: Import churn and merge conflicts.
  - Mitigation: phased rollout by concern, not broad rename in one PR.

## Acceptance Criteria
- No mutable runtime state exported from `constants/`.
- Common types and DTOs are split and imported from dedicated modules.
- i18n keys are typed and raw JSON direct imports are minimized.
- `npx tsc --noEmit`, lint, unit/integration/e2e pass.
- No regression in:
  - login/session restore,
  - car select + add/change data,
  - building core flows,
  - csv export flows.

## Suggested PR Sequence
1. PR1: DB constants extraction + compatibility exports.
2. PR2: reference-data cache/service extraction.
3. PR3: models/dto split.
4. PR4: i18n structure and typed access.
5. PR5: utility/hook cleanup + old file removal.

## Notes for PO and UX Perspective
- End-user behavior should remain stable during refactor.
- Prioritize zero regression on login, add-data, and building management.
- Keep error/loading/empty states unchanged unless explicitly improved in scoped PRs.

