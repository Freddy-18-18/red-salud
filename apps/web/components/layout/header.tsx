"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@red-salud/ui";
import { ROUTES, APP_NAME, AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@red-salud/core/utils";
import { Logo, ThemeToggle, useTheme } from "@red-salud/ui";
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
  { name: "Academia (Próximamente)", href: "#", description: "Formación y capacitación médica" },
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
  const pathname = usePathname();
  const { theme } = useTheme();
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setEffectiveTheme(isDark ? "dark" : "light");
    } else {
      setEffectiveTheme(theme as "light" | "dark");
    }
  }, [theme]);

  // Pages with dark hero sections where header should be white when transparent
  // Home page is only dark hero in dark mode
  const isHome = pathname === "/";
  const isDarkHeroPage =
    (isHome && effectiveTheme === "dark") ||
    pathname.startsWith("/servicios") ||
    pathname.startsWith("/academy");

  const isDarkTheme = isDarkHeroPage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
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
                <Logo size="lg" className={cn(isDarkTheme ? "text-white" : "text-foreground")} />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden xl:flex items-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <MainNav isScrolled={isScrolled} theme={isDarkTheme ? "dark" : "light"} />
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
                className={cn(
                  "border transition-all duration-300",
                  isDarkTheme
                    ? "border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/50"
                    : "border-border hover:border-primary/50 text-foreground hover:bg-primary/5"
                )}
              >
                <Link href={AUTH_ROUTES.LOGIN}>Iniciar Sesión</Link>
              </Button>
              <Button
                asChild
                className={cn(
                  "transition-all duration-300 shadow-lg",
                  isDarkTheme
                    ? "bg-white text-primary hover:bg-white/90 shadow-white/10"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                )}
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
                <X className={cn("h-6 w-6", isDarkTheme ? "text-white" : "text-foreground")} />
              ) : (
                <Menu className={cn("h-6 w-6", isDarkTheme ? "text-white" : "text-foreground")} />
              )}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="xl:hidden fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 h-16 sm:h-20 border-b border-border/10">
                <Link href={ROUTES.HOME} onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo size="lg" className="text-foreground" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <X className="h-6 w-6 text-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6">
                <nav className="flex flex-col space-y-6">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      {item.hasDropdown ? (
                        <MobileServiciosItem onClose={() => setIsMobileMenuOpen(false)} />
                      ) : (
                        <Link
                          href={item.href}
                          className="text-2xl font-medium text-foreground hover:text-primary transition-colors flex items-center justify-between group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-base">
                            →
                          </span>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10 pt-8 border-t border-border/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-muted-foreground">Apariencia</span>
                    <ThemeToggle />
                  </div>
                  <div className="grid gap-4">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-lg h-12"
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
                      className="w-full text-lg h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      <Link
                        href={AUTH_ROUTES.REGISTER}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileServiciosItem({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <button
        className="w-full text-left text-2xl font-medium text-foreground hover:text-primary transition-colors flex items-center justify-between group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Servicios
        <ChevronDown
          className={cn(
            "h-6 w-6 transition-transform duration-300 text-muted-foreground group-hover:text-primary",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-4 border-l-2 border-primary/20 space-y-3 py-2">
              {servicios.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  className="block text-lg text-muted-foreground hover:text-primary transition-colors py-1"
                  onClick={onClose}
                >
                  {s.name}
                  <p className="text-xs text-muted-foreground/60 font-normal">{s.description}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
