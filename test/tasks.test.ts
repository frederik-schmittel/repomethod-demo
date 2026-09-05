import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp, createProject } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

async function seedTasks(projectId: string, count: number): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await app.inject({
      method: "POST",
      url: `/projects/${projectId}/tasks`,
      payload: { title: `Task ${i + 1}` },
    });
  }
}

test("creates a task with a default status of open", async () => {
  const project = await createProject(app, "App");
  const response = await app.inject({
    method: "POST",
    url: `/projects/${project.id}/tasks`,
    payload: { title: "Write docs" },
  });
  expect(response.statusCode).toBe(201);
  expect(response.json()).toMatchObject({ title: "Write docs", status: "open" });
});

test("rejects an unknown status", async () => {
  const project = await createProject(app, "App");
  const response = await app.inject({
    method: "POST",
    url: `/projects/${project.id}/tasks`,
    payload: { title: "Bad", status: "archived" },
  });
  expect(response.statusCode).toBe(422);
});

test("GET tasks is paginated with a page meta block", async () => {
  const project = await createProject(app, "App");
  await seedTasks(project.id, 25);

  const first = await app.inject({
    method: "GET",
    url: `/projects/${project.id}/tasks?limit=10`,
  });
  expect(first.statusCode).toBe(200);
  const firstBody = first.json();
  expect(firstBody.items).toHaveLength(10);
  expect(firstBody.page).toMatchObject({
    total: 25,
    limit: 10,
    offset: 0,
    hasMore: true,
  });

  const last = await app.inject({
    method: "GET",
    url: `/projects/${project.id}/tasks?limit=10&offset=20`,
  });
  expect(last.json().items).toHaveLength(5);
  expect(last.json().page.hasMore).toBe(false);
});

test("rejects an out-of-range limit", async () => {
  const project = await createProject(app, "App");
  const response = await app.inject({
    method: "GET",
    url: `/projects/${project.id}/tasks?limit=999`,
  });
  expect(response.statusCode).toBe(422);
});

test("task listing for an unknown project is a 404", async () => {
  const response = await app.inject({
    method: "GET",
    url: `/projects/prj_missing/tasks`,
  });
  expect(response.statusCode).toBe(404);
});
