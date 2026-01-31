import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@red-salud/ui/dist/index.css' // Import styles from UI package (assuming it has built CSS or similar)
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Red Salud - Panel Médico',
    description: 'Aplicación de escritorio para médicos',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
