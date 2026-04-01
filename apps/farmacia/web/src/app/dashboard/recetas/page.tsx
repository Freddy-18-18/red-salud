"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Pill,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Printer,
  Eye,
  User,
  Stethoscope,
  Hash,
  AlertCircle,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@red-salud/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@red-salud/design-system";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@red-salud/design-system";
import {
  type Prescription,
  type PrescriptionMedication,
  fetchPrescriptions,
  dispensePrescription,
  cancelPrescription,
} from "@/lib/services/prescription-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateVE(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function truncateId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

function getStatusInfo(
  status: string,
  expiryDate: string
): { label: string; color: string } {
  if (status === "pending" && isExpired(expiryDate)) {
    return {
      label: "Expirada",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
  }

  switch (status) {
    case "pending":
      return {
        label: "Activa",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      };
    case "dispensed":
      return {
        label: "Dispensada",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
    case "cancelled":
      return {
        label: "Cancelada",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ---------------------------------------------------------------------------
// Medication Detail Row
// ---------------------------------------------------------------------------

function MedicationRow({ med }: { med: PrescriptionMedication }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
      <div className="flex-1">
        <p className="font-medium text-sm">
          {med.product?.name || med.product?.generic_name || "Medicamento"}
        </p>
        <p className="text-xs text-muted-foreground">
          {[med.product?.presentation, med.dosage, med.frequency, med.duration]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>
      <div className="text-right text-sm">
        <p>
          Qty: <span className="font-medium">{med.quantity}</span>
        </p>
        {med.dispensed_quantity > 0 && (
          <p className="text-xs text-muted-foreground">
            Dispensado: {med.dispensed_quantity}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Dialog
// ---------------------------------------------------------------------------

function PrescriptionDetailDialog({
  prescription,
  open,
  onClose,
}: {
  prescription: Prescription | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!prescription) return null;
  const statusInfo = getStatusInfo(prescription.status, prescription.expiry_date);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receta #{prescription.prescription_number || truncateId(prescription.id)}
          </DialogTitle>
          <DialogDescription>
            Detalles completos de la receta medica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Dates */}
          <div className="flex flex-wrap gap-3 items-center">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Emitida: {formatDateVE(prescription.issue_date)}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Vence: {formatDateVE(prescription.expiry_date)}
            </span>
          </div>

          {/* Doctor & Patient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Medico</span>
                </div>
                <p className="font-semibold">{prescription.doctor_name}</p>
                <p className="text-xs text-muted-foreground">
                  Lic. {prescription.doctor_license}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Paciente</span>
                </div>
                <p className="font-semibold">
                  {prescription.patient?.full_name || "No registrado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {prescription.patient?.email || ""}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Medications */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medicamentos ({prescription.prescription_items?.length || 0})
            </h4>
            <div className="space-y-2">
              {prescription.prescription_items?.map((med) => (
                <MedicationRow key={med.id} med={med} />
              ))}
              {(!prescription.prescription_items ||
                prescription.prescription_items.length === 0) && (
                <p className="text-sm text-muted-foreground py-2">
                  No hay medicamentos registrados
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Notas</h4>
              <p className="text-sm text-muted-foreground">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RecetasPage() {
  const [loading, setLoading] = useState(true);
  const [recetas, setRecetas] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailPrescription, setDetailPrescription] =
    useState<Prescription | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ------ Data loading ------

  const loadRecetas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPrescriptions({
        status: selectedStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchTerm || undefined,
      });
      setRecetas(data);
    } catch (error) {
      console.error("Error cargando recetas:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, dateFrom, dateTo, searchTerm]);

  useEffect(() => {
    loadRecetas();
  }, [loadRecetas]);

  // ------ Actions ------

  const handleDispense = async (id: string) => {
    if (!confirm("Confirmar dispensar esta receta?")) return;
    setActionLoading(id);
    const success = await dispensePrescription(id);
    setActionLoading(null);
    if (success) {
      loadRecetas();
    } else {
      alert("Error al dispensar la receta");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Estas seguro de cancelar esta receta?")) return;
    setActionLoading(id);
    const success = await cancelPrescription(id);
    setActionLoading(null);
    if (success) {
      loadRecetas();
    } else {
      alert("Error al cancelar la receta");
    }
  };

  const handlePrint = (prescription: Prescription) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const meds =
      prescription.prescription_items
        ?.map(
          (m) =>
            `<tr>
              <td style="padding:6px;border:1px solid #ddd">${m.product?.name || "—"}</td>
              <td style="padding:6px;border:1px solid #ddd">${m.dosage || "—"}</td>
              <td style="padding:6px;border:1px solid #ddd">${m.frequency || "—"}</td>
              <td style="padding:6px;border:1px solid #ddd">${m.duration || "—"}</td>
              <td style="padding:6px;border:1px solid #ddd;text-align:center">${m.quantity}</td>
            </tr>`
        )
        .join("") || "";

    printWindow.document.write(`
      <html><head><title>Receta ${prescription.prescription_number || truncateId(prescription.id)}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
      h1{font-size:18px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th{background:#f5f5f5;padding:8px;border:1px solid #ddd;text-align:left}
      .header{display:flex;justify-content:space-between;margin-bottom:20px}
      .info{margin-bottom:12px;font-size:14px}</style></head><body>
      <h1>Receta Medica</h1>
      <p style="color:#666;margin-bottom:20px">#${prescription.prescription_number || truncateId(prescription.id)}</p>
      <div class="info"><strong>Medico:</strong> ${prescription.doctor_name} | Lic. ${prescription.doctor_license}</div>
      <div class="info"><strong>Paciente:</strong> ${prescription.patient?.full_name || "N/A"}</div>
      <div class="info"><strong>Fecha:</strong> ${formatDateVE(prescription.issue_date)} | <strong>Vence:</strong> ${formatDateVE(prescription.expiry_date)}</div>
      ${prescription.notes ? `<div class="info"><strong>Notas:</strong> ${prescription.notes}</div>` : ""}
      <table><thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duracion</th><th>Cantidad</th></tr></thead>
      <tbody>${meds}</tbody></table>
      <script>window.print();</script></body></html>
    `);
    printWindow.document.close();
  };

  // ------ Stats ------

  const totalActive = recetas.filter(
    (r) => r.status === "pending" && !isExpired(r.expiry_date)
  ).length;
  const totalDispensed = recetas.filter(
    (r) => r.status === "dispensed"
  ).length;
  const totalExpired = recetas.filter(
    (r) => r.status === "pending" && isExpired(r.expiry_date)
  ).length;

  // ------ Render ------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Recetas Medicas</h1>
              <p className="text-muted-foreground">
                Gestion y dispensacion de recetas medicas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalActive}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dispensadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalDispensed}
                  </p>
                </div>
                <Pill className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiradas</p>
                  <p className="text-2xl font-bold text-gray-500">
                    {totalExpired}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por medico o numero de receta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Activa</option>
                <option value="dispensed">Dispensada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Desde"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="Hasta"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {recetas.length} receta{recetas.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recetas.length === 0 ? (
              <div className="text-center py-16">
                <Pill className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay recetas pendientes
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Las recetas apareceran aqui cuando un medico las envie a tu
                  farmacia.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Receta</TableHead>
                      <TableHead>Medico</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vence</TableHead>
                      <TableHead>Meds</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recetas.map((receta) => {
                      const statusInfo = getStatusInfo(
                        receta.status,
                        receta.expiry_date
                      );
                      const isExpanded = expandedId === receta.id;
                      const medsCount =
                        receta.prescription_items?.length || 0;

                      return (
                        <>
                          <TableRow
                            key={receta.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : receta.id)
                            }
                          >
                            <TableCell>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-mono text-sm font-medium">
                                  {receta.prescription_number ||
                                    truncateId(receta.id)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {receta.doctor_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Lic. {receta.doctor_license}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {receta.patient?.full_name || "No registrado"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {formatDateVE(receta.issue_date)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-sm ${
                                  isExpired(receta.expiry_date)
                                    ? "text-red-500 font-medium"
                                    : ""
                                }`}
                              >
                                {formatDateVE(receta.expiry_date)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{medsCount}</Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div
                                className="flex justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Ver detalles"
                                  onClick={() =>
                                    setDetailPrescription(receta)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Imprimir"
                                  onClick={() => handlePrint(receta)}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {receta.status === "pending" &&
                                  !isExpired(receta.expiry_date) && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Dispensar"
                                        disabled={actionLoading === receta.id}
                                        onClick={() =>
                                          handleDispense(receta.id)
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Cancelar"
                                        disabled={actionLoading === receta.id}
                                        onClick={() =>
                                          handleCancel(receta.id)
                                        }
                                      >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded medications */}
                          {isExpanded && (
                            <TableRow key={`${receta.id}-exp`}>
                              <TableCell colSpan={9} className="bg-muted/30 p-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    Medicamentos prescritos
                                  </p>
                                  {receta.prescription_items &&
                                  receta.prescription_items.length > 0 ? (
                                    receta.prescription_items.map((med) => (
                                      <MedicationRow
                                        key={med.id}
                                        med={med}
                                      />
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      Sin medicamentos registrados
                                    </p>
                                  )}
                                  {receta.notes && (
                                    <div className="mt-3 p-3 rounded bg-muted/50">
                                      <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Notas
                                      </p>
                                      <p className="text-sm">
                                        {receta.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <PrescriptionDetailDialog
        prescription={detailPrescription}
        open={detailPrescription !== null}
        onClose={() => setDetailPrescription(null)}
      />
    </div>
  );
}
