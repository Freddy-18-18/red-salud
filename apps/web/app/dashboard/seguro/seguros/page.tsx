"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Shield, Plus, FileText, AlertTriangle, CheckCircle2, Clock,
  Search, DollarSign, XCircle, ArrowLeft, RefreshCw, Send, Eye,
  Users, TrendingUp, Building2
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import type { InsurancePlan, InsuranceClaim } from "@/types/dental";

// ─── Demo Insurance Plans ────────────────────────────────────────────────────
const DEMO_PLANS: InsurancePlan[] = [
  {
    id: "plan-1",
    name: "Plan Básico Dental",
    payerName: "Seguros Mercantil",
    planName: "Plan Básico Dental",
    insurerName: "Seguros Mercantil",
    insurerCode: "MERC",
    coverageType: "basic",
    planType: "PPO",
    annualMaximum: 5000,
    deductible: 200,
    deductibleMet: 0,
    preventiveCoverage: 100,
    basicCoverage: 80,
    majorCoverage: 50,
    orthodonticCoverage: 0,
    coveragePercentages: {
      preventive: 100,
      basic: 80,
      major: 50,
      orthodontics: 0,
    },
    waitingPeriods: { basic: 0, major: 6, orthodontics: 0 },
    exclusions: [],
    isActive: true,
    effectiveDate: "2026-01-01",
  },
  {
    id: "plan-2",
    name: "Plan Premium Salud",
    payerName: "Mapfre Venezuela",
    planName: "Plan Premium Salud",
    insurerName: "Mapfre Venezuela",
    insurerCode: "MAPF",
    coverageType: "premium",
    planType: "PPO",
    annualMaximum: 15000,
    deductible: 100,
    deductibleMet: 0,
    preventiveCoverage: 100,
    basicCoverage: 90,
    majorCoverage: 70,
    orthodonticCoverage: 50,
    coveragePercentages: {
      preventive: 100,
      basic: 90,
      major: 70,
      orthodontics: 50,
    },
    waitingPeriods: { basic: 0, major: 3, orthodontics: 12 },
    exclusions: [],
    isActive: true,
    effectiveDate: "2026-01-01",
  },
  {
    id: "plan-3",
    name: "Plan Corporativo Dental",
    payerName: "Qualitas",
    planName: "Plan Corporativo Dental",
    insurerName: "Qualitas",
    insurerCode: "QUAL",
    coverageType: "premium",
    planType: "PPO",
    annualMaximum: 20000,
    deductible: 0,
    deductibleMet: 0,
    preventiveCoverage: 100,
    basicCoverage: 100,
    majorCoverage: 80,
    orthodonticCoverage: 60,
    coveragePercentages: {
      preventive: 100,
      basic: 100,
      major: 80,
      orthodontics: 60,
    },
    waitingPeriods: { basic: 0, major: 0, orthodontics: 6 },
    exclusions: [],
    isActive: true,
    effectiveDate: "2026-01-01",
  },
];

// ─── Demo Claims ─────────────────────────────────────────────────────────────
const DEMO_CLAIMS: InsuranceClaim[] = [
  {
    id: "claim-1",
    patientId: "p1",
    patientName: "María García",
    planId: "plan-1",
    planName: "Plan Básico Dental",
    procedureCodes: ["D2391", "D0220"],
    diagnosisCodes: ["K02.1"],
    totalAmount: 100,
    approvedAmount: 75,
    patientResponsibility: 25,
    status: "approved",
    submittedAt: "2026-02-01T10:00:00",
    processedAt: "2026-02-05T14:00:00",
    notes: "Restauración + radiografía periapical aprobada",
  },
  {
    id: "claim-2",
    patientId: "p2",
    patientName: "Carlos Fernández",
    planId: "plan-2",
    planName: "Plan Premium Salud",
    procedureCodes: ["D3330", "D2750"],
    diagnosisCodes: ["K04.0", "K02.9"],
    totalAmount: 1000,
    approvedAmount: 0,
    patientResponsibility: 1000,
    status: "pending",
    submittedAt: "2026-02-10T09:00:00",
    notes: "Endodoncia molar + corona. Pendiente pre-autorización.",
  },
  {
    id: "claim-3",
    patientId: "p3",
    patientName: "Ana Rodríguez",
    planId: "plan-3",
    planName: "Plan Corporativo Dental",
    procedureCodes: ["D4341", "D4341", "D4341", "D4341"],
    diagnosisCodes: ["K05.1"],
    totalAmount: 480,
    approvedAmount: 480,
    patientResponsibility: 0,
    status: "paid",
    submittedAt: "2026-01-20T11:00:00",
    processedAt: "2026-01-25T10:00:00",
    paidAt: "2026-02-01T16:00:00",
    notes: "Raspado y alisado 4 cuadrantes - cobertura total",
  },
  {
    id: "claim-4",
    patientId: "p5",
    patientName: "Rosa Martínez",
    planId: "plan-1",
    planName: "Plan Básico Dental",
    procedureCodes: ["D7240"],
    diagnosisCodes: ["K01.1"],
    totalAmount: 280,
    approvedAmount: 0,
    patientResponsibility: 280,
    status: "denied",
    submittedAt: "2026-02-08T14:00:00",
    processedAt: "2026-02-12T09:00:00",
    denialReason: "Extracción de tercer molar impactado no cubierta en plan básico",
    notes: "",
  },
  {
    id: "claim-5",
    patientId: "p4",
    patientName: "Luis Mendoza",
    planId: "plan-2",
    planName: "Plan Premium Salud",
    procedureCodes: ["D1110", "D0120", "D0210"],
    diagnosisCodes: ["Z01.20"],
    totalAmount: 155,
    approvedAmount: 155,
    patientResponsibility: 0,
    status: "approved",
    submittedAt: "2026-02-12T08:00:00",
    processedAt: "2026-02-13T10:00:00",
    notes: "Preventivo completo cubierto 100%",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: <FileText className="w-3 h-3" /> },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: <Clock className="w-3 h-3" /> },
  submitted: { label: "Enviado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <Send className="w-3 h-3" /> },
  approved: { label: "Aprobado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  denied: { label: "Denegado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: <XCircle className="w-3 h-3" /> },
  appealed: { label: "Apelado", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", icon: <RefreshCw className="w-3 h-3" /> },
  paid: { label: "Pagado", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", icon: <DollarSign className="w-3 h-3" /> },
};

type TabKey = "dashboard" | "plans" | "claims";

export default function InsuranceModulePage() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [claims, setClaims] = useState(DEMO_CLAIMS);
  const [plans] = useState(DEMO_PLANS);
  const [claimFilter, setClaimFilter] = useState("all");
  const [claimSearch, setClaimSearch] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  // ─── Dashboard Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalClaims: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => ["approved", "paid"].includes(c.status)).length,
    denied: claims.filter((c) => c.status === "denied").length,
    totalBilled: claims.reduce((s, c) => s + (c.totalAmount ?? 0), 0),
    totalApproved: claims.reduce((s, c) => s + (c.approvedAmount ?? 0), 0),
    totalPaid: claims.filter((c) => c.status === "paid").reduce((s, c) => s + (c.approvedAmount ?? 0), 0),
    activePlans: plans.filter((p) => p.isActive).length,
  }), [claims, plans]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchSt = claimFilter === "all" || c.status === claimFilter;
      const matchQ = !claimSearch || c.patientName.toLowerCase().includes(claimSearch.toLowerCase()) || (c.planName ?? "N/A").toLowerCase().includes(claimSearch.toLowerCase());
      return matchSt && matchQ;
    });
  }, [claims, claimFilter, claimSearch]);

  const activeClaim = selectedClaim ? claims.find((c) => c.id === selectedClaim) : null;

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: "dashboard", label: "Dashboard", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "plans", label: "Planes", icon: <Shield className="w-4 h-4" /> },
    { key: "claims", label: "Reclamos", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Módulo de Seguros
        </h1>
        <p className="text-sm text-muted-foreground">Gestión de planes, cobertura y reclamos de seguros dentales</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2",
              tab === t.key ? "border-primary text-primary bg-muted/50" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Planes activos" value={stats.activePlans} icon={<Shield className="w-5 h-5 text-primary" />} />
            <MetricCard label="Reclamos pendientes" value={stats.pending} icon={<Clock className="w-5 h-5 text-yellow-500" />} highlight={stats.pending > 0} />
            <MetricCard label="Aprobados" value={stats.approved} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
            <MetricCard label="Denegados" value={stats.denied} icon={<XCircle className="w-5 h-5 text-red-500" />} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold">${stats.totalBilled.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Total Aprobado</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalApproved.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-emerald-600">${stats.totalPaid.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
          {/* Approval Rate */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Tasa de Aprobación</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${stats.totalClaims > 0 ? (stats.approved / stats.totalClaims) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-bold">{stats.totalClaims > 0 ? Math.round((stats.approved / stats.totalClaims) * 100) : 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Tab */}
      {tab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Agregar Plan</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{plan.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{plan.insurerName}
                      </p>
                    </div>
                    <Badge variant={plan.isActive ? "default" : "secondary"} className="text-[10px]">
                      {plan.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="text-muted-foreground">Máximo anual</p><p className="font-bold text-base">${plan.annualMaximum.toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Deducible</p><p className="font-bold text-base">${plan.deductible}</p></div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="font-semibold mb-1">Cobertura</p>
                    <CoverageBar label="Preventivo" pct={plan.coveragePercentages?.preventive ?? 0} />
                    <CoverageBar label="Básico" pct={plan.coveragePercentages?.basic ?? 0} />
                    <CoverageBar label="Mayor" pct={plan.coveragePercentages?.major ?? 0} />
                    <CoverageBar label="Ortodoncia" pct={plan.coveragePercentages?.orthodontics ?? 0} />
                  </div>
                  {((plan.waitingPeriods?.major ?? 0) > 0 || (plan.waitingPeriods?.orthodontics ?? 0) > 0) && (
                    <div className="border-t pt-2">
                      <p className="font-semibold mb-1">Período espera (meses)</p>
                      <div className="grid grid-cols-3 gap-1">
                        <div><p className="text-muted-foreground">Básico</p><p>{plan.waitingPeriods.basic}</p></div>
                        <div><p className="text-muted-foreground">Mayor</p><p>{plan.waitingPeriods.major}</p></div>
                        <div><p className="text-muted-foreground">Orto.</p><p>{plan.waitingPeriods.orthodontics}</p></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {tab === "claims" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input className="pl-8" value={claimSearch} onChange={(e) => setClaimSearch(e.target.value)} placeholder="Buscar por paciente o plan..." />
            </div>
            <select value={claimFilter} onChange={(e) => setClaimFilter(e.target.value)} className="border rounded px-3 py-2 text-sm bg-background">
              <option value="all">Todos</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
            </select>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Nuevo Reclamo</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-2">
              {filteredClaims.length === 0 && (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No se encontraron reclamos.</CardContent></Card>
              )}
              {filteredClaims.map((c) => {
                const st = STATUS_CONFIG[c.status];
                return (
                  <Card key={c.id} className={cn("cursor-pointer hover:shadow-md transition-all", selectedClaim === c.id && "ring-2 ring-primary")} onClick={() => setSelectedClaim(c.id === selectedClaim ? null : c.id)}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm">{c.patientName}</span>
                            <Badge className={cn("text-[10px]", st?.color)}>{st?.icon}<span className="ml-1">{st?.label}</span></Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.planName ?? "N/A"}</p>
                          <p className="text-xs text-muted-foreground">CDT: {(c.procedureCodes ?? []).join(", ")} • DX: {(c.diagnosisCodes ?? []).join(", ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${(c.totalAmount ?? 0).toFixed(2)}</p>
                          {(c.approvedAmount ?? 0) > 0 && <p className="text-xs text-green-600">Aprob: ${(c.approvedAmount ?? 0).toFixed(2)}</p>}
                          <p className="text-[10px] text-muted-foreground">{new Date(c.submittedAt ?? new Date().toISOString()).toLocaleDateString("es-VE")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {activeClaim ? (
                <Card className="sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Detalle del Reclamo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Paciente</p><p className="font-medium">{activeClaim.patientName}</p></div>
                      <div><p className="text-muted-foreground">Plan</p><p className="font-medium">{activeClaim.planName}</p></div>
                      <div><p className="text-muted-foreground">Estado</p><Badge className={cn("text-[10px]", STATUS_CONFIG[activeClaim.status]?.color)}>{STATUS_CONFIG[activeClaim.status]?.label}</Badge></div>
                      <div><p className="text-muted-foreground">Enviado</p><p className="font-medium">{new Date(activeClaim.submittedAt ?? new Date().toISOString()).toLocaleDateString("es-VE")}</p></div>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs"><span>Total facturado</span><span className="font-bold">${(activeClaim.totalAmount ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between text-xs text-green-600"><span>Monto aprobado</span><span className="font-bold">${(activeClaim.approvedAmount ?? 0).toFixed(2)}</span></div>
                      <div className="flex justify-between text-xs text-amber-600"><span>Responsabilidad paciente</span><span className="font-bold">${(activeClaim.patientResponsibility ?? 0).toFixed(2)}</span></div>
                    </div>
                    <div className="border-t pt-2 text-xs">
                      <p className="text-muted-foreground mb-1">Procedimientos (CDT)</p>
                      <div className="flex flex-wrap gap-1">{(activeClaim.procedureCodes ?? []).map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-1">Diagnósticos (ICD)</p>
                      <div className="flex flex-wrap gap-1">{(activeClaim.diagnosisCodes ?? []).map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                    </div>
                    {activeClaim.denialReason && (
                      <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded text-xs">
                        <p className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Motivo de denegación</p>
                        <p className="text-red-700 dark:text-red-400 mt-0.5">{activeClaim.denialReason}</p>
                      </div>
                    )}
                    {activeClaim.notes && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{activeClaim.notes}</p>}
                    {activeClaim.status === "denied" && (
                      <Button size="sm" variant="outline" className="w-full text-xs"><RefreshCw className="w-3 h-3 mr-1" />Apelar Decisión</Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card><CardContent className="py-12 text-center text-muted-foreground"><Eye className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Seleccione un reclamo</p></CardContent></Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={cn(highlight && "border-yellow-300")}>
      <CardContent className="pt-3 pb-3 flex items-center gap-3">
        {icon}
        <div>
          <p className={cn("text-xl font-bold", highlight && "text-yellow-600")}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CoverageBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="w-20 text-muted-foreground">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className={cn("h-full rounded-full", pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : pct > 0 ? "bg-red-400" : "bg-gray-300")} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-medium">{pct}%</span>
    </div>
  );
}
