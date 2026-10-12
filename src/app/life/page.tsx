import { LifeDashboard } from "@/components/life/dashboard";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function LifePage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="board">
      <LifeDashboard data={data} />
    </LifeShell>
  );
}
