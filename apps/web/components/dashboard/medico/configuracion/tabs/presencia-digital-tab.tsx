/**
 * @file presencia-digital-tab.tsx
 * @description Tab de presencia digital y redes sociales
 */

"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
  AtSign,
} from "lucide-react";
import { Input, Label } from "@red-salud/ui";
import type { TabComponentProps } from "../types/professional-types";

const REDES_SOCIALES = [
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "blue",
    placeholder: "https://facebook.com/tu-perfil",
    prefix: "facebook.com/",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: Twitter,
    color: "sky",
    placeholder: "https://twitter.com/tu-usuario",
    prefix: "@",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "pink",
    placeholder: "https://instagram.com/tu-usuario",
    prefix: "@",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "blue",
    placeholder: "https://linkedin.com/in/tu-perfil",
    prefix: "linkedin.com/in/",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "red",
    placeholder: "https://youtube.com/@tu-canal",
    prefix: "youtube.com/@",
  },
];

export function PresenciaDigitalTab({
  data,
  isEditing,
  onUpdate,
}: TabComponentProps) {
  const handleUpdateSocial = (key: string, value: string) => {
    const updated = { ...data.redes_sociales };
    if (value.trim()) {
      updated[key] = value.trim();
    } else {
      delete updated[key];
    }
    onUpdate({ redes_sociales: updated });
  };

  const handleUpdateWebsite = (value: string) => {
    onUpdate({ website: value.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl">
          <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Presencia Digital
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Conecta tus redes sociales y sitio web
          </p>
        </div>
      </div>

      {/* Sitio Web */}
      <div className="space-y-3">
        <Label
          htmlFor="website"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <Globe className="h-4 w-4 text-violet-600" />
          Sitio Web Personal
        </Label>

        {isEditing ? (
          <div className="relative">
            <Input
              id="website"
              type="url"
              value={data.website || ""}
              onChange={(e) => handleUpdateWebsite(e.target.value)}
              placeholder="https://tu-sitio-web.com"
              className="pl-10 transition-all focus:border-violet-500 focus:ring-violet-500/20"
            />
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        ) : data.website ? (
          <a
            href={data.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-lg text-violet-700 dark:text-violet-300 hover:shadow-md transition-all group"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">{data.website}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic px-3 py-2">
            No especificado
          </p>
        )}
      </div>

      {/* Redes Sociales */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <AtSign className="h-4 w-4 text-violet-600" />
          Redes Sociales
        </h4>

        <div className="grid gap-4 md:grid-cols-2">
          {REDES_SOCIALES.map((red, index) => {
            const Icon = red.icon;
            const value = data.redes_sociales[red.key] || "";
            const hasValue = Boolean(value);

            return (
              <motion.div
                key={red.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-2"
              >
                <Label
                  htmlFor={`social-${red.key}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon className={`h-4 w-4 text-${red.color}-600`} />
                  {red.label}
                </Label>

                {isEditing ? (
                  <div className="relative">
                    <Input
                      id={`social-${red.key}`}
                      type="url"
                      value={value}
                      onChange={(e) => handleUpdateSocial(red.key, e.target.value)}
                      placeholder={red.placeholder}
                      className={`pl-10 transition-all focus:border-${red.color}-500 focus:ring-${red.color}-500/20`}
                    />
                    <Icon
                      className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-${red.color}-400`}
                    />
                  </div>
                ) : hasValue ? (
                  <a
                    href={value.startsWith("http") ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 bg-${red.color}-50 dark:bg-${red.color}-950/30 border border-${red.color}-200 dark:border-${red.color}-800 rounded-lg text-${red.color}-700 dark:text-${red.color}-300 text-sm hover:shadow-md transition-all group`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1">
                      {value.replace(/https?:\/\/(www\.)?/, "")}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    No configurado
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info adicional */}
      {!isEditing && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800 rounded-xl">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            💡 <strong>Tip:</strong> Una buena presencia digital ayuda a los pacientes
            a conocerte mejor y generar confianza. Mantén tus perfiles profesionales
            actualizados.
          </p>
        </div>
      )}

      {isEditing && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ <strong>Recuerda:</strong> Asegúrate de que tus perfiles de redes
            sociales sean profesionales y estén relacionados con tu práctica médica.
          </p>
        </div>
      )}
    </motion.div>
  );
}
