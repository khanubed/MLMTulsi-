export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Invalid request', details?: unknown) {
    super(400, 'BAD_REQUEST', message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Action forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'State conflict or resource already exists') {
    super(409, 'CONFLICT', message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Business rule validation failed', details?: unknown) {
    super(422, 'UNPROCESSABLE_ENTITY', message, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(429, 'TOO_MANY_REQUESTS', message);
  }
}

export function formatErrorResponse(error: unknown, requestId?: string) {
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      },
    };
  }

  const err = error as any;
  console.error('[Unhandled Server Error]:', err);

  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err?.message || 'An unexpected internal error occurred. Please try again later.',
        details: process.env.NODE_ENV !== 'production' ? { stack: err?.stack, name: err?.name } : undefined,
        requestId,
      },
    },
  };
}
