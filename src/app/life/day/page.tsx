import { DayDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function DayPage() {
  const data = await getLifeOverview();
  return (
    <LifeShell active="day">
      <DayDetail data={data} />
    </LifeShell>
  );
}
