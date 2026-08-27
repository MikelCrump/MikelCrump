/**
 * Drop this tile into Command Center → Tools page (next to Tables & Forms).
 *
 * File is typically something like:
 *   src/pages/Tools.tsx  OR  src/features/tools/ToolsPage.tsx
 *
 * Also add a Vercel rewrite on the Command Center project:
 * {
 *   "source": "/apps/communications/:path*",
 *   "destination": "https://reachflow-zeta.vercel.app/apps/communications/:path*"
 * }
 *
 * And set on the ReachFlow Vercel project:
 *   NEXT_PUBLIC_BASE_PATH=/apps/communications
 *   NEXT_PUBLIC_APP_URL=https://reawakencommandcenter.com
 */

import { Mail } from "lucide-react";

const COMMUNICATIONS_APP_URL = "/apps/communications";

export function CommunicationsToolTile() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = COMMUNICATIONS_APP_URL;
      }}
      className="group hover:shadow-lg transition-all"
    >
      <div className="aspect-square rounded-lg bg-gradient-to-br from-red-800 to-black p-4 flex flex-col items-center justify-center text-white shadow-md group-hover:shadow-lg">
        <Mail className="h-8 w-8 mb-2 opacity-90" />
        <h3 className="font-semibold text-sm">Communications</h3>
        <p className="text-xs opacity-80 mt-0.5 text-center">Email & SMS</p>
      </div>
    </button>
  );
}
