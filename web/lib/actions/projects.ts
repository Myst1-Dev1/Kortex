"use server";

import { cookies } from "next/headers";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  InviteEmailSchema,
} from "@/lib/schemas/projects";

const API_URL = process.env.API_URL;

export type ProjectState<T = any> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }
  | { success: null; error: null; data: null };

export interface Project {
  id: string;
  name: string;
  description?: string;
  author_id: string;
  participants?: string[];
  deadline_for_completion?: string;
  created_at?: string;
  updated_at?: string;
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getUserFromCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): { id: string } | null {
  const raw = cookieStore.get("user")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.id) return { id: parsed.id };
    return null;
  } catch {
    return null;
  }
}

function getFullUserFromCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): { id: string; name: string; email: string; avatarUrl: string | null } | null {
  const raw = cookieStore.get("user")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.id && parsed?.name && parsed?.email) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        avatarUrl: parsed.avatarUrl ?? parsed.avatar_url ?? null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAllProjectsAction(): Promise<ProjectState<Project[]>> {
  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects`, { headers });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao buscar projetos",
      };
    }

    const data: Project[] = await res.json();

    const cookieStore = await cookies();
    const user = getUserFromCookie(cookieStore);

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const filtered = data.filter(
      (project) =>
        project.author_id === user.id ||
        project.participants?.some((p:any) => p.id === user.id)
    );

    return { success: true, data: filtered };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function getProjectByIdAction(
  id: string
): Promise<ProjectState<Project>> {
  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/${id}`, { headers });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Projeto não encontrado",
      };
    }

    const data: Project = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function createProjectAction(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const raw = {
    author_id:formData.get("author_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    deadline_for_completion: formData.get("deadline_for_completion"),
  };

  const validated = CreateProjectSchema.safeParse(raw);
  if (!validated.success) {
    const message =
      validated.error.flatten().fieldErrors.name?.[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/create-new-project`, {
      method: "POST",
      headers,
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao criar projeto",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function updateProjectAction(
  id: string,
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    deadline_for_completion: formData.get("deadline_for_completion"),
  };

  const validated = UpdateProjectSchema.safeParse(raw);
  if (!validated.success) {
    const message =
      validated.error.flatten().fieldErrors.name?.[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/${id}/update`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao atualizar projeto",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function deleteProjectAction(
  id: string
): Promise<ProjectState> {
  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/${id}/delete`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao deletar projeto",
      };
    }

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function inviteToProjectAction(
  id: string,
  email?: string
): Promise<ProjectState> {
  const validated = InviteEmailSchema.safeParse({ email });
  if (!validated.success) {
    return { success: false, error: "E-mail inválido" };
  }

  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/${id}/invite`, {
      method: "POST",
      headers,
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao enviar convite",
      };
    }

    // --- CORREÇÃO AQUI ---
    const contentType = res.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // Se a API retornar texto puro (ex: a URL direta "http://localhost...")
      data = await res.text();
    }

    return { success: true, data };
  } catch (error: any) {
    console.log('erro:', error);
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function acceptProjectInviteAction(
  token: string,
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }
): Promise<ProjectState> {
  const headers = await authHeaders();
  if (!headers) {
    return { success: false, error: "Sessão expirada" };
  }

  try {
    const res = await fetch(`${API_URL}projects/accept-invite`, {
      method: "POST",
      headers,
      body: JSON.stringify({ token, currentUser }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "Erro ao aceitar convite",
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export interface InviteInfo {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  invitedBy?: {
    name: string;
    email: string;
  };
}

function decodeInviteToken(token: string): { projectId: string; invitedEmail?: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    if (decoded?.projectId) {
      return { projectId: decoded.projectId, invitedEmail: decoded.invitedEmail };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getInviteInfoAction(
  token: string
): Promise<ProjectState<InviteInfo>> {
  const decoded = decodeInviteToken(token);
  if (!decoded) {
    return { success: false, error: "Token de convite inválido" };
  }

  const projectResult = await getProjectByIdAction(decoded.projectId);
  if (!projectResult.success) {
    return { success: false, error: "Projeto não encontrado" };
  }

  return {
    success: true,
    data: {
      project: {
        id: projectResult.data.id,
        name: projectResult.data.name,
        description: projectResult.data.description,
      },
    },
  };
}

export async function acceptInviteAction(
  token: string
): Promise<ProjectState> {
  const cookieStore = await cookies();
  const user = getFullUserFromCookie(cookieStore);

  if (!user) {
    return { success: false, error: "Usuário não autenticado" };
  }

  return acceptProjectInviteAction(token, user);
}
