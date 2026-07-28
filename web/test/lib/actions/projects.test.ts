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

describe('getAllProjectsAction', () => {
  beforeEach(async () => {
    mockCookiesStore.clear();
    mockCookiesStore.set('user', JSON.stringify({ id: 'u1' }));
    mockCookiesStore.set('access_token', 'tok');
    mockCookiesStore.set('refresh_token', 'tok');
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
  });

  it('filtra projetos onde user é author ou participant', async () => {
    const projects = [
      { id: 'p1', author_id: 'u1', participants: [] },
      { id: 'p2', author_id: 'u2', participants: [{ id: 'u1' }] },
      { id: 'p3', author_id: 'u3', participants: [] },
    ];
    mockFetch.mockResolvedValue(okJson(projects));

    const { getAllProjectsAction } = await import('@/lib/actions/projects');
    const result = await getAllProjectsAction();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data.map((p: any) => p.id)).toEqual(['p1', 'p2']);
  });

  it('retorna erro se usuário não autenticado', async () => {
    mockCookiesStore.delete('user');
    mockFetch.mockResolvedValue(okJson([]));

    const { getAllProjectsAction } = await import('@/lib/actions/projects');
    const result = await getAllProjectsAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Usuário não autenticado');
  });
});

describe('createProjectAction', () => {
  beforeEach(async () => {
    mockCookiesStore.clear();
    mockCookiesStore.set('access_token', 'tok');
    mockCookiesStore.set('refresh_token', 'tok');
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
  });

  it('validação Zod falha sem chamar fetch', async () => {
    const formData = new FormData();
    formData.set('author_id', '');
    formData.set('name', '');

    const { createProjectAction } = await import('@/lib/actions/projects');
    const result = await createProjectAction({ success: null, error: null, data: null }, formData);

    expect(result.success).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sucesso retorna projeto criado', async () => {
    mockFetch.mockResolvedValue(okJson({ id: 'p1', name: 'Novo' }));

    const formData = new FormData();
    formData.set('author_id', 'u1');
    formData.set('name', 'Novo');
    formData.set('description', 'uma descrição');

    const { createProjectAction } = await import('@/lib/actions/projects');
    const result = await createProjectAction({ success: null, error: null, data: null }, formData);

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('p1');
  });
});

describe('decodeInviteToken', () => {
  beforeEach(async () => {
    mockCookiesStore.clear();
    mockCookiesStore.set('access_token', 'tok');
    mockCookiesStore.set('refresh_token', 'tok');
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
  });

  it('decodifica token válido com projectId', async () => {
    const payload = btoa(JSON.stringify({ projectId: 'p1', invitedEmail: 'a@b.com' }));
    const token = `header.${payload}.sig`;

    const { getInviteInfoAction } = await import('@/lib/actions/projects');
    mockFetch.mockResolvedValue(okJson({ id: 'p1', name: 'Projeto' }));

    const result = await getInviteInfoAction(token);
    expect(result.success).toBe(true);
  });

  it('retorna erro com token malformado', async () => {
    const { getInviteInfoAction } = await import('@/lib/actions/projects');
    const result = await getInviteInfoAction('token-invalido');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Token de convite inválido');
  });

  it('retorna erro se token não tem projectId', async () => {
    const payload = btoa(JSON.stringify({ email: 'a@b.com' }));
    const token = `header.${payload}.sig`;

    const { getInviteInfoAction } = await import('@/lib/actions/projects');
    const result = await getInviteInfoAction(token);

    expect(result.success).toBe(false);
  });
});

describe('inviteToProjectAction', () => {
  beforeEach(async () => {
    mockCookiesStore.clear();
    mockCookiesStore.set('access_token', 'tok');
    mockCookiesStore.set('refresh_token', 'tok');
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
  });

  it('trata resposta como texto quando content-type não é JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      text: () => Promise.resolve('http://invite.link/token123'),
      json: () => Promise.reject(new Error('not json')),
    } as any);

    const { inviteToProjectAction } = await import('@/lib/actions/projects');
    const result = await inviteToProjectAction('p1');

    expect(result.success).toBe(true);
    expect(result.data).toBe('http://invite.link/token123');
  });
});
