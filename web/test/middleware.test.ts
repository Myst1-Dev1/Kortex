import { describe, it, expect, vi } from 'vitest';
import { middleware, config } from '../middleware';

function mockRequest(pathname: string, cookies?: Record<string, string>) {
  const url = new URL(`http://localhost:3000${pathname}`);
  const cookieMap = new Map(
    Object.entries(cookies ?? {}).map(([k, v]) => [k, { value: v }])
  );

  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name: string) => cookieMap.get(name),
    },
  } as any;
}

vi.mock('next/server', () => ({
  NextResponse: {
    next: () => ({ type: 'next' }),
    redirect: (url: URL) => ({ type: 'redirect', url: url.toString() }),
  },
}));

describe('middleware', () => {
  it('permite acesso a rota pública /', () => {
    const result = middleware(mockRequest('/'));
    expect(result.type).toBe('next');
  });

  it('permite acesso a /projects/accept-invite sem cookies', () => {
    const result = middleware(mockRequest('/projects/accept-invite?token=abc'));
    expect(result.type).toBe('next');
  });

  it('redireciona /dashboard sem cookies para /', () => {
    const result = middleware(mockRequest('/dashboard'));
    expect(result.type).toBe('redirect');
    expect(result.url).toContain('/');
    expect(result.url).toContain('redirect=%2Fdashboard');
  });

  it('permite /dashboard com access_token', () => {
    const result = middleware(mockRequest('/dashboard', { access_token: 'tok' }));
    expect(result.type).toBe('next');
  });

  it('permite /dashboard com apenas refresh_token', () => {
    const result = middleware(mockRequest('/dashboard', { refresh_token: 'tok' }));
    expect(result.type).toBe('next');
  });

  it('protege rota aninhada /project/abc/tasks', () => {
    const result = middleware(mockRequest('/project/abc123/tasks'));
    expect(result.type).toBe('redirect');
  });

  it('matcher não captura rotas fora do padrão', () => {
    expect(config.matcher).not.toContain('/api/:path*');
    expect(config.matcher).not.toContain('/static/:path*');
  });
});
