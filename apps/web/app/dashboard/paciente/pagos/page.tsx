"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@red-salud/ui";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@red-salud/ui";
import { Payment, PaymentService } from "@/lib/services/payment-service";
import { PaymentReportForm } from "@/components/payments/payment-report-form";
import { PaymentStatusBadge } from "@/components/payments/payment-status-badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PagosPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await PaymentService.getUserPayments();
            setPayments(data);
        } catch (error) {
            console.error("Error fetching payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [open]); // Refetch when dialog closes (success)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pagos y Facturación</h2>
                    <p className="text-muted-foreground">
                        Gestiona tus pagos y reporta transferencias.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Reportar Pago
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Reportar Nuevo Pago</DialogTitle>
                            <DialogDescription>
                                Ingresa los detalles de tu transferencia o pago móvil para que podamos validarlo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <PaymentReportForm />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>
                        Listado de tus últimos pagos reportados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Concepto / Referencia</TableHead>
                                <TableHead>Banco</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Cargando historial...
                                    </TableCell>
                                </TableRow>
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No has reportado ningún pago aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">Ref: {payment.reference_number}</div>
                                            <div className="text-xs text-muted-foreground">{payment.currency}</div>
                                        </TableCell>
                                        <TableCell>{payment.bank_origin}</TableCell>
                                        <TableCell>
                                            {payment.currency === "VES" ? "Bs." : "$"} {Number(payment.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <PaymentStatusBadge status={payment.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
