import { api as request } from '@/lib/api';
export { ApiError, UserFacingError, displayError } from '@/lib/auth-errors';
type RecordData = Record<string, any>;
export function api<T = RecordData>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method,
    ...(body === undefined
      ? {}
      : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
}
