import { buildApp } from "../../src/app.js";
import type { Clock } from "../../src/lib/clock.js";

export function fixedClock(iso = "2026-01-01T00:00:00.000Z"): Clock {
  let tick = 0;
  return {
    now(): string {
      tick += 1;
      const base = new Date(iso).getTime();
      return new Date(base + tick * 1000).toISOString();
    },
  };
}

export function buildTestApp() {
  return buildApp({ logger: false, container: { clock: fixedClock() } });
}

export async function createItem(
  app: ReturnType<typeof buildTestApp>,
  name: string,
) {
  const response = await app.inject({
    method: "POST",
    url: "/items",
    payload: { name },
  });
  return response.json() as { id: string; name: string };
}

export async function createTask(
  app: ReturnType<typeof buildTestApp>,
  title: string,
) {
  const response = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title },
  });
  return response.json() as { id: string; title: string };
}
