import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockNotifications = [
  { id: 'n1', read: false, type: 'task.created', title: 'T1', description: '', project_id: 'p1', user_id: 'u1', metadata: {}, created_at: '', updated_at: '' },
  { id: 'n2', read: true, type: 'task.updated', title: 'T2', description: '', project_id: 'p1', user_id: 'u1', metadata: {}, created_at: '', updated_at: '' },
];

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock('@/lib/actions/notifications', () => ({
  getNotificationsAction: (...args: any[]) => mockGetNotifications(...args),
  markAsReadAction: (...args: any[]) => mockMarkAsRead(...args),
  markAllAsReadAction: (...args: any[]) => mockMarkAllAsRead(...args),
  deleteNotificationAction: (...args: any[]) => mockDeleteNotification(...args),
}));

import { useNotifications } from '@/hooks/useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    mockGetNotifications.mockResolvedValue({ notifications: mockNotifications, total: 2, hasMore: false });
    mockMarkAsRead.mockResolvedValue(true);
    mockMarkAllAsRead.mockResolvedValue(true);
    mockDeleteNotification.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('estado inicial: loading true, notifications vazias', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
  });

  it('carrega notificações no mount', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAsRead atualiza optimisticamente', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.unreadCount).toBe(0);
    expect(mockMarkAsRead).toHaveBeenCalledWith('n1');
  });

  it('markAsRead faz rollback se API falhar', async () => {
    mockMarkAsRead.mockResolvedValue(false);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });
  });

  it('deleteNotification remove da lista', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification('n1');
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('deleteNotification faz rollback se API falhar', async () => {
    mockDeleteNotification.mockResolvedValue(false);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteNotification('n1');
    });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });
  });

  it('markAllAsRead marca tudo', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });
});
