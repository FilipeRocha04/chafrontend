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
