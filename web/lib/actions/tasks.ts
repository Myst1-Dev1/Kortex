"use server";

import { fetchWithAuth } from "@/lib/api";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
} from "@/lib/schemas/tasks";

const API_URL = process.env.API_URL;

export type TaskState<T = any> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }
  | { success: null; error: null; data: null };

export interface Task {
  id: string;
  project_id: string;
  task_author_id: string;
  assigned_user_id?: string;
  name: string;
  description: string;
  status?: string;
  time_estimated?: string;
  time_concluded?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createTaskAction(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const raw = {
    project_id: formData.get("project_id"),
    assigned_user_id: formData.get("assigned_user_id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    time_estimated: formData.get("time_estimated") || undefined,
  };

  const validated = CreateTaskSchema.safeParse(raw);
  if (!validated.success) {
    const message =
      validated.error.flatten().fieldErrors.name?.[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  try {
    const res = await fetchWithAuth(`${API_URL}tasks/create-new-task`, {
      method: "POST",
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao criar tarefa",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function getTasksByProjectAction(
  projectId: string
): Promise<TaskState<Task[]>> {
  try {
    const res = await fetchWithAuth(`${API_URL}tasks/findAll/${projectId}`);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao buscar tarefas",
      };
    }

    const data: Task[] = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function getTaskByIdAction(
  id: string
): Promise<TaskState<Task>> {
  try {
    const res = await fetchWithAuth(`${API_URL}tasks/${id}`);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Tarefa não encontrada",
      };
    }

    const data: Task = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function updateTaskAction(
  id: string,
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const raw = {
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    time_estimated: formData.get("time_estimated") || undefined,
  };

  const validated = UpdateTaskSchema.safeParse(raw);
  if (!validated.success) {
    const message =
      validated.error.flatten().fieldErrors.name?.[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  try {
    const res = await fetchWithAuth(`${API_URL}tasks/update/${id}`, {
      method: "PATCH",
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao atualizar tarefa",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function updateTaskStatusAction(
  id: string,
  status: string,
  time_concluded?: string
): Promise<TaskState> {
  const validated = UpdateTaskStatusSchema.safeParse({ status, time_concluded });
  if (!validated.success) {
    return { success: false, error: "Status inválido" };
  }

  try {
    const res = await fetchWithAuth(`${API_URL}tasks/updateStatus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao atualizar status",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function deleteTaskAction(
  id: string
): Promise<TaskState> {
  try {
    const res = await fetchWithAuth(`${API_URL}tasks/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao deletar tarefa",
      };
    }

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}
