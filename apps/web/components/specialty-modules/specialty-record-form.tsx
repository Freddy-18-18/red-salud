"use client";

import { useState, useCallback, type FormEvent } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import type { ModuleSchema, FormFieldDef } from "@/lib/specialties/modules/module-schema";

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyRecordFormProps {
  schema: ModuleSchema;
  initialData?: Record<string, unknown>;
  isEdit?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Build initial form values from schema defaults + optional pre-fill data. */
function buildInitialValues(
  fields: FormFieldDef[],
  initialData?: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (initialData && field.key in initialData) {
      values[field.key] = initialData[field.key];
    } else if (field.defaultValue !== undefined) {
      values[field.key] = field.defaultValue;
    } else {
      values[field.key] = field.type === "boolean" ? false : "";
    }
  }
  return values;
}

/** Validate required fields and basic constraints. Returns a map of field key → error message. */
function validateForm(
  fields: FormFieldDef[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (field.type === "hidden") continue;

    const value = values[field.key];

    // Required check
    if (field.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "");
      if (isEmpty) {
        errors[field.key] = field.validation?.message ?? "Este campo es requerido";
        continue;
      }
    }

    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === "") continue;

    // Number range validation
    if (field.type === "number" && field.validation) {
      const num = Number(value);
      if (field.validation.min !== undefined && num < field.validation.min) {
        errors[field.key] = `El valor mínimo es ${field.validation.min}`;
      } else if (field.validation.max !== undefined && num > field.validation.max) {
        errors[field.key] = `El valor máximo es ${field.validation.max}`;
      }
    }

    // Pattern validation
    if (field.validation?.pattern && typeof value === "string") {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        errors[field.key] = field.validation.message ?? "Formato inválido";
      }
    }
  }

  return errors;
}

// ============================================================================
// FIELD RENDERER
// ============================================================================

interface FieldRendererProps {
  field: FormFieldDef;
  value: unknown;
  error?: string;
  onChange: (key: string, value: unknown) => void;
}

function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
  const id = `field-${field.key}`;
  const hasError = !!error;

  // Hidden fields
  if (field.type === "hidden") {
    return <input type="hidden" name={field.key} value={String(value ?? "")} />;
  }

  return (
    <div className={cn("space-y-1.5", field.colSpan === 2 ? "col-span-2" : "col-span-1")}>
      <Label htmlFor={id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {/* ---- text ---- */}
      {field.type === "text" && (
        <Input
          id={id}
          type="text"
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
        />
      )}

      {/* ---- textarea ---- */}
      {field.type === "textarea" && (
        <textarea
          id={id}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={4}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y min-h-[80px]",
            hasError && "border-destructive focus-visible:ring-destructive",
          )}
        />
      )}

      {/* ---- number ---- */}
      {field.type === "number" && (
        <Input
          id={id}
          type="number"
          placeholder={field.placeholder}
          value={value === "" || value === undefined || value === null ? "" : String(value)}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(field.key, raw === "" ? "" : Number(raw));
          }}
          className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
        />
      )}

      {/* ---- date ---- */}
      {field.type === "date" && (
        <Input
          id={id}
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
        />
      )}

      {/* ---- select ---- */}
      {field.type === "select" && (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <option value="">{field.placeholder ?? "Seleccionar..."}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* ---- boolean (checkbox) ---- */}
      {field.type === "boolean" && (
        <div className="flex items-center gap-2 pt-1">
          <input
            id={id}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
            {field.placeholder ?? field.label}
          </Label>
        </div>
      )}

      {/* ---- badge (read-only) ---- */}
      {field.type === "badge" && (
        <Badge variant="secondary" className="mt-1">
          {String(value ?? "—")}
        </Badge>
      )}

      {/* Help text */}
      {field.helpText && !hasError && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}

      {/* Error message */}
      {hasError && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpecialtyRecordForm({
  schema,
  initialData,
  isEdit = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: SpecialtyRecordFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    buildInitialValues(schema.formFields, initialData),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(schema.formFields, formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      onSubmit(formData);
    },
    [schema.formFields, formData, onSubmit],
  );

  const title = isEdit ? schema.labels.edit : schema.labels.create;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          {/* Form fields grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {schema.formFields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={formData[field.key]}
                error={errors[field.key]}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Guardando…
                </span>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  {isEdit ? "Guardar cambios" : "Crear registro"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export type { SpecialtyRecordFormProps };
