'use client';

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  File as FileIcon,
  FileImage,
  FileText,
  Paperclip,
  Upload,
  X,
} from 'lucide-react';
import { Button, Label } from '@red-salud/design-system';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface AttachmentsFieldProps {
  value: File[];
  onChange: (next: File[]) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime === 'application/pdf') return FileText;
  return FileIcon;
}

/**
 * Maneja archivos LOCALMENTE (File[]) hasta que se crea la cita. El upload
 * real ocurre POST-INSERT desde el page principal, llamando a
 * /api/appointments/[id]/attachments con FormData por cada archivo.
 *
 * Diseñado así porque appointments.id solo existe después del INSERT.
 */
export function AttachmentsField({ value, onChange }: AttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(newFiles);
      const errors: string[] = [];
      const accepted: File[] = [];

      for (const f of incoming) {
        if (value.length + accepted.length >= MAX_FILES) {
          errors.push(`Máximo ${MAX_FILES} archivos.`);
          break;
        }
        if (f.size > MAX_BYTES) {
          errors.push(`"${f.name}" supera 10MB.`);
          continue;
        }
        if (!ALLOWED_MIME.includes(f.type)) {
          errors.push(`"${f.name}" tiene formato no permitido.`);
          continue;
        }
        accepted.push(f);
      }

      if (accepted.length > 0) onChange([...value, ...accepted]);
      if (errors.length > 0) setError(errors.join(' '));
    },
    [value, onChange],
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ''; // permite re-seleccionar el mismo file
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const remaining = MAX_FILES - value.length;
  const canAddMore = remaining > 0;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Archivos adjuntos (opcional)</Label>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/20 hover:border-border-strong'
        } ${!canAddMore ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Arrastrá archivos
          </span>{' '}
          o
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddMore}
          className="h-7"
        >
          <Paperclip className="mr-1 h-3.5 w-3.5" />
          Elegir archivos
        </Button>
        <p className="mt-1 text-[10px] text-muted-foreground">
          JPG, PNG, WEBP, PDF, DOC, DOCX · max 10MB c/u · {remaining} restante{remaining !== 1 ? 's' : ''}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_MIME.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}

      {/* Lista de archivos */}
      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((f, idx) => {
            const Icon = iconFor(f.type);
            return (
              <li
                key={`${f.name}-${idx}`}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5"
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(f.size)} · {f.type.split('/')[1]?.toUpperCase() ?? '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  aria-label={`Eliminar ${f.name}`}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Sube los archivos secuencialmente a `/api/appointments/{appointmentId}/attachments`.
 * Llamar DESPUÉS de crear la cita. Retorna error si algún upload falla,
 * pero NO revierte los exitosos (best-effort).
 */
export async function uploadAttachments(
  appointmentId: string,
  files: File[],
): Promise<{ uploaded: number; failed: string[] }> {
  const failed: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/appointments/${appointmentId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        failed.push(`${file.name}: ${json?.message ?? 'falló upload'}`);
      } else {
        uploaded++;
      }
    } catch (err) {
      failed.push(`${file.name}: ${(err as Error).message}`);
    }
  }

  return { uploaded, failed };
}
