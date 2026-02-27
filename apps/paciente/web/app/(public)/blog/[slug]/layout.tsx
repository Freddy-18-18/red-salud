import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    title: "Cargando artículo...",
    description: "Artículo médico de RedSalud",
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
