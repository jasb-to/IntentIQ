-- Add admin roles and permissions
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permissions TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'jaspalbilkhu@gmail.com',
  crypt('ShadowStack2024!Admin#Secure', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jaspal Bilkhu", "role": "admin"}'
) ON CONFLICT (email) DO NOTHING;

-- Update user profile for admin
INSERT INTO user_profiles (id, email, full_name, role, permissions, subscription_tier, subscription_status)
SELECT id, email, 'Jaspal Bilkhu', 'admin', ARRAY['all'], 'enterprise', 'active'
FROM auth.users WHERE email = 'jaspalbilkhu@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  permissions = ARRAY['all'],
  subscription_tier = 'enterprise',
  subscription_status = 'active';

-- Create system configuration table
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT now()
);

-- Insert default system configurations
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('paywall_enabled', 'true', 'boolean', 'Enable/disable paywall for testing'),
('max_targets_free', '3', 'number', 'Maximum targets for free users'),
('max_targets_basic', '10', 'number', 'Maximum targets for basic users'),
('max_targets_pro', '50', 'number', 'Maximum targets for pro users'),
('max_targets_enterprise', '999', 'number', 'Maximum targets for enterprise users'),
('telegram_scan_interval', '300', 'number', 'Telegram scan interval in seconds'),
('email_alerts_enabled', 'true', 'boolean', 'Enable email alerts system-wide'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode')
ON CONFLICT (config_key) DO NOTHING;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create system stats table for analytics
CREATE TABLE IF NOT EXISTS system_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  total_targets INTEGER DEFAULT 0,
  total_alerts INTEGER DEFAULT 0,
  revenue_daily DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(stat_date)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to system_config" ON system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to audit_logs" ON audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to system_stats" ON system_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to admin_notifications" ON admin_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id VARCHAR(100) DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
