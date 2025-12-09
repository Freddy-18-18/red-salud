"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME, AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MainNav } from "@/components/layout/main-nav";

const servicios = [
  { name: "Pacientes", href: "/servicios/pacientes", description: "Consultas médicas en línea" },
  { name: "Médicos", href: "/servicios/medicos", description: "Plataforma para profesionales" },
  { name: "Clínicas", href: "/servicios/clinicas", description: "Gestión de centros médicos" },
  { name: "Laboratorios", href: "/servicios/laboratorios", description: "Análisis y resultados" },
  { name: "Farmacias", href: "/servicios/farmacias", description: "Gestión de medicamentos" },
  { name: "Secretarias", href: "/servicios/secretarias", description: "Organiza agendas médicas" },
  { name: "Ambulancias", href: "/servicios/ambulancias", description: "Servicio de emergencias" },
  { name: "Seguros", href: "/servicios/seguros", description: "Gestión de pólizas" },
];

const navItems = [
  { name: "Inicio", href: ROUTES.HOME },
  { name: "Nosotros", href: ROUTES.NOSOTROS },
  { name: "Servicios", href: ROUTES.SERVICIOS, hasDropdown: true },
  { name: "Precios", href: ROUTES.PRECIOS },
  { name: "Blog", href: ROUTES.BLOG },
  { name: "Soporte", href: ROUTES.SOPORTE },
];



export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
              <Logo size="lg" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden xl:flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MainNav isScrolled={isScrolled} />
          </motion.div>

          {/* Theme Toggle + Auth Buttons Desktop */}
          <motion.div
            className="hidden xl:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              className="border border-border hover:border-primary/50 text-foreground hover:bg-primary/5 transition-all duration-300"
            >
              <Link href={AUTH_ROUTES.LOGIN}>Iniciar Sesión</Link>
            </Button>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Link href={AUTH_ROUTES.REGISTER}>Registrarse</Link>
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="xl:hidden p-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="xl:hidden bg-background border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.hasDropdown ? (
                    <MobileServiciosItem />
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-3 rounded-lg text-foreground hover:bg-primary/5 hover:text-primary transition-colors duration-300 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Link
                    href={AUTH_ROUTES.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  <Link
                    href={AUTH_ROUTES.REGISTER}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MobileServiciosItem() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="w-full px-4 py-3 rounded-lg text-foreground hover:bg-primary/5 hover:text-primary transition-colors duration-300 font-medium flex items-center justify-between"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-servicios"
      >
        Servicios
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-servicios"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 ml-2 border-l border-border"
          >
            <div className="pl-4 space-y-1">
              {servicios.map((s) => (
                <Link key={s.name} href={s.href} className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors" >
                  {s.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
