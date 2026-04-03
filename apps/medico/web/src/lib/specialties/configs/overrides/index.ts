/**
 * @file overrides/index.ts
 * @description Registro central de overrides de configuración por especialidad.
 *
 * Exporta un mapa slug → SpecialtyConfigOverride para que el
 * auto-registry aplique configuraciones personalizadas a las
 * especialidades que las tienen.
 */

import type { SpecialtyConfigOverride } from '../config-factory';
import { odontologiaOverride } from './odontologia';
import { cardiologiaOverride } from './cardiologia';
import { pediatriaOverride } from './pediatria';
import { neurologiaOverride } from './neurologia';
import { traumatologiaOverride } from './traumatologia';
import { oftalmologiaOverride } from './oftalmologia';
import { ginecologiaOverride } from './ginecologia';
import { infectologiaPediatricaOverride } from './infectologia-pediatrica';
import { urologiaOverride } from './urologia';
import { medicinaInternaOverride } from './medicina-interna';
import { cardiologiaIntervencionistaOverride } from './cardiologia-intervencionista';
import { electrofisiologiaCardiacaOverride } from './electrofisiologia-cardiaca';
import { hemodinamiaOverride } from './hemodinamia';
import { cardiologiaPediatricaOverride } from './cardiologia-pediatrica';
import { cirugiaCardiovascularOverride } from './cirugia-cardiovascular';
import { angiologiaOverride } from './angiologia';
import { cirugiaVascularOverride } from './cirugia-vascular';
import { intervencionismoVascularOverride } from './intervencionismo-vascular';
import { flebologiaOverride } from './flebologia';
import { medicinaGeneralOverride } from './medicina-general';
import { medicinaFamiliarOverride } from './medicina-familiar';
import { geriatriaOverride } from './geriatria';
import { endocrinologiaOverride } from './endocrinologia';
import { endocrinologiaPediatricaOverride } from './endocrinologia-pediatrica';
import { diabetologiaOverride } from './diabetologia';
import { nutriologiaOverride } from './nutriologia';
import { radiologiaOverride } from './radiologia';
import { medicinaNuclearOverride } from './medicina-nuclear';
import { ecografiaOverride } from './ecografia';
import { patologiaOverride } from './patologia';
import { patologiaClinicaOverride } from './patologia-clinica';
import { citopatologiaOverride } from './citopatologia';
import { anestesiologiaOverride } from './anestesiologia';
import { anestesiaPediatricaOverride } from './anestesia-pediatrica';
import { anestesiaCardiovascularOverride } from './anestesia-cardiovascular';
import { medicinaEmergenciasOverride } from './medicina-emergencias';
import { medicinaIntensivaOverride } from './medicina-intensiva';
import { quemadosOverride } from './quemados';
import { medicinaHiperbaricaOverride } from './medicina-hiperbarica';
import { acupunturaOverride } from './acupuntura';
import { andrologiaOverride } from './andrologia';
import { artroscopiaOverride } from './artroscopia';
import { cirugiaRefractivaOverride } from './cirugia-refractiva';
import { dermatopatologiaOverride } from './dermatopatologia';
import { farmacologiaClinicaOverride } from './farmacologia-clinica';
import { foniatriaOverride } from './foniatria';
import { geneticaMedicaOverride } from './genetica-medica';
import { glaucomaOverride } from './glaucoma';
import { homeopatiaOverride } from './homeopatia';
import { logofonoaudiologiaOverride } from './logofonoaudiologia';
import { medicinaDeporteOverride } from './medicina-deporte';
import { medicinaFisicaRehabilitacionOverride } from './medicina-fisica-rehabilitacion';
import { medicinaLegalOverride } from './medicina-legal';
import { neurofisiologiaClinicaOverride } from './neurofisiologia-clinica';
import { optometriaOverride } from './optometria';
import { ortopediaDentomaxilofacialOverride } from './ortopedia-dentomaxilofacial';
import { podologiaOverride } from './podologia';
import { psicopedagogiaOverride } from './psicopedagogia';
import { quiropracticaOverride } from './quiropractica';
import { retinaVitreoOverride } from './retina-vitreo';
import { sexologiaClinicaOverride } from './sexologia-clinica';
import { toxicologiaOverride } from './toxicologia';
import { transplanteOrganosOverride } from './transplante-organos';

// Re-exports para acceso directo
export { odontologiaOverride } from './odontologia';
export { cardiologiaOverride } from './cardiologia';
export { pediatriaOverride } from './pediatria';
export { neurologiaOverride } from './neurologia';
export { traumatologiaOverride } from './traumatologia';
export { oftalmologiaOverride } from './oftalmologia';
export { ginecologiaOverride } from './ginecologia';
export { infectologiaPediatricaOverride } from './infectologia-pediatrica';
export { urologiaOverride } from './urologia';
export { medicinaInternaOverride } from './medicina-interna';
export { cardiologiaIntervencionistaOverride } from './cardiologia-intervencionista';
export { electrofisiologiaCardiacaOverride } from './electrofisiologia-cardiaca';
export { hemodinamiaOverride } from './hemodinamia';
export { cardiologiaPediatricaOverride } from './cardiologia-pediatrica';
export { cirugiaCardiovascularOverride } from './cirugia-cardiovascular';
export { angiologiaOverride } from './angiologia';
export { cirugiaVascularOverride } from './cirugia-vascular';
export { intervencionismoVascularOverride } from './intervencionismo-vascular';
export { flebologiaOverride } from './flebologia';
export { medicinaGeneralOverride } from './medicina-general';
export { medicinaFamiliarOverride } from './medicina-familiar';
export { geriatriaOverride } from './geriatria';
export { endocrinologiaOverride } from './endocrinologia';
export { endocrinologiaPediatricaOverride } from './endocrinologia-pediatrica';
export { diabetologiaOverride } from './diabetologia';
export { nutriologiaOverride } from './nutriologia';
export { radiologiaOverride } from './radiologia';
export { medicinaNuclearOverride } from './medicina-nuclear';
export { ecografiaOverride } from './ecografia';
export { patologiaOverride } from './patologia';
export { patologiaClinicaOverride } from './patologia-clinica';
export { citopatologiaOverride } from './citopatologia';
export { anestesiologiaOverride } from './anestesiologia';
export { anestesiaPediatricaOverride } from './anestesia-pediatrica';
export { anestesiaCardiovascularOverride } from './anestesia-cardiovascular';
export { medicinaEmergenciasOverride } from './medicina-emergencias';
export { medicinaIntensivaOverride } from './medicina-intensiva';
export { quemadosOverride } from './quemados';
export { medicinaHiperbaricaOverride } from './medicina-hiperbarica';
export { acupunturaOverride } from './acupuntura';
export { andrologiaOverride } from './andrologia';
export { artroscopiaOverride } from './artroscopia';
export { cirugiaRefractivaOverride } from './cirugia-refractiva';
export { dermatopatologiaOverride } from './dermatopatologia';
export { farmacologiaClinicaOverride } from './farmacologia-clinica';
export { foniatriaOverride } from './foniatria';
export { geneticaMedicaOverride } from './genetica-medica';
export { glaucomaOverride } from './glaucoma';
export { homeopatiaOverride } from './homeopatia';
export { logofonoaudiologiaOverride } from './logofonoaudiologia';
export { medicinaDeporteOverride } from './medicina-deporte';
export { medicinaFisicaRehabilitacionOverride } from './medicina-fisica-rehabilitacion';
export { medicinaLegalOverride } from './medicina-legal';
export { neurofisiologiaClinicaOverride } from './neurofisiologia-clinica';
export { optometriaOverride } from './optometria';
export { ortopediaDentomaxilofacialOverride } from './ortopedia-dentomaxilofacial';
export { podologiaOverride } from './podologia';
export { psicopedagogiaOverride } from './psicopedagogia';
export { quiropracticaOverride } from './quiropractica';
export { retinaVitreoOverride } from './retina-vitreo';
export { sexologiaClinicaOverride } from './sexologia-clinica';
export { toxicologiaOverride } from './toxicologia';
export { transplanteOrganosOverride } from './transplante-organos';

// Constantes de dominio pediátrico
export {
  PEDIATRIC_AGE_GROUPS,
  GROWTH_CHART_STANDARDS,
  VACCINATION_SCHEDULE,
  DEVELOPMENTAL_MILESTONES,
} from './pediatria';

// Constantes de dominio infectología pediátrica
export {
  COMMON_PEDIATRIC_INFECTIONS,
  ANTIBIOTIC_CATEGORIES,
  ISOLATION_TYPES,
} from './infectologia-pediatrica';

// Constantes de dominio urológico
export {
  IPSS_QUESTIONS,
  GLEASON_GRADE_GROUPS,
  STONE_COMPOSITION_TYPES,
} from './urologia';

// Constantes de dominio medicina interna
export {
  CHRONIC_DISEASE_PANELS,
  CLINICAL_SCORES,
  CRITICAL_CARE_PARAMETERS,
} from './medicina-interna';

// Constantes de dominio cardiología intervencionista
export {
  CORONARY_LESION_TYPES,
  STENT_TYPES,
} from './cardiologia-intervencionista';

// Constantes de dominio electrofisiología cardíaca
export {
  ARRHYTHMIA_CLASSIFICATION,
  CARDIAC_DEVICE_TYPES,
} from './electrofisiologia-cardiaca';

// Constantes de dominio hemodinámica
export {
  HEMODYNAMIC_MEASUREMENTS,
  CORONARY_SEGMENTS,
} from './hemodinamia';

// Constantes de dominio cardiología pediátrica
export {
  CONGENITAL_HEART_DEFECTS,
  FONTAN_STAGES,
} from './cardiologia-pediatrica';

// Constantes de dominio cirugía cardiovascular
export {
  EUROSCORE_VARIABLES,
  PROSTHETIC_VALVE_TYPES,
} from './cirugia-cardiovascular';

// Constantes de dominio angiología
export {
  FONTAINE_CLASSIFICATION,
  ABI_INTERPRETATION,
} from './angiologia';

// Constantes de dominio cirugía vascular
export {
  AAA_CLASSIFICATION,
  WIFI_CLASSIFICATION,
} from './cirugia-vascular';

// Constantes de dominio intervencionismo vascular
export {
  ENDOVASCULAR_PROCEDURE_TYPES,
  ACCESS_SITE_COMPLICATIONS,
} from './intervencionismo-vascular';

// Constantes de dominio flebología
export {
  CEAP_CLASSIFICATION,
  SCLEROSING_AGENTS,
  WELLS_DVT_CRITERIA,
} from './flebologia';

// Constantes de dominio medicina general
export {
  PREVENTIVE_SCREENING_PROTOCOLS,
  REFERRAL_CRITERIA,
  ADULT_VACCINATION_SCHEDULE,
} from './medicina-general';

// Constantes de dominio medicina familiar
export {
  FAMILY_LIFECYCLE_STAGES,
  HOME_VISIT_CATEGORIES,
  FAMILY_HEALTH_INDICATORS,
} from './medicina-familiar';

// Constantes de dominio geriatría
export {
  GERIATRIC_ASSESSMENT_SCALES,
  FRIED_FRAILTY_CRITERIA,
  DEPRESCRIBING_PROTOCOLS,
} from './geriatria';

// Constantes de dominio endocrinología
export {
  HORMONAL_PANELS,
  TIRADS_CLASSIFICATION,
  INSULIN_REGIMENS,
} from './endocrinologia';

// Constantes de dominio endocrinología pediátrica
export {
  TANNER_STAGES,
  PEDIATRIC_GROWTH_STANDARDS,
  GH_THERAPY_PROTOCOLS,
  PEDIATRIC_GLYCEMIC_TARGETS,
} from './endocrinologia-pediatrica';

// Constantes de dominio diabetología
export {
  GLYCEMIC_TARGETS,
  WAGNER_CLASSIFICATION,
  DIABETIC_NEPHROPATHY_STAGES,
  COMPLICATION_SCREENING_SCHEDULE,
} from './diabetologia';

// Constantes de dominio nutriología
export {
  BMI_CLASSIFICATION,
  CALORIC_FORMULAS,
  MACRONUTRIENT_DISTRIBUTION,
  CRITICAL_MICRONUTRIENTS,
} from './nutriologia';

// Constantes de dominio acupuntura
export {
  TCM_MERIDIANS,
  VAS_PAIN_SCALE,
} from './acupuntura';

// Constantes de dominio andrología
export {
  IIEF_DOMAINS,
  VARICOCELE_GRADES,
  WHO_SEMEN_REFERENCE,
} from './andrologia';

// Constantes de dominio artroscopía
export {
  MENISCAL_TEAR_TYPES,
  ACL_INJURY_GRADES,
  OUTERBRIDGE_CLASSIFICATION,
} from './artroscopia';

// Constantes de dominio cirugía refractiva
export {
  REFRACTIVE_PROCEDURE_TYPES,
  REFRACTIVE_CANDIDACY_CRITERIA,
} from './cirugia-refractiva';

// Constantes de dominio dermatopatología
export {
  HISTOLOGICAL_PATTERNS,
  BRESLOW_CLASSIFICATION,
} from './dermatopatologia';

// Constantes de dominio farmacología clínica
export {
  ADR_SEVERITY_CATEGORIES,
  TDM_COMMON_DRUGS,
} from './farmacologia-clinica';

// Constantes de dominio foniatría
export {
  GRBAS_SCALE,
  DYSPHAGIA_SEVERITY_SCALE,
} from './foniatria';

// Constantes de dominio genética médica
export {
  ACMG_VARIANT_CLASSIFICATION,
  GENETIC_TEST_TYPES,
} from './genetica-medica';

// Constantes de dominio glaucoma
export {
  GLAUCOMA_TYPES,
  GLAUCOMA_SURGICAL_PROCEDURES,
} from './glaucoma';

// Constantes de dominio homeopatía
export {
  HOMEOPATHIC_POTENCY_SCALES,
  HERING_LAWS,
} from './homeopatia';

// Constantes de dominio logofonoaudiología
export {
  APHASIA_CLASSIFICATION_BDAE,
  LANGUAGE_DEVELOPMENT_MILESTONES,
} from './logofonoaudiologia';

// Constantes de dominio medicina del deporte
export {
  CONCUSSION_RETURN_TO_PLAY_STAGES,
  MUSCLE_INJURY_CLASSIFICATION,
} from './medicina-deporte';

// Constantes de dominio medicina física y rehabilitación
export {
  FIM_CATEGORIES,
  MODIFIED_ASHWORTH_SCALE,
} from './medicina-fisica-rehabilitacion';

// Constantes de dominio medicina legal
export {
  WOUND_CLASSIFICATION_FORENSIC,
  MANNER_OF_DEATH,
} from './medicina-legal';

// Constantes de dominio neurofisiología clínica
export {
  EVOKED_POTENTIAL_TYPES,
  EEG_10_20_POSITIONS,
} from './neurofisiologia-clinica';

// Constantes de dominio optometría
export {
  REFRACTIVE_ERRORS,
  SNELLEN_VISUAL_ACUITY,
} from './optometria';

// Constantes de dominio ortopedia dentomaxilofacial
export {
  CEPHALOMETRIC_NORMS,
  ANGLE_CLASSIFICATION,
} from './ortopedia-dentomaxilofacial';

// Constantes de dominio podología
export {
  WAGNER_DIABETIC_FOOT,
  PODIATRIC_DEFORMITIES,
} from './podologia';

// Constantes de dominio psicopedagogía
export {
  WISC_V_INDICES,
  IQ_CLASSIFICATION,
} from './psicopedagogia';

// Constantes de dominio quiropráctica
export {
  OSWESTRY_INTERPRETATION,
  NDI_INTERPRETATION,
  SPINAL_REGIONS,
} from './quiropractica';

// Constantes de dominio retina y vítreo
export {
  DIABETIC_RETINOPATHY_ETDRS,
  MACULAR_HOLE_STAGING,
} from './retina-vitreo';

// Constantes de dominio sexología clínica
export {
  FSFI_DOMAINS,
  SEXUAL_DYSFUNCTION_DSM5,
} from './sexologia-clinica';

// Constantes de dominio toxicología
export {
  COMMON_ANTIDOTES,
  TOXIDROMES,
} from './toxicologia';

// Constantes de dominio trasplante de órganos
export {
  ORGAN_TRANSPLANT_TYPES,
  IMMUNOSUPPRESSANT_LEVELS,
  BANFF_REJECTION_CLASSIFICATION,
} from './transplante-organos';

/**
 * Mapa de overrides por slug de especialidad.
 *
 * Cuando el auto-registry genera un SpecialtyConfig para una especialidad
 * que tiene un override registrado, aplica el override sobre el config base.
 *
 * Para agregar un override nuevo:
 * 1. Crear archivo en configs/overrides/{slug}.ts
 * 2. Agregar el import y la entrada en este mapa
 */
export const SPECIALTY_OVERRIDES: ReadonlyMap<string, SpecialtyConfigOverride> = new Map([
  // Odontología — 15 módulos personalizados, widgets, KPIs dentales
  ['odontologia', odontologiaOverride],

  // Cardiología — ECG, ecocardiograma, Holter, prueba de esfuerzo
  ['cardiologia', cardiologiaOverride],

  // Pediatría — well-child, vacunación, crecimiento, neurodesarrollo
  ['pediatria', pediatriaOverride],

  // Neurología — EEG, EMG, neuroimagen, epilepsia, cefaleas, cognitivo
  ['neurologia', neurologiaOverride],

  // Traumatología — fracturas, artroscopia, prótesis, columna, rehabilitación
  ['traumatologia', traumatologiaOverride],

  // Oftalmología — refracción, fondo de ojo, tonometría, cirugía refractiva
  ['oftalmologia', oftalmologiaOverride],

  // Ginecología — prenatal, ecografía, colposcopia, fertilidad, cirugía
  ['ginecologia', ginecologiaOverride],

  // Infectología Pediátrica — antibiogramas, cultivos, esquemas antibióticos, aislamiento
  ['infectologia-pediatrica', infectologiaPediatricaOverride],

  // Urología — PSA, cistoscopía, biopsia, litiasis, uroflujometría, IPSS
  ['urologia', urologiaOverride],

  // Medicina Interna + Medicina Crítica — crónicos, hospitalización, UCI, scores clínicos
  ['medicina-interna', medicinaInternaOverride],

  // Cardiología Intervencionista — cateterismo, stents, angioplastia, contraste
  ['cardiologia-intervencionista', cardiologiaIntervencionistaOverride],

  // Electrofisiología Cardíaca — EP study, ablación, dispositivos, monitorizacion remota
  ['electrofisiologia-cardiaca', electrofisiologiaCardiacaOverride],

  // Hemodinámica — sala de cateterismo, presiones, coronarias, TAVI, corazón estructural
  ['hemodinamia', hemodinamiaOverride],

  // Cardiología Pediátrica — congénitas, eco/crecimiento, Fontan, dosificación por peso
  ['cardiologia-pediatrica', cardiologiaPediatricaOverride],

  // Cirugía Cardiovascular — CABG, válvulas, bypass, esternotomía, EuroSCORE
  ['cirugia-cardiovascular', cirugiaCardiovascularOverride],

  // Angiología — Doppler, ITB, mapeo venoso, enfermedad arterial, úlceras
  ['angiologia', angiologiaOverride],

  // Cirugía Vascular — aneurismas, bypass, endovascular, amputación, heridas
  ['cirugia-vascular', cirugiaVascularOverride],

  // Intervencionismo Vascular — endovascular, stents, embolización, trombólisis
  ['intervencionismo-vascular', intervencionismoVascularOverride],

  // Flebología — CEAP, escleroterapia, varices, compresión, TVP
  ['flebologia', flebologiaOverride],

  // Medicina General — tamizaje preventivo, crónicos, derivaciones, vacunación
  ['medicina-general', medicinaGeneralOverride],

  // Medicina Familiar — genograma, ciclo de vida, visitas domiciliarias, multigeneracional
  ['medicina-familiar', medicinaFamiliarOverride],

  // Geriatría — caídas, polifarmacia, cognitivo, funcional, delirium, fragilidad
  ['geriatria', geriatriaOverride],

  // Endocrinología — tiroides, diabetes, óseo, adrenal, hipófisis, bomba insulina
  ['endocrinologia', endocrinologiaOverride],

  // Endocrinología Pediátrica — GH, Tanner, hipotiroidismo congénito, DM1, crecimiento
  ['endocrinologia-pediatrica', endocrinologiaPediatricaOverride],

  // Diabetología — glucosa, insulina, HbA1c, pie diabético, retinopatía, nefropatía
  ['diabetologia', diabetologiaOverride],

  // Nutriología — antropometría, plan alimentario, micronutrientes, composición corporal
  ['nutriologia', nutriologiaOverride],

  // Radiología — BI-RADS, LI-RADS, PI-RADS, Lung-RADS, worklist, hallazgos críticos, dosis
  ['radiologia', radiologiaOverride],

  // Medicina Nuclear — isótopos, dosis, PET-CT, captación tiroidea, seguridad radiológica
  ['medicina-nuclear', medicinaNuclearOverride],

  // Ecografía — reporte estructurado, TI-RADS, BI-RADS, biometría fetal, Doppler
  ['ecografia', ecografiaOverride],

  // Patología — especímenes, macro/micro, IHC, molecular, sinóptico CAP
  ['patologia', patologiaOverride],

  // Patología Clínica — QC, rangos de referencia, valores críticos, instrumentos, proficiency
  ['patologia-clinica', patologiaClinicaOverride],

  // Citopatología — Bethesda, FNA, citología líquida, adecuación, HPV
  ['citopatologia', citopatologiaOverride],

  // Anestesiología — preop ASA/Mallampati, vía aérea, registro, fármacos, PACU, bloqueos
  ['anestesiologia', anestesiologiaOverride],

  // Anestesia Pediátrica — dosis por peso, NPO, croup, delirio emergencia, presencia parental
  ['anestesiologia-pediatrica', anestesiaPediatricaOverride],

  // Anestesia Cardiovascular — ETE, bypass, coagulación ACT, hemodinámica, BCIA/ECMO
  ['anestesiologia-cardiovascular', anestesiaCardiovascularOverride],

  // Medicina de Emergencias — triage ESI, trauma ATLS, reanimación, stroke/STEMI/sepsis
  ['emergencia', medicinaEmergenciasOverride],

  // Medicina Intensiva — APACHE/SOFA, ventilador, vasopresores, metas, líneas, movilización
  ['medicina-critica', medicinaIntensivaOverride],

  // Quemados — TBSA Lund-Browder, profundidad, Parkland, heridas, injertos, cicatrices
  ['quemados', quemadosOverride],

  // Medicina Hiperbárica — protocolo, cicatrización, TcPO2, sesiones, contraindicaciones
  ['medicina-hiperbarica', medicinaHiperbaricaOverride],

  // Acupuntura — meridianos, MTC, VAS, inserción de agujas, cursos de tratamiento
  ['acupuntura', acupunturaOverride],

  // Andrología — espermiograma, IIEF, varicocele, fertilidad, paneles hormonales
  ['andrologia', andrologiaOverride],

  // Artroscopía — procedimientos, meniscal, ligamentos, rehabilitación, retorno al deporte
  ['artroscopia', artroscopiaOverride],

  // Cirugía Refractiva — topografía corneal, LASIK/PRK, wavefront, flap, resultados visuales
  ['cirugia-refractiva', cirugiaRefractivaOverride],

  // Dermatopatología — especímenes, histología, IHC, márgenes, melanocíticas, concordancia
  ['dermatopatologia', dermatopatologiaOverride],

  // Farmacología Clínica — interacciones, TDM, RAM, farmacovigilancia, ajuste dosis
  ['farmacologia-clinica', farmacologiaClinicaOverride],

  // Foniatría — GRBAS, VHI, estroboscopía, FEES, cuerdas vocales, terapia habla
  ['foniatria', foniatriaOverride],

  // Genética Médica — pedigrí, ACMG, asesoramiento, portadores, prenatal, farmacogenómica
  ['genetica', geneticaMedicaOverride],

  // Glaucoma — PIO, campo visual, OCT RNFL, medicación, trabeculectomía, MIGS
  ['glaucoma', glaucomaOverride],

  // Homeopatía — constitucional, remedios, potencia, agravación, repertorización
  ['homeopatia', homeopatiaOverride],

  // Logofonoaudiología — lenguaje, articulación, fluidez, CAA, alimentación, afasia BDAE
  ['logofonoaudiologia', logofonoaudiologiaOverride],

  // Medicina del Deporte — lesiones, retorno al juego, VO2max, SCAT5, ecografía MSK
  ['medicina-deporte', medicinaDeporteOverride],

  // Medicina Física y Rehabilitación — FIM, Ashworth, prótesis, EMG/NCS, discapacidad
  ['medicina-fisica-rehabilitacion', medicinaFisicaRehabilitacionOverride],

  // Medicina Legal — lesiones, cadena custodia, edad, causa muerte, pericial, SAFE
  ['medicina-legal-forense', medicinaLegalOverride],

  // Neurofisiología Clínica — EEG, EMG/NCS, evocados, IOM, video-EEG
  ['neurofisiologia', neurofisiologiaClinicaOverride],

  // Optometría — refracción, lentes de contacto, agudeza, binocular, ojo seco
  ['optometria', optometriaOverride],

  // Ortopedia Dentomaxilofacial — cefalometría, crecimiento, Angle, expansión palatina
  ['ortopedia-dentomaxilofacial', ortopediaDentomaxilofacialOverride],

  // Podología — Wagner, procedimientos ungueales, órtesis, marcha, heridas, presión
  ['podologia', podologiaOverride],

  // Psicopedagogía — WISC, Bender, rendimiento, PEI, intervención, escuela-familia
  ['psicopedagogia', psicopedagogiaOverride],

  // Quiropráctica — evaluación espinal, subluxación, ajustes, ROM, Oswestry, NDI
  ['quiropractica', quiropracticaOverride],

  // Retina y Vítreo — OCT, angiografía, anti-VEGF, ETDRS, ROP, vitrectomía, agujero macular
  ['retina-vitreo', retinaVitreoOverride],

  // Sexología Clínica — IIEF, FSFI, hormonal, pareja, biopsicosocial, identidad de género
  ['sexologia', sexologiaClinicaOverride],

  // Toxicología — intoxicaciones, antídotos, niveles, descontaminación, envenenamiento
  ['toxicologia', toxicologiaOverride],

  // Trasplante de Órganos — lista espera, inmunosupresión, Banff, función, profilaxis, supervivencia
  ['transplante-organos', transplanteOrganosOverride],
]);
