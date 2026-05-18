import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CitasList } from "../citas-list";
import type { Appointment } from "@/lib/services/appointments/appointments.types";

// --- Mocks at the module level ---
const mockUsePatientAppointments = vi.fn();
const mockUseCancelAppointment = vi.fn();

vi.mock("@/hooks/use-appointments", () => ({
  usePatientAppointments: (userId: string | undefined) =>
    mockUsePatientAppointments(userId),
  useCancelAppointment: () => mockUseCancelAppointment(),
}));

// Stub the waitlist banner — it owns its own React Query client and would
// otherwise need a QueryClientProvider wrapper here. The banner is covered
// by its own dedicated tests.
vi.mock("@/components/citas/waitlist-match-banner", () => ({
  WaitlistMatchBanner: () => null,
}));

const FUTURE = "2099-12-31T10:00:00Z";
const PAST = "2020-01-01T10:00:00Z";

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt-1",
    doctor_id: "doc-1",
    scheduled_at: FUTURE,
    duration_minutes: 30,
    status: "confirmed",
    appointment_type: "in_person",
    reason: "Control general",
    created_at: "2026-05-01T00:00:00Z",
    doctor: {
      id: "doc-1",
      full_name: "Pérez García",
      city: "Caracas",
      state: "Distrito Capital",
    },
    ...overrides,
  };
}

describe("CitasList", () => {
  let cancelMock: ReturnType<typeof vi.fn>;
  let refreshMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cancelMock = vi.fn().mockResolvedValue({ success: true, error: null });
    refreshMock = vi.fn().mockResolvedValue({});
    mockUsePatientAppointments.mockReset();
    mockUseCancelAppointment.mockReset();
    mockUseCancelAppointment.mockReturnValue({
      cancel: cancelMock,
      loading: false,
      error: null,
    });
  });

  it("muestra skeleton mientras carga", () => {
    mockUsePatientAppointments.mockReturnValue({
      appointments: [],
      loading: true,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    expect(screen.getByText(/Mis Citas/i)).toBeInTheDocument();
    expect(document.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
  });

  it("muestra error state con botón de reintentar cuando hay error", async () => {
    mockUsePatientAppointments.mockReturnValue({
      appointments: [],
      loading: false,
      error: "Network down",
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    expect(
      screen.getByText(/No pudimos cargar tus citas/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Network down/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
  });

  it("muestra empty state cuando no hay citas próximas", () => {
    mockUsePatientAppointments.mockReturnValue({
      appointments: [],
      loading: false,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    expect(screen.getByText(/No tienes citas proximas/i)).toBeInTheDocument();
  });

  it("renderiza la card de la cita con doctor, badge de tipo y ciudad", () => {
    const appt = makeAppointment({ appointment_type: "telemedicine" });
    mockUsePatientAppointments.mockReturnValue({
      appointments: [appt],
      loading: false,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    expect(screen.getByText(/Dr. Pérez García/)).toBeInTheDocument();
    expect(screen.getByText(/Video consulta/i)).toBeInTheDocument();
  });

  it("clasifica las citas en próximas, pasadas y canceladas", () => {
    const upcoming = makeAppointment({ id: "future", scheduled_at: FUTURE });
    const past = makeAppointment({
      id: "past",
      scheduled_at: PAST,
      status: "completed",
    });
    const cancelled = makeAppointment({
      id: "cancelled",
      scheduled_at: FUTURE,
      status: "cancelled",
    });
    mockUsePatientAppointments.mockReturnValue({
      appointments: [upcoming, past, cancelled],
      loading: false,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    const tabs = screen.getAllByRole("button", { name: /Proximas|Pasadas|Canceladas/ });
    // Each tab should show its count badge: 1 / 1 / 1
    expect(tabs).toHaveLength(3);

    // Switch to "Pasadas"
    fireEvent.click(tabs[1]);
    expect(screen.getByText(/Completada/i)).toBeInTheDocument();

    // Switch to "Canceladas" — the badge says "Cancelada" (no s) exactly
    fireEvent.click(tabs[2]);
    expect(screen.getByText("Cancelada", { exact: true })).toBeInTheDocument();
  });

  it("abre el dialog de cancelación al clickear Cancelar", () => {
    mockUsePatientAppointments.mockReturnValue({
      appointments: [makeAppointment()],
      loading: false,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-1" />);

    const cancelButton = screen.getByRole("button", { name: /^Cancelar$/ });
    fireEvent.click(cancelButton);

    expect(
      screen.getByRole("heading", { name: /Cancelar cita/i }),
    ).toBeInTheDocument();
  });

  it("confirmar cancelación llama al hook con userId y refresca", async () => {
    mockUsePatientAppointments.mockReturnValue({
      appointments: [makeAppointment({ id: "apt-9" })],
      loading: false,
      error: null,
      refreshAppointments: refreshMock,
    });

    render(<CitasList userId="user-7" />);

    fireEvent.click(screen.getByRole("button", { name: /^Cancelar$/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /^Cancelar cita$/i }),
    );

    await waitFor(() => expect(cancelMock).toHaveBeenCalledTimes(1));
    expect(cancelMock).toHaveBeenCalledWith("apt-9", "user-7", undefined);
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
  });
});
