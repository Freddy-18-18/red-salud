/**
 * Genera una URL de Jitsi Meet para una cita de telemedicina.
 *
 * Formato: https://meet.jit.si/RedSalud-{slug}
 *   donde slug = doctorId(6 chars) + fechaHHMM + random(4)
 *
 * Jitsi acepta cualquier nombre de sala. Lo importante es que sea único
 * por cita para evitar colisiones, y razonablemente "no adivinable" para
 * que terceros no entren accidentalmente.
 */

function randomSlug(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateMeetingUrl(opts: {
  doctorId: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
}): string {
  const doctorPrefix = opts.doctorId.replace(/-/g, '').slice(0, 6);
  const datePart = opts.date.replace(/-/g, '');
  const timePart = opts.time.replace(':', '');
  const rand = randomSlug(4);
  return `https://meet.jit.si/RedSalud-${doctorPrefix}-${datePart}${timePart}-${rand}`;
}
