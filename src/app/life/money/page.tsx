import { MoneyDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="money">
      <MoneyDetail data={data} />
    </LifeShell>
  );
}
