"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Package,
  Calendar,
  AlertTriangle,
  Truck,
  DollarSign,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Eye,
  ExternalLink,
  CheckCheck,
} from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Card, CardContent } from "@red-salud/design-system";
import {
  type PharmacyAlert,
  type AlertType,
  type AlertSeverity,
  type AlertFilters,
  type AlertCounts,
  ALERT_TYPE_LABELS,
  SEVERITY_LABELS,
  fetchAlerts,
  fetchAlertCounts,
  markAlertRead,
  resolveAlert,
  markAllRead,
} from "@/lib/services/alerts-service";
import { getCurrentPharmacyId } from "@/lib/services/settings-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs} hora${diffHrs > 1 ? "s" : ""}`;
  if (diffDays < 7) return `hace ${diffDays} dia${diffDays > 1 ? "s" : ""}`;

  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTypeIcon(type: AlertType) {
  switch (type) {
    case "low_stock":
      return <Package className="h-5 w-5" />;
    case "out_of_stock":
      return <AlertCircle className="h-5 w-5" />;
    case "expiry_warning":
    case "expiry_critical":
      return <Calendar className="h-5 w-5" />;
    case "order_received":
      return <Truck className="h-5 w-5" />;
    case "price_change":
      return <DollarSign className="h-5 w-5" />;
    case "controlled_med":
      return <ShieldAlert className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getSeverityStyles(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return {
        stripe: "border-l-red-500",
        bg: "bg-red-50 dark:bg-red-950/30",
        icon: "text-red-600",
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    case "warning":
      return {
        stripe: "border-l-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        icon: "text-yellow-600",
        badge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
    case "info":
    default:
      return {
        stripe: "border-l-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        icon: "text-blue-600",
        badge:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
  }
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type StatusFilter = "todas" | "sin_leer" | "leidas" | "resueltas";

const TYPE_OPTIONS: { value: AlertType | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "low_stock", label: "Stock bajo" },
  { value: "expiry_warning", label: "Vencimiento" },
  { value: "out_of_stock", label: "Agotado" },
  { value: "order_received", label: "Pedido recibido" },
  { value: "price_change", label: "Cambio precio" },
  { value: "controlled_med", label: "Medicamento controlado" },
];

const SEVERITY_OPTIONS: { value: AlertSeverity | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Advertencia" },
  { value: "critical", label: "Critica" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "sin_leer", label: "Sin leer" },
  { value: "leidas", label: "Leidas" },
  { value: "resueltas", label: "Resueltas" },
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AlertasPage() {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<PharmacyAlert[]>([]);
  const [counts, setCounts] = useState<AlertCounts>({
    total: 0,
    unread: 0,
    critical: 0,
    warning: 0,
    info: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<AlertType | "">("");
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "">("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");

  // Init pharmacy ID
  useEffect(() => {
    getCurrentPharmacyId().then((id) => setPharmacyId(id));
  }, []);

  // Compute resolved-today count from loaded alerts
  const resolvedToday = alerts.filter((a) => {
    if (!a.is_resolved || !a.resolved_at) return false;
    const today = new Date();
    const resolved = new Date(a.resolved_at);
    return (
      resolved.getDate() === today.getDate() &&
      resolved.getMonth() === today.getMonth() &&
      resolved.getFullYear() === today.getFullYear()
    );
  }).length;

  // Load alerts + counts
  const loadData = useCallback(async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const serviceFilters: AlertFilters = {};
      if (filterType) serviceFilters.type = filterType;
      if (filterSeverity) serviceFilters.severity = filterSeverity;
      if (filterStatus === "sin_leer" || filterStatus === "resueltas") {
        serviceFilters.status = filterStatus;
      }

      const [alertsData, countsData] = await Promise.all([
        fetchAlerts(pharmacyId, serviceFilters),
        fetchAlertCounts(pharmacyId),
      ]);

      // Client-side filter for "leidas" (read but not resolved)
      let filtered = alertsData;
      if (filterStatus === "leidas") {
        filtered = alertsData.filter((a) => a.is_read && !a.is_resolved);
      }

      setAlerts(filtered);
      setCounts(countsData);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, filterType, filterSeverity, filterStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleMarkRead = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      await markAlertRead(alertId);
      await loadData();
    } catch (error) {
      console.error("Error marcando alerta como leida:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      await resolveAlert(alertId);
      await loadData();
    } catch (error) {
      console.error("Error resolviendo alerta:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!pharmacyId) return;
    setBulkLoading(true);
    try {
      await markAllRead(pharmacyId);
      await loadData();
    } catch (error) {
      console.error("Error marcando todas como leidas:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleResolveAll = async () => {
    if (!pharmacyId) return;
    setBulkLoading(true);
    try {
      // Resolve each unresolved alert individually
      const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);
      await Promise.all(unresolvedAlerts.map((a) => resolveAlert(a.id)));
      await loadData();
    } catch (error) {
      console.error("Error resolviendo todas las alertas:", error);
    } finally {
      setBulkLoading(false);
    }
  };

  // Loading state
  if (loading && alerts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  if (!pharmacyId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-muted-foreground">
            No se encontro la farmacia asociada a tu cuenta.
          </p>
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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">Centro de Alertas</h1>
                  {counts.unread > 0 && (
                    <Badge className="bg-red-500 text-white text-sm px-2.5 py-0.5">
                      {counts.unread}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Monitoreo de inventario y notificaciones
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={bulkLoading || counts.unread === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leidas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total alertas
                  </p>
                  <p className="text-2xl font-bold">{counts.total}</p>
                </div>
                <Bell className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sin leer</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {counts.unread}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Criticas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {counts.critical}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Resueltas hoy
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {resolvedToday}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AlertType | "")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value ? `Tipo: ${opt.label}` : "Tipo: Todos"}
                  </option>
                ))}
              </select>
              <select
                value={filterSeverity}
                onChange={(e) =>
                  setFilterSeverity(e.target.value as AlertSeverity | "")
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value
                      ? `Severidad: ${opt.label}`
                      : "Severidad: Todas"}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as StatusFilter)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value !== "todas"
                      ? `Estado: ${opt.label}`
                      : "Estado: Todas"}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {alerts.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {alerts.length} alerta{alerts.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={bulkLoading || counts.unread === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Marcar todas como leidas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResolveAll}
                disabled={
                  bulkLoading || alerts.every((a) => a.is_resolved)
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver todas
              </Button>
            </div>
          </div>
        )}

        {/* Alert Cards */}
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <CheckCircle className="h-14 w-14 mx-auto mb-4 text-green-500/60" />
                <p className="text-lg font-medium text-muted-foreground mb-1">
                  No hay alertas
                </p>
                <p className="text-sm text-muted-foreground">
                  Todo esta bajo control.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const isProcessing = actionLoading === alert.id;

              return (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${styles.stripe} ${
                    !alert.is_read ? styles.bg : ""
                  } ${alert.is_resolved ? "opacity-60" : ""}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`shrink-0 mt-0.5 ${styles.icon}`}
                      >
                        {getTypeIcon(alert.alert_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold ${
                                !alert.is_read ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {alert.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={styles.badge}
                            >
                              {SEVERITY_LABELS[alert.severity]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ALERT_TYPE_LABELS[alert.alert_type]}
                            </Badge>
                            {!alert.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                            {alert.is_resolved && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              >
                                Resuelta
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {timeAgo(alert.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>

                        {/* Related product */}
                        {alert.product_name && (
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Producto: {alert.product_name}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {!alert.is_read && !alert.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(alert.id)}
                              disabled={isProcessing}
                              className="h-7 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Marcar leida
                            </Button>
                          )}
                          {!alert.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              disabled={isProcessing}
                              className="h-7 text-xs text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Resolver
                            </Button>
                          )}
                          {alert.related_product_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-7 text-xs"
                            >
                              <a
                                href={`/dashboard/inventario?producto=${alert.related_product_id}`}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Ir al producto
                              </a>
                            </Button>
                          )}
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
    </div>
  );
}
