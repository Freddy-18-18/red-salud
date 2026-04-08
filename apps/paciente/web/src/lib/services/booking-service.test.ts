import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Mock fetchJson at the module level ---
const mockFetchJson = vi.fn();

vi.mock('@/lib/utils/fetch', () => ({
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
  postJson: vi.fn(),
}));

// Import AFTER mock is set up
import { bookingService } from './booking-service';

// ---------------------------------------------------------------------------
// bookingService
// ---------------------------------------------------------------------------

describe('bookingService', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  // ── getSpecialties ──────────────────────────────────────────────────

  describe('getSpecialties', () => {
    it('fetches from /api/specialties without params by default', async () => {
      const specialties = [{ id: '1', name: 'Cardiologia' }];
      mockFetchJson.mockResolvedValue(specialties);

      const result = await bookingService.getSpecialties();

      expect(mockFetchJson).toHaveBeenCalledOnce();
      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('/api/specialties');
      expect(url).not.toContain('with_doctors');
      expect(result).toEqual(specialties);
    });

    it('passes with_doctors=true when onlyWithDoctors is true', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getSpecialties(true);

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('with_doctors=true');
    });

    it('does not include with_doctors param when onlyWithDoctors is false', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getSpecialties(false);

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).not.toContain('with_doctors');
    });
  });

  // ── getDoctorsBySpecialty ───────────────────────────────────────────

  describe('getDoctorsBySpecialty', () => {
    it('includes specialty_id in query params', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-cardio');

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('/api/doctors/search');
      expect(url).toContain('specialty_id=sp-cardio');
    });

    it('appends city filter when provided', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', { city: 'Caracas' });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('city=Caracas');
    });

    it('appends accepts_insurance filter', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', {
        accepts_insurance: true,
      });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('accepts_insurance=true');
    });

    it('appends gender filter', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', { gender: 'F' });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('gender=F');
    });

    it('appends sort_by from sortBy filter', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', {
        sortBy: 'price_asc',
      });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('sort_by=price_asc');
    });

    it('builds URL with all filters combined', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', {
        city: 'Maracaibo',
        accepts_insurance: true,
        gender: 'M',
        sortBy: 'rating',
      });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('specialty_id=sp-1');
      expect(url).toContain('city=Maracaibo');
      expect(url).toContain('accepts_insurance=true');
      expect(url).toContain('gender=M');
      expect(url).toContain('sort_by=rating');
    });

    it('omits undefined filter values', async () => {
      mockFetchJson.mockResolvedValue([]);

      await bookingService.getDoctorsBySpecialty('sp-1', {
        city: undefined,
        gender: undefined,
      });

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).not.toContain('city=');
      expect(url).not.toContain('gender=');
    });
  });

  // ── getAvailableDates ──────────────────────────────────────────────

  describe('getAvailableDates', () => {
    it('fetches from /api/doctors/{id}/availability', async () => {
      const dates = [
        { date: '2026-05-01', dayOfWeek: 5, hasSlots: true },
      ];
      mockFetchJson.mockResolvedValue(dates);

      const result = await bookingService.getAvailableDates(
        'doc-123',
        '2026-05-01',
        '2026-05-31',
      );

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toBe('/api/doctors/doc-123/availability');
      expect(result).toEqual(dates);
    });
  });

  // ── getAvailableSlots ──────────────────────────────────────────────

  describe('getAvailableSlots', () => {
    it('includes date as query param', async () => {
      const slots = [
        {
          label: 'Manana',
          slots: [{ start: '09:00', end: '09:30', available: true }],
        },
      ];
      mockFetchJson.mockResolvedValue(slots);

      const result = await bookingService.getAvailableSlots(
        'doc-123',
        '2026-05-15',
      );

      const url = mockFetchJson.mock.calls[0][0] as string;
      expect(url).toContain('/api/doctors/doc-123/availability');
      expect(url).toContain('date=2026-05-15');
      expect(result).toEqual(slots);
    });
  });

  // ── createAppointment ─────────────────────────────────────────────

  describe('createAppointment', () => {
    it('sends POST to /api/appointments with patient_id merged into body', async () => {
      const appointmentResult = {
        id: 'apt-1',
        patient_id: 'pat-1',
        doctor_id: 'doc-1',
        scheduled_at: '2026-05-15T10:00:00Z',
        duration_minutes: 30,
        reason: 'Consulta general',
        notes: null,
        status: 'pending',
        appointment_type: 'presencial',
      };
      mockFetchJson.mockResolvedValue(appointmentResult);

      const data = {
        doctor_id: 'doc-1',
        scheduled_at: '2026-05-15T10:00:00Z',
        duration_minutes: 30,
        reason: 'Consulta general',
        appointment_type: 'presencial' as const,
      };

      const result = await bookingService.createAppointment('pat-1', data);

      expect(mockFetchJson).toHaveBeenCalledWith('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: 'pat-1', ...data }),
      });
      expect(result).toEqual(appointmentResult);
    });
  });

  // ── Error propagation ─────────────────────────────────────────────

  describe('error propagation', () => {
    it('re-throws when fetchJson rejects', async () => {
      mockFetchJson.mockRejectedValue(new Error('Network error'));

      await expect(bookingService.getSpecialties()).rejects.toThrow(
        'Network error',
      );
    });

    it('re-throws API errors from createAppointment', async () => {
      mockFetchJson.mockRejectedValue(new Error('Horario no disponible.'));

      await expect(
        bookingService.createAppointment('pat-1', {
          doctor_id: 'doc-1',
          scheduled_at: '2026-05-15T10:00:00Z',
          duration_minutes: 30,
          reason: 'Test',
          appointment_type: 'presencial',
        }),
      ).rejects.toThrow('Horario no disponible.');
    });
  });
});
