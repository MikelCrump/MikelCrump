import { getBrevoClient, isBrevoConfigured } from "./client";

export interface BrevoList {
  id: number;
  name: string;
  totalSubscribers: number;
  folderId?: number;
}

export async function listBrevoLists(): Promise<{
  lists: BrevoList[];
  source: "brevo" | "demo";
}> {
  if (!isBrevoConfigured()) {
    return { lists: [], source: "demo" };
  }

  const brevo = getBrevoClient();
  const response = await brevo.contacts.getLists({ limit: 50, offset: 0 });

  const lists: BrevoList[] = (response.lists ?? []).map((list) => ({
    id: list.id ?? 0,
    name: list.name ?? `List ${list.id}`,
    totalSubscribers: list.totalSubscribers ?? list.totalBlacklisted ?? 0,
    folderId: list.folderId,
  }));

  return { lists: lists.filter((l) => l.id > 0), source: "brevo" };
}
