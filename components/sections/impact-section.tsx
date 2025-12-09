"use client";
import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { TrendingUp, Users, Award, Globe } from "lucide-react";

type CoverageData = {
  estadosConCobertura: number;
  totalEstados: number;
  porcentajePenetracion: number;
};

export function ImpactSection() {
    const [coverage, setCoverage] = useState<CoverageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      async function loadCoverage() {
        try {
          const res = await fetch("/api/public/geographic-coverage", { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (mounted && json.success) {
              setCoverage(json.data);
            }
          }
        } finally {
          if (mounted) setLoading(false);
        }
      }
      loadCoverage();
      return () => { mounted = false; };
    }, []);

    const stats = [
      {
        icon: Users,
        value: "8",
        label: "Roles integrados",
        description: "en un ecosistema unificado",
        color: "from-blue-600 to-blue-700",
      },
      {
        icon: Globe,
        value: loading ? "..." : coverage?.estadosConCobertura ? `${coverage.estadosConCobertura}/${coverage.totalEstados}` : "0/24",
        label: "Cobertura",
        description: loading ? "calculando..." : coverage ? `${coverage.porcentajePenetracion}% en Venezuela` : "en Venezuela",
        color: "from-teal-600 to-teal-700",
      },
      {
        icon: TrendingUp,
        value: "24/7",
        label: "Disponibilidad",
        description: "para atención continua",
        color: "from-indigo-600 to-indigo-700",
      },
      {
        icon: Award,
        value: "100%",
        label: "Verificado",
        description: "profesionales certificados",
        color: "from-purple-600 to-purple-700",
      },
    ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-semibold mb-6 border border-primary/20 dark:border-primary/30"
          >
            Nuestro impacto
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Transformando la{" "}
            <span className="gradient-text">
              salud digital
            </span>
            <br />
            en Venezuela
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            La primera plataforma que conecta todo el ecosistema de salud en un solo lugar,
            diseñada por venezolanos para revolucionar el acceso a servicios médicos de calidad.
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="group"
              >
                <div className="relative bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/50 h-full overflow-hidden">
                  {/* Icono */}
                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Valor */}
                  <div className={`text-5xl font-bold mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent tabular-nums`}>
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>

                  {/* Decorative line - ahora dentro del overflow-hidden */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Vision Statement */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-20 max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-12 shadow-2xl shadow-primary/20 relative overflow-hidden shine">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <div className="text-white/90 text-lg font-medium mb-4">Nuestra visión</div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Democratizar el acceso a servicios de salud de calidad
              </h3>
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                Conectamos pacientes, profesionales, farmacias, laboratorios y aseguradoras
                en un ecosistema digital seguro, transparente y eficiente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
