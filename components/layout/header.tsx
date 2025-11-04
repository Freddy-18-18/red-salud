"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME, AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Inicio", href: ROUTES.HOME },
  { name: "Servicios", href: ROUTES.SERVICIOS },
  { name: "Precios", href: ROUTES.PRECIOS },
  { name: "Nosotros", href: ROUTES.NOSOTROS },
  { name: "Blog", href: ROUTES.BLOG },
  { name: "FAQ", href: ROUTES.FAQ },
  { name: "Soporte", href: ROUTES.SOPORTE },
  { name: "Contacto", href: ROUTES.CONTACTO },
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
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-teal-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-linear-to-br from-blue-600 to-teal-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
                  RS
                </div>
              </div>
              <span
                className={cn(
                  "font-bold text-2xl transition-colors duration-300",
                  isScrolled ? "text-gray-900" : "text-white"
                )}
              >
                {APP_NAME}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden lg:flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105",
                    isScrolled
                      ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Auth Buttons Desktop */}
          <motion.div
            className="hidden lg:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              asChild
              variant="outline"
              className={cn(
                "border-2 transition-all duration-300",
                isScrolled
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "border-white/30 text-white hover:bg-white/10"
              )}
            >
              <Link href={AUTH_ROUTES.LOGIN}>Iniciar Sesión</Link>
            </Button>
            <Button
              asChild
              className="bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={AUTH_ROUTES.REGISTER}>Registrarse</Link>
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white"
                )}
              />
            ) : (
              <Menu
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white"
                )}
              />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white border-t border-gray-200"
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
                  <Link
                    href={item.href}
                    className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-4 flex flex-col gap-3"
              >
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
                  className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
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
