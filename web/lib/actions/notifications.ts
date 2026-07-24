"use server";

import { fetchWithAuth } from "@/lib/api";

const API_URL = process.env.API_URL;

export interface Notification {
  id: string;
  user_id: string;
  project_id: string | null;
  type: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export async function getNotificationsAction(
  limit?: number,
  offset?: number
): Promise<PaginatedNotifications> {
  try {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (offset) params.set("offset", String(offset));

    const res = await fetchWithAuth(
      `${API_URL}notifications?${params.toString()}`
    );

    if (!res.ok) return { notifications: [], total: 0, hasMore: false };

    return await res.json();
  } catch {
    return { notifications: [], total: 0, hasMore: false };
  }
}

export async function getUnreadNotificationsAction(): Promise<Notification[]> {
  try {
    const res = await fetchWithAuth(`${API_URL}notifications/unread`);

    if (!res.ok) return [];

    return await res.json();
  } catch {
    return [];
  }
}

export async function markAsReadAction(
  notificationId: string
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}notifications/${notificationId}/read`,
      { method: "PATCH" }
    );

    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllAsReadAction(): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API_URL}notifications/read-all`, {
      method: "PATCH",
    });

    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteNotificationAction(
  notificationId: string
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}notifications/${notificationId}`,
      { method: "DELETE" }
    );

    return res.ok;
  } catch {
    return false;
  }
}
