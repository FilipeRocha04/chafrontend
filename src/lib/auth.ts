import { apiFetch, getToken, setToken } from "./api";

export type AdminMe = { email: string; username: string | null; is_admin: boolean };
type AuthResponse = {
  access_token: string;
  email: string;
  username: string | null;
  is_admin: boolean;
};

export function hasToken(): boolean {
  return getToken() !== null;
}

export async function fetchMe(): Promise<AdminMe> {
  return apiFetch<AdminMe>("/api/admin/me");
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/admin/register", {
    method: "POST",
    body: JSON.stringify({ email, username: username.trim() ? username.trim() : null, password }),
  });
  setToken(data.access_token);
  return data;
}

export function logout() {
  setToken(null);
}
