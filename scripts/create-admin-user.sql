-- Create admin user with strong password
-- Email: jaspalbilkhu@gmail.com
-- Password: IntentIQ2024!Admin#Secure$Pass

-- First, create the user in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'jaspalbilkhu@gmail.com',
  crypt('IntentIQ2024!Admin#Secure$Pass', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jaspal Bilkhu", "role": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('IntentIQ2024!Admin#Secure$Pass', gen_salt('bf')),
  updated_at = now();

-- Create or update the user profile with admin privileges
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  permissions,
  subscription_tier,
  subscription_status,
  is_active,
  created_at
) 
SELECT 
  id,
  'jaspalbilkhu@gmail.com',
  'Jaspal Bilkhu',
  'admin',
  ARRAY['all'],
  'enterprise',
  'active',
  true,
  now()
FROM auth.users 
WHERE email = 'jaspalbilkhu@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  permissions = ARRAY['all'],
  subscription_tier = 'enterprise',
  subscription_status = 'active',
  is_active = true,
  updated_at = now();

-- Grant admin access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Log the admin user creation
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) 
SELECT 
  id,
  'admin_user_created',
  'user',
  id::text,
  '{"email": "jaspalbilkhu@gmail.com", "role": "admin"}'::jsonb
FROM auth.users 
WHERE email = 'jaspalbilkhu@gmail.com';
