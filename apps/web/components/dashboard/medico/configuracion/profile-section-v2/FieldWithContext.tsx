/**
 * @file FieldWithContext.tsx
 * @description Campo de formulario con contexto educativo, validación visual y tooltips
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Label } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { PhoneInput } from "@red-salud/ui";
import { SpecialtyCombobox } from "@red-salud/ui";
import { SpecialtyMultiSelect } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";

interface FieldWithContextProps {
  label: string;
  value: string | string[];
  onChange?: (value: any) => void;
  type?: "text" | "email" | "phone" | "specialty" | "multi-specialty";
  locked?: boolean;
  verified?: boolean;
  contextInfo?: string;
  impact?: string;
  allowedValues?: string[];
  placeholder?: string;
  error?: string;
  warning?: string;
}

const FieldWithContext = ({
  label,
  value,
  onChange,
  type = "text",
  locked = false,
  verified = false,
  contextInfo,
  impact,
  allowedValues,
  placeholder,
  error,
  warning,
}: FieldWithContextProps) => {
  const [showContext, setShowContext] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const showImpact = impact && hasValue && !locked;

  const renderInput = () => {
    const commonProps = {
      value: Array.isArray(value) ? "" : value,
      onChange: (e: any) => onChange?.(e.target?.value || e),
      disabled: locked,
      placeholder,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      className: cn(
        "transition-all duration-200",
        locked && "bg-gray-50 dark:bg-gray-800 cursor-not-allowed",
        error && "border-red-500 focus:ring-red-500",
        warning && "border-yellow-500 focus:ring-yellow-500",
        hasValue && !error && !warning && "border-green-500",
        isFocused && "ring-2 ring-blue-500/20"
      ),
    };

    switch (type) {
      case "phone":
        return (
          <PhoneInput
            value={value as string}
            onChange={(val) => onChange?.(val)}
            disabled={locked}
          />
        );

      case "specialty":
        return (
          <SpecialtyCombobox
            value={value as string}
            onChange={(val) => onChange?.(val)}
            allowedSpecialties={allowedValues || []}
            readOnly={locked}
            placeholder={placeholder || "Seleccionar especialidad"}
          />
        );

      case "multi-specialty":
        return (
          <SpecialtyMultiSelect
            selected={(value as string[]) || []}
            onChange={(val) => onChange?.(val)}
            placeholder={placeholder || "Buscar especialidades"}
            readOnly={locked}
          />
        );

      case "email":
        return <Input {...commonProps} type="email" />;

      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="space-y-2">
      {/* Label con iconos de estado */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Label className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{label}</span>

          {locked && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <Lock className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Bloqueado</span>
            </div>
          )}

          {verified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30"
            >
              <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">Verificado</span>
            </motion.div>
          )}

          {(contextInfo || impact) && (
            <button
              type="button"
              onClick={() => setShowContext(!showContext)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Ver más información"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </Label>

        {/* Estado visual */}
        {!locked && (
          <div className="flex items-center gap-1">
            {error && (
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Error</span>
              </span>
            )}
            {warning && !error && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Advertencia</span>
              </span>
            )}
            {hasValue && !error && !warning && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20"
              >
                <CheckCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Válido</span>
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="relative">
        {renderInput()}

        {/* Indicador de focus */}
        {isFocused && !locked && (
          <motion.div
            layoutId="focus-indicator"
            className="absolute inset-0 rounded-md border-2 border-blue-500 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>

      {/* Mensajes de error/warning */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {warning && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{warning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contexto expandible */}
      <AnimatePresence>
        {showContext && (contextInfo || impact) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {/* Información contextual */}
              {contextInfo && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300 min-w-0">
                    <p className="font-medium mb-1">
                      {locked ? "¿Por qué está bloqueado?" : "¿Por qué es importante?"}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 break-words">{contextInfo}</p>
                    {locked && (
                      <p className="text-xs text-blue-500 dark:text-blue-500 mt-2 italic">
                        Este campo fue verificado automáticamente mediante el sistema SACS y no puede ser modificado manualmente.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Impacto */}
              {showImpact && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex items-start gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium mb-1">💡 Impacto en tu perfil</p>
                    <p className="text-green-600 dark:text-green-400">{impact}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button para contexto */}
      {(contextInfo || impact) && (
        <button
          type="button"
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 transition-colors"
        >
          {showContext ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Ocultar información
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Ver más información
            </>
          )}
        </button>
      )}
    </div>
  );
};

export { FieldWithContext };
export default FieldWithContext;
