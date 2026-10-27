import { type NextRequest } from 'next/server';
import { type ZodSchema } from 'zod';
import { BadRequestError } from './errors';

export async function validateJsonBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError('Invalid JSON payload in request body');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestError('Validation error', result.error.flatten());
  }

  return result.data;
}

export function validateQueryParams<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const paramsObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    paramsObj[key] = val;
  });

  const result = schema.safeParse(paramsObj);
  if (!result.success) {
    throw new BadRequestError('Invalid query parameters', result.error.flatten());
  }

  return result.data;
}
