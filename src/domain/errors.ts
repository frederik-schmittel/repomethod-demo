export type ErrorCode =
  | "not_found"
  | "validation_error"
  | "conflict";

export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: Readonly<Record<string, string>>;

  constructor(
    code: ErrorCode,
    statusCode: number,
    message: string,
    details: Record<string, string> = {},
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super("not_found", 404, `${resource} ${id} was not found`, { id });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details: Record<string, string> = {}) {
    super("validation_error", 422, message, details);
    this.name = "ValidationError";
  }
}

export function isDomainError(value: unknown): value is DomainError {
  return value instanceof DomainError;
}
