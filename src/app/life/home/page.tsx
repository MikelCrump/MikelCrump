import { HomeDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function HomeLifePage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="home">
      <HomeDetail data={data} />
    </LifeShell>
  );
}
