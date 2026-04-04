import { z } from "zod";
import { isBefore, startOfDay } from "date-fns";

/**
 * Base validation schema for medical appointments
 * Centralized and reusable validations
 */
const baseAppointmentSchema = z.object({
    patient_id: z.string().min(1, "You must select a patient"),

    office_id: z.string().optional().or(z.literal("")),

    date: z.string().refine((date) => {
        const today = startOfDay(new Date());
        const selectedDate = startOfDay(new Date(date));
        return !isBefore(selectedDate, today);
    }, "Date cannot be in the past"),

    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),

    duration_minutes: z
        .number()
        .min(5, "Minimum duration is 5 minutes")
        .max(480, "Maximum duration is 8 hours"),

    appointment_type: z.enum(["in_person", "telemedicine", "emergency", "follow_up", "first_visit"], {
        message: "Invalid appointment type",
    }),

    reason: z
        .string()
        .min(3, "Reason must be at least 3 characters")
        .optional()
        .or(z.literal("")),

    internal_notes: z.string().optional().or(z.literal("")),

    price: z
        .string()
        .refine(
            (val) => !val || !isNaN(parseFloat(val)),
            "Price must be a valid number"
        )
        .optional()
        .or(z.literal("")),

    payment_method: z.enum(["cash", "transfer", "card", "insurance", "mobile_payment", "pending"], {
        message: "Invalid payment method",
    }),

    send_reminder: z.boolean().default(true),

    // Advanced fields
    preliminary_diagnosis: z.string().default(""),
    relevant_history: z.string().optional().or(z.literal("")).default(""),
    current_medications: z.string().optional().or(z.literal("")).default(""),
    allergies: z.string().optional().or(z.literal("")).default(""),
    clinical_notes: z.string().optional().or(z.literal("")).default(""),
});

/**
 * Full schema with combined date/time validation
 * The hook handles conflict validation
 */
export const appointmentSchema = baseAppointmentSchema.refine((data) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (data.date === todayStr) {
        const [hoursStr = "0", minutesStr = "0"] = data.time.split(":");
        const hours = Number(hoursStr);
        const minutes = Number(minutesStr);
        const selectedTime = new Date(now);
        selectedTime.setHours(
            Number.isFinite(hours) ? hours : 0,
            Number.isFinite(minutes) ? minutes : 0,
            0,
            0,
        );

        return selectedTime > new Date(now.getTime() - 60000);
    }
    return true;
}, {
    message: "The selected time has already passed",
    path: ["time"],
});

// Schema for simple mode only (without advanced fields)
export const appointmentSchemaSimple = baseAppointmentSchema
    .omit({
        preliminary_diagnosis: true,
        relevant_history: true,
        current_medications: true,
        allergies: true,
        clinical_notes: true,
    })
    .refine((data) => {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        if (data.date === todayStr) {
            const [hoursStr = "0", minutesStr = "0"] = data.time.split(":");
            const hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            const selectedTime = new Date(now);
            selectedTime.setHours(
                Number.isFinite(hours) ? hours : 0,
                Number.isFinite(minutes) ? minutes : 0,
                0,
                0,
            );

            return selectedTime > new Date(now.getTime() - 60000);
        }
        return true;
    }, {
        message: "The selected time has already passed",
        path: ["time"],
    });

export type AppointmentFormValues = z.input<typeof baseAppointmentSchema>;
export type AppointmentFormSimpleValues = z.input<typeof appointmentSchemaSimple>;
