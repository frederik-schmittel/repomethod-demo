import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp, createProject } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

test("creates and reads a project", async () => {
  const created = await app.inject({
    method: "POST",
    url: "/projects",
    payload: { name: "Website", description: "marketing site" },
  });
  expect(created.statusCode).toBe(201);
  const body = created.json();
  expect(body).toMatchObject({ name: "Website", description: "marketing site" });

  const fetched = await app.inject({
    method: "GET",
    url: `/projects/${body.id}`,
  });
  expect(fetched.statusCode).toBe(200);
  expect(fetched.json().id).toBe(body.id);
});

test("rejects a project without a name", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/projects",
    payload: { description: "no name" },
  });
  expect(response.statusCode).toBe(422);
  expect(response.json().error.code).toBe("validation_error");
});

test("GET /projects returns every project under an items key", async () => {
  await createProject(app, "One");
  await createProject(app, "Two");
  await createProject(app, "Three");

  const response = await app.inject({ method: "GET", url: "/projects" });
  expect(response.statusCode).toBe(200);
  const body = response.json();
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items).toHaveLength(3);
});

test("updates a project name", async () => {
  const project = await createProject(app, "Old name");
  const response = await app.inject({
    method: "PATCH",
    url: `/projects/${project.id}`,
    payload: { name: "New name" },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json().name).toBe("New name");
});

test("deletes a project", async () => {
  const project = await createProject(app, "Doomed");
  const del = await app.inject({
    method: "DELETE",
    url: `/projects/${project.id}`,
  });
  expect(del.statusCode).toBe(204);

  const fetched = await app.inject({
    method: "GET",
    url: `/projects/${project.id}`,
  });
  expect(fetched.statusCode).toBe(404);
});
