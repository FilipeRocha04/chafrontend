import { apiFetch } from "@/lib/api";

export type AdminUserRow = {
  id: string;
  email: string;
  username: string | null;
  is_admin: boolean;
  created_at: string;
};

export async function fetchUsers(): Promise<AdminUserRow[]> {
  return apiFetch<AdminUserRow[]>("/api/admin/users");
}

export async function updateUserRole(id: string, isAdmin: boolean): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ is_admin: isAdmin }),
  });
}

export async function createUser(input: {
  email: string;
  username: string | null;
  password: string;
  isAdmin: boolean;
}): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      username: input.username,
      password: input.password,
      is_admin: input.isAdmin,
    }),
  });
}
