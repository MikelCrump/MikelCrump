"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Team invites live in Command Center Access — not a separate Tables roster. */
export default function TeamPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings");
  }, [router]);
  return null;
}
