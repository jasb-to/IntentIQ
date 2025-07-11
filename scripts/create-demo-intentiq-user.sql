-- Create demo user for IntentIQ
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    company_name,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@intentiq.ai',
    'Demo User',
    'IntentIQ Demo Company',
    'pro',
    'active',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status,
    updated_at = NOW();

-- Add demo keywords
INSERT INTO user_keywords (user_id, keyword, category, is_active) VALUES
    ('00000000-0000-0000-0000-000000000001', 'lead generation', 'marketing', true),
    ('00000000-0000-0000-0000-000000000001', 'sales automation', 'sales', true),
    ('00000000-0000-0000-0000-000000000001', 'CRM software', 'software', true),
    ('00000000-0000-0000-0000-000000000001', 'marketing tools', 'marketing', true),
    ('00000000-0000-0000-0000-000000000001', 'B2B leads', 'sales', true)
ON CONFLICT (user_id, keyword) DO NOTHING;

-- Add demo settings
INSERT INTO user_settings (
    user_id,
    email_notifications,
    monitoring_frequency,
    max_leads_per_search,
    platforms,
    min_intent_score,
    auto_save_high_intent
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    true,
    60,
    100,
    ARRAY['reddit', 'twitter', 'linkedin'],
    'MEDIUM',
    true
) ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = EXCLUDED.email_notifications,
    monitoring_frequency = EXCLUDED.monitoring_frequency,
    max_leads_per_search = EXCLUDED.max_leads_per_search,
    platforms = EXCLUDED.platforms,
    min_intent_score = EXCLUDED.min_intent_score,
    auto_save_high_intent = EXCLUDED.auto_save_high_intent,
    updated_at = NOW();

-- Add demo search history
INSERT INTO lead_searches (
    user_id,
    keywords,
    platforms,
    results_count,
    high_intent_count,
    medium_intent_count,
    low_intent_count,
    search_duration_ms,
    created_at
) VALUES
    ('00000000-0000-0000-0000-000000000001', ARRAY['lead generation'], ARRAY['reddit'], 15, 3, 7, 5, 2500, NOW() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000000001', ARRAY['CRM software'], ARRAY['twitter'], 8, 2, 4, 2, 1800, NOW() - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000000001', ARRAY['marketing tools', 'automation'], ARRAY['reddit', 'twitter'], 22, 5, 12, 5, 3200, NOW() - INTERVAL '3 days');

-- Add demo saved leads
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
    created_at,
    updated_at
) VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'reddit',
        'demo_lead_1',
        'Looking for the best lead generation tool for my startup. Budget is around $200/month. Any recommendations?',
        'startup_founder_2024',
        'https://reddit.com/r/entrepreneur/demo1',
        'HIGH',
        0.89,
        ARRAY['lead generation'],
        ARRAY['budget', 'recommendations', 'looking for'],
        false,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'twitter',
        'demo_lead_2',
        'Need help finding qualified B2B leads. Current tools are too expensive and not delivering results.',
        'b2b_marketer',
        'https://twitter.com/b2b_marketer/demo2',
        'HIGH',
        0.85,
        ARRAY['B2B leads'],
        ARRAY['need help', 'too expensive', 'not delivering'],
        true,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        'reddit',
        'demo_lead_3',
        'What CRM software do you recommend for a small team? We need something with good lead tracking.',
        'small_biz_owner',
        'https://reddit.com/r/smallbusiness/demo3',
        'MEDIUM',
        0.72,
        ARRAY['CRM software'],
        ARRAY['recommend', 'need something'],
        false,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    );
