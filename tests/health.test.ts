import { afterEach, beforeEach, expect, test } from "vitest";
import { buildTestApp } from "./helpers/buildTestApp.js";

let app: ReturnType<typeof buildTestApp>;

beforeEach(() => {
  app = buildTestApp();
});

afterEach(async () => {
  await app.close();
});

test("GET /health reports ok", async () => {
  const response = await app.inject({ method: "GET", url: "/health" });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({ status: "ok" });
});

test("unknown route returns a structured 404", async () => {
  const response = await app.inject({ method: "GET", url: "/nope" });
  expect(response.statusCode).toBe(404);
  expect(response.json().error.code).toBe("not_found");
});
