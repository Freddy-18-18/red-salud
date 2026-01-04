"use client";

import { Input } from "./input";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  className = "",
}: PhoneInputProps) {
  const formatPhoneNumber = (input: string) => {
    // Remover todo excepto números
    const numbers = input.replace(/\D/g, "");

    // Si está vacío, retornar vacío
    if (!numbers) return "";

    // Siempre empezar con 58
    let phoneNumbers = numbers;
    if (!phoneNumbers.startsWith("58")) {
      phoneNumbers = "58" + phoneNumbers;
    }

    // Formatear: +58 XXX XXX XXXX (espacios en lugar de guiones)
    if (phoneNumbers.length <= 2) {
      return `+${phoneNumbers}`;
    } else if (phoneNumbers.length <= 5) {
      return `+58 ${phoneNumbers.slice(2)}`;
    } else if (phoneNumbers.length <= 8) {
      return `+58 ${phoneNumbers.slice(2, 5)} ${phoneNumbers.slice(5)}`;
    } else if (phoneNumbers.length <= 12) {
      return `+58 ${phoneNumbers.slice(2, 5)} ${phoneNumbers.slice(5, 8)} ${phoneNumbers.slice(8)}`;
    } else {
      return `+58 ${phoneNumbers.slice(2, 5)} ${phoneNumbers.slice(5, 8)} ${phoneNumbers.slice(8, 12)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Si el usuario borra todo, mantener +58
    if (!input || input === "+58" || input === "+58 " || input === "+5" || input === "+") {
      onChange("+58 ");
      return;
    }

    // Extraer solo los números
    const numbers = input.replace(/\D/g, "");

    // Formatear y actualizar
    const formatted = formatPhoneNumber(numbers);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;

    // Prevenir borrar el +58
    if (e.key === "Backspace") {
      // Si hay selección y afecta el +58, prevenir
      if (cursorPosition <= 4 || (cursorPosition > 4 && selectionEnd <= 4)) {
        e.preventDefault();
        return;
      }
    }

    if (e.key === "Delete" && cursorPosition < 4) {
      e.preventDefault();
      return;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Si está vacío al hacer focus, agregar +58
    if (!value || value === "") {
      onChange("+58 ");
    }
  };

  const displayValue = value || "+58 ";

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="+58 412-1234567"
      disabled={disabled}
      className={className}
      maxLength={17} // +58 XXX-XXXXXXX
    />
  );
}
