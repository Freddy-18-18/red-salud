export interface Secretary {
    id: string;
    secretary_id: string;
    secretary_name: string;
    secretary_email: string;
    permissions: {
        can_view_agenda: boolean;
        can_create_appointments: boolean;
        can_edit_appointments: boolean;
        can_cancel_appointments: boolean;
        can_view_patients: boolean;
        can_register_patients: boolean;
        can_view_medical_records: boolean;
        can_send_messages: boolean;
        can_view_statistics: boolean;
    };
    status: string;
    created_at: string;
}
