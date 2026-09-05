# repomethod-demo

A small but real Fastify service that exists for one purpose: to be the
repository a coding agent works in while [RepoMethod](https://github.com/frederik-schmittel/repomethod)
drives the engineering method around it.

It is deliberately ordinary. A project and task tracker, in-memory storage,
input validation, structured errors, pagination on one endpoint, a real test
suite, lint, typecheck, and CI. Nothing here is novel. That is the point: it
looks like a normal service, so a change made through RepoMethod looks like
normal work.

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

| Method | Path                                   | Notes                              |
| ------ | -------------------------------------- | ---------------------------------- |
| GET    | `/health`                             | liveness                           |
| GET    | `/projects`                           | returns every project (unpaged)    |
| POST   | `/projects`                           | `{ name, description? }`           |
| GET    | `/projects/:projectId`                | single project                    |
| PATCH  | `/projects/:projectId`                | partial update                    |
| DELETE | `/projects/:projectId`                | 204                               |
| GET    | `/projects/:projectId/tasks`          | paginated: `?limit=&offset=`       |
| POST   | `/projects/:projectId/tasks`          | `{ title, status? }`              |
| GET    | `/projects/:projectId/tasks/:taskId`  | single task                       |
| PATCH  | `/projects/:projectId/tasks/:taskId`  | partial update                    |
| DELETE | `/projects/:projectId/tasks/:taskId`  | 204                               |

`GET /projects/:projectId/tasks` returns `{ items, page }` with
`page = { total, limit, offset, hasMore }`. `GET /projects` returns
`{ items }` with no paging. That asymmetry is intentional: it is the seam a
demo feature can close.

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
  routes/            health, projects, tasks
  services/          validation and business rules
test/                vitest suite, one file per surface
```

## License

MIT
