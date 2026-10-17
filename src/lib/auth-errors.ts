import messages from '@/features/bukcz-auth/error-messages.json';
export type RecordData = Record<string, any>;
export type Page<T = RecordData> = { data: T[]; next_cursor: string | null };
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public requestId?: string,
  ) {
    super(message);
  }
}
export class UserFacingError extends Error {}
export function displayError(error: unknown): string {
  if (error instanceof UserFacingError || error instanceof ApiError)
    return (
      error.message +
      (error instanceof ApiError && error.requestId
        ? ` Support reference: ${error.requestId}.`
        : '')
    );
  return messages.INTERNAL_ERROR;
}
export function responseError(
  status: number,
  data: unknown,
  path: string,
  requestId: string | null,
) {
  const body = data && typeof data === 'object' ? (data as RecordData) : {};
  const supplied =
    typeof body.code === 'string' && Object.hasOwn(messages, body.code)
      ? (body.code as keyof typeof messages)
      : undefined;
  const fallback: keyof typeof messages =
    status >= 500
      ? 'SERVICE_UNAVAILABLE'
      : status === 429
        ? 'RATE_LIMITED'
        : status === 413
          ? 'FILE_TOO_LARGE'
          : status === 401
            ? path.includes('/login')
              ? 'SIGN_IN_FAILED'
              : 'SESSION_EXPIRED'
            : status === 403
              ? 'NOT_ALLOWED'
              : status === 404
                ? 'NOT_AVAILABLE'
                : status === 409
                  ? path === '/auth/register' || path === '/users/me'
                    ? 'ACCOUNT_CONFLICT'
                    : 'CONFLICT'
                  : 'INVALID_INPUT';
  const code =
    status >= 500 &&
    supplied !== 'REALTIME_UNAVAILABLE' &&
    supplied !== 'WATCH_UNAVAILABLE'
      ? fallback
      : (supplied ?? fallback);
  const reference = requestId ?? body.request_id;
  return new ApiError(
    status,
    messages[code],
    code,
    typeof reference === 'string' && /^[a-f0-9-]{36}$/i.test(reference)
      ? reference
      : undefined,
  );
}
