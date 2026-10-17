const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
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
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession();
    if (refreshed.ok) return api<T>(path, options, false);
    listeners.forEach((fn) => fn());
  }
  if (response.status === 401 && !path.startsWith('/auth/'))
    listeners.forEach((fn) => fn());
  if (!response.ok)
    throw new ApiError(response.status, `Request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
