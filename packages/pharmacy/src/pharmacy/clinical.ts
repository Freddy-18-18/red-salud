import { Patient, AdverseReaction, DrugInteraction } from '@red-salud/types';

/**
 * Clinical Services Manager
 * Handles patient records, pharmacovigilance, and drug interactions
 */
export class ClinicalServicesManager {
  /**
   * Check for drug interactions between products
   */
  static checkDrugInteractions(
    productIds: string[],
    drugInteractions: DrugInteraction[]
  ): Array<{
    interaction: DrugInteraction;
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  }> {
    const interactions: Array<{
      interaction: DrugInteraction;
      severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
    }> = [];

    for (let i = 0; i < productIds.length; i++) {
      for (let j = i + 1; j < productIds.length; j++) {
        const interaction = drugInteractions.find(
          (di) =>
            (di.active_ingredient_1 === productIds[i] && di.active_ingredient_2 === productIds[j]) ||
            (di.active_ingredient_1 === productIds[j] && di.active_ingredient_2 === productIds[i])
        );

        if (interaction) {
          interactions.push({
            interaction,
            severity: interaction.severity,
          });
        }
      }
    }

    return interactions;
  }

  /**
   * Generate drug interaction alert message
   */
  static generateInteractionAlert(interactions: Array<{
    interaction: DrugInteraction;
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  }>): string {
    if (interactions.length === 0) {
      return '';
    }

    const criticalInteractions = interactions.filter(i => i.severity === 'contraindicated');
    const majorInteractions = interactions.filter(i => i.severity === 'major');
    const moderateInteractions = interactions.filter(i => i.severity === 'moderate');

    let message = '';

    if (criticalInteractions.length > 0) {
      message += `⛔ ${criticalInteractions.length} interacción(es) contraindicada(s) detectada(s). `;
      message += 'No se recomienda la venta conjunta de estos medicamentos.\n\n';
    }

    if (majorInteractions.length > 0) {
      message += `⚠️ ${majorInteractions.length} interacción(es) mayor(es) detectada(s). `;
      message += 'Se recomienda precaución y consultar con el paciente.\n\n';
    }

    if (moderateInteractions.length > 0) {
      message += `ℹ️ ${moderateInteractions.length} interacción(es) moderada(s) detectada(s).\n\n`;
    }

    interactions.forEach((item, index) => {
      message += `${index + 1}. ${item.interaction.active_ingredient_1} + ${item.interaction.active_ingredient_2}\n`;
      message += `   Severidad: ${item.severity}\n`;
      message += `   ${item.interaction.description}\n`;
      if (item.interaction.recommendation) {
        message += `   Recomendación: ${item.interaction.recommendation}\n`;
      }
      message += '\n';
    });

    return message;
  }

  /**
   * Create patient record
   */
  static createPatientRecord(data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Patient {
    return {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Update patient record
   */
  static updatePatientRecord(
    patient: Patient,
    updates: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>
  ): Patient {
    return {
      ...patient,
      ...updates,
      updated_at: new Date(),
    };
  }

  /**
   * Search patients by CI or name
   */
  static searchPatients(
    patients: Patient[],
    query: string
  ): Patient[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return patients;
    }

    return patients.filter(
      (patient) =>
        patient.ci?.toLowerCase().includes(normalizedQuery) ||
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(normalizedQuery) ||
        patient.email?.toLowerCase().includes(normalizedQuery) ||
        patient.phone?.includes(normalizedQuery)
    );
  }

  /**
   * Record adverse drug reaction
   */
  static recordAdverseReaction(
    data: Omit<AdverseReaction, 'id' | 'created_at' | 'updated_at' | 'status'>
  ): AdverseReaction {
    return {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Update adverse reaction status
   */
  static updateAdverseReactionStatus(
    reaction: AdverseReaction,
    status: 'pending' | 'investigating' | 'confirmed' | 'rejected'
  ): AdverseReaction {
    return {
      ...reaction,
      status,
      updated_at: new Date(),
    };
  }

  /**
   * Generate adverse reaction report for INH
   */
  static generateAdverseReactionReport(reaction: AdverseReaction): string {
    const lines: string[] = [];

    lines.push('REPORTE DE REACCIÓN ADVERSA A MEDICAMENTO (RAM)');
    lines.push('='.repeat(60));
    lines.push('');

    lines.push('INFORMACIÓN DEL PACIENTE:');
    lines.push(`  ID Paciente: ${reaction.patient_id}`);
    lines.push('');

    lines.push('MEDICAMENTO:');
    lines.push(`  ID Producto: ${reaction.product_id}`);
    lines.push(`  Nombre: ${reaction.product_name}`);
    if (reaction.batch_number) {
      lines.push(`  Número de Lote: ${reaction.batch_number}`);
    }
    lines.push('');

    lines.push('REACCIÓN:');
    lines.push(`  Tipo: ${reaction.reaction_type}`);
    lines.push(`  Severidad: ${reaction.severity}`);
    lines.push(`  Descripción: ${reaction.description}`);
    lines.push(`  Fecha de Inicio: ${reaction.onset_date.toLocaleDateString('es-VE')}`);
    lines.push('');

    lines.push('REPORTADOR:');
    lines.push(`  Nombre: ${reaction.reporter_name}`);
    lines.push(`  Rol: ${reaction.reporter_role}`);
    lines.push(`  Fecha de Reporte: ${reaction.created_at.toLocaleDateString('es-VE')}`);
    lines.push('');

    lines.push('ESTADO:');
    lines.push(`  Estado Actual: ${reaction.status}`);
    lines.push('');

    lines.push('='.repeat(60));
    lines.push('Este reporte será enviado al Instituto Nacional de Higiene');
    lines.push('Rafael Rangel para su investigación y seguimiento.');

    return lines.join('\n');
  }

  /**
   * Get patient medication history
   */
  static getMedicationHistory(
    patientId: string,
    sales: Array<{
      patient_id?: string;
      items: Array<{ product_name: string; quantity: number }>;
      created_at: Date;
    }>
  ): Array<{
    date: Date;
    medications: string[];
  }> {
    return sales
      .filter(sale => sale.patient_id === patientId)
      .map(sale => ({
        date: sale.created_at,
        medications: sale.items.map(item => item.product_name),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Check for patient allergies
   */
  static checkAllergies(
    patient: Patient,
    productIngredients: string[]
  ): string[] {
    const warnings: string[] = [];

    productIngredients.forEach(ingredient => {
      if (patient.allergies.some(allergy => 
        allergy.toLowerCase().includes(ingredient.toLowerCase())
      )) {
        warnings.push(`⚠️ El paciente es alérgico a: ${ingredient}`);
      }
    });

    return warnings;
  }

  /**
   * Generate patient summary
   */
  static generatePatientSummary(patient: Patient): string {
    return `
RESUMEN DEL PACIENTE
====================

Nombre: ${patient.first_name} ${patient.last_name}
CI: ${patient.ci || 'No registrado'}
Fecha de Nacimiento: ${patient.date_of_birth ? patient.date_of_birth.toLocaleDateString('es-VE') : 'No registrado'}
Tipo de Sangre: ${patient.blood_type || 'No registrado'}

Alergias:
${patient.allergies.length > 0 ? patient.allergies.map(a => `  - ${a}`).join('\n') : '  Ninguna registrada'}

Condiciones Crónicas:
${patient.chronic_conditions.length > 0 ? patient.chronic_conditions.map(c => `  - ${c}`).join('\n') : '  Ninguna registrada'}

Medicamentos Actuales:
${patient.medications.length > 0 ? patient.medications.map(m => `  - ${m}`).join('\n') : '  Ninguno registrado'}
`.trim();
  }
}

/**
 * Pharmacovigilance Manager
 * Manages adverse reaction reporting and tracking
 */
export class PharmacovigilanceManager {
  /**
   * Categorize reaction severity
   */
  static categorizeSeverity(severity: string): 'mild' | 'moderate' | 'severe' | 'life_threatening' {
    const lower = severity.toLowerCase();
    
    if (lower.includes('leve') || lower.includes('mild')) {
      return 'mild';
    }
    if (lower.includes('moderada') || lower.includes('moderate')) {
      return 'moderate';
    }
    if (lower.includes('severa') || lower.includes('severe')) {
      return 'severe';
    }
    if (lower.includes('vida') || lower.includes('life') || lower.includes('threatening')) {
      return 'life_threatening';
    }

    return 'moderate';
  }

  /**
   * Check if reaction requires immediate reporting
   */
  static requiresImmediateReporting(reaction: AdverseReaction): boolean {
    return (
      reaction.severity === 'life_threatening' ||
      reaction.severity === 'severe'
    );
  }

  /**
   * Generate pharmacovigilance report
   */
  static generatePharmacovigilanceReport(
    reactions: AdverseReaction[],
    startDate: Date,
    endDate: Date
  ): {
    total_reactions: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
    by_reaction_type: Record<string, number>;
    time_to_report: number;
  } {
    const periodReactions = reactions.filter(
      r => r.created_at >= startDate && r.created_at <= endDate
    );

    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byReactionType: Record<string, number> = {};

    let totalTimeToReport = 0;

    periodReactions.forEach(reaction => {
      // Count by severity
      bySeverity[reaction.severity] = (bySeverity[reaction.severity] || 0) + 1;
      
      // Count by status
      byStatus[reaction.status] = (byStatus[reaction.status] || 0) + 1;
      
      // Count by reaction type
      byReactionType[reaction.reaction_type] = (byReactionType[reaction.reaction_type] || 0) + 1;

      // Calculate time to report (days)
      const timeToReport = Math.floor(
        (reaction.created_at.getTime() - reaction.onset_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalTimeToReport += Math.max(0, timeToReport);
    });

    return {
      total_reactions: periodReactions.length,
      by_severity: bySeverity,
      by_status: byStatus,
      by_reaction_type: byReactionType,
      time_to_report: periodReactions.length > 0 
        ? totalTimeToReport / periodReactions.length 
        : 0,
    };
  }

  /**
   * Get reactions requiring follow-up
   */
  static getReactionsRequiringFollowUp(reactions: AdverseReaction[]): AdverseReaction[] {
    return reactions.filter(
      reaction =>
        reaction.status === 'pending' ||
        reaction.status === 'investigating'
    );
  }

  /**
   * Check for duplicate reactions
   */
  static checkForDuplicateReactions(
    newReaction: Omit<AdverseReaction, 'id' | 'created_at' | 'updated_at'>,
    existingReactions: AdverseReaction[],
    daysThreshold: number = 30
  ): AdverseReaction | null {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    return existingReactions.find(
      reaction =>
        reaction.patient_id === newReaction.patient_id &&
        reaction.product_id === newReaction.product_id &&
        reaction.reaction_type === newReaction.reaction_type &&
        reaction.created_at >= thresholdDate
    ) || null;
  }
}
