'use client';

import { supabase } from '@/lib/supabase/client';
import {
  useDoctorSchedule as useCoreSchedule,
  useTimeBlocks as useCoreTimeBlocks,
  useAvailabilityExceptions as useCoreExceptions,
} from '@red-salud/core';

// Re-export types from core so existing consumers don't break
export type {
  TimeSlot,
  BreakSlot,
  WeeklyScheduleRow,
  BlockType,
  TimeBlockRow,
  AvailabilityExceptionRow,
} from '@red-salud/core';

// Aliases for backward compatibility — consumers used names without `Row` suffix
export type { AvailabilityExceptionRow as AvailabilityException } from '@red-salud/core';
export type { TimeBlockRow as TimeBlock } from '@red-salud/core';

/**
 * Composite hook that wraps the three core scheduling hooks
 * (useDoctorSchedule, useTimeBlocks, useAvailabilityExceptions)
 * into a single return object — preserving the original API surface
 * so existing consumers don't need changes.
 */
export function useDoctorSchedule(doctorId: string | null) {
  const schedule = useCoreSchedule(supabase, doctorId);
  const blocks = useCoreTimeBlocks(supabase, doctorId);
  const exceptions = useCoreExceptions(supabase, doctorId);

  return {
    // State
    weeklySchedule: schedule.weeklySchedule,
    timeBlocks: blocks.timeBlocks,
    exceptions: exceptions.exceptions,
    loading: schedule.loading || blocks.loading || exceptions.loading,
    saving: schedule.saving || blocks.saving || exceptions.saving,
    error: schedule.error || blocks.error || exceptions.error,

    // Weekly schedule
    setWeeklySchedule: schedule.setWeeklySchedule,
    saveWeeklySchedule: schedule.saveWeeklySchedule,

    // Time blocks
    addTimeBlock: blocks.addTimeBlock,
    updateTimeBlock: blocks.updateTimeBlock,
    deleteTimeBlock: blocks.deleteTimeBlock,

    // Exceptions
    addException: exceptions.addException,
    deleteException: exceptions.deleteException,

    // Reload all
    refresh: async () => {
      await Promise.all([
        schedule.refresh(),
        blocks.refresh(),
        exceptions.refresh(),
      ]);
    },
  };
}
