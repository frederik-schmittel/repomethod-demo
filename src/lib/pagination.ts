import { ValidationError } from "../domain/errors.js";

export interface PageRequest {
  limit: number;
  offset: number;
}

export interface PageMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface Page<T> {
  items: T[];
  page: PageMeta;
}

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

function parseIntParam(
  raw: unknown,
  field: string,
  { min, max }: { min: number; max: number },
): number | undefined {
  if (raw === undefined || raw === "") {
    return undefined;
  }
  const value = typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer`, { [field]: String(raw) });
  }
  if (value < min || value > max) {
    throw new ValidationError(
      `${field} must be between ${min} and ${max}`,
      { [field]: String(raw) },
    );
  }
  return value;
}

export function parsePagination(query: Record<string, unknown>): PageRequest {
  const limit = parseIntParam(query.limit, "limit", { min: 1, max: MAX_LIMIT });
  const offset = parseIntParam(query.offset, "offset", {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
  });
  return {
    limit: limit ?? DEFAULT_LIMIT,
    offset: offset ?? 0,
  };
}

export function paginate<T>(all: readonly T[], request: PageRequest): Page<T> {
  const { limit, offset } = request;
  const slice = all.slice(offset, offset + limit);
  return {
    items: slice,
    page: {
      total: all.length,
      limit,
      offset,
      hasMore: offset + slice.length < all.length,
    },
  };
}
