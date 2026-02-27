import { Wifi, Car, Accessibility, Baby, Coffee, Clock, Stethoscope } from "lucide-react";

export const OFFICE_AMENITIES = [
    { id: "wifi", label: "Wifi Gratis", icon: Wifi },
    { id: "parking", label: "Estacionamiento", icon: Car },
    { id: "elevator", label: "Ascensor", icon: Accessibility },
    { id: "wheelchair_access", label: "Acceso Silla de Ruedas", icon: Accessibility }, // Reusing icon or finding better one
    { id: "cafeteria", label: "Cafetería/Snacks", icon: Coffee },
    { id: "kids_area", label: "Área de Niños", icon: Baby },
    { id: "pharmacy", label: "Farmacia Cercana", icon: Stethoscope },
    { id: "24_7", label: "Abierto 24/7", icon: Clock },
    { id: "emergency", label: "Emergencias", icon: Stethoscope }, // Or Ambulance
];

export const PAYMENT_METHODS = [
    { id: "cash", label: "Efectivo ($)" },
    { id: "bs", label: "Bolívares (Bs)" },
    { id: "pago_movil", label: "Pago Móvil" },
    { id: "zelle", label: "Zelle" },
    { id: "debit_card", label: "Tarjeta Débito" },
    { id: "credit_card", label: "Tarjeta Crédito" },
    { id: "insurance", label: "Seguro Médico" },
    { id: "paypal", label: "PayPal" },
    { id: "binance", label: "Binance / Cripto" },
];

export const CURRENCIES = [
    { code: "USD", name: "Dólar Americano", symbol: "$" },
    { code: "VES", name: "Bolívar Digital", symbol: "Bs." },
    { code: "EUR", name: "Euro", symbol: "€" },
];
