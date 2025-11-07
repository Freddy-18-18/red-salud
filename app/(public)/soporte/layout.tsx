import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soporte",
};

export default function SoporteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
