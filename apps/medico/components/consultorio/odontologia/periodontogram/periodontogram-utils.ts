import type { PerioSite } from "@/types/dental";

/**
 * Returns descriptive label for perio site abbreviations
 * @param site - The site code (MB, B, DB, ML, L, DL)
 * @returns Full Spanish description of the site
 */
export function getSiteLabel(site: PerioSite): string {
  const labels: Record<PerioSite, string> = {
    MB: "Mesio-Bucal",
    B: "Bucal",
    DB: "Disto-Bucal",
    ML: "Mesio-Lingual",
    L: "Lingual",
    DL: "Disto-Lingual"
  };
  return labels[site];
}

/**
 * Returns descriptive label for mobility grade
 * @param grade - Mobility grade (0-3)
 * @returns Full Spanish description of the mobility level
 */
export function getMobilityLabel(grade: number): string {
  const labels = [
    "Sin movilidad",
    "Movilidad leve (grado 1)",
    "Movilidad moderada (grado 2)",
    "Movilidad severa (grado 3)"
  ];
  return labels[grade] || "";
}

/**
 * Returns descriptive label for furcation grade
 * @param grade - Furcation grade (0-3)
 * @returns Full Spanish description of the furcation level
 */
export function getFurcationLabel(grade: number): string {
  const labels = [
    "Sin afectación",
    "Furcación grado 1",
    "Furcación grado 2",
    "Furcación grado 3"
  ];
  return labels[grade] || "";
}

/**
 * Returns tooltip description for BOP (Bleeding on Probing)
 * @returns Spanish explanation of BOP indicator
 */
export function getBOPTooltip(): string {
  return "BOP - Bleeding on Probing: Indica inflamación gingival activa";
}

/**
 * Returns tooltip description for implant marker
 * @returns Spanish explanation of implant indicator
 */
export function getImplantTooltip(): string {
  return "Implante dental: Prótesis sobre implante";
}

/**
 * Returns tooltip description for missing tooth marker
 * @returns Spanish explanation of missing tooth indicator
 */
export function getMissingTooltip(): string {
  return "Diente ausente: Extracción previa o agenesia";
}

/**
 * Returns tooltip description for probing depth measurement
 * @returns Spanish explanation of probing depth
 */
export function getProbingDepthTooltip(): string {
  return "Profundidad de la bolsa gingival medida en milímetros desde el margen gingival";
}

/**
 * Returns tooltip description for gingival recession measurement
 * @returns Spanish explanation of gingival recession
 */
export function getRecessionTooltip(): string {
  return "Recesión gingival: Distancia desde el límite cemento-esmalte a la margen gingival";
}

/**
 * Returns tooltip description for suppuration indicator
 * @returns Spanish explanation of suppuration
 */
export function getSuppurationTooltip(): string {
  return "Supuración: Presencia de pus al sondar la bolsa periodontal";
}

/**
 * Returns tooltip description for plaque indicator
 * @returns Spanish explanation of plaque
 */
export function getPlaqueTooltip(): string {
  return "Placa bacteriana: Acumulación de bacterias en la superficie dental";
}

/**
 * Returns descriptive label for CAL (Clinical Attachment Level)
 * @returns Spanish explanation of CAL
 */
export function getCALTooltip(): string {
  return "NIC (Nivel de Inserción Clínica): Distancia desde el límite CEJ al fondo de la bolsa";
};
