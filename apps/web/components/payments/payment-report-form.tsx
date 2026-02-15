"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@red-salud/ui";
import { Calendar } from "@red-salud/ui";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@red-salud/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@red-salud/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@red-salud/ui";

import { PaymentService } from "@/lib/services/payment-service";
import { BCVService } from "@/lib/services/bcv-service";

const BANKS = [
    { id: "0102", name: "Banco de Venezuela" },
    { id: "0105", name: "Banco Mercantil" },
    { id: "0108", name: "Banco Provincial" },
    { id: "0134", name: "Banesco" },
    { id: "0114", name: "Bancaribe" },
    { id: "0116", name: "BOD" },
    { id: "0138", name: "Banco Plaza" },
    { id: "0151", name: "BFC Fondo Común" },
    { id: "0156", name: "100% Banco" },
    { id: "0157", name: "DelSur" },
    { id: "0163", name: "Banco del Tesoro" },
    { id: "0166", name: "Banco Agrícola" },
    { id: "0168", name: "Bancrecer" },
    { id: "0169", name: "Mi Banco" },
    { id: "0171", name: "Banco Activo" },
    { id: "0172", name: "Bancamiga" },
    { id: "0174", name: "Banplus" },
    { id: "0175", name: "Bicentenario" },
    { id: "0177", name: "Banfanb" },
    { id: "0191", name: "BNC Nacional de Crédito" },
];

const formSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "El monto debe ser mayor a 0",
    }),
    reference_number: z.string().min(4, "La referencia debe tener al menos 4 dígitos"),
    bank_origin: z.string().min(1, "Selecciona un banco"),
    payment_date: z.date({
        message: "La fecha del pago es requerida",
    }),
    currency: z.enum(["VES", "USD"]),
    proof_url: z.string().optional(),
});

export function PaymentReportForm() {
    const router = useRouter();
    const [bcvRate, setBcvRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            reference_number: "",
            bank_origin: "",
            currency: "VES",
        },
    });

    useEffect(() => {
        async function fetchRate() {
            try {
                const rateData = await BCVService.getRate();
                if (rateData) {
                    setBcvRate(rateData.rate);
                }
            } catch (error) {
                console.error("Error fetching BCV rate", error);
            }
        }
        fetchRate();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true);

            const userId = "placeholder"; // In real usage current user is handled by service or RLS context

            await PaymentService.createPaymentReport({
                amount: Number(values.amount),
                currency: values.currency,
                reference_number: values.reference_number,
                bank_origin: values.bank_origin,
                payment_date: values.payment_date.toISOString(),
                exchange_rate: bcvRate || undefined,
            });

            toast.success("Pago reportado exitosamente. Esperando validación.");
            form.reset();
            router.refresh();
        } catch (error) {
            toast.error("Error al reportar el pago. Inténtalo de nuevo.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const currentAmount = form.watch("amount");
    const currentCurrency = form.watch("currency");

    const estimatedValue = bcvRate && currentAmount && !isNaN(Number(currentAmount))
        ? currentCurrency === "VES"
            ? Number(currentAmount) / bcvRate
            : Number(currentAmount) * bcvRate
        : null;

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Reportar Pago Móvil / Transferencia</CardTitle>
                <CardDescription>
                    Ingresa los datos de tu comprobante de pago para validación.
                    {bcvRate && (
                        <div className="mt-2 text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded-md inline-block">
                            Tasa BCV: {bcvRate.toFixed(2)} Bs/USD
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Monto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Moneda</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Moneda" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="VES">Bs (VES)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {estimatedValue !== null && (
                            <div className="text-sm text-gray-500 text-right">
                                Aproximadamente: {currentCurrency === 'VES' ? '$' : 'Bs'} {estimatedValue.toFixed(2)}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="bank_origin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banco de Origen</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu banco" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {BANKS.map((bank) => (
                                                <SelectItem key={bank.id} value={bank.name}>
                                                    {bank.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                        <FormLabel>Referencia (Últimos dígitos)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Seleccionar fecha</span>
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
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reportar Pago
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
