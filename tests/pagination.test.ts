import { expect, test } from "vitest";
import { DomainError } from "../src/domain/errors.js";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  paginate,
  parsePagination,
} from "../src/lib/pagination.js";

test("parsePagination falls back to defaults", () => {
  expect(parsePagination({})).toEqual({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
  });
});

test("parsePagination reads numeric strings", () => {
  expect(parsePagination({ page: "2", limit: "5" })).toEqual({
    page: 2,
    limit: 5,
  });
});

test("parsePagination rejects a non-integer page", () => {
  expect(() => parsePagination({ page: "abc" })).toThrow(DomainError);
});

test("parsePagination rejects a limit above the maximum", () => {
  expect(() => parsePagination({ limit: "101" })).toThrow(/between 1 and 100/);
});

test("paginate slices and reports metadata", () => {
  const all = Array.from({ length: 7 }, (_, i) => i);
  const result = paginate(all, { page: 2, limit: 3 });
  expect(result.items).toEqual([3, 4, 5]);
  expect(result.pagination).toEqual({
    page: 2,
    limit: 3,
    total: 7,
    totalPages: 3,
    hasMore: true,
  });
});

test("paginate past the end returns an empty slice", () => {
  const result = paginate([1, 2, 3], { page: 9, limit: 10 });
  expect(result.items).toEqual([]);
  expect(result.pagination.hasMore).toBe(false);
});
