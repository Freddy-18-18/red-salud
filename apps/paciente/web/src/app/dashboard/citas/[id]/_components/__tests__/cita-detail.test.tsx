import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CitaDetail } from "../cita-detail";
import type { AppointmentDetail } from "@/lib/services/appointments/appointments.types";

// Hooks + router stubs
const cancelMock = vi.fn().mockResolvedValue({ success: true, error: null });
const rescheduleMock = vi
  .fn()
  .mockResolvedValue({ success: true, data: { id: "apt-1" }, error: null });
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn() }),
}));

vi.mock("@/hooks/use-appointments", () => ({
  useCancelAppointment: () => ({
    cancel: cancelMock,
    loading: false,
    error: null,
  }),
  useRescheduleAppointment: () => ({
    reschedule: rescheduleMock,
    loading: false,
    error: null,
  }),
}));

const FUTURE = "2099-12-31T14:30:00Z";

function makeDetail(
  overrides: Partial<AppointmentDetail> = {},
): AppointmentDetail {
  return {
    id: "apt-1",
    doctor_id: "doc-1",
    scheduled_at: FUTURE,
    duration_minutes: 30,
    status: "confirmed",
    appointment_type: "in_person",
    reason: "Control general",
    created_at: "2026-05-01T00:00:00Z",
    cancellation_window_hours: 24,
    doctor: {
      id: "doc-1",
      full_name: "Pérez García",
      city: "Caracas",
      state: "Distrito Capital",
      doctor_profile: {
        id: "dp-1",
        biography: null,
        years_experience: 12,
        sacs_verified: true,
        verified: true,
        languages: ["es", "en"],
        specialty: { id: "s-1", name: "Cardiología", icon: "heart" },
      },
    },
    location: {
      id: "loc-1",
      name: "Sede Principal",
      address_line: "Av. Libertador 123",
      city: "Caracas",
      state: "Distrito Capital",
      phone: "+58 212 1234567",
      latitude: 10.5,
      longitude: -66.9,
      organization: { id: "org-1", name: "Clínica Sur" },
    },
    ...overrides,
  };
}

describe("CitaDetail", () => {
  beforeEach(() => {
    cancelMock.mockClear();
    cancelMock.mockResolvedValue({ success: true, error: null });
    refreshMock.mockClear();
  });

  it("renderiza el doctor con nombre, especialidad y badges", () => {
    render(<CitaDetail appointment={makeDetail()} userId="user-1" />);

    expect(screen.getByText(/Dr\. Pérez García/)).toBeInTheDocument();
    expect(screen.getByText(/Cardiología/)).toBeInTheDocument();
    expect(screen.getByText(/SACS verificado/i)).toBeInTheDocument();
    expect(screen.getByText(/12 años de experiencia/i)).toBeInTheDocument();
  });

  it("muestra la sede completa para citas presenciales", () => {
    render(<CitaDetail appointment={makeDetail()} userId="user-1" />);

    expect(screen.getByText("Sede Principal")).toBeInTheDocument();
    expect(screen.getByText("Clínica Sur")).toBeInTheDocument();
    expect(
      screen.getByText(/Av. Libertador 123, Caracas, Distrito Capital/),
    ).toBeInTheDocument();
    expect(screen.getByText(/\+58 212 1234567/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver en mapa/i })).toBeInTheDocument();
  });

  it("oculta la sección Sede para video consultas", () => {
    render(
      <CitaDetail
        appointment={makeDetail({ appointment_type: "telemedicine" })}
        userId="user-1"
      />,
    );

    expect(screen.queryByText("Sede Principal")).not.toBeInTheDocument();
    expect(screen.getByText(/Video consulta/i)).toBeInTheDocument();
  });

  it("muestra la política de cancelación cuando se puede cancelar", () => {
    render(<CitaDetail appointment={makeDetail()} userId="user-1" />);

    expect(
      screen.getByText(/sin costo hasta\s*24\s*horas antes/i),
    ).toBeInTheDocument();
  });

  it("oculta acciones cuando la cita ya está cancelada", () => {
    render(
      <CitaDetail
        appointment={makeDetail({ status: "cancelled" })}
        userId="user-1"
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Cancelar cita/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sin costo hasta/i),
    ).not.toBeInTheDocument();
  });

  it("abre el dialog de cancelación al clickear el botón", () => {
    render(<CitaDetail appointment={makeDetail()} userId="user-1" />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar cita/i }));

    expect(
      screen.getByRole("heading", { name: /Cancelar cita/i }),
    ).toBeInTheDocument();
  });

  it("muestra 'Agendar de nuevo' cuando la cita está completada", () => {
    render(
      <CitaDetail
        appointment={makeDetail({ status: "completed" })}
        userId="user-1"
      />,
    );

    expect(
      screen.getByRole("link", { name: /Agendar de nuevo/i }),
    ).toBeInTheDocument();
  });
});
