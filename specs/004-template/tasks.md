# Tasks 003: <Feature Name>

> **Implementation Checklist**
> **Status:** NOT STARTED — define functional requirements in `spec.md` first

## Phase 1: Types & Data
- [ ] **T1.1** Define types / Zod schemas (`src/types/...`)
- [ ] **T1.2** Define API contract + service/`src/services/...`
- [ ] **T1.3** Unit tests for types/schemas

## Phase 2: State & Data Fetching
- [ ] **T2.1** Zustand store slice (client/transient state) — `src/stores/...`
- [ ] **T2.2** React Query hook (server/cache state) — `src/hooks/...`
- [ ] **T2.3** Invalidation + error handling wired

## Phase 3: UI
- [ ] **T3.1** Presentational component(s) — `src/components/...`
- [ ] **T3.2** Screen/route wired (i18n, accessibility) — `src/app/...`
- [ ] **T3.3** Edge-case states (loading / empty / error)

## Phase 4: Testing & Polish
- [ ] **T4.1** Integration test: store + Query + API
- [ ] **T4.2** Component/hook tests (`src/__tests__/...`)
- [ ] **T4.3** i18n strings, a11y labels, Dynamic Size Text
- [ ] **T4.4** Lint + tests green

## Verification
- [ ] All Functional Requirements (FR1..FRn) met
- [ ] All Non-Functional Requirements (NFR1..NFRn) met
- [ ] No secrets / `.env.local` committed
