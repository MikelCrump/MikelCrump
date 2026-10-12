import { TeslaDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function TeslaPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="tesla">
      <TeslaDetail data={data} />
    </LifeShell>
  );
}
