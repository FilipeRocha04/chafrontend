import { apiFetch } from "@/lib/api";

export type Category = {
  id: string;
  name: string;
  display_order: number;
};

export type GiftItem = {
  id: string;
  category_id: string;
  name: string;
  size: string | null;
  description: string | null;
  desired_quantity: number;
  active: boolean;
  display_order: number;
};

export type Commitment = {
  id: string;
  gift_item_id: string;
  guest_name: string | null;
  quantity: number;
  created_at: string;
};

export function itemLabel(item: GiftItem) {
  return item.size ? `${item.name} — tamanho ${item.size}` : item.name;
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function fetchItems(includeInactive = false): Promise<GiftItem[]> {
  const query = includeInactive ? "?include_inactive=true" : "";
  return apiFetch<GiftItem[]>(`/api/gift-items${query}`);
}

export async function fetchTotals(): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>("/api/gift-totals");
}

export async function addCommitment(input: {
  giftItemId: string;
  guestName: string;
  quantity: number;
}) {
  await apiFetch("/api/gift-commitments", {
    method: "POST",
    body: JSON.stringify({
      gift_item_id: input.giftItemId,
      guest_name: input.guestName.trim().slice(0, 60),
      quantity: input.quantity,
    }),
  });
}

export async function addCommitmentsBulk(input: {
  guestName: string;
  items: { giftItemId: string; quantity: number }[];
}) {
  await apiFetch("/api/gift-commitments/bulk", {
    method: "POST",
    body: JSON.stringify({
      guest_name: input.guestName.trim().slice(0, 60),
      items: input.items.map((entry) => ({
        gift_item_id: entry.giftItemId,
        quantity: entry.quantity,
      })),
    }),
  });
}

export async function fetchCommitments(): Promise<Commitment[]> {
  return apiFetch<Commitment[]>("/api/gift-commitments");
}

export type PersonGift = {
  guest_name: string;
  item_name: string;
  item_size: string | null;
  quantity: number;
  created_at: string;
};

export async function fetchPeopleList(): Promise<PersonGift[]> {
  return apiFetch<PersonGift[]>("/api/lista-pessoas");
}

export async function createGiftItem(input: {
  categoryId: string;
  name: string;
  size: string | null;
  description: string | null;
  desiredQuantity: number;
}): Promise<GiftItem> {
  return apiFetch<GiftItem>("/api/gift-items", {
    method: "POST",
    body: JSON.stringify({
      category_id: input.categoryId,
      name: input.name,
      size: input.size,
      description: input.description,
      desired_quantity: input.desiredQuantity,
    }),
  });
}

export async function updateGiftItem(
  id: string,
  input: Partial<{
    categoryId: string;
    name: string;
    size: string | null;
    description: string | null;
    active: boolean;
    desiredQuantity: number;
  }>,
): Promise<GiftItem> {
  const payload: Record<string, unknown> = {};
  if (input.categoryId !== undefined) payload["category_id"] = input.categoryId;
  if (input.name !== undefined) payload["name"] = input.name;
  if (input.size !== undefined) payload["size"] = input.size;
  if (input.description !== undefined) payload["description"] = input.description;
  if (input.active !== undefined) payload["active"] = input.active;
  if (input.desiredQuantity !== undefined) payload["desired_quantity"] = input.desiredQuantity;

  return apiFetch<GiftItem>(`/api/gift-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteGiftItem(id: string): Promise<void> {
  await apiFetch<void>(`/api/gift-items/${id}`, { method: "DELETE" });
}
