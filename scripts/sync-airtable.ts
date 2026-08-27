/**
 * One-shot Airtable → Tables merge (server-side).
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AIRTABLE_TOKEN
 *
 * Usage: npx tsx scripts/sync-airtable.ts
 */
import { createClient } from "@supabase/supabase-js";
import { AIRTABLE_SOURCES } from "../src/lib/airtable/catalog";
import { syncAirtableSources } from "../src/lib/airtable/sync";
import { SHARED_WORKSPACE_ID } from "../src/lib/supabase/queries";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!process.env.AIRTABLE_TOKEN && !process.env.AIRTABLE_PASTORS_TOKEN) {
    throw new Error("Missing AIRTABLE_TOKEN (same token as Command Center edge functions)");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Ensure shared workspace exists
  await supabase.from("workspaces").upsert({
    id: SHARED_WORKSPACE_ID,
    name: "Reawaken USA",
  });

  console.log(
    `Syncing ${AIRTABLE_SOURCES.length} Airtable sources → workspace ${SHARED_WORKSPACE_ID}`
  );
  const result = await syncAirtableSources(supabase, SHARED_WORKSPACE_ID, {
    accessToken: null,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.sources.some((s) => s.error)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
