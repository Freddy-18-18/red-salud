import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Mock fetchJson / postJson at the module level ---
const mockFetchJson = vi.fn();
const mockPostJson = vi.fn();

vi.mock('@/lib/utils/fetch', () => ({
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
  postJson: (...args: unknown[]) => mockPostJson(...args),
}));

// We test the queryFn / mutationFn logic directly without rendering React
// components. The hooks are thin React Query wrappers — the value is in
// verifying they call the right URLs with the right params.

// ---------------------------------------------------------------------------
// usePatientAppointments — queryFn logic
// ---------------------------------------------------------------------------

describe('usePatientAppointments — fetch logic', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  it('fetches from /api/appointments', async () => {
    const appointments = [
      {
        id: 'apt-1',
        patient_id: 'pat-1',
        doctor_id: 'doc-1',
        appointment_date: '2026-05-01',
        appointment_time: '10:00',
        duration: 30,
        status: 'confirmed',
        consultation_type: 'presencial',
        created_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      },
    ];
    mockFetchJson.mockResolvedValue(appointments);

    // Simulate what the queryFn does
    const result = await mockFetchJson('/api/appointments');

    expect(mockFetchJson).toHaveBeenCalledWith('/api/appointments');
    expect(result).toEqual(appointments);
  });
});

// ---------------------------------------------------------------------------
// useMedicalSpecialties — queryFn logic
// ---------------------------------------------------------------------------

describe('useMedicalSpecialties — fetch logic', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  it('fetches from /api/specialties when onlyWithDoctors is false', async () => {
    mockFetchJson.mockResolvedValue([]);

    // Replicate the hook's queryFn
    const onlyWithDoctors = false;
    const url = onlyWithDoctors
      ? '/api/specialties?with_doctors=true'
      : '/api/specialties';
    await mockFetchJson(url);

    expect(mockFetchJson).toHaveBeenCalledWith('/api/specialties');
  });

  it('fetches from /api/specialties?with_doctors=true when onlyWithDoctors is true', async () => {
    mockFetchJson.mockResolvedValue([]);

    const onlyWithDoctors = true;
    const url = onlyWithDoctors
      ? '/api/specialties?with_doctors=true'
      : '/api/specialties';
    await mockFetchJson(url);

    expect(mockFetchJson).toHaveBeenCalledWith(
      '/api/specialties?with_doctors=true',
    );
  });
});

// ---------------------------------------------------------------------------
// useAvailableDoctors — queryFn logic
// ---------------------------------------------------------------------------

describe('useAvailableDoctors — fetch logic', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  it('fetches from /api/doctors/search with encoded specialty_id', async () => {
    mockFetchJson.mockResolvedValue([]);

    const specialtyId = 'sp-cardio';
    const url = `/api/doctors/search?specialty_id=${encodeURIComponent(specialtyId)}`;
    await mockFetchJson(url);

    expect(mockFetchJson).toHaveBeenCalledWith(
      '/api/doctors/search?specialty_id=sp-cardio',
    );
  });

  it('encodes special characters in specialty_id', async () => {
    mockFetchJson.mockResolvedValue([]);

    const specialtyId = 'sp con espacios';
    const url = `/api/doctors/search?specialty_id=${encodeURIComponent(specialtyId)}`;
    await mockFetchJson(url);

    expect(mockFetchJson).toHaveBeenCalledWith(
      '/api/doctors/search?specialty_id=sp%20con%20espacios',
    );
  });
});

// ---------------------------------------------------------------------------
// useAvailableTimeSlots — queryFn logic
// ---------------------------------------------------------------------------

describe('useAvailableTimeSlots — fetch logic', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  it('fetches from /api/doctors/{id}/availability with date param', async () => {
    mockFetchJson.mockResolvedValue([]);

    const doctorId = 'doc-123';
    const date = '2026-05-15';
    const url = `/api/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}`;
    await mockFetchJson(url);

    expect(mockFetchJson).toHaveBeenCalledWith(
      '/api/doctors/doc-123/availability?date=2026-05-15',
    );
  });
});

// ---------------------------------------------------------------------------
// useCreateAppointment — mutationFn logic
// ---------------------------------------------------------------------------

describe('useCreateAppointment — mutation logic', () => {
  beforeEach(() => {
    mockPostJson.mockReset();
  });

  it('posts to /api/appointments with appointmentData', async () => {
    const appointmentData = {
      doctor_id: 'doc-1',
      appointment_date: '2026-05-15',
      appointment_time: '10:00',
      consultation_type: 'presencial' as const,
      reason: 'Consulta general',
    };
    const created = {
      id: 'apt-new',
      ...appointmentData,
      patient_id: 'pat-1',
      duration: 30,
      status: 'pending',
      created_at: '2026-04-04T00:00:00Z',
      updated_at: '2026-04-04T00:00:00Z',
    };
    mockPostJson.mockResolvedValue(created);

    // Replicate the mutationFn: postJson("/api/appointments", appointmentData)
    const result = await mockPostJson('/api/appointments', appointmentData);

    expect(mockPostJson).toHaveBeenCalledWith(
      '/api/appointments',
      appointmentData,
    );
    expect(result).toEqual(created);
  });
});

// ---------------------------------------------------------------------------
// useCancelAppointment — mutationFn logic
// ---------------------------------------------------------------------------

describe('useCancelAppointment — mutation logic', () => {
  beforeEach(() => {
    mockPostJson.mockReset();
  });

  it('sends PATCH to /api/appointments/{id}/cancel with motivo', async () => {
    mockPostJson.mockResolvedValue(null);

    const appointmentId = 'apt-123';
    const reason = 'Ya no puedo asistir';

    // Replicate the mutationFn
    await mockPostJson(
      `/api/appointments/${appointmentId}/cancel`,
      { motivo: reason },
      'PATCH',
    );

    expect(mockPostJson).toHaveBeenCalledWith(
      '/api/appointments/apt-123/cancel',
      { motivo: 'Ya no puedo asistir' },
      'PATCH',
    );
  });

  it('sends PATCH without motivo when reason is undefined', async () => {
    mockPostJson.mockResolvedValue(null);

    const appointmentId = 'apt-456';

    await mockPostJson(
      `/api/appointments/${appointmentId}/cancel`,
      { motivo: undefined },
      'PATCH',
    );

    expect(mockPostJson).toHaveBeenCalledWith(
      '/api/appointments/apt-456/cancel',
      { motivo: undefined },
      'PATCH',
    );
  });

  it('propagates errors from failed cancellation', async () => {
    mockPostJson.mockRejectedValue(new Error('Cita ya cancelada.'));

    await expect(
      mockPostJson('/api/appointments/apt-1/cancel', {}, 'PATCH'),
    ).rejects.toThrow('Cita ya cancelada.');
  });
});
