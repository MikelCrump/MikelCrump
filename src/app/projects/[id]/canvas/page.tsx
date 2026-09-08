import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Canvas lands in Phase 6 — keep route alive with a soft redirect for now. */
export default async function CanvasPlaceholderPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/projects/${id}/wizard`);
}
