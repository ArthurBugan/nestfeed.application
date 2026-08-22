# Spec 002: <Feature Name>

> **Status:** NOT STARTED — define functional requirements below
> **Date:** <YYYY-MM-DD>
> **Author:** <who>

## Problem Statement

<Why does this exist? What user problem does it solve? Who is it for?>

## Proposed Solution

- <approach bullet>
- <approach bullet>

## Requirements

### Functional Requirements
- **FR1:** <the system must ...>
- **FR2:** <the system must ...>
- **FR3:** <the system must ...>

### Non-Functional Requirements
- **NFR1:** <performance / offline / security / accessibility ...>
- **NFR2:** <...>

## Design

### Data Model / Types
```ts
// src/types/... — or zod schema
interface ... {}
// or
const schema = z.object({ ... });
```

### Components / Screens
- Route: `src/app/<route>/.tsx` (expo-router)
- Components: `src/components/...`

### State & Data Flow
- Zustand store: `src/stores/...` (transient/Client state)
- React Query: `src/hooks/...` (server/cache state)
- API: `src/api/...` / `src/services/...`

## Acceptance Criteria
- [ ] FR1 verified
- [ ] FR2 verified
- [ ] FR3 verified
- [ ] NFR1 verified
- [ ] Tests pass

## Risks
- R1: <...>

## Open Questions
- Q1: <...>
