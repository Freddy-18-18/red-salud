"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@red-salud/design-system";
import { Receipt } from "./receipt";
import type { ReceiptInvoice, ReceiptItem, ReceiptPharmacy } from "./receipt";

// ─── Types ───────────────────────────────────────────────────────────

export interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ReceiptInvoice | null;
  items: ReceiptItem[];
  pharmacy: ReceiptPharmacy;
  onNewSale?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────

export function ReceiptDialog({
  open,
  onOpenChange,
  invoice,
  items,
  pharmacy,
  onNewSale,
}: ReceiptDialogProps) {
  if (!invoice) return null;

  const handleNewSale = () => {
    onOpenChange(false);
    onNewSale?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 bg-gray-50 dark:bg-gray-950">
        <DialogTitle className="sr-only">Recibo de Venta</DialogTitle>

        <Receipt
          invoice={invoice}
          items={items}
          pharmacy={pharmacy}
          onNewSale={handleNewSale}
        />
      </DialogContent>
    </Dialog>
  );
}
