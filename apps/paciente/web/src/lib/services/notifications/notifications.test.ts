import { describe, it, expect, vi } from 'vitest';
import { createDoctorNotificationDriver } from './index';

function makeSupabaseStub(insertResult: { error: { message: string } | null }) {
  const insert = vi.fn().mockResolvedValue(insertResult);
  const from = vi.fn().mockReturnValue({ insert });
  return {
    client: { from } as unknown as Parameters<typeof createDoctorNotificationDriver>[0],
    from,
    insert,
  };
}

describe('createDoctorNotificationDriver', () => {
  it('inserts the notification row with the canonical column names', async () => {
    const stub = makeSupabaseStub({ error: null });
    const driver = createDoctorNotificationDriver(stub.client);

    await driver.notify({
      recipientId: 'doc-1',
      type: 'appointment_cancelled',
      title: 'Cita cancelada',
      message: 'El paciente canceló su cita.',
      actionUrl: '/dashboard/citas/abc',
    });

    expect(stub.from).toHaveBeenCalledWith('doctor_notifications');
    expect(stub.insert).toHaveBeenCalledWith({
      doctor_id: 'doc-1',
      type: 'appointment_cancelled',
      title: 'Cita cancelada',
      message: 'El paciente canceló su cita.',
      action_url: '/dashboard/citas/abc',
      is_read: false,
    });
  });

  it('passes null action_url when none provided', async () => {
    const stub = makeSupabaseStub({ error: null });
    const driver = createDoctorNotificationDriver(stub.client);

    await driver.notify({
      recipientId: 'doc-1',
      type: 'appointment_created',
      title: 't',
      message: 'm',
    });

    expect(stub.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action_url: null }),
    );
  });

  it('swallows insert errors so the caller is not interrupted', async () => {
    const stub = makeSupabaseStub({ error: { message: 'DB down' } });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const driver = createDoctorNotificationDriver(stub.client);

    await expect(
      driver.notify({
        recipientId: 'doc-1',
        type: 'appointment_cancelled',
        title: 't',
        message: 'm',
      }),
    ).resolves.toBeUndefined();

    expect(errSpy).toHaveBeenCalled();
  });
});
