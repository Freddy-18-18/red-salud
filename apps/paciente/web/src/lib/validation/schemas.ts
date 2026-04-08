import { z } from "zod";

// Reusable primitives
const uuid = z.string().uuid();
const optionalUuid = z.string().uuid().optional().or(z.literal(""));
const safeText = z.string().trim().max(2000);
const shortText = z.string().trim().max(500);

// Appointments
export const createAppointmentSchema = z.object({
  doctor_id: uuid,
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  tipo_cita: z.enum(["presencial", "telemedicina", "urgencia", "seguimiento", "primera_vez"]).default("presencial"),
  motivo: shortText.optional(),
  notas_internas: safeText.optional(),
  price: z.number().nonnegative().optional(),
  metodo_pago: z.enum(["efectivo", "transferencia", "tarjeta", "seguro", "pago_movil", "pendiente"]).optional(),
  office_id: optionalUuid,
}).superRefine((d, ctx) => {
  if (new Date(d.start_time) >= new Date(d.end_time)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "start must be before end", path: ["start_time"] });
  }
  if (new Date(d.start_time) <= new Date()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "cannot book in the past", path: ["start_time"] });
  }
});

export const cancelAppointmentSchema = z.object({
  motivo: shortText.optional(),
});

// Ratings
export const submitRatingSchema = z.object({
  appointment_id: uuid,
  doctor_id: uuid,
  rating: z.number().int().min(1).max(5),
  comment: safeText.optional(),
  would_recommend: z.boolean(),
});

// Follow-ups
export const completeFollowUpSchema = z.object({
  completed: z.literal(true),
  notes: safeText.optional(),
});

// Chronic conditions
export const addConditionSchema = z.object({
  condition_type: z.enum(["diabetes_1", "diabetes_2", "hipertension", "asma", "hipotiroidismo", "hipertiroidismo", "epoc", "artritis", "epilepsia", "insuficiencia_renal", "otro"]),
  custom_label: shortText.optional(),
  diagnosed_date: z.string().date().optional(),
  severity: z.enum(["leve", "moderado", "severo"]).optional(),
  treating_doctor_id: optionalUuid,
  notes: safeText.optional(),
});

export const updateConditionSchema = z.object({
  severity: z.enum(["leve", "moderado", "severo"]).optional(),
  treating_doctor_id: optionalUuid,
  notes: safeText.optional(),
  condition_label: shortText.optional(),
}).refine(d => Object.values(d).some(v => v !== undefined), { message: "At least one field required" });

export const logReadingSchema = z.object({
  condition_id: uuid,
  type: z.enum(["glucose", "blood_pressure", "peak_flow", "weight", "heart_rate", "temperature", "oxygen_saturation"]),
  value: z.number(),
  value2: z.number().optional(),
  unit: z.string().max(20),
  context: z.enum(["ayunas", "postprandial", "random", "reposo", "ejercicio"]).optional(),
  notes: safeText.optional(),
  measured_at: z.string().datetime().optional(),
});

// Goals
export const createGoalSchema = z.object({
  condition_id: uuid,
  metric_type: z.string().max(50),
  target_value: z.number(),
  current_value: z.number().optional(),
  target_date: z.string().date().optional(),
  description: shortText,
});

export const updateGoalSchema = z.object({
  current_value: z.number().optional(),
  is_completed: z.boolean().optional(),
  is_active: z.boolean().optional(),
  description: shortText.optional(),
  target_value: z.number().optional(),
  target_date: z.string().date().optional(),
}).refine(d => Object.values(d).some(v => v !== undefined), { message: "At least one field required" });

// Expenses
export const createExpenseSchema = z.object({
  category: z.enum(["consulta", "examen_lab", "medicamento", "cirugia", "hospitalizacion", "seguro_prima", "seguro_copago", "otro"]),
  description: shortText,
  amount_usd: z.number().positive(),
  amount_bs: z.number().nonnegative().optional(),
  bcv_rate: z.number().positive().optional(),
  date: z.string().date(),
  provider_name: shortText.optional(),
  appointment_id: optionalUuid,
  prescription_id: optionalUuid,
  lab_order_id: optionalUuid,
  receipt_url: z.string().url().optional(),
  notes: safeText.optional(),
});

export const updateExpenseSchema = z.object({
  category: z.enum(["consulta", "examen_lab", "medicamento", "cirugia", "hospitalizacion", "seguro_prima", "seguro_copago", "otro"]).optional(),
  description: shortText.optional(),
  amount_usd: z.number().positive().optional(),
  amount_bs: z.number().nonnegative().optional(),
  bcv_rate: z.number().positive().optional(),
  date: z.string().date().optional(),
  provider_name: shortText.optional(),
  appointment_id: optionalUuid,
  prescription_id: optionalUuid,
  lab_order_id: optionalUuid,
  receipt_url: z.string().url().optional(),
  notes: safeText.optional(),
}).refine(d => Object.values(d).some(v => v !== undefined), { message: "At least one field required" });

// Notifications
export const markNotificationsReadSchema = z.object({
  notification_ids: z.array(uuid).optional(),
  mark_all: z.boolean().optional(),
}).refine(d => d.notification_ids || d.mark_all, { message: "Provide notification_ids or mark_all" });

export const updateNotificationSchema = z.object({
  is_read: z.boolean(),
});

// Emergency profile
export const updateEmergencyProfileSchema = z.object({
  is_active: z.boolean().optional(),
  pin_code: z.string().max(6).optional(),
  share_blood_type: z.boolean().optional(),
  share_allergies: z.boolean().optional(),
  share_medications: z.boolean().optional(),
  share_conditions: z.boolean().optional(),
  share_emergency_contacts: z.boolean().optional(),
  share_insurance: z.boolean().optional(),
});

// Pharmacy
export const createPharmacyOrderSchema = z.object({
  pharmacy_id: uuid,
  prescription_id: uuid,
  items: z.array(z.unknown()).min(1),
  total_bs: z.number().nonnegative(),
  delivery_type: z.enum(["pickup", "delivery"]),
  payment_method: z.string().max(50),
  delivery_address: shortText.optional(),
  payment_reference: shortText.optional(),
  notes: safeText.optional(),
});

export const createPriceAlertSchema = z.object({
  medication_name: shortText,
  target_price_usd: z.number().positive(),
  prescription_id: optionalUuid,
});

// Insurance
export const createClaimSchema = z.object({
  insurance_id: uuid,
  appointment_id: optionalUuid,
  claim_type: z.string().max(50),
  total_amount: z.number().positive(),
});

export const createPreauthorizationSchema = z.object({
  insurance_id: uuid,
  appointment_id: optionalUuid,
  procedure_code: shortText,
  procedure_description: shortText,
  estimated_cost: z.number().positive(),
});

// Referrals
export const updateReferralSchema = z.object({
  status: z.enum(["pending", "scheduled", "completed", "expired"]),
  scheduled_appointment_id: z.string().uuid().optional(),
});

// Notification preferences
export const updateNotificationPrefsSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  categories: z.record(z.boolean()).optional(),
});
