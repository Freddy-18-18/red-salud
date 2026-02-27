import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Artículos Científicos",
    template: "%s | Artículos Científicos RedSalud",
  },
  description: "Explora artículos científicos médicos validados y revisados por pares. Acceso a investigación médica de PubMed y fuentes científicas confiables.",
  keywords: [
    "artículos científicos",
    "investigación médica",
    "PubMed",
    "salud",
    "medicina basada en evidencia",
    "publicaciones científicas",
  ],
  openGraph: {
    title: "Artículos Científicos | RedSalud",
    description: "Explora artículos científicos médicos validados y revisados por pares.",
    type: "website",
    locale: "es_ES",
  },
};

export default function ScientificArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
