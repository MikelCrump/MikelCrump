import { AiDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="ai">
      <AiDetail data={data} />
    </LifeShell>
  );
}
