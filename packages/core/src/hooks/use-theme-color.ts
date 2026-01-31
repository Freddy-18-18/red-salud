import { useState, useEffect } from "react";

export type ThemeColor = "blue" | "purple" | "green" | "orange" | "indigo" | "pink";

export const THEME_CONFIG = {
    blue: {
        name: "Azul",
        gradient: { from: "from-blue-600", to: "to-teal-600" },
        primary: "bg-blue-600",
        primaryHover: "hover:bg-blue-700",
        text: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-600",
        ring: "ring-blue-600",
    },
    purple: {
        name: "Púrpura",
        gradient: { from: "from-purple-600", to: "to-pink-600" },
        primary: "bg-purple-600",
        primaryHover: "hover:bg-purple-700",
        text: "text-purple-600",
        bg: "bg-purple-100",
        border: "border-purple-600",
        ring: "ring-purple-600",
    },
    green: {
        name: "Verde",
        gradient: { from: "from-green-600", to: "to-emerald-600" },
        primary: "bg-green-600",
        primaryHover: "hover:bg-green-700",
        text: "text-green-600",
        bg: "bg-green-100",
        border: "border-green-600",
        ring: "ring-green-600",
    },
    orange: {
        name: "Naranja",
        gradient: { from: "from-orange-600", to: "to-red-600" },
        primary: "bg-orange-600",
        primaryHover: "hover:bg-orange-700",
        text: "text-orange-600",
        bg: "bg-orange-100",
        border: "border-orange-600",
        ring: "ring-orange-600",
    },
    indigo: {
        name: "Índigo",
        gradient: { from: "from-indigo-600", to: "to-blue-600" },
        primary: "bg-indigo-600",
        primaryHover: "hover:bg-indigo-700",
        text: "text-indigo-600",
        bg: "bg-indigo-100",
        border: "border-indigo-600",
        ring: "ring-indigo-600",
    },
    pink: {
        name: "Rosa",
        gradient: { from: "from-pink-600", to: "to-rose-600" },
        primary: "bg-pink-600",
        primaryHover: "hover:bg-pink-700",
        text: "text-pink-600",
        bg: "bg-pink-100",
        border: "border-pink-600",
        ring: "ring-pink-600",
    },
};

export function useThemeColor() {
    const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("profileThemeColor");
            return (saved as ThemeColor) || "blue";
        }
        return "blue";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("profileThemeColor", themeColor);
        }
    }, [themeColor]);

    const setThemeColor = (color: ThemeColor) => {
        setThemeColorState(color);
    };

    const theme = THEME_CONFIG[themeColor];

    return { themeColor, setThemeColor, theme };
}
