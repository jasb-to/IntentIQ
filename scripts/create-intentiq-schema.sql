-- IntentIQ Database Schema
-- Run this script to set up the database tables for IntentIQ

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
  subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User keywords table
CREATE TABLE IF NOT EXISTS user_keywords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

-- Lead searches table
CREATE TABLE IF NOT EXISTS lead_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL,
  platforms TEXT[] DEFAULT ARRAY['reddit', 'twitter'],
  results_count INTEGER DEFAULT 0,
  high_intent_count INTEGER DEFAULT 0,
  medium_intent_count INTEGER DEFAULT 0,
  low_intent_count INTEGER DEFAULT 0,
  search_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved leads table
CREATE TABLE IF NOT EXISTS saved_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  url TEXT,
  intent_score TEXT CHECK (intent_score IN ('HIGH', 'MEDIUM', 'LOW')),
  confidence DECIMAL(5,2),
  keywords TEXT[],
  signals TEXT[],
  metadata JSONB,
  is_contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, external_id)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  slack_webhook_url TEXT,
  monitoring_frequency INTEGER DEFAULT 60, -- minutes
  max_leads_per_search INTEGER DEFAULT 50,
  platforms TEXT[] DEFAULT ARRAY['reddit', 'twitter'],
  min_intent_score TEXT DEFAULT 'MEDIUM' CHECK (min_intent_score IN ('HIGH', 'MEDIUM', 'LOW')),
  auto_save_high_intent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead monitoring jobs table (for scheduled monitoring)
CREATE TABLE IF NOT EXISTS monitoring_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription limits table
CREATE TABLE IF NOT EXISTS subscription_limits (
  tier TEXT PRIMARY KEY,
  max_keywords INTEGER NOT NULL,
  max_searches_per_day INTEGER NOT NULL,
  max_saved_leads INTEGER NOT NULL,
  api_rate_limit INTEGER NOT NULL, -- requests per minute
  features TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Insert default subscription limits
INSERT INTO subscription_limits (tier, max_keywords, max_searches_per_day, max_saved_leads, api_rate_limit, features) VALUES
  ('free', 5, 10, 50, 10, ARRAY['basic_search', 'email_notifications']),
  ('starter', 20, 50, 200, 30, ARRAY['basic_search', 'email_notifications', 'slack_integration', 'export']),
  ('pro', 100, 200, 1000, 60, ARRAY['basic_search', 'email_notifications', 'slack_integration', 'export', 'advanced_analytics', 'auto_monitoring']),
  ('enterprise', -1, -1, -1, 120, ARRAY['basic_search', 'email_notifications', 'slack_integration', 'export', 'advanced_analytics', 'auto_monitoring', 'api_access', 'custom_integrations'])
ON CONFLICT (tier) DO UPDATE SET
  max_keywords = EXCLUDED.max_keywords,
  max_searches_per_day = EXCLUDED.max_searches_per_day,
  max_saved_leads = EXCLUDED.max_saved_leads,
  api_rate_limit = EXCLUDED.api_rate_limit,
  features = EXCLUDED.features;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_keywords_user_id ON user_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_user_keywords_active ON user_keywords(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_searches_user_id ON lead_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_searches_created_at ON lead_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_leads_user_id ON saved_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_leads_intent ON saved_leads(user_id, intent_score);
CREATE INDEX IF NOT EXISTS idx_saved_leads_created_at ON saved_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_leads_contacted ON saved_leads(user_id, is_contacted);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_active ON monitoring_jobs(is_active, next_run_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON api_usage(user_id, created_at);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for user_keywords
CREATE POLICY "Users can manage own keywords" ON user_keywords
  FOR ALL USING (auth.uid() = user_id);

-- Policies for lead_searches
CREATE POLICY "Users can manage own searches" ON lead_searches
  FOR ALL USING (auth.uid() = user_id);

-- Policies for saved_leads
CREATE POLICY "Users can manage own leads" ON saved_leads
  FOR ALL USING (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Policies for monitoring_jobs
CREATE POLICY "Users can manage own monitoring jobs" ON monitoring_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Policies for api_usage
CREATE POLICY "Users can view own API usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON api_usage
  FOR INSERT WITH CHECK (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_keywords_updated_at BEFORE UPDATE ON user_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_leads_updated_at BEFORE UPDATE ON saved_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_jobs_updated_at BEFORE UPDATE ON monitoring_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_current_count INTEGER DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  tier_limit INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Get the limit for this tier
  CASE p_limit_type
    WHEN 'keywords' THEN
      SELECT max_keywords INTO tier_limit FROM subscription_limits WHERE tier = user_tier;
    WHEN 'searches_per_day' THEN
      SELECT max_searches_per_day INTO tier_limit FROM subscription_limits WHERE tier = user_tier;
    WHEN 'saved_leads' THEN
      SELECT max_saved_leads INTO tier_limit FROM subscription_limits WHERE tier = user_tier;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- -1 means unlimited
  IF tier_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Check if current count is within limit
  RETURN p_current_count < tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily search count
CREATE OR REPLACE FUNCTION get_daily_search_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM lead_searches
    WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default user settings when a user profile is created
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- Function to clean up old API usage data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_usage()
RETURNS void AS $$
BEGIN
  DELETE FROM api_usage
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-api-usage', '0 2 * * *', 'SELECT cleanup_old_api_usage();');
