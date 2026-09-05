import { BadRequestError } from "../domain/errors.js";

export interface PageRequest {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface Page<T> {
  items: T[];
  pagination: PaginationMeta;
}

export const DEFAULT_PAGE = 1;
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
    throw new BadRequestError(`${field} must be an integer`, {
      [field]: String(raw),
    });
  }
  if (value < min || value > max) {
    throw new BadRequestError(`${field} must be between ${min} and ${max}`, {
      [field]: String(raw),
    });
  }
  return value;
}

export function parsePagination(query: Record<string, unknown>): PageRequest {
  const page = parseIntParam(query.page, "page", {
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
  });
  const limit = parseIntParam(query.limit, "limit", { min: 1, max: MAX_LIMIT });
  return {
    page: page ?? DEFAULT_PAGE,
    limit: limit ?? DEFAULT_LIMIT,
  };
}

export function paginate<T>(all: readonly T[], request: PageRequest): Page<T> {
  const { page, limit } = request;
  const offset = (page - 1) * limit;
  const slice = all.slice(offset, offset + limit);
  const total = all.length;
  return {
    items: slice,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: offset + slice.length < total,
    },
  };
}
