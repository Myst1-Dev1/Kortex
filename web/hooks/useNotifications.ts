"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  deleteNotificationAction,
  Notification,
} from "@/lib/actions/notifications";

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { notifications: all } = await getNotificationsAction(50, 0);
      setNotifications(all);
      setUnreadCount(all.filter((n) => !n.read).length);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const ok = await markAsReadAction(id);
    if (!ok) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    const ok = await markAllAsReadAction();
    if (!ok) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });

    const ok = await deleteNotificationAction(id);
    if (!ok) {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
