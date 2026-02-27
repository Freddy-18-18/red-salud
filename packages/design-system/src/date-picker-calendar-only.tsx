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

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    const dateStr = date.toISOString().split("T")[0];
    onChange(dateStr);
    setIsOpen(false);
    setViewMode("days");
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
    const todayStr = today.toISOString().split("T")[0];

    // Verificar si hoy está dentro del rango permitido
    if (maxDate && todayStr > maxDate) return;
    if (minDate && todayStr < minDate) return;

    onChange(todayStr);
    setCurrentMonth(today);
    setIsOpen(false);
    setViewMode("days");
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setViewMode("days");
  };

  const isDateDisabled = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

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
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between transition-colors ${disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "hover:border-gray-400"
          }`}
        aria-label="Abrir selector de fecha"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? formatDisplayDate(value) : "Seleccionar fecha"}
        </span>
        <Calendar className="h-4 w-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
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
