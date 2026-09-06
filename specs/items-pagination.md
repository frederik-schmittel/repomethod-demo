# Task: Paginate GET /items

## Context

`GET /tasks` is the repository reference for paginated list endpoints. `GET /items` currently returns the complete item list while the shared pagination helper already defines query parsing, defaults, validation, slicing, and response metadata.

## Objective

Make `GET /items` use the same pagination behavior and response shape as `GET /tasks` with the smallest route-level change.

## Definition of Ready

- `GET /tasks`, `src/lib/pagination.ts`, the item route, and relevant tests have been inspected.
- The shared pagination helper remains authoritative for defaults and validation.
- No persistence, service, dependency, architecture, or security change is required.
- Acceptance criteria are mapped to repository verification evidence.

## Architecture and Authority Boundaries

`ItemService.list()` remains the source of items. The HTTP route owns query parsing and pagination of that returned list using the existing shared helper, matching the task route boundary.

## Dependencies and Interfaces

Use the existing `parsePagination()` and `paginate()` functions from `src/lib/pagination.ts`. Do not add dependencies or change shared pagination semantics.

## Scope

- `src/routes/items.ts`
- `tests/items.test.ts`
- `specs/items-pagination.md`
- `.repomethod/workflows/items-pagination*`
- `.repomethod/evidence/items-pagination-verification.txt`
- `.repomethod/evidence/report.md`

## Out of Scope

- `README.md`
- `GET /tasks`
- shared pagination behavior
- item service or repository behavior
- persistence or domain model changes
- dependency changes

## Acceptance Criteria

1. `GET /items` accepts `page` and `limit`, returns the requested slice under `items`, and returns the same pagination metadata fields as `GET /tasks`.
2. `GET /items` uses the same default `page=1` and `limit=20` behavior as `GET /tasks` when query parameters are omitted.
3. Invalid item pagination query values are rejected with HTTP 400 according to the shared pagination validation used by `GET /tasks`.
4. Existing item create, read, update, and delete behavior remains passing.
5. Repository-defined lint, typecheck, test, and build verification passes with `README.md` unchanged.

## Acceptance Mapping

| Criterion | Evidence | Verification |
| --- | --- | --- |
| 1 | `.repomethod/evidence/items-pagination-verification.txt` | item route pagination tests |
| 2 | `.repomethod/evidence/items-pagination-verification.txt` | item route default pagination test |
| 3 | `.repomethod/evidence/items-pagination-verification.txt` | item route invalid pagination tests |
| 4 | `.repomethod/evidence/items-pagination-verification.txt` | existing item CRUD tests |
| 5 | `.repomethod/evidence/items-pagination-verification.txt` | repository verify command and RepoMethod agent gate |

## Work Packets

### items-pagination

- Goal: align `GET /items` with the existing task pagination contract.
- Files: `src/routes/items.ts`, `tests/items.test.ts`.
- Verification: targeted item tests, then repository-defined verification through RepoMethod.

## Verify Command

```bash
.repomethod/scripts/agent-gate.sh --spec specs/items-pagination.md
```

## Expected Evidence

- `.repomethod/evidence/items-pagination-verification.txt`
- `.repomethod/evidence/report.md`

## Escalation Conditions

- The existing task behavior cannot be reused without changing shared pagination semantics.
- The change requires a service, repository, domain, persistence, dependency, architecture, or security change.
