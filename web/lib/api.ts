'use server';

import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

async function refreshTokens(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      console.error("[refreshTokens] refresh_token não encontrado nos cookies");
      return false;
    }

    const res = await fetch(`${API_URL}auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.error("[refreshTokens] API retornou erro:", res.status);
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return false;
    }

    const data = await res.json();

    cookieStore.set("access_token", data.accessToken, COOKIE_OPTIONS);
    cookieStore.set("refresh_token", data.refreshToken, COOKIE_OPTIONS);

    return true;
  } catch (error) {
    console.error("[refreshTokens] Erro ao renovar token:", error);
    return false;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && token) {
      const refreshed = await refreshTokens();

      if (refreshed) {
        const newCookieStore = await cookies();
        const newToken = newCookieStore.get("access_token")?.value;

        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers });
        }
      }
    }

    return res;
  } catch (error) {
    console.error("[fetchWithAuth] Erro:", error);
    throw error;
  }
}
