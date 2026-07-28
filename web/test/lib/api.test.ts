import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCookies = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) => (mockCookies.has(name) ? { value: mockCookies.get(name)! } : undefined),
      set: (name: string, value: string) => mockCookies.set(name, value),
      delete: (name: string) => mockCookies.delete(name),
    })
  ),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response;
}

describe('fetchWithAuth', () => {
  let fetchWithAuth: typeof import('@/lib/api').fetchWithAuth;

  beforeEach(async () => {
    mockCookies.clear();
    mockCookies.set('access_token', 'my-token');
    mockCookies.set('refresh_token', 'my-refresh');
    mockFetch.mockReset();
    vi.resetModules();
    const mod = await import('@/lib/api');
    fetchWithAuth = mod.fetchWithAuth;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injeta header Authorization Bearer', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await fetchWithAuth('http://api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('retorna JSON da resposta', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: 123 }));

    const res = await fetchWithAuth('http://api/test');
    const body = await res.json();

    expect(body).toEqual({ data: 123 });
  });

  it('em 401 faz refresh e retries', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'new-at', refreshToken: 'new-rt' }))
      .mockResolvedValueOnce(jsonResponse({ data: 'retry-ok' }));

    const res = await fetchWithAuth('http://api/test');
    const body = await res.json();

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(body).toEqual({ data: 'retry-ok' });
    expect(mockCookies.get('access_token')).toBe('new-at');
  });

  it('em 401 com refresh falho, não retry', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ error: 'unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: 'bad refresh' }, 401));

    await fetchWithAuth('http://api/test');

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('propaga erro de rede', async () => {
    mockFetch.mockRejectedValue(new Error('Network fail'));

    await expect(fetchWithAuth('http://api/test')).rejects.toThrow('Network fail');
  });
});
