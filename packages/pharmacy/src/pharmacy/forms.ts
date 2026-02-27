import { v4 as uuidv4 } from 'uuid';
import {
  FormTemplate,
  FormSubmission,
} from '@red-salud/types';

export class FormsManager {
  private templates: FormTemplate[] = [];
  private submissions: FormSubmission[] = [];

  constructor() {
    this.loadTemplates();
    this.loadSubmissions();
  }

  async loadTemplates(): Promise<void> {
    const stored = localStorage.getItem('form_templates');
    if (stored) {
      this.templates = JSON.parse(stored) as FormTemplate[];
    }
  }

  async saveTemplates(): Promise<void> {
    localStorage.setItem('form_templates', JSON.stringify(this.templates));
  }

  async loadSubmissions(): Promise<void> {
    const stored = localStorage.getItem('form_submissions');
    if (stored) {
      this.submissions = JSON.parse(stored) as FormSubmission[];
    }
  }

  async saveSubmissions(): Promise<void> {
    localStorage.setItem('form_submissions', JSON.stringify(this.submissions));
  }

  async createTemplate(template: Omit<FormTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<FormTemplate> {
    const newTemplate: FormTemplate = {
      ...template,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.templates.push(newTemplate);
    await this.saveTemplates();

    return newTemplate;
  }

  async submitForm(submission: Omit<FormSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<FormSubmission> {
    const newSubmission: FormSubmission = {
      ...submission,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.submissions.push(newSubmission);
    await this.saveSubmissions();

    return newSubmission;
  }

  getTemplates(): FormTemplate[] {
    return this.templates.filter((t) => t.is_active);
  }

  getTemplate(templateId: string): FormTemplate | undefined {
    return this.templates.find((t) => t.id === templateId);
  }

  getSubmissions(templateId?: string): FormSubmission[] {
    let submissions = [...this.submissions];

    if (templateId) {
      submissions = submissions.filter((s) => s.template_id === templateId);
    }

    return submissions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  getSubmission(submissionId: string): FormSubmission | undefined {
    return this.submissions.find((s) => s.id === submissionId);
  }
}
