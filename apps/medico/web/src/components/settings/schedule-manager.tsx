'use client';

import { useState, useCallback } from 'react';
import {
  CalendarDays,
  Clock,
  CalendarOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useDoctorSchedule } from '@/hooks/use-doctor-schedule';
import { WeeklySchedule } from './weekly-schedule';
import { TimeBlocks } from './time-blocks';
import { AvailabilityExceptions } from './availability-exceptions';

// ============================================================================
// TYPES
// ============================================================================

type ScheduleSection = 'weekly' | 'blocks' | 'exceptions';

// ============================================================================
// PROPS
// ============================================================================

interface ScheduleManagerProps {
  doctorId: string;
  consultationDuration: number;
  onDurationChange: (duration: number) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScheduleManager({
  doctorId,
  consultationDuration,
  onDurationChange,
}: ScheduleManagerProps) {
  const [activeSection, setActiveSection] = useState<ScheduleSection>('weekly');

  const {
    weeklySchedule,
    timeBlocks,
    exceptions,
    loading,
    saving,
    error,
    setWeeklySchedule,
    saveWeeklySchedule,
    addTimeBlock,
    deleteTimeBlock,
    addException,
    deleteException,
  } = useDoctorSchedule(doctorId);

  const sections: Array<{ id: ScheduleSection; label: string; icon: typeof Clock; count?: number }> = [
    { id: 'weekly', label: 'Horario semanal', icon: CalendarDays },
    { id: 'blocks', label: 'Bloqueos', icon: Clock, count: timeBlocks.length || undefined },
    { id: 'exceptions', label: 'Excepciones', icon: CalendarOff, count: exceptions.length || undefined },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Cargando horarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
              {section.count != null && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {section.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      {activeSection === 'weekly' && (
        <WeeklySchedule
          schedule={weeklySchedule}
          consultationDuration={consultationDuration}
          saving={saving}
          onScheduleChange={setWeeklySchedule}
          onSave={saveWeeklySchedule}
          onDurationChange={onDurationChange}
        />
      )}

      {activeSection === 'blocks' && (
        <TimeBlocks
          blocks={timeBlocks}
          doctorId={doctorId}
          saving={saving}
          onAdd={addTimeBlock}
          onDelete={deleteTimeBlock}
        />
      )}

      {activeSection === 'exceptions' && (
        <AvailabilityExceptions
          exceptions={exceptions}
          doctorId={doctorId}
          saving={saving}
          onAdd={addException}
          onDelete={deleteException}
        />
      )}
    </div>
  );
}
