// Re-export everything from the new modular structure
// This file is kept for backward compatibility
export * from "./appointments";

// Legacy exports (deprecated - use named imports from "./appointments" instead)
import {
  getMedicalSpecialties as _getMedicalSpecialties,
  getAvailableDoctors as _getAvailableDoctors,
  getDoctorProfile as _getDoctorProfile,
  getDoctorSchedules as _getDoctorSchedules,
  getAvailableTimeSlots as _getAvailableTimeSlots,
  getPatientAppointments as _getPatientAppointments,
  getDoctorAppointments as _getDoctorAppointments,
  createAppointment as _createAppointment,
  cancelAppointment as _cancelAppointment,
  confirmAppointment as _confirmAppointment,
  completeAppointment as _completeAppointment,
} from "./appointments";

export const getMedicalSpecialties = _getMedicalSpecialties;
export const getAvailableDoctors = _getAvailableDoctors;
export const getDoctorProfile = _getDoctorProfile;
export const getDoctorSchedules = _getDoctorSchedules;
export const getAvailableTimeSlots = _getAvailableTimeSlots;
export const getPatientAppointments = _getPatientAppointments;
export const getDoctorAppointments = _getDoctorAppointments;
export const createAppointment = _createAppointment;
export const cancelAppointment = _cancelAppointment;
export const confirmAppointment = _confirmAppointment;
export const completeAppointment = _completeAppointment;

// Old implementation (deprecated)
/*
import { supabase } from "../client";
import type {
  Appointment,
  DoctorProfile,
  MedicalSpecialty,
  CreateAppointmentData,
  TimeSlot,
  DoctorSchedule,
} from "../types/appointments";

export async function getMedicalSpecialties(onlyWithDoctors: boolean = false) {
*/
