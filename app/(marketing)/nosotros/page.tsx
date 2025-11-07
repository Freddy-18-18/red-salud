"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6 font-(family-name:--font-poppins)">Sobre Nosotros</motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100">Transformando la atención médica con tecnología e innovación</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-6 font-(family-name:--font-poppins)">Nuestra Historia</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Red-Salus nació en 2020 con la visión de democratizar el acceso a servicios de salud de calidad.
              Somos un equipo de profesionales médicos, tecnólogos y diseñadores comprometidos con mejorar
              la experiencia de atención médica a través de la innovación digital.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {[
              { icon: Target, title: "Misión", desc: "Proporcionar atención médica accesible y de calidad mediante tecnología innovadora." },
              { icon: Eye, title: "Visión", desc: "Ser líderes en telemedicina, transformando la salud digital en Latinoamérica." },
              { icon: Award, title: "Valores", desc: "Compromiso, innovación, empatía y excelencia en cada interacción." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeInUp}>
                  <Card className="p-8 text-center h-full hover:shadow-xl transition-shadow">
                    <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 font-(family-name:--font-poppins)">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
