import { ServersDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function ServersPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="servers">
      <ServersDetail data={data} />
    </LifeShell>
  );
}
