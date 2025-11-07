"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold font-(family-name:--font-poppins)">
            Política de Privacidad
          </motion.h1>
          <p className="mt-4 text-gray-300">Última actualización: Noviembre 2024</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div className="prose prose-lg max-w-none" variants={fadeInUp} initial="initial" animate="animate">
            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos información personal necesaria para proporcionar nuestros servicios de salud, incluyendo:</p>
            <ul>
              <li>Datos de identificación personal</li>
              <li>Historial médico y síntomas</li>
              <li>Información de contacto</li>
              <li>Datos de pago</li>
            </ul>

            <h2>2. Uso de la Información</h2>
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Proporcionar servicios médicos</li>
              <li>Mejorar nuestros servicios</li>
              <li>Comunicarnos contigo</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>

            <h2>3. Protección de Datos</h2>
            <p>Implementamos medidas de seguridad robustas incluyendo encriptación de extremo a extremo y cumplimiento con estándares HIPAA.</p>

            <h2>4. Compartir Información</h2>
            <p>No compartimos tu información médica con terceros sin tu consentimiento explícito, excepto cuando sea requerido por ley.</p>

            <h2>5. Tus Derechos</h2>
            <p>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento.</p>

            <h2>6. Cookies</h2>
            <p>Utilizamos cookies para mejorar tu experiencia en nuestra plataforma.</p>

            <h2>7. Contacto</h2>
            <p>Para preguntas sobre privacidad, contáctanos en privacidad@red-salus.com</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
