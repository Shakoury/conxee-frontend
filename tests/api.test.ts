import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, onSessionExpired } from '../src/lib/api';
afterEach(() => vi.unstubAllGlobals());
describe('cookie-based API client', () => {
  it('refreshes and retries once after a 401, preserving request and cookies', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ user: { id: '1' } }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetch);
    await expect(
      api('/resources', {
        method: 'POST',
        body: JSON.stringify({ name: 'Notes' }),
      }),
    ).resolves.toEqual({ ok: true });
    expect(fetch.mock.calls.map((c) => c[0])).toEqual([
      '/api/resources',
      '/api/auth/refresh',
      '/api/resources',
    ]);
    for (const [, options] of fetch.mock.calls)
      expect(options.credentials).toBe('include');
    expect(fetch.mock.calls[2][1].body).toBe('{"name":"Notes"}');
  });
  it('shares concurrent refresh requests', async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/refresh')) {
          refreshCalls++;
          await new Promise((r) => setTimeout(r, 20));
          return Response.json({ user: { id: '1' } });
        }
        protectedCalls++;
        return protectedCalls <= 2
          ? new Response(null, { status: 401 })
          : Response.json({ ok: true });
      }),
    );
    await Promise.all([api('/a'), api('/b')]);
    expect(refreshCalls).toBe(1);
  });
  it('expires session when refresh fails without an infinite retry', async () => {
    const expired = vi.fn();
    const off = onSessionExpired(expired);
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    await expect(api('/resources')).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(expired).toHaveBeenCalled();
    off();
  });
  it('does not refresh rejected login credentials', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    await expect(api('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('supports empty logout responses and multipart without JSON headers', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    await expect(
      api('/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined();
    await api('/files', { method: 'POST', body: new FormData() });
    expect(fetch.mock.calls[1][1].headers.has('Content-Type')).toBe(false);
  });
});
