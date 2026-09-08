"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/admin-store";

export function SiteAnnouncement() {
  const announcement = useAdminStore((s) => s.site.announcement);
  const maintenanceMode = useAdminStore((s) => s.site.maintenanceMode);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) return null;

  if (maintenanceMode) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm text-amber-950">
        Maintenance mode is on — public visitors may see limited content.
      </div>
    );
  }

  if (!announcement) return null;

  return (
    <div className="border-b border-sea/20 bg-sea/10 px-5 py-2 text-center text-sm text-ink">
      {announcement}
    </div>
  );
}
