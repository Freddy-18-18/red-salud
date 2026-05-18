/**
 * Resolves the Spanish honorific for a doctor based on declared gender or
 * a fallback heuristic on the first name.
 */
export function honorificFor(
  fullName: string,
  gender?: string | null,
): "Dr." | "Dra." {
  const g = (gender || "").toLowerCase();
  if (g === "f" || g === "femenino" || g === "female") return "Dra.";
  if (g === "m" || g === "masculino" || g === "male") return "Dr.";
  const first = (fullName?.split(" ")[0] || "").toLowerCase();
  return first.endsWith("a") ? "Dra." : "Dr.";
}

/**
 * Friendly label for an age group code stored in `doctor_profiles.age_groups`.
 * The catalog is open-ended (free strings), so we map known canonical codes
 * and fall back to the raw string for anything we don't recognize.
 */
const AGE_GROUP_LABEL: Record<string, string> = {
  newborn: "Recién nacidos",
  infant: "Lactantes",
  pediatric: "Pediátrico",
  child: "Niños",
  adolescent: "Adolescentes",
  adult: "Adultos",
  senior: "Adultos mayores",
  geriatric: "Geriátrico",
};

export function ageGroupLabel(code: string): string {
  return AGE_GROUP_LABEL[code.toLowerCase()] ?? code;
}
