import type { Metadata } from "next";
import { AcademiaHero } from "@/components/sections/academia/AcademiaHero";
import { AcademiaFeatures } from "@/components/sections/academia/AcademiaFeatures";
import { AcademiaCTA } from "@/components/sections/academia/AcademiaCTA";

export const metadata: Metadata = {
    title: "Academia Red-Salud - Formación Médica de Elite",
    description: "Accede a cursos certificados, webinars en vivo y la mayor red de educación médica continua en Venezuela. Actualización constante para profesionales de la salud.",
    keywords: "educación médica venezuela, cursos medicina, webinars salud, certificación médica, academia red-salud",
};

export default function AcademiaPage() {
    return (
        <main className="min-h-screen bg-background">
            <AcademiaHero />
            <AcademiaFeatures />
            <AcademiaCTA />
        </main>
    );
}
