"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Calendar, User, ArrowRight } from "lucide-react";

const posts = [
  { title: "5 Consejos para Mantener una Vida Saludable", excerpt: "Descubre los hábitos esenciales para mejorar tu bienestar...", date: "15 Oct 2024", author: "Dr. María García", category: "Bienestar" },
  { title: "Telemedicina: El Futuro de la Atención Médica", excerpt: "Cómo la tecnología está transformando la medicina...", date: "12 Oct 2024", author: "Dr. Carlos Ruiz", category: "Tecnología" },
  { title: "Importancia de los Chequeos Médicos Anuales", excerpt: "Por qué deberías hacerte un chequeo completo cada año...", date: "8 Oct 2024", author: "Dra. Ana López", category: "Prevención" },
  { title: "Nutrición Balanceada: Guía Completa", excerpt: "Todo lo que necesitas saber sobre alimentación saludable...", date: "5 Oct 2024", author: "Lic. Pedro Sánchez", category: "Nutrición" },
  { title: "Manejo del Estrés en la Vida Moderna", excerpt: "Técnicas efectivas para reducir el estrés diario...", date: "1 Oct 2024", author: "Dra. Laura Martínez", category: "Salud Mental" },
  { title: "Ejercicio y Salud Cardiovascular", excerpt: "Beneficios del ejercicio regular para tu corazón...", date: "28 Sep 2024", author: "Dr. Roberto Díaz", category: "Cardiología" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6 font-(family-name:--font-poppins)">Blog y Noticias</motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100">Mantente informado con las últimas noticias y consejos de salud</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {posts.map((post) => (
              <motion.div key={post.title} variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-shadow overflow-hidden group">
                  <div className="h-48 bg-linear-to-br from-blue-500 to-teal-500" />
                  <div className="p-6">
                    <div className="text-sm text-blue-600 font-semibold mb-2">{post.category}</div>
                    <h3 className="text-xl font-bold mb-3 font-(family-name:--font-poppins) group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</div>
                      <div className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</div>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 group">
                      Leer más <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
