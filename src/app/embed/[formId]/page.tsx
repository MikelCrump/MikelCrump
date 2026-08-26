"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { FormRenderer } from "@/components/forms/form-renderer";
import { useAppStore } from "@/lib/store";

export default function EmbedFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const form = useAppStore((s) => s.getForm(formId));
  const table = useAppStore((s) =>
    form ? s.getTable(form.tableId) : undefined
  );
  const submitForm = useAppStore((s) => s.submitForm);

  if (!form || !table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <p className="text-slate-500">Form not found.</p>
      </div>
    );
  }

  if (!form.published) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <p className="text-slate-500">This form is not published yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <FormRenderer
        form={form}
        fields={table.fields}
        onSubmit={(values) => submitForm(formId, values)}
        embed
      />
    </div>
  );
}
