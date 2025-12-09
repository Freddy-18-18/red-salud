"use client";

import { useRouter } from "next/navigation";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AppointmentFormValues } from "@/lib/validations/appointment";

interface PatientSelectorProps {
  patients: any[];
  loadingPatients: boolean;
  // Optional props for standalone use (without react-hook-form)
  selectedPatientId?: string;
  onPatientSelect?: (patientId: string) => void;
}

export function PatientSelector({
  patients,
  loadingPatients,
  selectedPatientId,
  onPatientSelect,
}: PatientSelectorProps) {
  const router = useRouter();

  // Check if we're in standalone mode (props provided instead of form context)
  const isStandaloneMode = selectedPatientId !== undefined && onPatientSelect !== undefined;

  // Try to get form context only if not in standalone mode
  let formContext: ReturnType<typeof useFormContext<AppointmentFormValues>> | null = null;
  if (!isStandaloneMode) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      formContext = useFormContext<AppointmentFormValues>();
    } catch {
      // Not in a FormProvider context
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Paciente <span className="text-red-500">*</span>
            </Label>
            {loadingPatients ? (
              <div className="flex items-center gap-2 text-gray-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando pacientes...</span>
              </div>
            ) : isStandaloneMode ? (
              // Standalone mode - no react-hook-form
              <SearchableSelect
                options={patients.map((patient): SearchableSelectOption => ({
                  value: patient.id,
                  label: patient.nombre_completo,
                  badge: patient.type === "offline" ? patient.cedula : undefined,
                  subtitle: patient.email || undefined,
                }))}
                value={selectedPatientId || ""}
                onValueChange={(value) => onPatientSelect?.(value)}
                placeholder="Selecciona un paciente"
                searchPlaceholder="Buscar por nombre..."
                emptyMessage="No se encontró ningún paciente"
              />
            ) : formContext ? (
              // React Hook Form mode
              <FormField
                control={formContext.control}
                name="paciente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableSelect
                        options={patients.map((patient): SearchableSelectOption => ({
                          value: patient.id,
                          label: patient.nombre_completo,
                          badge: patient.type === "offline" ? patient.cedula : undefined,
                          subtitle: patient.email || undefined,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona un paciente"
                        searchPlaceholder="Buscar por nombre..."
                        emptyMessage="No se encontró ningún paciente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <p className="text-sm text-red-500">Error: No form context available</p>
            )}
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-700 mb-2">
              ¿No encuentras al paciente?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-sm"
              onClick={() => router.push("/dashboard/medico/pacientes/nuevo/simple?from=cita")}
            >
              <User className="h-4 w-4 mr-2" />
              Registrar Nuevo Paciente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
