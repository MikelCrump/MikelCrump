import { HealthDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="health">
      <HealthDetail data={data} />
    </LifeShell>
  );
}
