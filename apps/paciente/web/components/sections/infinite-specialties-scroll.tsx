"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Activity,
  Smile,
  Pill,
  Microscope,
  Syringe,
  Radio,
} from "lucide-react";
import { slugify } from "@red-salud/core";

const specialties = [
  { name: "Medicina General", Icon: Stethoscope },
  { name: "Cardiología", Icon: Heart },
  { name: "Neurología", Icon: Brain },
  { name: "Pediatría", Icon: Baby },
  { name: "Oftalmología", Icon: Eye },
  { name: "Traumatología", Icon: Bone },
  { name: "Medicina Deportiva", Icon: Activity },
  { name: "Odontología", Icon: Smile },
  { name: "Farmacología", Icon: Pill },
  { name: "Laboratorio", Icon: Microscope },
  { name: "Vacunación", Icon: Syringe },
  { name: "Telemedicina", Icon: Radio },
];

export function InfiniteSpecialtiesScroll() {
  // Duplicamos el array para crear el efecto infinito
  const duplicatedSpecialties = [...specialties, ...specialties];

  return (
    <div id="next-section" className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-teal-50 to-blue-50 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative">
        <div className="flex mb-6 justify-center">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            Nuestras Especialidades
          </div>
        </div>

        <div className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
          <motion.div
            className="flex gap-8 pr-8"
            animate={{
              x: [0, -1920], // Ajustar según el ancho total
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedSpecialties.map((specialty, index) => {
              const Icon = specialty.Icon;
              const slug = slugify(specialty.name);
              return (
                <Link
                  key={`${slug}-${index}`}
                  href={`/especialidades/${slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow whitespace-nowrap min-w-fit block"
                >
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {specialty.name}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
