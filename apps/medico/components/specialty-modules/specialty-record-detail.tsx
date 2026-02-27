"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Trash2, Loader2, Clock } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import type { ModuleSchema, DetailSectionDef } from "@/lib/specialties/modules/module-schema";

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyRecordDetailProps {
  schema: ModuleSchema;
  record: Record<string, unknown>;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack: () => void;
  isDeleting?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Resolve the display title for a record: first column value or record ID. */
function resolveRecordTitle(
  schema: ModuleSchema,
  record: Record<string, unknown>,
): string {
  // Try the first visible column value
  const firstCol = schema.columns.find((c) => !c.hidden);
  if (firstCol) {
    const val = record[firstCol.key];
    if (val != null && String(val).trim() !== "") {
      return String(val);
    }
  }
  // Fallback to record id
  if (record.id != null) {
    return `#${record.id}`;
  }
  return schema.labels.singular;
}

/** Format a timestamp for display. */
function fmtTimestamp(value: unknown): string {
  if (value == null) return "—";
  try {
    return new Date(value as string).toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Format a field value using optional format function, with null-safety. */
function renderFieldValue(
  value: unknown,
  format?: (value: unknown) => string,
): string {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return "—";
  }
  if (format) {
    try {
      return format(value);
    } catch {
      return String(value);
    }
  }
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  return String(value);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Renders a single detail section as a Card. */
function DetailSection({
  section,
  record,
}: {
  section: DetailSectionDef;
  record: Record<string, unknown>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {section.fields.map((field) => (
            <div
              key={field.key}
              className={cn(
                "space-y-1",
                field.colSpan === 2 && "col-span-2",
              )}
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {field.label}
              </dt>
              <dd className="text-sm">
                {renderFieldValue(record[field.key], field.format)}
              </dd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Inline delete confirmation bar. */
function DeleteConfirmation({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3">
      <span className="text-sm font-medium text-destructive">
        ¿Estás seguro?
      </span>
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Eliminando…
            </>
          ) : (
            "Confirmar"
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SpecialtyRecordDetail({
  schema,
  record,
  onEdit,
  onDelete,
  onBack,
  isDeleting = false,
}: SpecialtyRecordDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const title = resolveRecordTitle(schema, record);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} disabled={isDeleting}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {schema.labels.singular}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isDeleting}
            >
              <Edit className="mr-2 h-4 w-4" />
              {schema.labels.edit}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting || showDeleteConfirm}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {schema.labels.delete}
            </Button>
          )}
        </div>
      </div>

      {/* ── Delete confirmation ────────────────────────────────────── */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}

      {/* ── Detail sections ────────────────────────────────────────── */}
      {schema.detailSections.map((section) => (
        <DetailSection
          key={section.title}
          section={section}
          record={record}
        />
      ))}

      {/* ── Metadata footer ────────────────────────────────────────── */}
      {(record.created_at != null || record.updated_at != null) && (
        <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
          {record.created_at != null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Creado: {fmtTimestamp(record.created_at)}</span>
            </div>
          )}
          {record.updated_at != null && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>Actualizado: {fmtTimestamp(record.updated_at)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
