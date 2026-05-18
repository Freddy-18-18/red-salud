import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CancelAppointmentDialog } from "../cancel-appointment-dialog";
import type { Appointment } from "@/lib/services/appointments/appointments.types";

const baseAppointment: Appointment = {
  id: "apt-1",
  doctor_id: "doc-1",
  scheduled_at: "2026-06-15T14:30:00Z",
  duration_minutes: 30,
  status: "confirmed",
  appointment_type: "in_person",
  reason: "Control",
  created_at: "2026-05-01T00:00:00Z",
  doctor: {
    id: "doc-1",
    full_name: "Pérez García",
  },
};

describe("CancelAppointmentDialog", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirm = vi.fn().mockResolvedValue({ success: true, error: null });
    onClose = vi.fn();
  });

  it("muestra el doctor y el título del dialog", () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/Dr. Pérez García/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Cancelar cita/i }),
    ).toBeInTheDocument();
  });

  it("envía undefined cuando no se selecciona motivo", async () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancelar cita/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("envía la etiqueta del motivo predefinido elegido", async () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Motivo/i), {
      target: { value: "improved" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Cancelar cita/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith(
      "Mejoré, ya no necesito la consulta",
    );
  });

  it('muestra el textarea cuando elige "Otro motivo" y envía el texto custom', async () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Motivo/i), {
      target: { value: "other" },
    });
    const textarea = screen.getByLabelText(/Contanos brevemente/i);
    fireEvent.change(textarea, { target: { value: "Cambié de doctor" } });
    fireEvent.click(screen.getByRole("button", { name: /Cancelar cita/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith("Cambié de doctor");
  });

  it("muestra el error devuelto por onConfirm cuando falla", async () => {
    onConfirm.mockResolvedValueOnce({
      success: false,
      error: "Las cancelaciones deben hacerse al menos 24h antes de la cita.",
    });

    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancelar cita/i }));

    expect(
      await screen.findByText(/al menos 24h antes/i),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ESC dispara onClose cuando no está cargando", () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ESC NO dispara onClose si loading=true", () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
        loading
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('botón "Volver" cierra el dialog', () => {
    render(
      <CancelAppointmentDialog
        appointment={baseAppointment}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Volver/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
