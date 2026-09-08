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
      <div className="border-b border-orange/30 bg-orange/15 px-5 py-2 text-center text-sm font-medium text-navy">
        Maintenance mode is on — public visitors may see limited content.
      </div>
    );
  }

  if (!announcement) return null;

  return (
    <div className="border-b border-blue/20 bg-blue/10 px-5 py-2 text-center text-sm font-medium text-navy">
      {announcement}
    </div>
  );
}
