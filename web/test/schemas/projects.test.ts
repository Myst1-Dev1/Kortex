import { describe, it, expect } from 'vitest';
import { CreateProjectSchema, UpdateProjectSchema, InviteEmailSchema } from '@/lib/schemas/projects';

describe('CreateProjectSchema', () => {
  it('aceita author_id e name', () => {
    const result = CreateProjectSchema.safeParse({ author_id: 'u1', name: 'Projeto' });
    expect(result.success).toBe(true);
  });

  it('rejeita name vazio', () => {
    const result = CreateProjectSchema.safeParse({ author_id: 'u1', name: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita author_id vazio', () => {
    const result = CreateProjectSchema.safeParse({ author_id: '', name: 'Projeto' });
    expect(result.success).toBe(false);
  });

  it('aceita sem deadline (opcional)', () => {
    const result = CreateProjectSchema.safeParse({ author_id: 'u1', name: 'P' });
    expect(result.success).toBe(true);
  });

  it('aceita com description e deadline', () => {
    const result = CreateProjectSchema.safeParse({
      author_id: 'u1',
      name: 'P',
      description: 'desc',
      deadline_for_completion: '2025-12-31',
    });
    expect(result.success).toBe(true);
  });
});

describe('UpdateProjectSchema', () => {
  it('aceita parcial (só name)', () => {
    const result = UpdateProjectSchema.safeParse({ name: 'Novo nome' });
    expect(result.success).toBe(true);
  });

  it('aceita objeto vazio (partial)', () => {
    const result = UpdateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('InviteEmailSchema', () => {
  it('aceita email válido', () => {
    const result = InviteEmailSchema.safeParse({ email: 'a@b.com' });
    expect(result.success).toBe(true);
  });

  it('aceita email ausente (opcional)', () => {
    const result = InviteEmailSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = InviteEmailSchema.safeParse({ email: 'nao-e-email' });
    expect(result.success).toBe(false);
  });
});
