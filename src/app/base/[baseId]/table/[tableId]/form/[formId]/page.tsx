"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { FormBuilder } from "@/components/forms/form-builder";
import { useAppStore } from "@/lib/store";

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string; formId: string }>;
}) {
  const { formId } = use(params);
  const form = useAppStore((s) => s.getForm(formId));

  if (!form) notFound();

  return <FormBuilder formId={formId} />;
}
