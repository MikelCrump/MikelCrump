"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ControlRequest } from "@/life/types";

export function useLifeControl() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  async function control(body: ControlRequest) {
    const res = await fetch("/api/life/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; detail: string };
    setToast(json.detail);
    startTransition(() => router.refresh());
    window.setTimeout(() => setToast(null), 2400);
    return json;
  }

  return { control, pending, toast };
}
