// =============================================================================
// DentalAppointmentFields — Campos odontológicos en formulario de citas
// =============================================================================
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  ScrollArea,
  Separator,
} from "@red-salud/ui";
import { 
  AlertCircle, 
  Droplet, 
  Package, 
  DollarSign,
  Armchair,
  Activity,
  Syringe
} from "lucide-react";

import type { 
  DentalChair, 
  DentalProcedureCatalog, 
  DentalAppointmentDetails,
  SurfaceCode 
} from "@/types/dental";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DentalAppointmentFieldsProps {
  officeId: string;
  value: Partial<DentalAppointmentDetails>;
  onChange: (details: Partial<DentalAppointmentDetails>) => void;
}

const SURFACE_OPTIONS: { value: SurfaceCode; label: string }[] = [
  { value: "M", label: "Mesial" },
  { value: "D", label: "Distal" },
  { value: "O", label: "Oclusal" },
  { value: "B", label: "Bucal" },
  { value: "L", label: "Lingual" },
  { value: "I", label: "Incisal" },
];

const ANESTHESIA_TYPES = [
  "Tópica",
  "Infiltrativa",
  "Troncular",
  "Intrapulpar",
  "Intraligamentaria",
  "Otra"
];

const SEDATION_TYPES = [
  "Óxido Nitroso",
  "Midazolam Oral",
  "Sedación IV",
  "Anestesia General"
];

// ─── Component ────────────────────────────────────────────────────────────────
export function DentalAppointmentFields({ officeId, value, onChange }: DentalAppointmentFieldsProps) {
  const supabase = createClientComponentClient();
  
  const [chairs, setChairs] = useState<DentalChair[]>([]);
  const [procedures, setProcedures] = useState<DentalProcedureCatalog[]>([]);
  const [loadingChairs, setLoadingChairs] = useState(true);
  const [loadingProcedures, setLoadingProcedures] = useState(true);
  const [toothInput, setToothInput] = useState("");

  // ─── Load Chairs ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadChairs() {
      setLoadingChairs(true);
      const { data, error } = await supabase
        .from("dental_chairs")
        .select("*")
        .eq("office_id", officeId)
        .eq("is_active", true)
        .order("number");

      if (error) {
        console.error("Error loading chairs:", error);
      } else {
        setChairs(data || []);
      }
      setLoadingChairs(false);
    }
    if (officeId) loadChairs();
  }, [officeId, supabase]);

  // ─── Load Procedures ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProcedures() {
      setLoadingProcedures(true);
      const { data, error } = await supabase
        .from("dental_procedure_catalog")
        .select("*")
        .eq("is_active", true)
        .order("category, name");

      if (error) {
        console.error("Error loading procedures:", error);
      } else {
        setProcedures(data || []);
      }
      setLoadingProcedures(false);
    }
    loadProcedures();
  }, [supabase]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const updateField = <K extends keyof DentalAppointmentDetails>(
    field: K,
    fieldValue: DentalAppointmentDetails[K]
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleProcedureChange = (code: string) => {
    const procedure = procedures.find((p) => p.code === code);
    if (procedure) {
      onChange({
        ...value,
        procedureCode: code,
        procedureName: procedure.name,
        requiresAnesthesia: procedure.requiresAnesthesia,
        materialsNeeded: procedure.typicalMaterials || [],
        estimatedCost: (procedure.typicalCostMin + procedure.typicalCostMax) / 2,
      });
    }
  };

  const addTooth = () => {
    const tooth = parseInt(toothInput);
    if (tooth >= 11 && tooth <= 48 && !value.toothNumbers?.includes(tooth)) {
      updateField("toothNumbers", [...(value.toothNumbers || []), tooth]);
      setToothInput("");
    }
  };

  const removeTooth = (tooth: number) => {
    updateField(
      "toothNumbers",
      (value.toothNumbers || []).filter((t) => t !== tooth)
    );
  };

  const toggleSurface = (surface: SurfaceCode) => {
    const surfaces = value.surfaces || [];
    if (surfaces.includes(surface)) {
      updateField("surfaces", surfaces.filter((s) => s !== surface));
    } else {
      updateField("surfaces", [...surfaces, surface]);
    }
  };

  const toggleMaterial = (material: string) => {
    const materials = value.materialsNeeded || [];
    if (materials.includes(material)) {
      updateField("materialsNeeded", materials.filter((m) => m !== material));
    } else {
      updateField("materialsNeeded", [...materials, material]);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Silla y Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Armchair className="h-4 w-4" />
            Silla y Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chair">Silla Dental</Label>
            <Select
              value={value.chairId || ""}
              onValueChange={(v: string) => updateField("chairId", v || undefined)}
              disabled={loadingChairs}
            >
              <SelectTrigger id="chair">
                <SelectValue placeholder="Seleccionar silla..." />
              </SelectTrigger>
              <SelectContent>
                {chairs.map((chair) => (
                  <SelectItem key={chair.id} value={chair.id}>
                    Silla {chair.number} — {chair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Procedimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Procedimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="procedure">Procedimiento</Label>
            <Select
              value={value.procedureCode || ""}
              onValueChange={handleProcedureChange}
              disabled={loadingProcedures}
            >
              <SelectTrigger id="procedure">
                <SelectValue placeholder="Seleccionar procedimiento..." />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[300px]">
                  {procedures.map((proc) => (
                    <SelectItem key={proc.id} value={proc.code}>
                      <div className="flex flex-col">
                        <span className="font-medium">{proc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {proc.category} • {proc.defaultDuration} min • $
                          {proc.typicalCostMin}-{proc.typicalCostMax}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {value.procedureCode && (
            <>
              <Separator />
              
              {/* Dientes */}
              <div>
                <Label>Dientes (FDI)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    min={11}
                    max={48}
                    value={toothInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToothInput(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && addTooth()}
                    placeholder="11-48"
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={addTooth}
                    className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Agregar
                  </button>
                </div>
                {value.toothNumbers && value.toothNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {value.toothNumbers.map((tooth) => (
                      <Badge key={tooth} variant="secondary" className="gap-1">
                        Diente {tooth}
                        <button
                          type="button"
                          onClick={() => removeTooth(tooth)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Superficies */}
              <div>
                <Label>Superficies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SURFACE_OPTIONS.map((surf) => (
                    <label
                      key={surf.value}
                      className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={value.surfaces?.includes(surf.value) || false}
                        onCheckedChange={() => toggleSurface(surf.value)}
                      />
                      <span className="text-sm">{surf.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuadrante */}
              <div>
                <Label htmlFor="quadrant">Cuadrante (opcional)</Label>
                <Select
                  value={value.quadrant?.toString() || ""}
                  onValueChange={(v: string) =>
                    updateField("quadrant", v ? (parseInt(v) as 1 | 2 | 3 | 4) : undefined)
                  }
                >
                  <SelectTrigger id="quadrant">
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cuadrante 1 (Superior Derecho)</SelectItem>
                    <SelectItem value="2">Cuadrante 2 (Superior Izquierdo)</SelectItem>
                    <SelectItem value="3">Cuadrante 3 (Inferior Izquierdo)</SelectItem>
                    <SelectItem value="4">Cuadrante 4 (Inferior Derecho)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Anestesia y Sedación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Syringe className="h-4 w-4" />
            Anestesia y Sedación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={value.requiresAnesthesia || false}
              onCheckedChange={(checked: boolean) =>
                updateField("requiresAnesthesia", checked === true)
              }
            />
            <span className="text-sm">Requiere anestesia</span>
          </label>

          {value.requiresAnesthesia && (
            <div>
              <Label htmlFor="anesthesia-type">Tipo de anestesia</Label>
              <Select
                value={value.anesthesiaType || ""}
                onValueChange={(v: string) => updateField("anesthesiaType", v || undefined)}
              >
                <SelectTrigger id="anesthesia-type">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {ANESTHESIA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          <label className="flex items-center gap-2">
            <Checkbox
              checked={value.requiresSedation || false}
              onCheckedChange={(checked: boolean) =>
                updateField("requiresSedation", checked === true)
              }
            />
            <span className="text-sm">Requiere sedación</span>
          </label>

          {value.requiresSedation && (
            <div>
              <Label htmlFor="sedation-type">Tipo de sedación</Label>
              <Select
                value={value.sedationType || ""}
                onValueChange={(v: string) => updateField("sedationType", v || undefined)}
              >
                <SelectTrigger id="sedation-type">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {SEDATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materiales */}
      {value.procedureCode && value.materialsNeeded && value.materialsNeeded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Materiales
            </CardTitle>
            <CardDescription>
              Materiales típicos para este procedimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {value.materialsNeeded.map((material) => (
              <label key={material} className="flex items-center gap-2">
                <Checkbox
                  checked={true}
                  onCheckedChange={() => toggleMaterial(material)}
                />
                <span className="text-sm">{material}</span>
              </label>
            ))}
            
            <Separator className="my-3" />
            
            <label className="flex items-center gap-2">
              <Checkbox
                checked={value.materialsPrepared || false}
                onCheckedChange={(checked: boolean) =>
                  updateField("materialsPrepared", checked === true)
                }
              />
              <span className="text-sm font-medium">Materiales preparados</span>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Costo Estimado */}
      {value.procedureCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Costo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="cost">Costo (USD)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min={0}
                value={value.estimatedCost || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField(
                    "estimatedCost",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas Clínicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4" />
            Notas Clínicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="preop">Notas Pre-operatorias</Label>
            <Textarea
              id="preop"
              value={value.preopNotes || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("preopNotes", e.target.value)}
              placeholder="Alergias, consideraciones especiales, medicación previa..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
