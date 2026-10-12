import { TeslaDetail } from "@/components/life/detail-pages";
import { LifeShell } from "@/components/life/shell";
import { getLifeOverview } from "@/life/overview";

export const dynamic = "force-dynamic";

export default async function TeslaPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; vin?: string; detail?: string; vehicles?: string }>;
}) {
  const params = await searchParams;
  const data = await getLifeOverview();
  let authNotice: string | null = null;
  if (params.auth === "ok") {
    authNotice = params.vin
      ? `Tesla connected. Set TESLA_VIN=${params.vin} if not already configured.`
      : "Tesla tokens saved.";
  } else if (params.auth === "error") {
    authNotice = params.detail ?? "Tesla auth failed";
  }

  return (
    <LifeShell active="tesla">
      <TeslaDetail data={data} authNotice={authNotice} />
    </LifeShell>
  );
}
