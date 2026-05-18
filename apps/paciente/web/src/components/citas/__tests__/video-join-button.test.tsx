import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { VideoJoinButton } from "../video-join-button";

const fetchJsonMock = vi.fn();
vi.mock("@/lib/utils/fetch", () => ({
  fetchJson: (...args: unknown[]) => fetchJsonMock(...args),
}));

describe("VideoJoinButton", () => {
  beforeEach(() => {
    fetchJsonMock.mockReset();
  });

  it("muestra estado disabled con countdown cuando faltan más de 15 min", () => {
    const inOneHour = new Date(Date.now() + 60 * 60_000).toISOString();
    render(
      <VideoJoinButton
        appointmentId="apt-1"
        scheduledAt={inOneHour}
        durationMinutes={30}
        status="confirmed"
      />,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/Disponible en/);
  });

  it("muestra el botón habilitado dentro de los 15 min antes", () => {
    const in5Min = new Date(Date.now() + 5 * 60_000).toISOString();
    render(
      <VideoJoinButton
        appointmentId="apt-1"
        scheduledAt={in5Min}
        durationMinutes={30}
        status="confirmed"
      />,
    );

    const btn = screen.getByRole("button");
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveTextContent(/Unirse a videollamada/);
  });

  it("no renderiza nada cuando la cita ya finalizó hace tiempo", () => {
    const longAgo = new Date(Date.now() - 5 * 60 * 60_000).toISOString();
    const { container } = render(
      <VideoJoinButton
        appointmentId="apt-1"
        scheduledAt={longAgo}
        durationMinutes={30}
        status="confirmed"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("no renderiza nada cuando la cita está cancelada", () => {
    const in5Min = new Date(Date.now() + 5 * 60_000).toISOString();
    const { container } = render(
      <VideoJoinButton
        appointmentId="apt-1"
        scheduledAt={in5Min}
        durationMinutes={30}
        status="cancelled"
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
