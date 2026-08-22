# Plan 001: <Feature Name>

> **Status:** NOT STARTED
> **Related spec:** `specs/001-template/spec.md`

## Architecture

<How will this be built? File locations under `src/`, which layers touch
(types / stores / hooks / api / services / components / app routes).>

### Proposed Files
| Layer | Path |
|---|---|
| Types | `src/types/...` |
| Store | `src/stores/...` |
| Hooks (Query) | `src/hooks/...` |
| API/Service | `src/api/...` or `src/services/...` |
| Component | `src/components/...` |
| Screen/Route | `src/app/...` |

### State & Data Flow
- Client state (Zustand): <what lives here, when reset>
- Server state (React Query): <queries/mutations, cache keys, invalidation>
- API contract: <endpoints / request-response shapes, validated with Zod>

## Testing Strategy
1. Unit: component / hook / util tests (`src/__tests__/...`)
2. Integration: store + Query + API flow
3. Edge cases: <loading, empty, error, offline states>
4. E2E (if applicable): maestro

## Dependencies
- <external services, existing stores, backend endpoints...>

## Timeline
- **Estimate:** <...>
- **Phase:** <MVP / follow-up...>
