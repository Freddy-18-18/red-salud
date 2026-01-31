import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

export const tauriNotificationService = {
    async init() {
        // In Web environment, this might fail if the plugin is not mocked.
        if (typeof window === 'undefined' || !('__TAURI__' in window)) {
            return false;
        }

        let permissionGranted = await isPermissionGranted();

        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === "granted";
        }

        return permissionGranted;
    },

    async notify(title: string, body: string) {
        const permitted = await this.init();
        if (!permitted) return;

        await sendNotification({
            title,
            body,
        });
    },

    async notifyNewAppointment(appointment: any) {
        await this.notify(
            "Nueva Cita Agendada",
            `Cita con ${appointment.paciente?.nombre || 'Paciente'} a las ${appointment.hora || 'pendiente'}`
        );
    },

    async notifySync(status: "success" | "error") {
        await this.notify(
            status === "success" ? "Sincronización Completa" : "Error de Sincronización",
            status === "success"
                ? "Todos los datos están actualizados"
                : "No se pudo sincronizar. Reintentando..."
        );
    }
};
