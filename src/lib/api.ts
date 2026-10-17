import { ApiError, responseError } from './auth-errors';
export { ApiError };
const base = '/api';
let refreshPromise: Promise<Response> | null = null;
const listeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function refreshSession() {
  if (!refreshPromise)
    refreshPromise = fetch(`${base}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      refreshPromise = null;
    });
  return refreshPromise.then((r) => r.clone());
}
export async function api<T = void>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  )
    headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal ?? AbortSignal.timeout(30000),
    });
  } catch {
    throw new ApiError(
      0,
      options.method && options.method !== 'GET'
        ? 'The request could not be confirmed. Check your connection before trying again.'
        : 'We could not connect. Check your connection and try again.',
      'NETWORK_ERROR',
    );
  }
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed.ok) return api<T>(path, options, false);
    listeners.forEach((fn) => fn());
  }
  if (response.status === 401 && !path.startsWith('/auth/'))
    listeners.forEach((fn) => fn());
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw responseError(
      response.status,
      data,
      path,
      response.headers.get('x-request-id'),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
