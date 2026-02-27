import { Product, Patient, ProductCategory } from '@red-salud/types';

/**
 * Drug Interaction Alert
 */
export interface DrugInteractionAlert {
  id: string;
  
  // Products involved
  product_a_id: string;
  product_a_name: string;
  product_a_active_ingredient: string;
  
  product_b_id: string;
  product_b_name: string;
  product_b_active_ingredient: string;
  
  // Interaction details
  interaction_severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  interaction_description: string;
  interaction_mechanism?: string;
  
  // Recommendations
  recommendation: string;
  action_required: 'none' | 'warning' | 'block';
  
  created_at: Date;
}

/**
 * Contraindication Alert
 */
export interface ContraindicationAlert {
  id: string;
  
  // Patient info
  patient_id?: string;
  patient_age?: number;
  patient_gender?: 'M' | 'F';
  
  // Product info
  product_id: string;
  product_name: string;
  active_ingredient: string;
  
  // Contraindication details
  contraindication_type: 'age' | 'pregnancy' | 'breastfeeding' | 'renal_impairment' | 'hepatic_impairment' | 'other';
  contraindication_description: string;
  
  severity: 'warning' | 'contraindicated';
  
  created_at: Date;
}

/**
 * Mobile App Push Notification
 */
export interface PushNotification {
  id: string;
  
  // Recipient
  patient_id: string;
  patient_phone?: string;
  patient_email?: string;
  
  // Notification type
  type: 'dose_reminder' | 'refill_reminder' | 'adherence_alert' | 'appointment_reminder';
  
  // Content
  title: string;
  message: string;
  
  // Metadata
  medication_name?: string;
  dosage?: string;
  scheduled_time?: Date;
  
  // Delivery
  delivery_method: 'whatsapp' | 'sms' | 'email';
  
  // Status
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  created_at: Date;
}

/**
 * Pharmacovigilance and Mobile App Manager
 * Handles drug interaction alerts and patient mobile notifications
 */
export class PharmacovigilanceMobileManager {
  private static interactionAlerts: DrugInteractionAlert[] = [];
  private static contraindicationAlerts: ContraindicationAlert[] = [];
  private static notifications: PushNotification[] = [];
  
  private static STORAGE_KEY_INTERACTIONS = 'drug_interaction_alerts';
  private static STORAGE_KEY_CONTRAINDICATIONS = 'contraindication_alerts';
  private static STORAGE_KEY_NOTIFICATIONS = 'push_notifications';

  /**
   * Check for drug interactions
   */
  static async checkDrugInteractions(
    products: Product[],
    patientAge?: number,
    patientGender?: 'M' | 'F'
  ): Promise<DrugInteractionAlert[]> {
    const alerts: DrugInteractionAlert[] = [];
    
    // Check all pairs of products
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const productA = products[i];
        const productB = products[j];
        
        // Check for known interactions (simplified logic)
        const interaction = this.detectInteraction(productA, productB, patientAge, patientGender);
        
        if (interaction) {
          const alert: DrugInteractionAlert = {
            id: crypto.randomUUID(),
            product_a_id: productA.id,
            product_a_name: productA.name,
            product_a_active_ingredient: productA.active_ingredient || '',
            product_b_id: productB.id,
            product_b_name: productB.name,
            product_b_active_ingredient: productB.active_ingredient || '',
            interaction_severity: interaction.severity,
            interaction_description: interaction.description,
            interaction_mechanism: interaction.mechanism,
            recommendation: interaction.recommendation,
            action_required: interaction.action_required,
            created_at: new Date(),
          };
          
          alerts.push(alert);
        }
      }
    }
    
    return alerts;
  }

  /**
   * Detect interaction between two products
   */
  private static detectInteraction(
    productA: Product,
    productB: Product,
    patientAge?: number,
    patientGender?: 'M' | 'F'
  ): {
    severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
    description: string;
    mechanism?: string;
    recommendation: string;
    action_required: 'none' | 'warning' | 'block';
  } | null {
    // Common drug interactions (simplified database)
    const interactions: Array<{
      ingredientA: string;
      ingredientB: string;
      severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
      description: string;
      mechanism?: string;
      recommendation: string;
      action_required: 'none' | 'warning' | 'block';
    }> = [
      {
        ingredientA: 'warfarin',
        ingredientB: 'aspirin',
        severity: 'major',
        description: 'Warfarin y Aspirina pueden aumentar el riesgo de sangrado',
        mechanism: 'Inhibición de la agregación plaquetaria',
        recommendation: 'Monitorear INR y considerar ajuste de dosis',
        action_required: 'warning',
      },
      {
        ingredientA: 'warfarin',
        ingredientB: 'ibuprofeno',
        severity: 'major',
        description: 'Warfarin e Ibuprofeno pueden aumentar el riesgo de sangrado',
        mechanism: 'Inhibición de la agregación plaquetaria',
        recommendation: 'Evitar uso concomitante o monitorear INR',
        action_required: 'warning',
      },
      {
        ingredientA: 'digoxina',
        ingredientB: 'hidroclorotiazida',
        severity: 'major',
        description: 'Digoxina y diuréticos tiazídicos pueden aumentar toxicidad digitálica',
        mechanism: 'Pérdida de potasio',
        recommendation: 'Monitorear niveles de potasio y digoxina',
        action_required: 'warning',
      },
      {
        ingredientA: 'ergotamina',
        ingredientB: 'sumatriptan',
        severity: 'contraindicated',
        description: 'Ergotamina y Sumatriptán pueden causar vasoespasmo severo',
        mechanism: 'Sinergismo serotoninérgico',
        recommendation: 'Contraindicado - no usar juntos',
        action_required: 'block',
      },
    ];

    const ingredientA = (productA.active_ingredient || '').toLowerCase();
    const ingredientB = (productB.active_ingredient || '').toLowerCase();

    for (const interaction of interactions) {
      if (
        (ingredientA.includes(interaction.ingredientA) && ingredientB.includes(interaction.ingredientB)) ||
        (ingredientA.includes(interaction.ingredientB) && ingredientB.includes(interaction.ingredientA))
      ) {
        return interaction;
      }
    }

    return null;
  }

  /**
   * Check for contraindications
   */
  static async checkContraindications(
    product: Product,
    patientAge?: number,
    patientGender?: 'M' | 'F',
    patientConditions?: string[]
  ): Promise<ContraindicationAlert[]> {
    const alerts: ContraindicationAlert[] = [];
    
    // Age-based contraindications
    if (patientAge && patientAge < 12 && product.category === ProductCategory.ANTIBIOTIC) {
      alerts.push({
        id: crypto.randomUUID(),
        patient_age: patientAge,
        patient_gender: patientGender,
        product_id: product.id,
        product_name: product.name,
        active_ingredient: product.active_ingredient || '',
        contraindication_type: 'age',
        contraindication_description: 'Medicamento no recomendado para menores de 12 años',
        severity: 'warning',
        created_at: new Date(),
      });
    }

    // Pregnancy contraindications
    if (patientConditions && patientConditions.includes('pregnancy')) {
      const contraindicatedCategories = ['antibióticos', 'antihistamínicos'];
      if (contraindicatedCategories.includes(product.category)) {
        alerts.push({
          id: crypto.randomUUID(),
          patient_age: patientAge,
          patient_gender: patientGender,
          product_id: product.id,
          product_name: product.name,
          active_ingredient: product.active_ingredient || '',
          contraindication_type: 'pregnancy',
          contraindication_description: 'Medicamento contraindicado durante el embarazo',
          severity: 'contraindicated',
          created_at: new Date(),
        });
      }
    }

    return alerts;
  }

  /**
   * Create dose reminder notification
   */
  static async createDoseReminder(data: {
    patientId: string;
    patientPhone?: string;
    patientEmail?: string;
    medicationName: string;
    dosage: string;
    scheduledTime: Date;
    deliveryMethod: 'whatsapp' | 'sms' | 'email';
  }): Promise<PushNotification> {
    const notification: PushNotification = {
      id: crypto.randomUUID(),
      patient_id: data.patientId,
      patient_phone: data.patientPhone,
      patient_email: data.patientEmail,
      type: 'dose_reminder',
      title: 'Recordatorio de Medicamento',
      message: `Es hora de tomar ${data.medicationName} - ${data.dosage}`,
      medication_name: data.medicationName,
      dosage: data.dosage,
      scheduled_time: data.scheduledTime,
      delivery_method: data.deliveryMethod,
      status: 'pending',
      created_at: new Date(),
    };

    this.notifications.push(notification);
    await this.persistNotifications();

    return notification;
  }

  /**
   * Create refill reminder notification
   */
  static async createRefillReminder(data: {
    patientId: string;
    patientPhone?: string;
    patientEmail?: string;
    medicationName: string;
    deliveryMethod: 'whatsapp' | 'sms' | 'email';
  }): Promise<PushNotification> {
    const notification: PushNotification = {
      id: crypto.randomUUID(),
      patient_id: data.patientId,
      patient_phone: data.patientPhone,
      patient_email: data.patientEmail,
      type: 'refill_reminder',
      title: 'Recordatorio de Reposición',
      message: `Es hora de reponer ${data.medicationName}. Visítenos para apartarlo.`,
      medication_name: data.medicationName,
      delivery_method: data.deliveryMethod,
      status: 'pending',
      created_at: new Date(),
    };

    this.notifications.push(notification);
    await this.persistNotifications();

    return notification;
  }

  /**
   * Generate WhatsApp message for notification
   */
  static generateWhatsAppMessage(notification: PushNotification): string {
    let message = `🏥 *Farmacia Red Salud*\n\n`;
    message += `${notification.title}\n\n`;
    message += `${notification.message}\n\n`;
    message += `📍 [Dirección]\n`;
    message += `📞 [Teléfono]\n\n`;
    message += `Gracias por confiar en nosotros.`;

    return message;
  }

  /**
   * Get pending notifications
   */
  static getPendingNotifications(): PushNotification[] {
    return this.notifications.filter(n => n.status === 'pending');
  }

  /**
   * Mark notification as sent
   */
  static async markNotificationAsSent(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) throw new Error('Notification not found');

    notification.status = 'sent';
    notification.sent_at = new Date();

    await this.persistNotifications();
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) throw new Error('Notification not found');

    notification.status = 'read';
    notification.read_at = new Date();

    await this.persistNotifications();
  }

  /**
   * Persist interaction alerts
   */
  private static async persistInteractionAlerts(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_INTERACTIONS, JSON.stringify(this.interactionAlerts));
    } catch (error) {
      console.error('Error persisting interaction alerts:', error);
    }
  }

  /**
   * Persist contraindication alerts
   */
  private static async persistContraindicationAlerts(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_CONTRAINDICATIONS, JSON.stringify(this.contraindicationAlerts));
    } catch (error) {
      console.error('Error persisting contraindication alerts:', error);
    }
  }

  /**
   * Persist notifications
   */
  private static async persistNotifications(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error persisting notifications:', error);
    }
  }

  /**
   * Load interaction alerts
   */
  static async loadInteractionAlerts(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_INTERACTIONS);
      if (stored) {
        this.interactionAlerts = JSON.parse(stored).map((alert: any) => ({
          ...alert,
          created_at: new Date(alert.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading interaction alerts:', error);
    }
  }

  /**
   * Load contraindication alerts
   */
  static async loadContraindicationAlerts(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_CONTRAINDICATIONS);
      if (stored) {
        this.contraindicationAlerts = JSON.parse(stored).map((alert: any) => ({
          ...alert,
          created_at: new Date(alert.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading contraindication alerts:', error);
    }
  }

  /**
   * Load notifications
   */
  static async loadNotifications(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_NOTIFICATIONS);
      if (stored) {
        this.notifications = JSON.parse(stored).map((notification: any) => ({
          ...notification,
          scheduled_time: notification.scheduled_time ? new Date(notification.scheduled_time) : undefined,
          sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
          delivered_at: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
          read_at: notification.read_at ? new Date(notification.read_at) : undefined,
          created_at: new Date(notification.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }
}
