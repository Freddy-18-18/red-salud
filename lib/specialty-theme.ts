import { LucideIcon, Heart, Brain, Stethoscope, Microscope, Scissors, Activity, Baby, Sparkles, Smile, Shield } from "lucide-react";

export type SpecialtyThemeColor = "red" | "rose" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "slate";

export interface SpecialtyTheme {
    primary: string;
    secondary: string;
    accent: string;
    icon: LucideIcon;
    gradientFrom: string;
    gradientTo: string;
    bgLight: string; // for badges etc
    textDark: string; // for badges etc
    colorName: SpecialtyThemeColor;
}

// Fallback theme
const DEFAULT_THEME: SpecialtyTheme = {
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-blue-500",
    accent: "bg-blue-600",
    icon: Activity,
    gradientFrom: "from-blue-600",
    gradientTo: "to-cyan-500",
    bgLight: "bg-blue-50 dark:bg-blue-900/20",
    textDark: "text-blue-700 dark:text-blue-300",
    colorName: "blue"
};

export const CATEGORY_THEMES: Record<string, SpecialtyTheme> = {
    cardiovascular: {
        primary: "text-rose-600 dark:text-rose-400",
        secondary: "text-rose-500",
        accent: "bg-rose-600",
        icon: Heart,
        gradientFrom: "from-rose-600",
        gradientTo: "to-red-500",
        bgLight: "bg-rose-50 dark:bg-rose-900/20",
        textDark: "text-rose-700 dark:text-rose-300",
        colorName: "rose"
    },
    neurologia: {
        primary: "text-violet-600 dark:text-violet-400",
        secondary: "text-violet-500",
        accent: "bg-violet-600",
        icon: Brain,
        gradientFrom: "from-violet-600",
        gradientTo: "to-purple-500",
        bgLight: "bg-violet-50 dark:bg-violet-900/20",
        textDark: "text-violet-700 dark:text-violet-300",
        colorName: "violet"
    },
    mental: {
        primary: "text-fuchsia-600 dark:text-fuchsia-400",
        secondary: "text-fuchsia-500",
        accent: "bg-fuchsia-600",
        icon: Brain,
        gradientFrom: "from-purple-600",
        gradientTo: "to-fuchsia-500",
        bgLight: "bg-fuchsia-50 dark:bg-fuchsia-900/20",
        textDark: "text-fuchsia-700 dark:text-fuchsia-300",
        colorName: "fuchsia"
    },
    digestivo: {
        primary: "text-amber-600 dark:text-amber-400",
        secondary: "text-amber-500",
        accent: "bg-amber-600",
        icon: Activity, // Could be generic or specific
        gradientFrom: "from-orange-500",
        gradientTo: "to-amber-500",
        bgLight: "bg-amber-50 dark:bg-amber-900/20",
        textDark: "text-amber-700 dark:text-amber-300",
        colorName: "amber"
    },
    respiratorio: {
        primary: "text-cyan-600 dark:text-cyan-400",
        secondary: "text-cyan-500",
        accent: "bg-cyan-600",
        icon: Activity,
        gradientFrom: "from-cyan-500",
        gradientTo: "to-sky-500",
        bgLight: "bg-cyan-50 dark:bg-cyan-900/20",
        textDark: "text-cyan-700 dark:text-cyan-300",
        colorName: "cyan"
    },
    renal: {
        primary: "text-blue-600 dark:text-blue-400",
        secondary: "text-blue-500",
        accent: "bg-blue-600",
        icon: Activity,
        gradientFrom: "from-blue-600",
        gradientTo: "to-indigo-500",
        bgLight: "bg-blue-50 dark:bg-blue-900/20",
        textDark: "text-blue-700 dark:text-blue-300",
        colorName: "blue"
    },
    pediatria: {
        primary: "text-indigo-500 dark:text-indigo-400",
        secondary: "text-indigo-400",
        accent: "bg-indigo-500",
        icon: Baby,
        gradientFrom: "from-indigo-400",
        gradientTo: "to-pink-400", // Playful gradient
        bgLight: "bg-indigo-50 dark:bg-indigo-900/20",
        textDark: "text-indigo-700 dark:text-indigo-300",
        colorName: "indigo"
    },
    ginecologia: {
        primary: "text-pink-600 dark:text-pink-400",
        secondary: "text-pink-500",
        accent: "bg-pink-600",
        icon: Activity,
        gradientFrom: "from-pink-500",
        gradientTo: "to-rose-400",
        bgLight: "bg-pink-50 dark:bg-pink-900/20",
        textDark: "text-pink-700 dark:text-pink-300",
        colorName: "pink"
    },
    cirugia: {
        primary: "text-emerald-600 dark:text-emerald-400",
        secondary: "text-emerald-500",
        accent: "bg-emerald-600",
        icon: Scissors,
        gradientFrom: "from-emerald-600",
        gradientTo: "to-teal-500",
        bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
        textDark: "text-emerald-700 dark:text-emerald-300",
        colorName: "emerald"
    },
    plastica: {
        primary: "text-teal-600 dark:text-teal-400",
        secondary: "text-teal-500",
        accent: "bg-teal-600",
        icon: Sparkles,
        gradientFrom: "from-teal-500",
        gradientTo: "to-cyan-400",
        bgLight: "bg-teal-50 dark:bg-teal-900/20",
        textDark: "text-teal-700 dark:text-teal-300",
        colorName: "teal"
    },
    traumatologia: {
        primary: "text-slate-700 dark:text-slate-300",
        secondary: "text-slate-600",
        accent: "bg-slate-700",
        icon: Activity,
        gradientFrom: "from-slate-700",
        gradientTo: "to-gray-600",
        bgLight: "bg-slate-100 dark:bg-slate-800",
        textDark: "text-slate-800 dark:text-slate-200",
        colorName: "slate"
    },
    dermatologia: {
        primary: "text-orange-600 dark:text-orange-400",
        secondary: "text-orange-500",
        accent: "bg-orange-600",
        icon: Sparkles,
        gradientFrom: "from-orange-500",
        gradientTo: "to-yellow-500",
        bgLight: "bg-orange-50 dark:bg-orange-900/20",
        textDark: "text-orange-700 dark:text-orange-300",
        colorName: "orange"
    },
    oftalmologia: {
        primary: "text-sky-600 dark:text-sky-400",
        secondary: "text-sky-500",
        accent: "bg-sky-600",
        icon: Activity,
        gradientFrom: "from-sky-500",
        gradientTo: "to-blue-400",
        bgLight: "bg-sky-50 dark:bg-sky-900/20",
        textDark: "text-sky-700 dark:text-sky-300",
        colorName: "sky"
    },
    infectologia: {
        primary: "text-lime-600 dark:text-lime-400",
        secondary: "text-lime-500",
        accent: "bg-lime-600",
        icon: Microscope,
        gradientFrom: "from-lime-500",
        gradientTo: "to-green-500",
        bgLight: "bg-lime-50 dark:bg-lime-900/20",
        textDark: "text-lime-700 dark:text-lime-300",
        colorName: "lime"
    },
    odontologia: {
        primary: "text-teal-500 dark:text-teal-400",
        secondary: "text-teal-400",
        accent: "bg-teal-500",
        icon: Smile,
        gradientFrom: "from-teal-400",
        gradientTo: "to-cyan-400",
        bgLight: "bg-teal-50 dark:bg-teal-900/20",
        textDark: "text-teal-700 dark:text-teal-300",
        colorName: "teal"
    },
    intensiva: {
        primary: "text-red-600 dark:text-red-400",
        secondary: "text-red-500",
        accent: "bg-red-600",
        icon: Activity,
        gradientFrom: "from-red-600",
        gradientTo: "to-rose-600",
        bgLight: "bg-red-50 dark:bg-red-900/20",
        textDark: "text-red-700 dark:text-red-300",
        colorName: "red"
    },
    hematologia: {
        primary: "text-red-700 dark:text-red-500",
        secondary: "text-red-600",
        accent: "bg-red-700",
        icon: Microscope,
        gradientFrom: "from-red-700",
        gradientTo: "to-red-900",
        bgLight: "bg-red-50 dark:bg-red-900/20",
        textDark: "text-red-800 dark:text-red-200",
        colorName: "red"
    }
};

export function getSpecialtyTheme(category?: string): SpecialtyTheme {
    if (!category) return DEFAULT_THEME;
    // Try direct match
    if (CATEGORY_THEMES[category]) return CATEGORY_THEMES[category];

    // Try partial mapping or fallbacks based on keywords
    // General check by known keywords in category if no direct match
    if (category.includes("ciru")) return CATEGORY_THEMES.cirugia;
    if (category.includes("pedi")) return CATEGORY_THEMES.pediatria;
    if (category.includes("neuro")) return CATEGORY_THEMES.neurologia;

    return DEFAULT_THEME;
}
