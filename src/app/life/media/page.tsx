import { MediaDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="media">
      <MediaDetail data={data} />
    </LifeShell>
  );
}
