"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Calculator, Plus, Trash2, FileDown, Send, ArrowLeft,
  DollarSign, Percent, CheckCircle2, AlertCircle, Printer
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import Link from "next/link";
import type { TreatmentEstimate, TreatmentEstimateItem } from "@/types/dental";

// ─── CDT Procedure Catalog ──────────────────────────────────────────────────
const PROCEDURE_CATALOG: Array<{
  code: string;
  name: string;
  category: string;
  baseFee: number;
}> = [
  // Preventivo
  { code: "D0120", name: "Examen oral periódico", category: "Diagnóstico", baseFee: 25 },
  { code: "D0150", name: "Examen oral completo", category: "Diagnóstico", baseFee: 40 },
  { code: "D0210", name: "Radiografías serie completa", category: "Diagnóstico", baseFee: 80 },
  { code: "D0220", name: "Radiografía periapical", category: "Diagnóstico", baseFee: 15 },
  { code: "D0330", name: "Radiografía panorámica", category: "Diagnóstico", baseFee: 60 },
  { code: "D1110", name: "Profilaxis adulto", category: "Preventivo", baseFee: 50 },
  { code: "D1120", name: "Profilaxis niño", category: "Preventivo", baseFee: 35 },
  { code: "D1208", name: "Aplicación tópica de flúor", category: "Preventivo", baseFee: 20 },
  { code: "D1351", name: "Sellante por diente", category: "Preventivo", baseFee: 30 },
  // Restaurativo
  { code: "D2140", name: "Amalgama 1 superficie", category: "Restaurativo", baseFee: 60 },
  { code: "D2150", name: "Amalgama 2 superficies", category: "Restaurativo", baseFee: 80 },
  { code: "D2330", name: "Resina 1 superficie anterior", category: "Restaurativo", baseFee: 75 },
  { code: "D2331", name: "Resina 2 superficies anterior", category: "Restaurativo", baseFee: 95 },
  { code: "D2391", name: "Resina 1 superficie posterior", category: "Restaurativo", baseFee: 85 },
  { code: "D2392", name: "Resina 2 superficies posterior", category: "Restaurativo", baseFee: 110 },
  { code: "D2740", name: "Corona porcelana/cerámica", category: "Restaurativo", baseFee: 450 },
  { code: "D2750", name: "Corona porcelana/metal", category: "Restaurativo", baseFee: 400 },
  // Endodoncia
  { code: "D3310", name: "Endodoncia anterior", category: "Endodoncia", baseFee: 350 },
  { code: "D3320", name: "Endodoncia premolar", category: "Endodoncia", baseFee: 450 },
  { code: "D3330", name: "Endodoncia molar", category: "Endodoncia", baseFee: 600 },
  // Periodoncia
  { code: "D4341", name: "Raspado y alisado por cuadrante", category: "Periodoncia", baseFee: 120 },
  { code: "D4342", name: "Raspado y alisado 1-3 dientes", category: "Periodoncia", baseFee: 80 },
  { code: "D4910", name: "Mantenimiento periodontal", category: "Periodoncia", baseFee: 75 },
  // Cirugía
  { code: "D7140", name: "Extracción simple", category: "Cirugía", baseFee: 80 },
  { code: "D7210", name: "Extracción quirúrgica", category: "Cirugía", baseFee: 150 },
  { code: "D7240", name: "Extracción impactado tejido óseo", category: "Cirugía", baseFee: 280 },
  // Prótesis
  { code: "D5110", name: "Dentadura completa superior", category: "Prótesis", baseFee: 800 },
  { code: "D5120", name: "Dentadura completa inferior", category: "Prótesis", baseFee: 800 },
  { code: "D5213", name: "Parcial removible superior", category: "Prótesis", baseFee: 650 },
  { code: "D6010", name: "Implante endoóseo", category: "Implantes", baseFee: 1200 },
  { code: "D6058", name: "Corona sobre implante", category: "Implantes", baseFee: 600 },
  // Ortodoncia
  { code: "D8080", name: "Ortodoncia integral adolescente", category: "Ortodoncia", baseFee: 3500 },
  { code: "D8090", name: "Ortodoncia integral adulto", category: "Ortodoncia", baseFee: 4000 },
];

const CATEGORIES = [...new Set(PROCEDURE_CATALOG.map((p) => p.category))];

const CATEGORY_COLORS: Record<string, string> = {
  Diagnóstico: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Preventivo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Restaurativo: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Endodoncia: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Periodoncia: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  Cirugía: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Prótesis: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Implantes: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Ortodoncia: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
};

// ─── Estimator Page ──────────────────────────────────────────────────────────
export default function TreatmentEstimatorPage() {
  const [items, setItems] = useState<TreatmentEstimateItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [insuranceCoverage, setInsuranceCoverage] = useState(0); // percentage 0-100
  const [globalDiscount, setGlobalDiscount] = useState(0); // percentage 0-100
  const [showCatalog, setShowCatalog] = useState(false);
  const [notes, setNotes] = useState("");

  const filteredCatalog = useMemo(() => {
    return PROCEDURE_CATALOG.filter((p) => {
      const matchSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !selectedCategory || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, selectedCategory]);

  const addProcedure = (proc: typeof PROCEDURE_CATALOG[number]) => {
    const item: TreatmentEstimateItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      procedureCode: proc.code,
      procedureName: proc.name,
      toothNumber: undefined,
      quantity: 1,
      unitFee: proc.baseFee,
      discountPercent: globalDiscount,
      insuranceCoveragePercent: insuranceCoverage,
      patientResponsibility: 0,
      status: "proposed",
    };
    item.patientResponsibility = calcPatientCost(item);
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = useCallback((id: string, field: keyof TreatmentEstimateItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.patientResponsibility = calcPatientCost(updated);
        return updated;
      })
    );
  }, []);

  const calcPatientCost = (item: TreatmentEstimateItem): number => {
    const subtotal = item.unitFee * item.quantity;
    const discount = subtotal * ((item.discountPercent ?? 0) / 100);
    const afterDiscount = subtotal - discount;
    const insurance = afterDiscount * ((item.insuranceCoveragePercent ?? 0) / 100);
    return Math.round((afterDiscount - insurance) * 100) / 100;
  };

  // --- Summary ---
  const summary = useMemo(() => {
    const totalGross = items.reduce((s, i) => s + i.unitFee * i.quantity, 0);
    const totalDiscount = items.reduce((s, i) => s + i.unitFee * i.quantity * ((i.discountPercent ?? 0) / 100), 0);
    const totalInsurance = items.reduce((s, i) => {
      const afterDisc = i.unitFee * i.quantity * (1 - (i.discountPercent ?? 0) / 100);
      return s + afterDisc * ((i.insuranceCoveragePercent ?? 0) / 100);
    }, 0);
    const totalPatient = items.reduce((s, i) => s + (i.patientResponsibility ?? 0), 0);
    return { totalGross, totalDiscount, totalInsurance, totalPatient, count: items.length };
  }, [items]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/consultorio">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Estimador de Tratamiento
            </h1>
            <p className="text-sm text-muted-foreground">Crea presupuestos detallados para el paciente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
          <Button variant="outline" size="sm"><FileDown className="w-4 h-4 mr-1" />PDF</Button>
          <Button size="sm"><Send className="w-4 h-4 mr-1" />Enviar al Paciente</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient & Insurance */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Paciente</label>
                  <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nombre del paciente" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cobertura seguro (%)</label>
                  <Input type="number" min={0} max={100} value={insuranceCoverage} onChange={(e) => {
                    setInsuranceCoverage(Number(e.target.value));
                    setItems((prev) => prev.map((i) => {
                      const updated = { ...i, insuranceCoveragePercent: Number(e.target.value) };
                      updated.patientResponsibility = calcPatientCost(updated);
                      return updated;
                    }));
                  }} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Descuento global (%)</label>
                  <Input type="number" min={0} max={100} value={globalDiscount} onChange={(e) => {
                    setGlobalDiscount(Number(e.target.value));
                    setItems((prev) => prev.map((i) => {
                      const updated = { ...i, discountPercent: Number(e.target.value) };
                      updated.patientResponsibility = calcPatientCost(updated);
                      return updated;
                    }));
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Procedure */}
          <Button variant="outline" className="w-full" onClick={() => setShowCatalog(!showCatalog)}>
            <Plus className="w-4 h-4 mr-1" />
            {showCatalog ? "Cerrar Catálogo" : "Agregar Procedimiento"}
          </Button>

          {showCatalog && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o código CDT..."
                />
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todos
                  </Badge>
                  {CATEGORIES.map((c) => (
                    <Badge
                      key={c}
                      variant={selectedCategory === c ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y text-sm">
                  {filteredCatalog.map((proc) => (
                    <button
                      key={proc.code}
                      onClick={() => addProcedure(proc)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div>
                        <span className="font-mono text-xs text-muted-foreground mr-2">{proc.code}</span>
                        <span>{proc.name}</span>
                        <Badge variant="secondary" className={cn("ml-2 text-[10px]", CATEGORY_COLORS[proc.category])}>
                          {proc.category}
                        </Badge>
                      </div>
                      <span className="font-semibold">${proc.baseFee}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Procedure Items */}
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No hay procedimientos agregados.</p>
                <p className="text-xs">Use el catálogo para agregar tratamientos al presupuesto.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{idx + 1}.</span>
                          <Badge variant="secondary" className={cn("text-[10px]", CATEGORY_COLORS[PROCEDURE_CATALOG.find((p) => p.code === item.procedureCode)?.category || ""])}>
                            {item.procedureCode}
                          </Badge>
                          <span className="text-sm font-medium">{item.procedureName}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div className="space-y-0.5">
                            <label className="text-muted-foreground">Diente</label>
                            <Input
                              className="h-7 text-xs"
                              type="number" min={11} max={85}
                              value={item.toothNumber || ""}
                              onChange={(e) => updateItem(item.id, "toothNumber", e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="FDI"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-muted-foreground">Cantidad</label>
                            <Input
                              className="h-7 text-xs"
                              type="number" min={1} max={99}
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-muted-foreground">Precio unitario</label>
                            <Input
                              className="h-7 text-xs"
                              type="number" min={0} step={0.01}
                              value={item.unitFee}
                              onChange={(e) => updateItem(item.id, "unitFee", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-muted-foreground">Desc. %</label>
                            <Input
                              className="h-7 text-xs"
                              type="number" min={0} max={100}
                              value={item.discountPercent}
                              onChange={(e) => updateItem(item.id, "discountPercent", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-muted-foreground">Paciente paga</label>
                            <div className="h-7 flex items-center font-semibold text-primary">
                              ${(item.patientResponsibility ?? 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Notes */}
          {items.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales para el paciente o para referencia interna..."
                  rows={3}
                  className="w-full border rounded-lg p-2 text-sm bg-background mt-1 resize-y focus:outline-primary"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumen del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow label="Procedimientos" value={`${summary.count}`} />
              <SummaryRow label="Subtotal" value={`$${summary.totalGross.toFixed(2)}`} />
              {summary.totalDiscount > 0 && (
                <SummaryRow label="Descuento" value={`-$${summary.totalDiscount.toFixed(2)}`} className="text-green-600" icon={<Percent className="w-3 h-3" />} />
              )}
              {summary.totalInsurance > 0 && (
                <SummaryRow label="Seguro cubre" value={`-$${summary.totalInsurance.toFixed(2)}`} className="text-blue-600" icon={<CheckCircle2 className="w-3 h-3" />} />
              )}
              <div className="border-t pt-3 mt-3">
                <SummaryRow
                  label="Paciente paga"
                  value={`$${summary.totalPatient.toFixed(2)}`}
                  bold
                  icon={<DollarSign className="w-4 h-4" />}
                />
              </div>

              {insuranceCoverage > 0 && (
                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  Cobertura sujeta a verificación con la aseguradora.
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Category */}
          {items.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Desglose por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(
                  items.reduce<Record<string, number>>((acc, item) => {
                    const cat = PROCEDURE_CATALOG.find((p) => p.code === item.procedureCode)?.category || "Otro";
                    acc[cat] = (acc[cat] || 0) + item.unitFee * item.quantity;
                    return acc;
                  }, {})
                ).map(([cat, total]) => (
                  <div key={cat} className="flex items-center justify-between py-1 text-sm">
                    <Badge variant="secondary" className={cn("text-[10px]", CATEGORY_COLORS[cat])}>{cat}</Badge>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Plan Hint */}
          {summary.totalPatient > 500 && (
            <Card className="border-amber-300">
              <CardContent className="pt-4 text-sm space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  Plan de pagos sugerido
                </p>
                <p className="text-muted-foreground text-xs">
                  Monto total: ${summary.totalPatient.toFixed(2)}
                </p>
                <div className="space-y-0.5 text-xs">
                  <p>3 cuotas: <strong>${(summary.totalPatient / 3).toFixed(2)}</strong>/mes</p>
                  <p>6 cuotas: <strong>${(summary.totalPatient / 6).toFixed(2)}</strong>/mes</p>
                  <p>12 cuotas: <strong>${(summary.totalPatient / 12).toFixed(2)}</strong>/mes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, className, bold, icon,
}: {
  label: string;
  value: string;
  className?: string;
  bold?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between text-sm", className, bold && "text-base font-bold")}>
      <span className="flex items-center gap-1">{icon}{label}</span>
      <span>{value}</span>
    </div>
  );
}
