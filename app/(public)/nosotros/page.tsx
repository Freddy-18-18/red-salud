"use client";

import { motion } from "framer-motion";
import { 
  Target, 
  Eye, 
  Heart,
  Lightbulb,
  Users,
  Stethoscope,
  MapPin,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Linkedin,
  Mail,
  Calendar,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { AUTH_ROUTES } from "@/lib/constants";

const valores = [
  {
    icon: Heart,
    title: "Empatía",
    description: "Entendemos las necesidades reales de pacientes y profesionales de salud en Venezuela.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Lightbulb,
    title: "Innovación",
    description: "Aplicamos tecnología de punta para resolver problemas de salud de forma creativa.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Confianza",
    description: "Protegemos los datos de salud con los más altos estándares de seguridad.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Accesibilidad",
    description: "Democratizamos el acceso a servicios de salud de calidad para todos.",
    color: "from-emerald-500 to-teal-600",
  },
];

const stats = [
  { value: "8", label: "Roles integrados", description: "Pacientes, médicos, farmacias y más" },
  { value: "50+", label: "Especialidades", description: "Cobertura médica completa" },
  { value: "24/7", label: "Disponibilidad", description: "Atención cuando la necesites" },
  { value: "100%", label: "Venezolano", description: "Hecho con orgullo local" },
];

const roadmap = [
  { phase: "Fase 1", title: "MVP Lanzado", status: "completed", description: "Plataforma funcional con citas y telemedicina" },
  { phase: "Fase 2", title: "Validación", status: "current", description: "Pruebas con usuarios reales y mejoras continuas" },
  { phase: "Fase 3", title: "Expansión", status: "upcoming", description: "Más profesionales y cobertura nacional" },
  { phase: "Fase 4", title: "Consolidación", status: "upcoming", description: "Alianzas estratégicas y crecimiento sostenido" },
];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-secondary/20 to-secondary/5 blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5">
                🇻🇪 Startup venezolana
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Transformando la{" "}
              <span className="gradient-text">salud digital</span>
              {" "}en Venezuela
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Somos una startup tecnológica construyendo el futuro de la atención médica, 
              conectando pacientes con profesionales de salud de manera simple y accesible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-20 lg:py-28 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-secondary/30 bg-secondary/5 text-secondary">
                Nuestra Historia
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                De una idea a una <span className="gradient-text">solución real</span>
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-sm">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Red-Salud nació de una frustración personal: la dificultad de conseguir citas médicas, 
                  la falta de información sobre especialistas y la desconexión entre los diferentes 
                  actores del sistema de salud en Venezuela.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Vimos una oportunidad de usar la tecnología para resolver estos problemas. 
                  No solo para pacientes, sino para médicos, farmacias, laboratorios y todos 
                  los que forman parte del ecosistema de salud.
                </p>
                <p className="text-lg text-foreground leading-relaxed font-medium">
                  Hoy estamos construyendo esa visión: una plataforma integral que simplifica 
                  la atención médica y la hace accesible para todos los venezolanos.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-colors overflow-hidden group">
                <CardContent className="p-8 lg:p-10">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Democratizar el acceso a servicios de salud de calidad en Venezuela, 
                    conectando pacientes con profesionales médicos a través de una plataforma 
                    tecnológica simple, segura y accesible.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-2 border-secondary/20 hover:border-secondary/40 transition-colors overflow-hidden group">
                <CardContent className="p-8 lg:p-10">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Ser la plataforma líder de salud digital en Venezuela, transformando 
                    la manera en que las personas acceden y gestionan su atención médica, 
                    mejorando la calidad de vida de millones.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 lg:py-28 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30 bg-primary/5">
              Lo que nos define
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nuestros <span className="gradient-text">Valores</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {valores.map((valor) => {
              const Icon = valor.icon;
              return (
                <motion.div key={valor.title} variants={fadeInUp}>
                  <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group border-border hover:border-primary/30">
                    <CardContent className="p-6 lg:p-8">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${valor.color} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{valor.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {valor.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Fundador */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-secondary/30 bg-secondary/5 text-secondary">
                Liderazgo
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Conoce al <span className="gradient-text">Fundador</span>
              </h2>
            </div>

            <Card className="overflow-hidden border-2 border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 lg:p-12">
                  {/* Avatar placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                      <span className="text-5xl font-bold text-white">FR</span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-1">Freddy Ramírez</h3>
                    <p className="text-primary font-semibold mb-4">Fundador & CEO</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Apasionado por la tecnología y su potencial para transformar la salud en Venezuela. 
                      Comprometido con construir soluciones que realmente impacten la vida de las personas, 
                      haciendo la atención médica más accesible y eficiente para todos.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="mailto:freddy@red-salud.com">
                          <Mail className="h-4 w-4" />
                          Contactar
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30 bg-primary/5">
              En números
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Lo que estamos <span className="gradient-text">construyendo</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow border-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 lg:p-8">
                    <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hecho en Venezuela */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-blue-500/10 dark:from-amber-500/20 dark:via-yellow-500/10 dark:to-blue-500/20">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="text-8xl">🇻🇪</div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-3xl font-bold mb-4">
                      Orgullosamente <span className="gradient-text">Venezolano</span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      Red-Salud es una startup 100% venezolana. Conocemos los desafíos únicos 
                      de nuestro sistema de salud porque los vivimos. Estamos comprometidos 
                      con crear soluciones que funcionen para nuestra realidad, con talento local 
                      y visión global.
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Venezuela</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Para venezolanos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span>Salud accesible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 lg:py-28 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-secondary/30 bg-secondary/5 text-secondary">
              Transparencia
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nuestro <span className="gradient-text">Camino</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Somos transparentes sobre dónde estamos y hacia dónde vamos
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-muted hidden md:block" />
              
              <div className="space-y-6">
                {roadmap.map((item, index) => (
                  <motion.div 
                    key={item.phase} 
                    variants={fadeInUp}
                    className="relative"
                  >
                    <div className="flex items-start gap-6">
                      {/* Timeline dot */}
                      <div className="hidden md:flex flex-shrink-0 w-16 h-16 items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${
                          item.status === 'completed' 
                            ? 'bg-secondary' 
                            : item.status === 'current' 
                              ? 'bg-primary animate-pulse' 
                              : 'bg-muted-foreground/30'
                        }`} />
                      </div>
                      
                      {/* Content */}
                      <Card className={`flex-1 transition-all duration-300 ${
                        item.status === 'current' 
                          ? 'border-primary/50 shadow-lg shadow-primary/10' 
                          : item.status === 'completed'
                            ? 'border-secondary/30'
                            : 'border-border opacity-70'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              item.status === 'completed'
                                ? 'bg-secondary/20 text-secondary'
                                : item.status === 'current'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {item.phase}
                            </span>
                            {item.status === 'completed' && (
                              <CheckCircle2 className="h-5 w-5 text-secondary" />
                            )}
                            {item.status === 'current' && (
                              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                                En progreso
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Sé parte del <span className="gradient-text">cambio</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Estamos en las primeras etapas de algo grande. Únete como usuario temprano 
              y ayúdanos a construir el futuro de la salud en Venezuela.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                asChild 
                size="lg" 
                className="h-12 px-8 shadow-glow hover:scale-[1.02] transition-all duration-300"
              >
                <a href={AUTH_ROUTES.REGISTER}>
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 glass-card border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <a href="/soporte/contacto">
                  <Mail className="mr-2 h-5 w-5" />
                  Contáctanos
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
