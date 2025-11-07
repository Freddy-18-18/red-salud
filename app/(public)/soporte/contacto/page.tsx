"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONTACT_INFO } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const contactMethods = [
  { icon: Mail, title: "Email", value: CONTACT_INFO.EMAIL, link: `mailto:${CONTACT_INFO.EMAIL}` },
  { icon: Phone, title: "Teléfono", value: CONTACT_INFO.PHONE, link: `tel:${CONTACT_INFO.PHONE}` },
  { icon: MapPin, title: "Dirección", value: CONTACT_INFO.ADDRESS, link: "#" },
  { icon: Clock, title: "Horario", value: "Lun - Vie: 8am - 8pm", link: "#" },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-size-[50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-3xl mx-auto text-center" variants={staggerContainer} initial="initial" animate="animate">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-(family-name:--font-poppins)">
              Contáctanos
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6 font-(family-name:--font-poppins)">Envíanos un mensaje</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" placeholder="Juan Pérez" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="juan@ejemplo.com" className="mt-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Asunto</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona un asunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulta">Consulta general</SelectItem>
                          <SelectItem value="soporte">Soporte técnico</SelectItem>
                          <SelectItem value="cita">Agendar cita</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea id="message" placeholder="Escribe tu mensaje aquí..." className="mt-2 min-h-[150px]" />
                  </div>
                  <Button size="lg" className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                    Enviar Mensaje
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card key={method.title} className="p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-blue-100">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                          <a href={method.link} className="text-gray-600 hover:text-blue-600 transition-colors">
                            {method.value}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
