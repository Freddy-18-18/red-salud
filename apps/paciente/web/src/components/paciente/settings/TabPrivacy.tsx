"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@red-salud/design-system";
import { Loader2, Save, Download, Trash2, Eye, AlertTriangle } from "lucide-react";

import type { PrivacySettings } from "@/hooks/paciente/useSettings";

interface TabPrivacyProps {
  privacy: PrivacySettings;
  setPrivacy: (privacy: PrivacySettings) => void;
  saving: boolean;
  onSave: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

const VISIBILITY_OPTIONS = [
  { value: "solo_yo", label: "Solo yo" },
  { value: "mis_doctores", label: "Mis doctores" },
  { value: "cualquier_doctor", label: "Cualquier doctor" },
];

export function TabPrivacy({
  privacy,
  setPrivacy,
  saving,
  onSave,
  onExportData,
  onDeleteAccount,
}: TabPrivacyProps) {
  return (
    <div className="space-y-6">
      {/* Privacy controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Control de privacidad
          </CardTitle>
          <CardDescription>
            Decide quien puede ver tu informacion en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Historial visibility */}
          <div className="space-y-2">
            <Label>Quien puede ver mi historial medico</Label>
            <Select
              value={privacy.historial_visibilidad}
              onValueChange={(value) =>
                setPrivacy({
                  ...privacy,
                  historial_visibilidad: value as PrivacySettings["historial_visibilidad"],
                })
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Controla el acceso a tus consultas, diagnosticos y recetas
            </p>
          </div>

          {/* Auto share */}
          <div className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))]">
            <div className="space-y-0.5">
              <Label>Compartir datos con nuevos doctores automaticamente</Label>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Cuando agendes con un doctor nuevo, compartir tu historial automaticamente
              </p>
            </div>
            <Switch
              checked={privacy.compartir_datos_auto}
              onCheckedChange={(checked) =>
                setPrivacy({ ...privacy, compartir_datos_auto: checked })
              }
            />
          </div>

          {/* Find by name */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <Label>Permitir que me encuentren por nombre</Label>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Otros usuarios podran buscarte por nombre en la plataforma
              </p>
            </div>
            <Switch
              checked={privacy.encontrar_por_nombre}
              onCheckedChange={(checked) =>
                setPrivacy({ ...privacy, encontrar_por_nombre: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save privacy */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Data export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar mis datos
          </CardTitle>
          <CardDescription>
            Descarga toda tu informacion en formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Incluye tu perfil, historial medico, citas y mensajes. El archivo se descargara automaticamente.
              </p>
            </div>
            <Button onClick={onExportData} className="gap-2 shrink-0">
              <Download className="h-4 w-4" />
              Exportar datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Estas acciones son irreversibles. Procede con precaucion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Esta accion es irreversible. Tus datos seran eliminados permanentemente despues de 30 dias.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar mi cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar cuenta permanentemente</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion es irreversible. Se eliminaran todos tus datos personales,
                  historial medico, citas y mensajes. No podras recuperar esta informacion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Si, eliminar mi cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
