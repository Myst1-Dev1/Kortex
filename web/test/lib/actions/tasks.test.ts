import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: () => ({ value: 'tok' }),
      set: () => {},
      delete: () => {},
    })
  ),
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function okJson(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) } as Response;
}

describe('createTaskAction', () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    vi.resetModules();
    process.env.API_URL = 'http://api/';
  });

  it('validação Zod falha (project_id inválido) sem chamar fetch', async () => {
    const formData = new FormData();
    formData.set('project_id', 'not-a-uuid');
    formData.set('name', 'Task');
    formData.set('description', 'Desc');

    const { createTaskAction } = await import('@/lib/actions/tasks');
    const result = await createTaskAction({ success: null, error: null, data: null }, formData);

    expect(result.success).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sucesso retorna task criada', async () => {
    mockFetch.mockResolvedValue(okJson({ id: 't1', name: 'Task' }));

    const formData = new FormData();
    formData.set('project_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('name', 'Task');
    formData.set('description', 'Desc');

    const { createTaskAction } = await import('@/lib/actions/tasks');
    const result = await createTaskAction({ success: null, error: null, data: null }, formData);

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('t1');
  });

  it('API down retorna erro de conexão', async () => {
    mockFetch.mockRejectedValue(new Error('fetch failed'));

    const formData = new FormData();
    formData.set('project_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.set('name', 'Task');
    formData.set('description', 'Desc');

    const { createTaskAction } = await import('@/lib/actions/tasks');
    const result = await createTaskAction({ success: null, error: null, data: null }, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao conectar com o servidor');
  });
});
