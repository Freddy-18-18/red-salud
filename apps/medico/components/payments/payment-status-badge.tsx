import { Badge } from "@red-salud/design-system";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export type PaymentStatus = "pending" | "approved" | "rejected";

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    if (status === "approved") {
        return (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Aprobado
            </Badge>
        );
    }

    if (status === "rejected") {
        return (
            <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Rechazado
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
            <Clock className="h-3 w-3" />
            Pendiente
        </Badge>
    );
}
