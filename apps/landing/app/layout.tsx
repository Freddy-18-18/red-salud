import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Red-Salud | El Ecosistema de Salud del Futuro",
    description: "Portal central de servicios de salud integrados.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
