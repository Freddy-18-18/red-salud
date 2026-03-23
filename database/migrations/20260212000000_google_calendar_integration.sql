-- Google Calendar Integration
-- Stores OAuth tokens and sync state for Google Calendar integration

-- Table to store Google Calendar OAuth tokens per doctor
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    scope TEXT NOT NULL,
    
    -- Calendar info
    calendar_id TEXT NOT NULL, -- Primary calendar ID (usually email)
    calendar_timezone TEXT NOT NULL DEFAULT 'America/Caracas',
    
    -- Sync control
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    sync_direction TEXT NOT NULL DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_google', 'from_google', 'bidirectional')),
    last_sync_at TIMESTAMPTZ,
    last_sync_token TEXT, -- For incremental sync
    
    -- Watch/webhook for real-time updates
    watch_channel_id TEXT,
    watch_resource_id TEXT,
    watch_expiration TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One token per user
    UNIQUE(user_id)
);

-- Table to map appointments to Google Calendar events (bidirectional tracking)
CREATE TABLE IF NOT EXISTS google_calendar_event_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Local appointment
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Google Calendar event
    google_event_id TEXT NOT NULL,
    google_calendar_id TEXT NOT NULL,
    
    -- Sync metadata
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
    sync_error TEXT,
    
    -- Version control for conflict detection
    local_updated_at TIMESTAMPTZ NOT NULL,
    google_updated_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one mapping per appointment
    UNIQUE(appointment_id),
    -- Index for reverse lookup (Google event -> appointment)
    UNIQUE(google_calendar_id, google_event_id)
);

-- Table to store imported Google Calendar events (not from our app)
CREATE TABLE IF NOT EXISTS google_calendar_imported_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Google event details
    google_event_id TEXT NOT NULL,
    google_calendar_id TEXT NOT NULL,
    
    -- Event data (stored as blocked time in our calendar)
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    
    -- Sync metadata
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    google_updated_at TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, google_calendar_id, google_event_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gcal_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_gcal_tokens_watch_expiration ON google_calendar_tokens(watch_expiration) WHERE watch_channel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gcal_mappings_appointment_id ON google_calendar_event_mappings(appointment_id);
CREATE INDEX IF NOT EXISTS idx_gcal_mappings_google_event ON google_calendar_event_mappings(google_calendar_id, google_event_id);
CREATE INDEX IF NOT EXISTS idx_gcal_mappings_sync_status ON google_calendar_event_mappings(sync_status);

CREATE INDEX IF NOT EXISTS idx_gcal_imported_user_id ON google_calendar_imported_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gcal_imported_time_range ON google_calendar_imported_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_gcal_imported_google_event ON google_calendar_imported_events(google_calendar_id, google_event_id);

-- RLS Policies
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_event_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_imported_events ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own tokens
CREATE POLICY "Users can view their own Google Calendar tokens"
    ON google_calendar_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar tokens"
    ON google_calendar_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar tokens"
    ON google_calendar_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar tokens"
    ON google_calendar_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Event mappings are viewable by appointment participants
CREATE POLICY "Users can view event mappings for their appointments"
    ON google_calendar_event_mappings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM appointments
            WHERE appointments.id = appointment_id
            AND (appointments.doctor_id = auth.uid() OR appointments.patient_id = auth.uid())
        )
    );

CREATE POLICY "System can manage event mappings"
    ON google_calendar_event_mappings FOR ALL
    USING (true);

-- Imported events are only viewable by the owner
CREATE POLICY "Users can view their own imported events"
    ON google_calendar_imported_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage imported events"
    ON google_calendar_imported_events FOR ALL
    USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_gcal_tokens_updated_at
    BEFORE UPDATE ON google_calendar_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_updated_at();

CREATE TRIGGER update_gcal_mappings_updated_at
    BEFORE UPDATE ON google_calendar_event_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_updated_at();

CREATE TRIGGER update_gcal_imported_updated_at
    BEFORE UPDATE ON google_calendar_imported_events
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_updated_at();

-- Function to check if token is expired
CREATE OR REPLACE FUNCTION is_google_calendar_token_expired(token_row google_calendar_tokens)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN token_row.token_expiry <= NOW() + INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if watch needs renewal (renew 1 day before expiry)
CREATE OR REPLACE FUNCTION needs_watch_renewal(token_row google_calendar_tokens)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN token_row.watch_expiration IS NOT NULL 
        AND token_row.watch_expiration <= NOW() + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT ALL ON google_calendar_tokens TO authenticated;
GRANT ALL ON google_calendar_event_mappings TO authenticated;
GRANT ALL ON google_calendar_imported_events TO authenticated;

-- Comments for documentation
COMMENT ON TABLE google_calendar_tokens IS 'Stores OAuth2 tokens for Google Calendar integration per user';
COMMENT ON TABLE google_calendar_event_mappings IS 'Maps local appointments to Google Calendar events for bidirectional sync';
COMMENT ON TABLE google_calendar_imported_events IS 'Stores external Google Calendar events as blocked time slots';
COMMENT ON COLUMN google_calendar_tokens.sync_direction IS 'to_google: only push to Google, from_google: only import from Google, bidirectional: both ways';
COMMENT ON COLUMN google_calendar_tokens.last_sync_token IS 'Token for incremental sync using Google Calendar sync API';
COMMENT ON COLUMN google_calendar_event_mappings.sync_status IS 'synced: in sync, pending: needs sync, conflict: conflicting changes, error: sync failed';
