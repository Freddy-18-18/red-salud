/**
 * Página de RCM & Finanzas
 */

'use client';

import { useParams } from 'next/navigation';
import { useClinicScope } from '@/components/dashboard/clinica/clinic-scope-provider';
import { useClinicRCM } from '@/hooks/use-clinic-rcm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';



export default function ClinicRCMPage() {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  const { selectedLocationIds } = useClinicScope();

  const {
    payerContracts,
    financialKPIs,
    dso,
    unreconciledPayments,
    agingClaims,
    isLoading,
  } = useClinicRCM(clinicId, selectedLocationIds);

  if (isLoading) {
    return null;
  }


  const latestKPI = financialKPIs?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">RCM & Finanzas</h2>
        <p className="text-muted-foreground">
          Gestión del ciclo de ingresos y análisis financiero
        </p>
      </div>

      {/* KPIs Financieros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">DSO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dso} días</div>
            <p className="text-xs text-muted-foreground">Días promedio de cobro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Rechazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestKPI?.denial_rate_pct.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Claims denegados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestKPI?.collection_rate_pct.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Efectividad de cobro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Conciliar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreconciledPayments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Pagos pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Próximos a Vencer</CardTitle>
              <CardDescription>
                Claims con más de 30 días sin resolución
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agingClaims && agingClaims.length > 0 ? (
                <div className="space-y-2">
                  {agingClaims.slice(0, 10).map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{claim.claim_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.patient_name} • {claim.payer_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${claim.total_amount.toLocaleString()}
                        </p>
                        <Badge variant="outline">{claim.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay claims próximos a vencer
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Sin Conciliar</CardTitle>
              <CardDescription>
                Requieren revisión y conciliación manual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreconciledPayments && unreconciledPayments.length > 0 ? (
                <div className="space-y-2">
                  {unreconciledPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{payment.payment_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_date} • {payment.payment_method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${payment.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todos los pagos están conciliados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos Activos</CardTitle>
              <CardDescription>
                Aseguradoras y convenios vigentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payerContracts && payerContracts.length > 0 ? (
                <div className="space-y-2">
                  {payerContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{contract.payer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.payer_type} • {contract.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge>{contract.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contract.payment_terms_days} días
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay contratos activos
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KPIs Históricos</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {financialKPIs && financialKPIs.length > 0 ? (
                <div className="space-y-4">
                  {financialKPIs.map((kpi) => (
                    <div key={kpi.month} className="border-b pb-3 last:border-0">
                      <p className="font-medium mb-2">
                        {new Date(kpi.month).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Facturado</p>
                          <p className="font-medium">
                            ${kpi.total_billed.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cobrado</p>
                          <p className="font-medium">
                            ${kpi.total_collected.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tasa Cobro</p>
                          <p className="font-medium">
                            {kpi.collection_rate_pct.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay datos históricos disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
