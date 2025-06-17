-- Enable Row Level Security but allow public access for testing
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles with public access
CREATE POLICY "Public read access for user_profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for monitoring_targets with public access
CREATE POLICY "Public read access for monitoring_targets" ON monitoring_targets
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own targets" ON monitoring_targets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own targets" ON monitoring_targets
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own targets" ON monitoring_targets
    FOR DELETE USING (true);

-- Create RLS policies for alerts with public access
CREATE POLICY "Public read access for alerts" ON alerts
    FOR SELECT USING (true);

CREATE POLICY "Users can update own alerts" ON alerts
    FOR UPDATE USING (true);

CREATE POLICY "Public insert access for alerts" ON alerts
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for user_integrations with public access
CREATE POLICY "Public read access for user_integrations" ON user_integrations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own integrations" ON user_integrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own integrations" ON user_integrations
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own integrations" ON user_integrations
    FOR DELETE USING (true);

-- Create RLS policies for notification_preferences with public access
CREATE POLICY "Public read access for notification_preferences" ON notification_preferences
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own preferences" ON notification_preferences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own preferences" ON notification_preferences
    FOR UPDATE USING (true);
