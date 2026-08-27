import { NextResponse, type NextRequest } from "next/server";
import { tryCreateAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/config";
import { fetchPublishedForm } from "@/lib/supabase/queries";
import { submitFormRecord } from "@/lib/supabase/mutations";
import { generateId } from "@/lib/utils";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { CellValue } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local" });
  }

  const admin = tryCreateAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const result = await fetchPublishedForm(admin, formId);
  if (!result) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({ mode: "remote", ...result });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const ip = getClientIp(request);
  const limit = rateLimit(`form:${formId}:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ mode: "local" });
  }

  const admin = tryCreateAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const result = await fetchPublishedForm(admin, formId);
  if (!result) {
    return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
  }

  let body: { values?: Record<string, CellValue> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.values || typeof body.values !== "object") {
    return NextResponse.json({ error: "values required" }, { status: 400 });
  }

  const recordId = generateId();
  const { error } = await submitFormRecord(
    admin,
    result.form.tableId,
    body.values,
    recordId
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    recordId,
    message: result.form.successMessage,
  });
}
