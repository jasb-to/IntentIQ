-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
    subscription_id VARCHAR(255),
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_keywords table
CREATE TABLE IF NOT EXISTS user_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, keyword)
);

-- Create lead_searches table
CREATE TABLE IF NOT EXISTS lead_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    keywords TEXT[] NOT NULL,
    platforms TEXT[] NOT NULL,
    results_count INTEGER DEFAULT 0,
    high_intent_count INTEGER DEFAULT 0,
    medium_intent_count INTEGER DEFAULT 0,
    low_intent_count INTEGER DEFAULT 0,
    search_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_leads table
CREATE TABLE IF NOT EXISTS saved_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255),
    url TEXT,
    intent_score VARCHAR(10) CHECK (intent_score IN ('HIGH', 'MEDIUM', 'LOW')),
    confidence DECIMAL(3,2),
    keywords TEXT[],
    signals TEXT[],
    metadata JSONB,
    is_contacted BOOLEAN DEFAULT false,
    contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, external_id)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    slack_webhook_url TEXT,
    monitoring_frequency INTEGER DEFAULT 60, -- minutes
    max_leads_per_search INTEGER DEFAULT 50,
    platforms TEXT[] DEFAULT ARRAY['reddit', 'twitter'],
    min_intent_score VARCHAR(10) DEFAULT 'MEDIUM' CHECK (min_intent_score IN ('HIGH', 'MEDIUM', 'LOW')),
    auto_save_high_intent BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monitoring_jobs table
CREATE TABLE IF NOT EXISTS monitoring_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    keywords TEXT[] NOT NULL,
    platforms TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    frequency_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_keywords_user_id ON user_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_user_keywords_active ON user_keywords(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_searches_user_id ON lead_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_searches_created_at ON lead_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_leads_user_id ON saved_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_leads_intent_score ON saved_leads(user_id, intent_score);
CREATE INDEX IF NOT EXISTS idx_saved_leads_contacted ON saved_leads(user_id, is_contacted);
CREATE INDEX IF NOT EXISTS idx_saved_leads_created_at ON saved_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_user_id ON monitoring_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_active ON monitoring_jobs(is_active);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own keywords" ON user_keywords FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own searches" ON lead_searches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own leads" ON saved_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own monitoring jobs" ON monitoring_jobs FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_keywords_updated_at BEFORE UPDATE ON user_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_leads_updated_at BEFORE UPDATE ON saved_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitoring_jobs_updated_at BEFORE UPDATE ON monitoring_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create subscription limits view
CREATE OR REPLACE VIEW subscription_limits AS
SELECT 
    'free' as tier,
    10 as max_keywords,
    5 as max_searches_per_day,
    50 as max_saved_leads,
    10 as api_rate_limit_per_minute,
    ARRAY['basic_search', 'email_notifications'] as features
UNION ALL
SELECT 
    'starter' as tier,
    50 as max_keywords,
    25 as max_searches_per_day,
    500 as max_saved_leads,
    50 as api_rate_limit_per_minute,
    ARRAY['basic_search', 'email_notifications', 'slack_integration', 'csv_export'] as features
UNION ALL
SELECT 
    'pro' as tier,
    200 as max_keywords,
    100 as max_searches_per_day,
    2000 as max_saved_leads,
    200 as api_rate_limit_per_minute,
    ARRAY['basic_search', 'email_notifications', 'slack_integration', 'csv_export', 'api_access', 'priority_support'] as features
UNION ALL
SELECT 
    'enterprise' as tier,
    1000 as max_keywords,
    500 as max_searches_per_day,
    10000 as max_saved_leads,
    1000 as api_rate_limit_per_minute,
    ARRAY['basic_search', 'email_notifications', 'slack_integration', 'csv_export', 'api_access', 'priority_support', 'custom_integrations', 'dedicated_support'] as features;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert default subscription tiers data
INSERT INTO user_profiles (id, email, full_name, subscription_tier, subscription_status) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'demo@intentiq.ai', 'Demo User', 'pro', 'active')
ON CONFLICT (email) DO NOTHING;
