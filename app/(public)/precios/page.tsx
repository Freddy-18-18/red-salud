"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Básico",
    description: "Ideal para consultas ocasionales",
    monthlyPrice: 29,
    annualPrice: 290,
    gradient: "from-blue-500 to-cyan-600",
    features: [
      { text: "3 consultas virtuales al mes", included: true },
      { text: "Chat médico 24/7", included: true },
      { text: "Recetas electrónicas", included: true },
      { text: "Historial médico digital", included: true },
      { text: "Descuentos en laboratorios", included: false },
      { text: "Consultas con especialistas", included: false },
      { text: "Telemedicina familiar", included: false },
      { text: "Atención prioritaria", included: false },
    ],
    popular: false,
  },
  {
    name: "Premium",
    description: "Lo más elegido por nuestros usuarios",
    monthlyPrice: 59,
    annualPrice: 590,
    gradient: "from-teal-500 to-green-600",
    features: [
      { text: "Consultas virtuales ilimitadas", included: true },
      { text: "Chat médico 24/7", included: true },
      { text: "Recetas electrónicas", included: true },
      { text: "Historial médico digital", included: true },
      { text: "20% descuento en laboratorios", included: true },
      { text: "5 consultas con especialistas", included: true },
      { text: "Telemedicina familiar (4 miembros)", included: true },
      { text: "Atención prioritaria", included: false },
    ],
    popular: true,
  },
  {
    name: "Empresarial",
    description: "Para equipos y organizaciones",
    monthlyPrice: 149,
    annualPrice: 1490,
    gradient: "from-purple-500 to-indigo-600",
    features: [
      { text: "Todo lo de Premium incluido", included: true },
      { text: "Usuarios ilimitados", included: true },
      { text: "Dashboard de administración", included: true },
      { text: "Reportes de salud empresarial", included: true },
      { text: "30% descuento en laboratorios", included: true },
      { text: "Consultas especializadas ilimitadas", included: true },
      { text: "Atención prioritaria 24/7", included: true },
      { text: "Gerente de cuenta dedicado", included: true },
    ],
    popular: false,
  },
];

export default function PreciosPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-(family-name:--font-poppins)"
            >
              Planes Diseñados{" "}
              <span className="bg-linear-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Para Ti
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Sin costos ocultos. Sin compromisos largos. Cancela cuando quieras.
            </motion.p>

            {/* Toggle */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm p-2 rounded-full"
            >
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2 rounded-full font-semibold transition-all duration-300",
                  !isAnnual
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:text-blue-100"
                )}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2",
                  isAnnual
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-white hover:text-blue-100"
                )}
              >
                Anual
                <span className="text-xs bg-teal-400 text-blue-900 px-2 py-1 rounded-full">
                  -17%
                </span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-linear-to-r from-teal-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Más Popular
                    </div>
                  </div>
                )}

                <Card
                  className={cn(
                    "h-full transition-all duration-300 hover:shadow-2xl",
                    plan.popular
                      ? "border-2 border-teal-500 shadow-xl scale-105"
                      : "border-2 hover:border-blue-200"
                  )}
                >
                  {/* Gradient bar */}
                  <div className={`h-2 bg-linear-to-r ${plan.gradient}`} />

                  <CardHeader className="text-center pb-8 pt-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-(family-name:--font-poppins)">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /{isAnnual ? "año" : "mes"}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-teal-600 font-semibold">
                        Ahorra ${(plan.monthlyPrice * 12 - plan.annualPrice)} al año
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature.text}
                          className="flex items-start gap-3"
                        >
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              feature.included
                                ? "text-gray-700"
                                : "text-gray-400 line-through"
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      size="lg"
                      className={cn(
                        "w-full",
                        plan.popular
                          ? `bg-linear-to-r ${plan.gradient} text-white hover:opacity-90`
                          : "bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <Link href={ROUTES.CONTACTO}>
                        {plan.popular ? "Comenzar Ahora" : "Seleccionar Plan"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-(family-name:--font-poppins)">
              Preguntas Frecuentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "¿Puedo cambiar de plan en cualquier momento?",
                a: "Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu panel de usuario.",
              },
              {
                q: "¿Qué métodos de pago aceptan?",
                a: "Aceptamos tarjetas de crédito, débito y transferencias bancarias.",
              },
              {
                q: "¿Hay algún costo adicional?",
                a: "No, todos nuestros precios incluyen los servicios descritos sin costos ocultos.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
