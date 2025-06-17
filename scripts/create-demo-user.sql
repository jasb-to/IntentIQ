-- Create demo user and data for testing
-- This should be run in your Supabase SQL editor

-- First, let's make sure we have the demo user in auth.users
-- You'll need to create this user through the Supabase dashboard first
-- Email: demo@shadowstack.com
-- Password: demo12345

-- Insert demo user profile (replace the UUID with the actual user ID from auth.users)
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  company_name,
  subscription_tier,
  subscription_status,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual demo user UUID
  'demo@shadowstack.com',
  'Demo User',
  'ShadowStack Demo',
  'pro',
  'active',
  'user'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  role = EXCLUDED.role;

-- Add some demo monitoring targets
INSERT INTO monitoring_targets (
  user_id,
  target_type,
  target_value,
  target_name,
  target_description,
  is_active
) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'domain', 'example.com', 'Example Domain', 'Demo domain monitoring', true),
  ('00000000-0000-0000-0000-000000000000', 'wallet', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'Bitcoin Genesis', 'Bitcoin genesis wallet', true),
  ('00000000-0000-0000-0000-000000000000', 'email', 'admin@example.com', 'Admin Email', 'Demo email monitoring', true)
ON CONFLICT DO NOTHING;

-- Add some demo alerts
INSERT INTO alerts (
  user_id,
  target_id,
  severity,
  source_channel,
  message_text,
  is_read,
  is_blocked
) VALUES 
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM monitoring_targets WHERE target_value = 'example.com' LIMIT 1), 'high', 'telegram_channel_1', 'Suspicious activity detected on example.com', false, false),
  ('00000000-0000-0000-0000-000000000000', (SELECT id FROM monitoring_targets WHERE target_value = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' LIMIT 1), 'critical', 'telegram_channel_2', 'Wallet address mentioned in breach discussion', false, false)
ON CONFLICT DO NOTHING;
