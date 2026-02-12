import { SMSTemplateType } from '@red-salud/types';
import type { SMSTemplate, SMSMessage } from '@red-salud/types';

export class NotificationManager {
  /**
   * Create an SMS template
   */
  static createTemplate(
    name: string,
    templateType: SMSTemplateType,
    content: string,
    variables: string[] = []
  ): Omit<SMSTemplate, 'id' | 'created_at' | 'updated_at'> {
    return {
      name,
      template_type: templateType,
      content,
      is_active: true,
      variables,
    };
  }

  /**
   * Render template with variables
   */
  static renderTemplate(template: SMSTemplate, variables: Record<string, string>): string {
    let content = template.content;

    for (const variable of template.variables) {
      const value = variables[variable] || '';
      const placeholder = `{${variable}}`;
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return content;
  }

  /**
   * Create an SMS message
   */
  static createMessage(
    templateId: string,
    phoneNumber: string,
    message: string,
    patientId?: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
    createdBy: string = 'system'
  ): Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'> {
    return {
      template_id: templateId,
      patient_id: patientId,
      phone_number: phoneNumber,
      message,
      status: 'pending',
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      created_by: createdBy,
    };
  }

  /**
   * Mark message as sent
   */
  static markAsSent(message: SMSMessage): SMSMessage {
    return {
      ...message,
      status: 'sent',
      sent_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Mark message as delivered
   */
  static markAsDelivered(message: SMSMessage): SMSMessage {
    return {
      ...message,
      status: 'delivered',
      delivered_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Mark message as failed
   */
  static markAsFailed(message: SMSMessage, errorMessage: string): SMSMessage {
    return {
      ...message,
      status: 'failed',
      error_message: errorMessage,
      updated_at: new Date(),
    };
  }

  /**
   * Get pending messages
   */
  static getPendingMessages(messages: SMSMessage[]): SMSMessage[] {
    return messages.filter(m => m.status === 'pending');
  }

  /**
   * Get failed messages
   */
  static getFailedMessages(messages: SMSMessage[]): SMSMessage[] {
    return messages.filter(m => m.status === 'failed');
  }

  /**
   * Get messages by patient
   */
  static getMessagesByPatient(messages: SMSMessage[], patientId: string): SMSMessage[] {
    return messages.filter(m => m.patient_id === patientId);
  }

  /**
   * Get messages by template type
   */
  static getMessagesByTemplateType(
    messages: SMSMessage[],
    templates: SMSTemplate[],
    templateType: SMSTemplateType
  ): SMSMessage[] {
    const templateIds = templates
      .filter(t => t.template_type === templateType)
      .map(t => t.id);

    return messages.filter(m => templateIds.includes(m.template_id));
  }

  /**
   * Calculate SMS statistics
   */
  static calculateStatistics(messages: SMSMessage[]): {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryRate: number;
    totalCostUsd: number;
  } {
    const sent = messages.filter(m => m.status === 'sent' || m.status === 'delivered');
    const delivered = messages.filter(m => m.status === 'delivered');
    const failed = messages.filter(m => m.status === 'failed');
    const pending = messages.filter(m => m.status === 'pending');

    const deliveryRate = sent.length > 0 ? (delivered.length / sent.length) * 100 : 0;
    const totalCostUsd = messages.reduce((sum, m) => sum + (m.cost_usd || 0), 0);

    return {
      total: messages.length,
      sent: sent.length,
      delivered: delivered.length,
      failed: failed.length,
      pending: pending.length,
      deliveryRate,
      totalCostUsd,
    };
  }

  /**
   * Get active templates
   */
  static getActiveTemplates(templates: SMSTemplate[]): SMSTemplate[] {
    return templates.filter(t => t.is_active);
  }

  /**
   * Get template by type
   */
  static getTemplateByType(
    templates: SMSTemplate[],
    templateType: SMSTemplateType
  ): SMSTemplate | undefined {
    return templates.find(t => t.template_type === templateType && t.is_active);
  }

  /**
   * Search templates
   */
  static searchTemplates(templates: SMSTemplate[], query: string): SMSTemplate[] {
    const lowerQuery = query.toLowerCase();
    return templates.filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Search messages
   */
  static searchMessages(messages: SMSMessage[], query: string): SMSMessage[] {
    const lowerQuery = query.toLowerCase();
    return messages.filter(
      m =>
        m.phone_number.includes(query) ||
        m.message.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Validate phone number (basic validation)
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic validation for Venezuelan phone numbers
    const venezuelaPattern = /^(\+58)?[0-9]{10,11}$/;
    return venezuelaPattern.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Format phone number to international format
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If starts with 58, add + prefix
    if (cleaned.startsWith('58')) {
      return `+${cleaned}`;
    }

    // If starts with 0, replace with +58
    if (cleaned.startsWith('0')) {
      return `+58${cleaned.substring(1)}`;
    }

    // Otherwise, add +58 prefix
    return `+58${cleaned}`;
  }

  /**
   * Calculate estimated SMS cost
   */
  static calculateEstimatedCost(messages: SMSMessage[]): number {
    // Assuming $0.05 per message
    const costPerMessage = 0.05;
    return messages.length * costPerMessage;
  }

  /**
   * Create order confirmation message
   */
  static createOrderConfirmationMessage(
    templates: SMSTemplate[],
    patientId: string,
    phoneNumber: string,
    orderNumber: string,
    totalUsd: number,
    createdBy: string
  ): Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'> | null {
    const template = this.getTemplateByType(templates, SMSTemplateType.ORDER_CONFIRMATION);
    if (!template) return null;

    const message = this.renderTemplate(template, {
      customer_name: '', // Would need patient data
      order_number: orderNumber,
      total_usd: totalUsd.toString(),
    });

    return this.createMessage(
      template.id,
      phoneNumber,
      message,
      patientId,
      'order',
      orderNumber,
      createdBy
    );
  }

  /**
   * Create delivery update message
   */
  static createDeliveryUpdateMessage(
    templates: SMSTemplate[],
    patientId: string,
    phoneNumber: string,
    orderNumber: string,
    status: string,
    createdBy: string
  ): Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'> | null {
    const template = this.getTemplateByType(templates, SMSTemplateType.DELIVERY_UPDATE);
    if (!template) return null;

    const message = this.renderTemplate(template, {
      customer_name: '',
      order_number: orderNumber,
      status,
    });

    return this.createMessage(
      template.id,
      phoneNumber,
      message,
      patientId,
      'delivery',
      orderNumber,
      createdBy
    );
  }
}
