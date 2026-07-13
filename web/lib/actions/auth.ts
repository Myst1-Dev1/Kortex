"use server";

import { cookies } from "next/headers";
import { LoginSchema, RegisterSchema } from "@/lib/schemas/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

type AuthState = {
  success: boolean;
  error?: string;
};

export async function signInAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = LoginSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.flatten().fieldErrors;
    const message = Object.values(firstError).flat()[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  try {
    const res = await fetch(`${API_URL}auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        success: false,
        error: body?.message ?? "E-mail ou senha incorretos",
      };
    }

    const data = await res.json();
    const cookieStore = await cookies();

    cookieStore.set("user", JSON.stringify(data.user), {
      path: "/",
      secure: true,
      sameSite: "lax",
    });
    cookieStore.set("access_token", data.accessToken, COOKIE_OPTIONS);
    cookieStore.set("refresh_token", data.refreshToken, COOKIE_OPTIONS);

    revalidatePath('/dashboard');

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao conectar com o servidor" };
  }
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validated = RegisterSchema.safeParse(raw);

  if (!validated.success) {
    const firstError = validated.error.flatten().fieldErrors;
    const message = Object.values(firstError).flat()[0] ?? "Dados inválidos";
    return { success: false, error: message };
  }

  const avatar = formData.get("avatar") as File | null;

  const payload = new FormData();
  payload.append("name", validated.data.name);
  payload.append("email", validated.data.email);
  payload.append("password", validated.data.password);

  if (avatar && avatar.size > 0) {
    payload.append("avatar", avatar);
  }

  try {
    const res = await fetch(`${API_URL}auth/sign-up`, {
      method: "POST",
      body: payload, // NÃO defina Content-Type
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);

      return {
        success: false,
        error: body?.message ?? "Erro ao criar conta",
      };
    }

    console.log('conta criada com sucesso!');

    return { success: true };
  } catch {
    console.log('tivemos um erro na criação da conta');
    return {
      success: false,
      error: "Erro ao conectar com o servidor",
    };
  }
}

export async function refreshSessionAction(): Promise<AuthState> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return { success: false, error: "Sessão expirada" };
    }

    const res = await fetch(`${API_URL}auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return { success: false, error: "Sessão expirada" };
    }

    const data = await res.json();

    cookieStore.set("access_token", data.accessToken, COOKIE_OPTIONS);
    cookieStore.set("refresh_token", data.refreshToken, COOKIE_OPTIONS);

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao renovar sessão" };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user");
}
