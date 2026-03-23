import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

export class TauriNotificationService {
  async send(title: string, body?: string): Promise<void> {
    let granted = await isPermissionGranted();

    if (!granted) {
      const permission = await requestPermission();
      granted = permission === 'granted';
    }

    if (granted) {
      sendNotification({ title, body });
    }
  }
}
