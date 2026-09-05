import { expect, test } from "vitest";
import { DomainError } from "../src/domain/errors.js";
import {
  DEFAULT_LIMIT,
  paginate,
  parsePagination,
} from "../src/lib/pagination.js";

test("parsePagination falls back to defaults", () => {
  expect(parsePagination({})).toEqual({ limit: DEFAULT_LIMIT, offset: 0 });
});

test("parsePagination reads numeric strings", () => {
  expect(parsePagination({ limit: "5", offset: "10" })).toEqual({
    limit: 5,
    offset: 10,
  });
});

test("parsePagination rejects a non-integer limit", () => {
  expect(() => parsePagination({ limit: "abc" })).toThrow(DomainError);
});

test("parsePagination rejects a limit above the maximum", () => {
  expect(() => parsePagination({ limit: "101" })).toThrow(/between 1 and 100/);
});

test("paginate slices and reports meta", () => {
  const all = Array.from({ length: 7 }, (_, i) => i);
  const page = paginate(all, { limit: 3, offset: 3 });
  expect(page.items).toEqual([3, 4, 5]);
  expect(page.page).toEqual({ total: 7, limit: 3, offset: 3, hasMore: true });
});

test("paginate past the end returns an empty slice", () => {
  const page = paginate([1, 2, 3], { limit: 10, offset: 50 });
  expect(page.items).toEqual([]);
  expect(page.page.hasMore).toBe(false);
});
