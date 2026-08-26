"use client";

import { use, useEffect, useState } from "react";
import { FormRenderer } from "@/components/forms/form-renderer";
import { useAppStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/config";
import { submitFormRemote } from "@/lib/sync";
import type { Field, Form } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function EmbedFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const localForm = useAppStore((s) => s.getForm(formId));
  const localTable = useAppStore((s) =>
    localForm ? s.getTable(localForm.tableId) : undefined
  );
  const submitForm = useAppStore((s) => s.submitForm);
  const mode = useAppStore((s) => s.mode);

  const [remoteForm, setRemoteForm] = useState<Form | null>(null);
  const [remoteFields, setRemoteFields] = useState<Field[] | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    fetch(`/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mode === "remote" && data.form) {
          setRemoteForm(data.form);
          setRemoteFields(data.table.fields);
        } else if (data.error) {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const form = remoteForm ?? localForm;
  const fields = remoteFields ?? localTable?.fields;

  if (notFound || !form || !fields) {
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

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (isSupabaseConfigured() && mode === "remote") {
      return submitFormRemote(formId, values as Record<string, string | string[] | boolean | number | null>);
    }
    return submitForm(formId, values as Record<string, string | string[] | boolean | number | null>);
  };

  return (
    <div className="min-h-screen bg-white">
      <FormRenderer form={form} fields={fields} onSubmit={handleSubmit} embed />
    </div>
  );
}
