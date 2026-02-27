"use client";

import { useState, useMemo } from "react";
import { cn } from "@red-salud/core/utils";
import {
  Crown, Plus, Users, CreditCard, CheckCircle2, Star,
  ArrowLeft, TrendingUp, AlertCircle, Calendar, Percent
} from "lucide-react";
import {
  Button, Card, CardContent, CardHeader, CardTitle, Badge, Input
} from "@red-salud/design-system";
import Link from "next/link";
import type { MembershipPlan, MembershipSubscription } from "@/types/dental";

// ─── Demo Plans ──────────────────────────────────────────────────────────────
const DEMO_PLANS: MembershipPlan[] = [
  {
    id: "mp-1",
    name: "Plan Esencial",
    description: "Cuidado preventivo básico para mantener tu salud dental",
    tier: "basic",
    monthlyPrice: 15,
    annualPrice: 150,
    features: [
      "2 limpiezas al año",
      "1 examen completo anual",
      "Radiografías de rutina",
      "10% descuento en restauraciones",
      "Consulta de emergencia gratis",
    ],
    discountOnServices: 10,
    includedProcedures: ["D1110", "D0150", "D0210", "D0220"],
    maxMembers: 1,
    isActive: true,
    createdAt: "2026-01-01",
  },
  {
    id: "mp-2",
    name: "Plan Familiar",
    description: "Cobertura completa para toda la familia con descuentos exclusivos",
    tier: "standard",
    monthlyPrice: 35,
    annualPrice: 350,
    features: [
      "2 limpiezas al año por miembro",
      "Exámenes completos ilimitados",
      "Radiografías incluidas",
      "20% descuento en todos los procedimientos",
      "Consultas de emergencia gratis",
      "Flúor para menores incluido",
      "Hasta 4 miembros",
    ],
    discountOnServices: 20,
    includedProcedures: ["D1110", "D1120", "D0150", "D0210", "D0220", "D0330", "D1208"],
    maxMembers: 4,
    isActive: true,
    createdAt: "2026-01-01",
  },
  {
    id: "mp-3",
    name: "Plan Premium",
    description: "Máxima cobertura con beneficios exclusivos y prioridad en citas",
    tier: "premium",
    monthlyPrice: 60,
    annualPrice: 600,
    features: [
      "Limpiezas ilimitadas",
      "Exámenes y radiografías ilimitadas",
      "30% descuento en todos los procedimientos",
      "1 blanqueamiento anual incluido",
      "Prioridad en agenda de citas",
      "Consultas virtuales ilimitadas",
      "Hasta 6 miembros",
      "Ortodoncia con 15% descuento",
    ],
    discountOnServices: 30,
    includedProcedures: ["D1110", "D1120", "D0150", "D0210", "D0220", "D0330", "D1208", "D1351", "D9972"],
    maxMembers: 6,
    isActive: true,
    createdAt: "2026-01-01",
  },
];

const DEMO_SUBS: MembershipSubscription[] = [
  { id: "sub-1", patientId: "p1", patientName: "María García", planId: "mp-2", planName: "Plan Familiar", status: "active", startDate: "2026-01-01", nextBillingDate: "2026-03-01", billingCycle: "monthly", amount: 35, members: 3, createdAt: "2026-01-01" },
  { id: "sub-2", patientId: "p2", patientName: "Carlos Fernández", planId: "mp-3", planName: "Plan Premium", status: "active", startDate: "2025-06-01", nextBillingDate: "2026-06-01", billingCycle: "annual", amount: 600, members: 2, createdAt: "2025-06-01" },
  { id: "sub-3", patientId: "p3", patientName: "Ana Rodríguez", planId: "mp-1", planName: "Plan Esencial", status: "active", startDate: "2026-02-01", nextBillingDate: "2026-03-01", billingCycle: "monthly", amount: 15, members: 1, createdAt: "2026-02-01" },
  { id: "sub-4", patientId: "p5", patientName: "Rosa Martínez", planId: "mp-2", planName: "Plan Familiar", status: "past_due", startDate: "2025-12-01", nextBillingDate: "2026-02-01", billingCycle: "monthly", amount: 35, members: 4, createdAt: "2025-12-01" },
  { id: "sub-5", patientId: "p6", patientName: "Pedro Gómez", planId: "mp-1", planName: "Plan Esencial", status: "cancelled", startDate: "2025-09-01", nextBillingDate: "2026-02-15", endDate: "2026-01-31", billingCycle: "monthly", amount: 15, members: 1, createdAt: "2025-09-01" },
];

const TIER_COLORS: Record<string, string> = {
  basic: "from-gray-500 to-gray-600",
  standard: "from-blue-500 to-blue-600",
  premium: "from-amber-500 to-amber-600",
};

const TIER_BORDER: Record<string, string> = {
  basic: "border-gray-200",
  standard: "border-blue-200 dark:border-blue-800",
  premium: "border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800",
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  past_due: { label: "Vencido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  paused: { label: "Pausado", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
};

export default function MembershipPage() {
  const [tab, setTab] = useState<"plans" | "subscribers">("plans");
  const [subs] = useState(DEMO_SUBS);

  const stats = useMemo(() => ({
    activeSubs: subs.filter((s) => s.status === "active").length,
    mrr: subs.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.billingCycle === "monthly" ? (s.amount ?? 0) : (s.amount ?? 0) / 12), 0),
    totalMembers: subs.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.members ?? 1), 0),
    pastDue: subs.filter((s) => s.status === "past_due").length,
  }), [subs]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/consultorio">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              Planes de Membresía
            </h1>
            <p className="text-sm text-muted-foreground">Programas de suscripción y descuentos para pacientes</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><Users className="w-5 h-5 text-blue-500" /><div><p className="text-xl font-bold">{stats.activeSubs}</p><p className="text-xs text-muted-foreground">Suscriptores</p></div></CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><CreditCard className="w-5 h-5 text-green-500" /><div><p className="text-xl font-bold">${stats.mrr.toFixed(0)}</p><p className="text-xs text-muted-foreground">Ingreso mensual</p></div></CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 flex items-center gap-3"><Users className="w-5 h-5 text-purple-500" /><div><p className="text-xl font-bold">{stats.totalMembers}</p><p className="text-xs text-muted-foreground">Miembros cubiertos</p></div></CardContent></Card>
        <Card className={cn(stats.pastDue > 0 && "border-red-300")}><CardContent className="pt-3 pb-3 flex items-center gap-3"><AlertCircle className={cn("w-5 h-5", stats.pastDue > 0 ? "text-red-500" : "text-muted-foreground")} /><div><p className={cn("text-xl font-bold", stats.pastDue > 0 && "text-red-600")}>{stats.pastDue}</p><p className="text-xs text-muted-foreground">Pagos vencidos</p></div></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === "plans" ? "default" : "outline"} size="sm" onClick={() => setTab("plans")}>
          <Star className="w-4 h-4 mr-1" />Planes
        </Button>
        <Button variant={tab === "subscribers" ? "default" : "outline"} size="sm" onClick={() => setTab("subscribers")}>
          <Users className="w-4 h-4 mr-1" />Suscriptores
        </Button>
      </div>

      {/* Plans */}
      {tab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_PLANS.map((plan) => (
            <Card key={plan.id} className={cn("overflow-hidden relative", TIER_BORDER[plan.tier])}>
              {plan.tier === "premium" && (
                <div className="absolute top-3 right-3"><Crown className="w-5 h-5 text-amber-500" /></div>
              )}
              <div className={cn("h-2 bg-gradient-to-r", TIER_COLORS[plan.tier])} />
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] mb-1 capitalize">{plan.tier}</Badge>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  o ${plan.annualPrice}/año (ahorra ${plan.monthlyPrice * 12 - plan.annualPrice})
                </p>

                <div className="border-t pt-3 space-y-2">
                  {(plan.features ?? []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex items-center gap-2 text-sm">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{plan.discountOnServices}% descuento</span>
                  <span className="text-xs text-muted-foreground">en servicios adicionales</span>
                </div>

                <Button className="w-full" variant={plan.tier === "premium" ? "default" : "outline"}>
                  Inscribir Paciente
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subscribers */}
      {tab === "subscribers" && (
        <div className="space-y-2">
          {subs.map((sub) => {
            const st = STATUS_BADGE[sub.status];
            return (
              <Card key={sub.id} className={cn(sub.status === "past_due" && "border-red-300")}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {(sub.patientName ?? "Paciente").split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.patientName ?? "Paciente"}</p>
                        <p className="text-xs text-muted-foreground">{sub.planName} • {sub.members ?? 1} miembro{(sub.members ?? 1) > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-[10px]", st?.color)}>{st?.label}</Badge>
                      <div className="text-right text-xs">
                        <p className="font-bold">${sub.amount}{sub.billingCycle === "monthly" ? "/mes" : "/año"}</p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Próximo: {sub.nextBillingDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
