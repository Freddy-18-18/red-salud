"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { APP_NAME, ROUTES, SOCIAL_LINKS, CONTACT_INFO } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const footerLinks = {
  company: [
    { name: "Nosotros", href: ROUTES.NOSOTROS },
    { name: "Servicios", href: ROUTES.SERVICIOS },
    { name: "Blog", href: ROUTES.BLOG },
    { name: "Contacto", href: ROUTES.CONTACTO },
  ],
  support: [
    { name: "Soporte", href: ROUTES.SOPORTE },
    { name: "FAQ", href: ROUTES.FAQ },
    { name: "Precios", href: ROUTES.PRECIOS },
  ],
  legal: [
    { name: "Términos y Condiciones", href: ROUTES.TERMINOS },
    { name: "Política de Privacidad", href: ROUTES.PRIVACIDAD },
  ],
};

const socialIcons = [
  { Icon: Facebook, href: SOCIAL_LINKS.FACEBOOK, label: "Facebook" },
  { Icon: Twitter, href: SOCIAL_LINKS.TWITTER, label: "Twitter" },
  { Icon: Instagram, href: SOCIAL_LINKS.INSTAGRAM, label: "Instagram" },
  { Icon: Linkedin, href: SOCIAL_LINKS.LINKEDIN, label: "LinkedIn" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[hsl(230,25%,9%)] text-[hsl(220,15%,70%)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Link href={ROUTES.HOME} className="inline-flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-primary to-secondary text-white px-3 py-2 rounded-lg font-bold text-xl">
                RS
              </div>
              <span className="font-bold text-2xl text-white">{APP_NAME}</span>
            </Link>
            <p className="text-[hsl(220,15%,60%)] mb-6 max-w-md">
              Transformamos la atención médica con tecnología innovadora,
              conectando pacientes y profesionales de la salud de manera eficiente y segura.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-5 w-5 text-primary" />
                <a href={`mailto:${CONTACT_INFO.EMAIL}`} className="hover:text-white transition-colors">
                  {CONTACT_INFO.EMAIL}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-5 w-5 text-primary" />
                <a href={`tel:${CONTACT_INFO.PHONE}`} className="hover:text-white transition-colors">
                  {CONTACT_INFO.PHONE}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{CONTACT_INFO.ADDRESS}</span>
              </div>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-semibold text-white mb-4">Compañía</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-semibold text-white mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={fadeInUp}>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="border-t border-[hsl(230,20%,15%)] my-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.p variants={fadeInUp} className="text-sm text-[hsl(220,15%,55%)]" suppressHydrationWarning>
            © {currentYear} {APP_NAME}. Todos los derechos reservados.
          </motion.p>

          {/* Social Links */}
          <motion.div variants={fadeInUp} className="flex items-center space-x-4">
            {socialIcons.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                className="p-2 rounded-full bg-[hsl(230,20%,15%)] hover:bg-primary transition-colors duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
