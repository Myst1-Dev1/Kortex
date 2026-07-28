import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCookiesStore = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) =>
        mockCookiesStore.has(name) ? { value: mockCookiesStore.get(name)! } : undefined,
      set: (name: string, value: string) => mockCookiesStore.set(name, value),
      delete: (name: string) => mockCookiesStore.delete(name),
    })
  ),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function okJson(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) } as Response;
}

function errJson(message: string, status = 400) {
  return { ok: false, status, json: () => Promise.resolve({ message }) } as Response;
}

describe('signInAction', () => {
  let signInAction: typeof import('@/lib/actions/auth').signInAction;

  beforeEach(async () => {
    mockCookiesStore.clear();
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
    const mod = await import('@/lib/actions/auth');
    signInAction = mod.signInAction;
  });

  it('sucesso cria 3 cookies e retorna success', async () => {
    mockFetch.mockResolvedValue(
      okJson({
        user: { id: 'u1', name: 'Test' },
        accessToken: 'at',
        refreshToken: 'rt',
      })
    );

    const formData = new FormData();
    formData.set('email', 'a@b.com');
    formData.set('password', '123');

    const result = await signInAction({ success: false }, formData);

    expect(result.success).toBe(true);
    expect(mockCookiesStore.get('user')).toContain('u1');
    expect(mockCookiesStore.get('access_token')).toBe('at');
    expect(mockCookiesStore.get('refresh_token')).toBe('rt');
  });

  it('credenciais inválidas retorna erro sem cookies', async () => {
    mockFetch.mockResolvedValue(errJson('Email ou senha inválidos', 401));

    const formData = new FormData();
    formData.set('email', 'a@b.com');
    formData.set('password', 'wrong');

    const result = await signInAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockCookiesStore.has('access_token')).toBe(false);
  });

  it('API down retorna erro de conexão', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    const formData = new FormData();
    formData.set('email', 'a@b.com');
    formData.set('password', '123');

    const result = await signInAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao conectar com o servidor');
  });

  it('validação Zod falha sem chamar fetch', async () => {
    const formData = new FormData();
    formData.set('email', '');
    formData.set('password', '');

    const result = await signInAction({ success: false }, formData);

    expect(result.success).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('logoutAction', () => {
  it('limpa os 3 cookies', async () => {
    mockCookiesStore.set('user', 'data');
    mockCookiesStore.set('access_token', 'at');
    mockCookiesStore.set('refresh_token', 'rt');

    const { logoutAction } = await import('@/lib/actions/auth');
    await logoutAction();

    expect(mockCookiesStore.has('user')).toBe(false);
    expect(mockCookiesStore.has('access_token')).toBe(false);
    expect(mockCookiesStore.has('refresh_token')).toBe(false);
  });
});
