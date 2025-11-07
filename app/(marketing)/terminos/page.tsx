"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold font-(family-name:--font-poppins)">
            Términos y Condiciones
          </motion.h1>
          <p className="mt-4 text-gray-300">Última actualización: Noviembre 2024</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div className="prose prose-lg max-w-none" variants={fadeInUp} initial="initial" animate="animate">
            <h2>1. Aceptación de Términos</h2>
            <p>Al acceder y utilizar Red-Salus, aceptas cumplir con estos términos y condiciones.</p>

            <h2>2. Servicios</h2>
            <p>Red-Salus proporciona servicios de telemedicina y consultas médicas virtuales. Los servicios no reemplazan atención médica de emergencia.</p>

            <h2>3. Responsabilidades del Usuario</h2>
            <ul>
              <li>Proporcionar información médica precisa y completa</li>
              <li>Mantener la confidencialidad de tus credenciales</li>
              <li>Usar los servicios de forma responsable</li>
            </ul>

            <h2>4. Privacidad y Protección de Datos</h2>
            <p>Nos comprometemos a proteger tu información personal según nuestra Política de Privacidad.</p>

            <h2>5. Limitación de Responsabilidad</h2>
            <p>Red-Salus no se hace responsable por diagnósticos erróneos derivados de información incompleta proporcionada por el usuario.</p>

            <h2>6. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
