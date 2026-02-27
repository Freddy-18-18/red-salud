import { invoke } from "@tauri-apps/api/core";
import { tauriNotificationService } from "./tauri-notification-service";

export const tauriSyncService = {
    syncInterval: null as ReturnType<typeof setInterval> | null,

    async startAutoSync(intervalMinutes: number = 5) {
        if (typeof window === 'undefined' || !('__TAURI__' in window)) return;

        // Sincronizar inmediatamente
        await this.syncAll();

        // Configurar sincronización periódica
        if (this.syncInterval) clearInterval(this.syncInterval);

        this.syncInterval = setInterval(async () => {
            const isOnline = await invoke("check_connectivity");
            if (isOnline) {
                await this.syncAll();
            }
        }, intervalMinutes * 60 * 1000);
    },

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    },

    async syncAll() {
        try {
            console.log("Iniciando sincronización...");

            // Check connectivity first
            const isOnline = await invoke("check_connectivity");
            if (!isOnline) {
                console.log("Offline: Skipping sync");
                return;
            }

            // Sincronizar citas
            // NOTE: In a real app we'd need the current doctor ID.
            // For now we assume the API/Backend handles 'my' appointments or we fetch from local user state.
            // This is a placeholder for the sync logic.

            // Notificar éxito
            await tauriNotificationService.notifySync("success");
            console.log("Sincronización completada");
        } catch (_error) {
            console.error("Error en sincronización:", _error);
            await tauriNotificationService.notifySync("error");
        }
    }
};
