import { describe, it, expect } from 'vitest';
import { CreateTaskSchema, UpdateTaskSchema, UpdateTaskStatusSchema } from '@/lib/schemas/tasks';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('CreateTaskSchema', () => {
  const valid = { project_id: UUID, name: 'Task', description: 'Desc' };

  it('aceita dados válidos', () => {
    expect(CreateTaskSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita project_id que não é UUID', () => {
    const result = CreateTaskSchema.safeParse({ ...valid, project_id: 'invalido' });
    expect(result.success).toBe(false);
  });

  it('rejeita name > 255 caracteres', () => {
    const result = CreateTaskSchema.safeParse({ ...valid, name: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('rejeita description > 5000 caracteres', () => {
    const result = CreateTaskSchema.safeParse({ ...valid, description: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('aceita name com 255 caracteres (boundary)', () => {
    const result = CreateTaskSchema.safeParse({ ...valid, name: 'x'.repeat(255) });
    expect(result.success).toBe(true);
  });

  it('aceita assigned_user_id e time_estimated opcionais', () => {
    const result = CreateTaskSchema.safeParse({
      ...valid,
      assigned_user_id: UUID,
      time_estimated: '2h',
    });
    expect(result.success).toBe(true);
  });
});

describe('UpdateTaskSchema', () => {
  it('aceita parcial (só name)', () => {
    const result = UpdateTaskSchema.safeParse({ name: 'Nova task' });
    expect(result.success).toBe(true);
  });

  it('aceita objeto vazio', () => {
    const result = UpdateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('UpdateTaskStatusSchema', () => {
  it('aceita status válido', () => {
    const result = UpdateTaskStatusSchema.safeParse({ status: 'DONE' });
    expect(result.success).toBe(true);
  });

  it('rejeita status ausente', () => {
    const result = UpdateTaskStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('aceita status com time_concluded', () => {
    const result = UpdateTaskStatusSchema.safeParse({ status: 'DONE', time_concluded: '2h' });
    expect(result.success).toBe(true);
  });
});
