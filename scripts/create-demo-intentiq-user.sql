-- Create demo user for IntentIQ
-- This script creates a demo user account for testing

-- Insert demo user profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  company_name,
  subscription_tier,
  subscription_status,
  trial_ends_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo@intentiq.com',
  'Demo User',
  'IntentIQ Demo Company',
  'pro',
  'active',
  NOW() + INTERVAL '30 days'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  company_name = EXCLUDED.company_name,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_status = EXCLUDED.subscription_status,
  trial_ends_at = EXCLUDED.trial_ends_at;

-- Insert demo keywords
INSERT INTO user_keywords (user_id, keyword, category, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'CRM', 'sales', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'email marketing', 'marketing', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'sales tools', 'sales', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'lead generation', 'marketing', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'automation', 'general', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'prospecting', 'sales', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'sales funnel', 'sales', true),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'customer acquisition', 'marketing', true)
ON CONFLICT (user_id, keyword) DO NOTHING;

-- Insert demo search history
INSERT INTO lead_searches (user_id, keywords, platforms, results_count, high_intent_count, medium_intent_count, low_intent_count, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, ARRAY['CRM', 'sales tools'], ARRAY['reddit', 'twitter'], 12, 4, 6, 2, NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000001'::uuid, ARRAY['email marketing'], ARRAY['reddit'], 8, 2, 4, 2, NOW() - INTERVAL '6 hours'),
  ('00000000-0000-0000-0000-000000000001'::uuid, ARRAY['lead generation', 'automation'], ARRAY['twitter'], 15, 5, 7, 3, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001'::uuid, ARRAY['prospecting'], ARRAY['reddit', 'twitter'], 9, 3, 4, 2, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001'::uuid, ARRAY['sales funnel'], ARRAY['reddit'], 6, 2, 3, 1, NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Insert demo saved leads
INSERT INTO saved_leads (
  user_id, 
  platform, 
  external_id, 
  content, 
  author, 
  url, 
  intent_score, 
  confidence, 
  keywords, 
  signals,
  is_contacted,
  notes,
  created_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Reddit',
    'demo_reddit_1',
    'Looking for a good CRM solution for my startup. Any recommendations? We need something affordable but powerful for a team of 15.',
    'startup_founder_23',
    'https://reddit.com/r/entrepreneur/comments/demo1',
    'HIGH',
    85.5,
    ARRAY['CRM', 'startup'],
    ARRAY['High intent keywords: looking for, need', 'Budget mentioned: affordable'],
    false,
    'High-intent lead from r/entrepreneur. Startup with 15 people looking for CRM.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Twitter',
    'demo_twitter_1',
    'Our current email marketing tool is too expensive. Need alternatives that won''t break the bank but still deliver results.',
    '@marketing_pro',
    'https://twitter.com/marketing_pro/status/demo1',
    'HIGH',
    78.2,
    ARRAY['email marketing', 'alternatives'],
    ARRAY['High intent keywords: need', 'Budget mentioned: expensive, break the bank'],
    true,
    'Contacted via DM. Interested in demo next week.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Reddit',
    'demo_reddit_2',
    'Anyone using AI for prospecting? We''re scaling fast and need better lead qualification tools.',
    'growth_hacker_2024',
    'https://reddit.com/r/marketing/comments/demo2',
    'MEDIUM',
    65.0,
    ARRAY['prospecting', 'lead qualification'],
    ARRAY['Research phase: anyone using', 'Urgency indicators: scaling fast, need'],
    false,
    'Scaling company interested in AI prospecting tools.',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (user_id, platform, external_id) DO NOTHING;

-- Insert demo user settings
INSERT INTO user_settings (
  user_id,
  email_notifications,
  slack_webhook_url,
  monitoring_frequency,
  max_leads_per_search,
  platforms,
  min_intent_score,
  auto_save_high_intent
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  true,
  null,
  30,
  100,
  ARRAY['reddit', 'twitter'],
  'MEDIUM',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  email_notifications = EXCLUDED.email_notifications,
  monitoring_frequency = EXCLUDED.monitoring_frequency,
  max_leads_per_search = EXCLUDED.max_leads_per_search,
  platforms = EXCLUDED.platforms,
  min_intent_score = EXCLUDED.min_intent_score,
  auto_save_high_intent = EXCLUDED.auto_save_high_intent;

-- Insert demo monitoring job
INSERT INTO monitoring_jobs (
  user_id,
  keywords,
  platforms,
  is_active,
  frequency_minutes,
  next_run_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  ARRAY['CRM', 'sales tools', 'lead generation'],
  ARRAY['reddit', 'twitter'],
  true,
  60,
  NOW() + INTERVAL '1 hour'
) ON CONFLICT DO NOTHING;
