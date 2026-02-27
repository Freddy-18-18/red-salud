/**
 * @file id-mapping.ts
 * @description Redirección al SDK para mapeo de IDs y resolución de identidades.
 */

export {
  SPECIALTY_ID_MAPPING,
  masterIdToSlug,
  slugToMasterId,
  getIdentityBySlug,
  getIdentityByMasterId,
  getIdentityByName,
  resolveIdentity,
  searchIdentities,
  getSubSpecialties,
  getParentSpecialty,
  getSpecialtyTree,
} from '@red-salud/sdk-medico';
