"use client";

import { useState } from "react";
import type { CellValue, Field, Form } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

interface FormRendererProps {
  form: Form;
  fields: Field[];
  onSubmit: (values: Record<string, CellValue>) => void;
  embed?: boolean;
}

export function FormRenderer({
  form,
  fields,
  onSubmit,
  embed = false,
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, CellValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const orderedFields = form.fieldIds
    .map((id) => fields.find((f) => f.id === id))
    .filter(Boolean) as Field[];

  const primaryColor = form.settings.primaryColor || "#2563eb";

  const setValue = (fieldId: string, value: CellValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const toggleMultiSelect = (fieldId: string, option: string) => {
    const current = (values[fieldId] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setValue(fieldId, next);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    orderedFields.forEach((field) => {
      if (field.required) {
        const val = values[field.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[field.id] = "This field is required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center",
          embed ? "py-12 px-6" : "py-16"
        )}
      >
        <CheckCircle2
          className="mb-4 h-12 w-12"
          style={{ color: primaryColor }}
        />
        <h2 className="text-xl font-semibold text-slate-900">
          Thank you!
        </h2>
        <p className="mt-2 max-w-md text-slate-600">
          {form.successMessage}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "mx-auto w-full",
        embed ? "max-w-lg px-4 py-6" : "max-w-2xl px-6 py-8"
      )}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{form.name}</h1>
        {form.description && (
          <p className="mt-2 text-slate-600">{form.description}</p>
        )}
      </div>

      <div className="space-y-5">
        {orderedFields.map((field) => (
          <div key={field.id}>
            {field.type !== "checkbox" && (
              <Label className="mb-1.5 block">
                {field.name}
                {field.required && (
                  <span className="ml-0.5 text-red-500">*</span>
                )}
              </Label>
            )}

            {field.type === "longText" ? (
              <Textarea
                value={String(values[field.id] ?? "")}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.description}
              />
            ) : field.type === "singleSelect" && field.options ? (
              <Select
                value={String(values[field.id] ?? "")}
                onValueChange={(v) => setValue(field.id, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "multiSelect" && field.options ? (
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const selected = ((values[field.id] as string[]) || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMultiSelect(field.id, opt)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-transparent text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      )}
                      style={
                        selected
                          ? { backgroundColor: primaryColor }
                          : undefined
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : field.type === "checkbox" ? (
              <div className="flex items-start gap-3">
                <Checkbox
                  id={field.id}
                  checked={Boolean(values[field.id])}
                  onCheckedChange={(checked) =>
                    setValue(field.id, Boolean(checked))
                  }
                />
                <label
                  htmlFor={field.id}
                  className="text-sm leading-relaxed text-slate-600"
                >
                  {field.description || field.name}
                </label>
              </div>
            ) : (
              <Input
                type={
                  field.type === "email"
                    ? "email"
                    : field.type === "phone"
                      ? "tel"
                      : field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : field.type === "url"
                            ? "url"
                            : "text"
                }
                value={String(values[field.id] ?? "")}
                onChange={(e) =>
                  setValue(
                    field.id,
                    field.type === "number"
                      ? e.target.value
                        ? Number(e.target.value)
                        : null
                      : e.target.value
                  )
                }
                placeholder={field.description}
              />
            )}

            {errors[field.id] && (
              <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="mt-8 w-full sm:w-auto"
        style={{ backgroundColor: primaryColor }}
      >
        {form.submitButtonText || "Submit"}
      </Button>
    </form>
  );
}
