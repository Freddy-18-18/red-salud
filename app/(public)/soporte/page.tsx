"use client";

import { motion } from "framer-motion";
import { Book, MessageCircle, FileText, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const supportOptions = [
  { icon: MessageCircle, title: "Chat en Vivo", desc: "Habla con nuestro equipo en tiempo real", action: "Iniciar Chat" },
  { icon: Book, title: "Centro de Ayuda", desc: "Artículos y guías completas", action: "Ver Artículos" },
  { icon: FileText, title: "Documentación", desc: "Manuales y tutoriales detallados", action: "Ver Docs" },
  { icon: Phone, title: "Soporte Telefónico", desc: "Llámanos de Lun-Vie 8am-8pm", action: "Llamar Ahora" },
];

export default function SoportePage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6 font-(family-name:--font-poppins)">Centro de Soporte</motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100">Estamos aquí para ayudarte en lo que necesites</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {supportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.div key={option.title} variants={fadeInUp}>
                  <Card className="h-full text-center hover:shadow-xl transition-shadow">
                    <CardContent className="p-8">
                      <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 font-(family-name:--font-poppins)">{option.title}</h3>
                      <p className="text-gray-600 mb-6">{option.desc}</p>
                      <Button variant="outline" className="w-full">{option.action}</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div className="mt-16 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-4 font-(family-name:--font-poppins)">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-6">Nuestro equipo está listo para ayudarte</p>
            <Button asChild size="lg" className="bg-linear-to-r from-blue-600 to-teal-600">
              <Link href={ROUTES.CONTACTO}>Contactar Soporte</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
