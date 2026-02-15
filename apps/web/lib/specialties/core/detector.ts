// ============================================
// SPECIALTY DETECTOR
// Auto-detects specialty from user profile data
// ============================================

import type { SpecialtyConfig, SpecialtyContext, SpecialtyDetectionResult, SpecialtyId } from './types';
import { getSpecialtyConfig, getAllSpecialties } from './registry';

/**
 * Normalize text for comparison
 * Removes accents, converts to lowercase, trims
 */
function normalizeText(value?: string | null): string {
  if (!value) return '';
  return (
    value
      // Remove diacritics (accents, tildes, etc.)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Convert to lowercase
      .toLowerCase()
      // Trim whitespace
      .trim()
  );
}

/**
 * Check if a text contains any of the given keywords
 * Uses word-boundary matching for better accuracy
 */
function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  // Exact match
  if (normalizedText === normalizedKeyword) return true;

  // Contains as whole word (using word boundaries)
  const wordBoundary = new RegExp(
    `\\b${escapeRegex(normalizedKeyword)}\\b`,
    'i'
  );
  if (wordBoundary.test(normalizedText)) return true;

  // Contains as substring (for multi-word terms)
  if (normalizedText.includes(normalizedKeyword)) return true;

  // Reverse check (keyword contains text) for partial matches
  if (normalizedKeyword.includes(normalizedText)) return true;

  return false;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect specialty from context
 * Returns the most likely specialty based on available data
 *
 * Detection priority:
 * 0. specialtySlug (direct DB slug → certain confidence)
 * 1. forceSpecialtyId (for development/testing)
 * 2. SACS código match
 * 3. SACS especialidad match
 * 4. specialtyName keyword match
 * 5. subSpecialties keyword match
 */
export function detectSpecialty(context: SpecialtyContext): SpecialtyDetectionResult {
  const {
    specialtySlug,
    forceSpecialtyId,
    sacsCodigo,
    sacsEspecialidad,
    specialtyName,
    subSpecialties,
  } = context;

  // 0. Direct slug resolution (highest confidence — from DB)
  if (specialtySlug) {
    const config = getSpecialtyConfig(specialtySlug);
    if (config) {
      return {
        detected: true,
        specialtyId: config.id,
        confidence: 'certain',
        matchedKeyword: `slug:${specialtySlug}`,
      };
    }
  }

  // 1. Forced specialty (development/testing)
  if (forceSpecialtyId) {
    const config = getSpecialtyConfig(forceSpecialtyId);
    if (config) {
      return {
        detected: true,
        specialtyId: config.id,
        confidence: 'certain',
        matchedKeyword: 'forced',
      };
    }
  }

  // Get all specialties sorted by specificity (more specific first)
  const allSpecialties = getAllSpecialties().sort((a, b) => {
    // Sub-specialties (with hyphens) should come before main specialties
    const aIsSub = a.id.includes('-');
    const bIsSub = b.id.includes('-');
    if (aIsSub && !bIsSub) return -1;
    if (!aIsSub && bIsSub) return 1;
    return a.id.localeCompare(b.id);
  });

  // 2. SACS Código match (highest confidence for Venezuelan doctors)
  if (sacsCodigo) {
    for (const specialty of allSpecialties) {
      if (specialty.sacsCodes?.includes(sacsCodigo)) {
        return {
          detected: true,
          specialtyId: specialty.id,
          confidence: 'certain',
          matchedKeyword: `sacs:${sacsCodigo}`,
        };
      }
    }
  }

  // 3. SACS Especialidad match
  if (sacsEspecialidad) {
    for (const specialty of allSpecialties) {
      if (
        specialty.keywords.some((keyword) =>
          containsKeyword(sacsEspecialidad, keyword)
        )
      ) {
        return {
          detected: true,
          specialtyId: specialty.id,
          confidence: 'certain',
          matchedKeyword: `sacs_especialidad:${sacsEspecialidad}`,
        };
      }
    }
  }

  // 4. Specialty Name match
  if (specialtyName) {
    const matches: Array<{ id: string; confidence: SpecialtyDetectionResult['confidence']; keyword: string }> = [];

    for (const specialty of allSpecialties) {
      for (const keyword of specialty.keywords) {
        if (containsKeyword(specialtyName, keyword)) {
          // Determine confidence based on match quality
          let confidence: SpecialtyDetectionResult['confidence'] = 'possible';

          const normalizedName = normalizeText(specialtyName);
          const normalizedKeyword = normalizeText(keyword);

          // Exact match = certain
          if (normalizedName === normalizedKeyword) {
            confidence = 'certain';
          }
          // Whole word match = likely
          else if (
            new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, 'i').test(
              normalizedName
            )
          ) {
            confidence = 'likely';
          }
          // Sub-specialty match gets higher confidence
          else if (specialty.id.includes('-')) {
            confidence = 'likely';
          }

          matches.push({
            id: specialty.id,
            confidence,
            keyword,
          });
          break; // Found a match for this specialty, move to next
        }
      }
    }

    // Sort matches by confidence and specificity
    matches.sort((a, b) => {
      // By confidence (certain > likely > possible)
      const confidenceOrder: Record<string, number> = { certain: 3, likely: 2, possible: 1, none: 0 };
      const confidenceDiff = (confidenceOrder[b.confidence || 'possible'] || 0) - (confidenceOrder[a.confidence || 'possible'] || 0);
      if (confidenceDiff !== 0) return confidenceDiff;

      // By specificity (sub-specialties first)
      const aIsSub = a.id.includes('-');
      const bIsSub = b.id.includes('-');
      if (aIsSub && !bIsSub) return -1;
      if (!aIsSub && bIsSub) return 1;

      return 0;
    });

    if (matches.length > 0) {
      const bestMatch = matches[0]!;
      return {
        detected: true,
        specialtyId: bestMatch.id,
        confidence: bestMatch.confidence,
        matchedKeyword: bestMatch.keyword,
        alternativeIds: matches.slice(1).map((m) => m.id),
      };
    }
  }

  // 5. Sub-specialties match
  if (subSpecialties && subSpecialties.length > 0) {
    for (const sub of subSpecialties) {
      for (const specialty of allSpecialties) {
        if (
          specialty.keywords.some((keyword) => containsKeyword(sub, keyword))
        ) {
          return {
            detected: true,
            specialtyId: specialty.id,
            confidence: 'possible',
            matchedKeyword: `sub:${sub}`,
          };
        }
      }
    }
  }

  // No specialty detected
  return {
    detected: false,
    specialtyId: null,
    confidence: 'none',
  };
}

/**
 * Get the best matching specialty config for a context
 * Returns null if no specialty is detected (default behavior)
 */
export function getSpecialtyForContext(
  context: SpecialtyContext,
  fallbackToDefault = true
): SpecialtyConfig | null {
  const detection = detectSpecialty(context);

  if (detection.detected && detection.specialtyId) {
    return getSpecialtyConfig(detection.specialtyId) || null;
  }

  // Fallback to default specialty if enabled
  if (fallbackToDefault) {
    return getSpecialtyConfig('default') || null;
  }

  return null;
}

/**
 * Check if a context matches a specific specialty
 */
export function contextMatchesSpecialty(
  context: SpecialtyContext,
  specialtyId: string
): boolean {
  const detection = detectSpecialty(context);
  return detection.specialtyId === specialtyId;
}

/**
 * Get detection info for a context (for debugging/analytics)
 */
export function getDetectionInfo(
  context: SpecialtyContext
): SpecialtyDetectionResult & {
  specialtyName?: string;
  detectedConfig?: SpecialtyConfig;
 } {
  const detection = detectSpecialty(context);
  const config = detection.specialtyId
    ? getSpecialtyConfig(detection.specialtyId)
    : undefined;

  return {
    ...detection,
    specialtyName: config?.name,
    detectedConfig: config,
  };
}

/**
 * Quick check if context is likely a dental specialty
 * Kept for backwards compatibility with existing code
 */
export function isDentalSpecialty(context: SpecialtyContext): boolean {
  const detection = detectSpecialty(context);
  return !!(
    detection.detected &&
    (detection.specialtyId === 'dental' ||
      detection.specialtyId?.startsWith('dental-'))
  );
}

/**
 * Legacy function for backwards compatibility
 * TODO: Remove after migrating all callers to detectSpecialty()
 */
export function isOdontologySpecialty(specialtyName?: string | null): boolean {
  if (!specialtyName) return false;

  const ODONTOLOGY_KEYWORDS = [
    'odontologia',
    'odontología',
    'cirujano dentista',
    'doctor en odontologia',
    'doctor en odontología',
    'estomatologia',
    'estomatología',
    'odontologo',
    'odontólogo',
    'dental',
  ];

  const normalized = normalizeText(specialtyName);
  return ODONTOLOGY_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return (
      normalized === normalizedKeyword ||
      normalized.includes(normalizedKeyword) ||
      normalizedKeyword.includes(normalized)
    );
  });
}
