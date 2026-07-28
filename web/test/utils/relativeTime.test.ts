import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '@/lib/utils/relativeTime';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna "agora" para < 60 segundos', () => {
    expect(formatRelativeTime('2025-06-15T11:59:30Z')).toBe('agora');
  });

  it('retorna "há X min" para < 60 minutos', () => {
    expect(formatRelativeTime('2025-06-15T11:55:00Z')).toBe('há 5 min');
  });

  it('retorna "há Xh" para < 24 horas', () => {
    expect(formatRelativeTime('2025-06-15T09:00:00Z')).toBe('há 3h');
  });

  it('retorna "ontem" para exatamente 1 dia', () => {
    expect(formatRelativeTime('2025-06-14T12:00:00Z')).toBe('ontem');
  });

  it('retorna "há X dias" para 2-6 dias', () => {
    expect(formatRelativeTime('2025-06-10T12:00:00Z')).toBe('há 5 dias');
  });

  it('retorna data formatada para >= 7 dias', () => {
    const result = formatRelativeTime('2025-06-01T12:00:00Z');
    expect(result).toMatch(/\d{2} de/);
  });

  it('não quebra com data futura', () => {
    const result = formatRelativeTime('2025-06-20T12:00:00Z');
    expect(typeof result).toBe('string');
  });
});
