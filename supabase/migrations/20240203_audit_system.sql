-- Tablas de Auditoría y Gestión de Accesos

-- Crear tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- e.g., 'CREATE_USER', 'UPDATE_PERMISSIONS', 'AUTH_BYPASS'
    entity_type TEXT NOT NULL, -- e.g., 'profile', 'announcement', 'role'
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para auditoría
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo administradores nivel 4+ pueden ver logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = (select auth.uid()) 
            AND (role = 'admin' OR access_level >= 4)
        )
    );

-- Trigger para registrar cambios automáticamente en perfiles (opcional, pero recomendado)
-- Podríamos implementarlo vía RPC o directamente desde el cliente para acciones específicas de la app.
