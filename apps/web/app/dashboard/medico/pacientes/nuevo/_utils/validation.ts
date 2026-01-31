export function validateEmailFormat(v: string) {
  if (!v) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(v) ? null : "Formato de email inválido";
}

export function validatePhoneFormat(v: string) {
  if (!v) return null;
  const re = /^\+?\d[\d\s-]{7,}$/;
  return re.test(v) ? null : "Formato de teléfono inválido";
}