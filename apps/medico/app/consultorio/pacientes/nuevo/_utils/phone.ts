export function formatVzlaPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const rest = digits.startsWith("58") ? digits.slice(2) : digits;
  const trimmed = rest.slice(0, 10);
  const a = trimmed.slice(0, 3);
  const b = trimmed.slice(3, 6);
  const c = trimmed.slice(6, 10);
  let out = "+58";
  if (a) out += ` ${a}`;
  if (b) out += ` ${b}`;
  if (c) out += ` ${c}`;
  return out;
}

export function validateVzlaPhone(formatted: string) {
  // Allow empty fields - don't show error for empty input
  if (!formatted || formatted === "+58") return null;
  return /^\+58\s\d{3}\s\d{3}\s\d{4}$/.test(formatted) ? null : "Formato: +58 412 1234567";
}

export function enforceVzlaPhone(value: string) {
  const formatted = formatVzlaPhone(value);
  const error = validateVzlaPhone(formatted);
  return { formatted, error };
}