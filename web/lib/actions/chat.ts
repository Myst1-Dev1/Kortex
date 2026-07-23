"use server";

import { fetchWithAuth } from "@/lib/api";

const API_URL = process.env.API_URL;

export type ChatState<T = unknown> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }
  | { success: null; error: null; data: null };

export interface ChatMessage {
  id: string;
  project_id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  updated_at?: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export async function sendMessageAction(
  projectId: string,
  message: string
): Promise<ChatState<ChatMessage>> {
  try {
    const res = await fetchWithAuth(`${API_URL}chat/send`, {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, message }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao enviar mensagem",
      };
    }

    const data: ChatMessage = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function getLatestMessagesAction(
  projectId: string,
  limit = 50
): Promise<ChatState<ChatMessage[]>> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}chat/latest/${projectId}?limit=${limit}`
    );

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao buscar mensagens",
      };
    }

    const data: ChatMessage[] = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function getPaginatedMessagesAction(
  projectId: string,
  limit = 50,
  offset = 0
): Promise<ChatState<ChatMessage[]>> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}chat/messages/${projectId}?limit=${limit}&offset=${offset}`
    );

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao buscar mensagens",
      };
    }

    const data: ChatMessage[] = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function editMessageAction(
  messageId: string,
  message: string
): Promise<ChatState<ChatMessage>> {
  try {
    const res = await fetchWithAuth(`${API_URL}chat/edit`, {
      method: "PATCH",
      body: JSON.stringify({ message_id: messageId, message }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao editar mensagem",
      };
    }

    const data: ChatMessage = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function deleteMessageAction(
  messageId: string
): Promise<ChatState> {
  try {
    const res = await fetchWithAuth(`${API_URL}chat/message/${messageId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao deletar mensagem",
      };
    }

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}
