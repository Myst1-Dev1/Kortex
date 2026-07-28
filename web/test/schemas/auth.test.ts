import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema } from '@/lib/schemas/auth';

describe('LoginSchema', () => {
  it('aceita email e password válidos', () => {
    const result = LoginSchema.safeParse({ email: 'a@b.com', password: '123' });
    expect(result.success).toBe(true);
  });

  it('rejeita email sem @', () => {
    const result = LoginSchema.safeParse({ email: 'invalido', password: '123' });
    expect(result.success).toBe(false);
  });

  it('rejeita campos vazios', () => {
    const result = LoginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita email ausente', () => {
    const result = LoginSchema.safeParse({ password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const valid = { name: 'João', email: 'a@b.com', password: 'Abcdef1!', confirmPassword: 'Abcdef1!' };

  it('aceita dados válidos', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita senha sem maiúscula', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: 'abcdef1!', confirmPassword: 'abcdef1!' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha sem número', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: 'Abcdefg!', confirmPassword: 'Abcdefg!' });
    expect(result.success).toBe(false);
  });

  it('rejeita senhas diferentes (confirmPassword mismatch)', () => {
    const result = RegisterSchema.safeParse({ ...valid, confirmPassword: 'DIFERENTE1!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmPasswordErrors = result.error.flatten().fieldErrors.confirmPassword;
      expect(confirmPasswordErrors).toBeDefined();
    }
  });

  it('rejeita nome com 1 caractere', () => {
    const result = RegisterSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: 'Ab1!', confirmPassword: 'Ab1!' });
    expect(result.success).toBe(false);
  });
});
