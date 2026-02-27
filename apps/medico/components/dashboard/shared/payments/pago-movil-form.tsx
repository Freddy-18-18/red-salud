import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@red-salud/design-system";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { PaymentReportData } from "@/lib/supabase/services/billing-service";
import { Calendar } from "@red-salud/design-system";
import { Popover, PopoverContent, PopoverTrigger } from "@red-salud/design-system";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

const formSchema = z.object({
    amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
    reference_number: z.string().min(4, "Número de referencia inválido (mínimo 4 dígitos)"),
    bank_origin: z.string().min(2, "Banco de origen requerido"),
    payment_date: z.date(),
});

interface PagoMovilFormProps {
    onSubmit: (data: PaymentReportData) => Promise<void>;
    isLoading?: boolean;
}

export function PagoMovilForm({ onSubmit, isLoading }: PagoMovilFormProps) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            reference_number: "",
            bank_origin: "",
            payment_date: new Date(),
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        await onSubmit({
            ...values,
            currency: "VES",
            method: "mobile_payment",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="bank_origin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Banco de Origen</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Banesco, Mercantil" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="reference_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Referencia</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: 123456" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto (Bs)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="Ej: 500.00" {...field} value={field.value as number} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha del Pago</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm mb-4">
                        <p className="font-medium">Datos para el pago:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                            <li>Banco: Banesco</li>
                            <li>Teléfono: 0414-1234567</li>
                            <li>C.I.: V-12.345.678</li>
                        </ul>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        "Reportar Pago"
                    )}
                </Button>
            </form>
        </Form>
    );
}
