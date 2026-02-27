"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  maxDate?: string;
  minDate?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  maxDate,
  minDate,
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value + "T00:00:00") : new Date()
  );
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convertir YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatToDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convertir DD/MM/YYYY a YYYY-MM-DD
  const formatToISO = (displayDate: string) => {
    const cleaned = displayDate.replace(/\D/g, "");
    if (cleaned.length !== 8) return "";

    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);

    // Validar fecha
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (dayNum < 1 || dayNum > 31) return "";
    if (monthNum < 1 || monthNum > 12) return "";
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return "";

    return `${year}-${month}-${day}`;
  };

  // Usar useMemo para evitar setState en useEffect
  const displayValue = formatToDisplay(value);
  const [localDisplayValue, setLocalDisplayValue] = useState(displayValue);
  const [error, setError] = useState("");

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  // Sincronizar cuando cambia el valor externo
  useEffect(() => {
    const newValue = formatToDisplay(value);
    if (newValue !== localDisplayValue) {
      setLocalDisplayValue(newValue);
    }
  }, [value, localDisplayValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setViewMode("days");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // Solo números

    // Limitar a 8 dígitos
    if (input.length > 8) input = input.substring(0, 8);

    // Formatear con /
    let formatted = "";
    if (input.length > 0) {
      formatted = input.substring(0, 2);
      if (input.length >= 3) {
        formatted += "/" + input.substring(2, 4);
      }
      if (input.length >= 5) {
        formatted += "/" + input.substring(4, 8);
      }
    }

    setLocalDisplayValue(formatted);
    setError("");

    // Si tiene 10 caracteres (DD/MM/YYYY), validar y convertir
    if (formatted.length === 10) {
      const isoDate = formatToISO(formatted);

      if (!isoDate) {
        setError("Fecha inválida");
        return;
      }

      // Validar rango
      if (maxDate && isoDate > maxDate) {
        setError("Fecha no puede ser futura");
        return;
      }

      if (minDate && isoDate < minDate) {
        setError("Fecha muy antigua");
        return;
      }

      onChange(isoDate);
      setCurrentMonth(new Date(isoDate + "T00:00:00"));
    }
  };

  const handleInputBlur = () => {
    if (displayValue && displayValue.length === 10) {
      const isoDate = formatToISO(displayValue);
      if (!isoDate) {
        setError("Fecha inválida. Formato: DD/MM/AAAA");
      }
    } else if (displayValue && displayValue.length > 0) {
      setError("Fecha incompleta. Formato: DD/MM/AAAA");
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handlePrevYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth())
    );
  };

  const handleNextYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())
    );
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0]!;
    onChange(dateStr);
    setIsOpen(false);
    setViewMode("days");
    setError("");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex));
    setViewMode("days");
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth()));
    setViewMode("months");
  };

  const handleToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]!;

    // Verificar si hoy está dentro del rango permitido
    if (maxDate && todayStr > maxDate) return;
    if (minDate && todayStr < minDate) return;

    onChange(todayStr);
    setCurrentMonth(today);
    setIsOpen(false);
    setViewMode("days");
    setError("");
  };

  const handleCalendarClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleClear = () => {
    onChange("");
    setLocalDisplayValue("");
    setIsOpen(false);
    setViewMode("days");
    setError("");
  };

  const isDateDisabled = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0]!;

    if (maxDate && dateStr > maxDate) return true;
    if (minDate && dateStr < minDate) return true;
    return false;
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const monthNamesShort = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Generar décadas para vista de años
  const startDecade = Math.floor(year / 10) * 10;
  const yearsInView = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input híbrido */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={localDisplayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={`w-full px-3 py-2 pr-10 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors ${error
            ? "border-red-500"
            : "border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-gray-400"
            }`}
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Abrir calendario"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {/* Calendario flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
          >
            {/* Header con navegación */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Año anterior"
                  title="Año anterior"
                >
                  <ChevronsLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Mes anterior"
                  title="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Selector de mes y año */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                >
                  {monthNames[month]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                >
                  {year}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Próximo mes"
                  title="Próximo mes"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Próximo año"
                  title="Próximo año"
                >
                  <ChevronsRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Vista de días */}
            {viewMode === "days" && (
              <>
                {/* Nombres de días */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-xs font-semibold text-gray-600 text-center py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === month &&
                      selectedDate.getFullYear() === year;
                    const isDisabled = isDateDisabled(day);
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === month &&
                      new Date().getFullYear() === year;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => !isDisabled && handleDateSelect(day)}
                        disabled={isDisabled}
                        className={`h-9 text-sm rounded-md font-medium transition-all ${isSelected
                          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                          : isToday
                            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                            : isDisabled
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Vista de meses */}
            {viewMode === "months" && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {monthNamesShort.map((monthName, index) => {
                  const isSelected = selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === year;
                  const isCurrent = new Date().getMonth() === index && new Date().getFullYear() === year;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`py-3 text-sm font-medium rounded-md transition-all ${isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : isCurrent
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {monthName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Vista de años */}
            {viewMode === "years" && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {yearsInView.map((y) => {
                  const isSelected = selectedDate && selectedDate.getFullYear() === y;
                  const isCurrent = new Date().getFullYear() === y;
                  const isOutOfRange = y < startDecade || y > startDecade + 9;

                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearSelect(y)}
                      className={`py-3 text-sm font-medium rounded-md transition-all ${isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : isCurrent
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : isOutOfRange
                            ? "text-gray-400"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer con botones de acción */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleToday}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
              >
                Hoy
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm font-medium text-gray-600 hover:text-gray-700 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
