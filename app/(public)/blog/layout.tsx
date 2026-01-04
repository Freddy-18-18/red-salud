import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog Médico y Comunidad",
    template: "%s | Blog RedSalud",
  },
  description: "Artículos de salud escritos por médicos verificados, preguntas y respuestas de la comunidad, y las últimas noticias en medicina y bienestar.",
  keywords: [
    "blog médico",
    "salud",
    "medicina",
    "consejos de salud",
    "preguntas médicas",
    "médicos verificados",
    "comunidad de salud",
    "bienestar",
    "nutrición",
    "salud mental",
  ],
  openGraph: {
    title: "Blog Médico y Comunidad | RedSalud",
    description: "Artículos de salud escritos por médicos verificados y respuestas de la comunidad médica.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Médico y Comunidad | RedSalud",
    description: "Artículos de salud escritos por médicos verificados y respuestas de la comunidad médica.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
