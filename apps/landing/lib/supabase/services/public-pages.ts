import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

// --- SCHEMAS (Zod Validation) ---

const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  content: z.string(),
  rating: z.number().min(1).max(5),
  image_url: z.string().nullable(),
});

const FeatureItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  benefits: z.array(z.string()).optional(),
  icon_name: z.string().optional(), // Para mapear iconos en frontend si es necesario
});

const BenefitItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
});

const ProcessStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  step: z.number(),
  icon: z.string(),
});

const FAQItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const PricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  cta: z.string(),
  popular: z.boolean(),
});

const FeaturesContentSchema = z.object({
  items: z.array(FeatureItemSchema),
});

const BenefitsContentSchema = z.array(BenefitItemSchema);
const ProcessContentSchema = z.array(ProcessStepSchema);
const FAQsContentSchema = z.array(FAQItemSchema);
const PricingContentSchema = z.array(PricingPlanSchema);

export type Testimonial = z.infer<typeof TestimonialSchema>;
export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type BenefitItem = z.infer<typeof BenefitItemSchema>;
export type ProcessStep = z.infer<typeof ProcessStepSchema>;
export type FAQItem = z.infer<typeof FAQItemSchema>;
export type PricingPlan = z.infer<typeof PricingPlanSchema>;

// --- SERVICE ---

export const publicPagesService = {
  /**
   * Obtiene estadísticas en tiempo real de la plataforma.
   * Cuenta perfiles de doctores y pacientes activos.
   */
  async getStats() {
    try {
      const supabase = createClient();
      
      // Contar pacientes (usuarios con rol paciente)
      // Nota: Esto asume que existe un campo 'role' o una tabla relacionada. 
      // Ajustaremos la query según el esquema real de profiles.
      const [patientsRes, doctorsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'paciente'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'doctor')
      ]);

      if (patientsRes.error) console.warn('Warning fetching patient stats:', patientsRes.error.message);
      if (doctorsRes.error) console.warn('Warning fetching doctor stats:', doctorsRes.error.message);

      return {
        patients: patientsRes.count || 0,
        doctors: doctorsRes.count || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Unexpected error in getStats:', error);
      return { patients: 0, doctors: 0, lastUpdated: new Date().toISOString() };
    }
  },

  /**
   * Obtiene testimonios destacados para una página específica.
   */
  async getTestimonials(pageContext: 'pacientes' | 'medicos' | 'home' = 'pacientes') {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('page_context', pageContext)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.warn('Warning fetching testimonials:', error.message);
        return [];
      }

      // Validar datos con Zod para asegurar integridad
      const validTestimonials = data
        .map(t => {
          const result = TestimonialSchema.safeParse(t);
          return result.success ? result.data : null;
        })
        .filter(Boolean) as Testimonial[];

      return validTestimonials;
    } catch (error) {
      console.error('Unexpected error in getTestimonials:', error);
      return [];
    }
  },

  /**
   * Obtiene contenido dinámico de secciones (Features, Benefits) desde la DB.
   */
  async getSectionContent(pageKey: string, sectionKey: string) {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('page_key', pageKey)
        .eq('section_key', sectionKey)
        .single();

      if (error || !data) {
        return null;
      }

      // Validar estructura específica para diferentes tipos de contenido
      switch (sectionKey) {
        case 'features':
          const featuresResult = FeaturesContentSchema.safeParse(data.content);
          if (featuresResult.success) {
            return featuresResult.data.items;
          } else {
            console.warn('Invalid content structure for features:', featuresResult.error);
            return null;
          }
        
        case 'benefits':
          const benefitsResult = BenefitsContentSchema.safeParse(data.content);
          if (benefitsResult.success) {
            return benefitsResult.data;
          } else {
            console.warn('Invalid content structure for benefits:', benefitsResult.error);
            return null;
          }
          
        case 'process':
          const processResult = ProcessContentSchema.safeParse(data.content);
          if (processResult.success) {
            return processResult.data;
          } else {
            console.warn('Invalid content structure for process:', processResult.error);
            return null;
          }
          
        case 'faqs':
          const faqsResult = FAQsContentSchema.safeParse(data.content);
          if (faqsResult.success) {
            return faqsResult.data;
          } else {
            console.warn('Invalid content structure for faqs:', faqsResult.error);
            return null;
          }
          
        case 'pricing':
          const pricingResult = PricingContentSchema.safeParse(data.content);
          if (pricingResult.success) {
            return pricingResult.data;
          } else {
            console.warn('Invalid content structure for pricing:', pricingResult.error);
            return null;
          }

        default:
          return data.content;
      }
    } catch (error) {
      console.error('Unexpected error in getSectionContent:', error);
      return null;
    }
  }
};