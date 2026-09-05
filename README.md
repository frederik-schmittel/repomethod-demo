# repomethod-demo

A small but real Fastify service that exists for one purpose: to be the
repository a coding agent works in while [RepoMethod](https://github.com/frederik-schmittel/repomethod)
drives the engineering method around it.

It is deliberately ordinary. An item and task store, in-memory storage, input
validation, structured errors, a real test suite, lint, typecheck, build, and
CI. Nothing here is novel. That is the point: it looks like a normal service,
so a change made through RepoMethod looks like normal work.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build
npm run lint
npm run typecheck
npm test
```

## API

| Method | Path              | Notes                                    |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/health`         | liveness                                 |
| GET    | `/items`          | returns every item, no pagination        |
| POST   | `/items`          | `{ name, description? }`                 |
| GET    | `/items/:itemId`  | single item                             |
| PATCH  | `/items/:itemId`  | partial update                          |
| DELETE | `/items/:itemId`  | 204                                     |
| GET    | `/tasks`          | paginated: `?page=&limit=`               |
| POST   | `/tasks`          | `{ title, status? }`                    |
| GET    | `/tasks/:taskId`  | single task                            |
| PATCH  | `/tasks/:taskId`  | partial update                         |
| DELETE | `/tasks/:taskId`  | 204                                    |

`GET /tasks` returns `{ items, pagination }` with
`pagination = { page, limit, total, totalPages, hasMore }` and rejects
invalid `page` or `limit` with `400`. `GET /items` returns `{ items }` with
no paging. That asymmetry is intentional: it is the seam a demo feature can
close, following the pattern `/tasks` already sets.

## Layout

```
src/
  app.ts             Fastify wiring, error handler, route registration
  index.ts           process entrypoint
  config.ts          env parsing
  container.ts       dependency wiring
  domain/            types and error classes
  lib/               id, clock, pagination helpers
  repositories/      in-memory stores
  routes/            health, items, tasks
  services/          validation and business rules
tests/               vitest suite, one file per surface
```

## License

MIT
