import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@red-salud/ui";
import { Plus } from "lucide-react";
import { PagoMovilForm } from "./pago-movil-form";
import { BankTransferForm } from "./bank-transfer-form";
import { PaymentReportData, reportPayment } from "@/lib/supabase/services/billing-service";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";

interface PaymentModalProps {
    onSuccess?: () => void;
}

export function PaymentModal({ onSuccess }: PaymentModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useSupabaseAuth();

    const handlePaymentSubmit = async (data: PaymentReportData) => {
        if (!user) {
            toast.error("Debes iniciar sesión para reportar un pago");
            return;
        }

        setLoading(true);
        try {
            const result = await reportPayment(user.id, data);

            if (result.success) {
                toast.success("Pago reportado exitosamente. Pendiente de aprobación.");
                setOpen(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error("Error al reportar el pago. Intenta de nuevo.");
            }
        } catch (error) {
            console.error("Error submitting payment:", error);
            toast.error("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Reportar Pago
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reportar Nuevo Pago</DialogTitle>
                    <DialogDescription>
                        Selecciona el método de pago y completa los datos de la transacción.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="pago-movil" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pago-movil">Pago Móvil</TabsTrigger>
                        <TabsTrigger value="transferencia">Transferencia</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pago-movil" className="mt-4">
                        <PagoMovilForm onSubmit={handlePaymentSubmit} isLoading={loading} />
                    </TabsContent>

                    <TabsContent value="transferencia" className="mt-4">
                        <BankTransferForm onSubmit={handlePaymentSubmit} isLoading={loading} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
