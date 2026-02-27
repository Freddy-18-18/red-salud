"use client";

import { CURRENCIES, PAYMENT_METHODS } from "@/lib/data/office-options";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Checkbox } from "@red-salud/design-system";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { DollarSign, CreditCard } from "lucide-react";
import { useBCVRate } from "@/hooks/use-bcv-rate";

interface OfficePricingProps {
    value: {
        consultation_fee?: number;
        price_currency: string;
        payment_methods: string[];
        accepts_insurance: boolean;
        insurance_companies: string[];
    } | undefined;
    onChange: (value: {
        consultation_fee?: number;
        price_currency: string;
        payment_methods: string[];
        accepts_insurance: boolean;
        insurance_companies: string[];
    }) => void;
}

export function OfficePricing({ value = { price_currency: "USD", payment_methods: [], accepts_insurance: false, insurance_companies: [] }, onChange }: OfficePricingProps) {
    const handleChange = (field: string, val: string | boolean | number | string[]) => {
        onChange({
            ...value,
            [field]: val
        } as NonNullable<OfficePricingProps['value']>);
    };

    const togglePaymentMethod = (methodId: string) => {
        const currentMethods = value.payment_methods || [];
        if (currentMethods.includes(methodId)) {
            handleChange("payment_methods", currentMethods.filter(m => m !== methodId));
        } else {
            handleChange("payment_methods", [...currentMethods, methodId]);
        }
    };

    const { data: bcvResponse } = useBCVRate();

    const getConversionDisplay = (amount: number | undefined, currency: string | undefined) => {
        if (!amount || !bcvResponse?.rates) return null;

        const usdRate = bcvResponse.rates.find((r: { currency: string; rate: number }) => r.currency === 'USD')?.rate;
        const eurRate = bcvResponse.rates.find((r: { currency: string; rate: number }) => r.currency === 'EUR')?.rate;

        if (currency === 'USD' && usdRate) {
            return (
                <p className="text-[10px] text-gray-500 mt-1 pl-1">
                    Aprox. <span className="font-medium text-gray-700 dark:text-gray-300">Bs. {(amount * usdRate).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</span> (Tasa BCV)
                </p>
            );
        }

        if (currency === 'EUR' && eurRate) {
            return (
                <p className="text-[10px] text-gray-500 mt-1 pl-1">
                    Aprox. <span className="font-medium text-gray-700 dark:text-gray-300">Bs. {(amount * eurRate).toLocaleString("es-VE", { maximumFractionDigits: 2 })}</span> (Tasa BCV)
                </p>
            );
        }

        if (currency === 'VES' && usdRate) {
            return (
                <p className="text-[10px] text-gray-500 mt-1 pl-1">
                    Aprox. <span className="font-medium text-gray-700 dark:text-gray-300">${(amount / usdRate).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span> (Ref. Oficial)
                </p>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Precios y Pagos
                </h4>
                <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Define el costo de consulta y métodos de pago aceptados en esta sede.
                    </p>
                    {bcvResponse?.rates && (
                        <div className="flex gap-1">
                            {bcvResponse.rates.map((rate: { currency: string; rate: number }) => (
                                <Badge key={rate.currency} variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                    {rate.currency}: {rate.rate.toLocaleString("es-VE")}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Costo Consulta */}
                <div>
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Costo de Consulta
                    </Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={value.consultation_fee || ""}
                            onChange={(e) => handleChange("consultation_fee", parseFloat(e.target.value))}
                            className="pl-9"
                            placeholder="0.00"
                        />
                    </div>
                    {getConversionDisplay(value.consultation_fee, value.price_currency)}
                </div>

                {/* Moneda */}
                <div>
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Moneda
                    </Label>
                    <Select
                        value={value.price_currency || "USD"}
                        onValueChange={(val: string) => handleChange("price_currency", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Moneda" />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((curr) => (
                                <SelectItem key={curr.code} value={curr.code}>
                                    {curr.code} - {curr.name} ({curr.symbol})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Seguros */}
            <div className="flex items-center space-x-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                <Checkbox
                    id="insurance"
                    checked={value.accepts_insurance || false}
                    onCheckedChange={(checked: boolean) => handleChange("accepts_insurance", !!checked)}
                />
                <Label htmlFor="insurance" className="text-sm cursor-pointer">
                    Acepta Seguros Médicos en esta sede
                </Label>
            </div>

            {/* Métodos de Pago */}
            <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" />
                    Métodos de Pago Aceptados
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((method) => {
                        const isSelected = (value.payment_methods || []).includes(method.id);
                        return (
                            <div
                                key={method.id}
                                className={`
                                    flex items-center space-x-2 p-2 rounded border cursor-pointer text-xs
                                    ${isSelected
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                                    }
                                `}
                                onClick={() => togglePaymentMethod(method.id)}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => togglePaymentMethod(method.id)}
                                    className={`h-3.5 w-3.5 ${isSelected ? "border-green-600 data-[state=checked]:bg-green-600" : ""}`}
                                />
                                <span>{method.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
