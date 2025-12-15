-- Create tasker_profiles table
CREATE TABLE IF NOT EXISTS tasker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started',
    onboarding_step INTEGER DEFAULT 1,
    bio TEXT,
    profile_picture_url TEXT,
    selfie_url TEXT,
    id_document_urls JSONB DEFAULT '[]',
    profession_ids JSONB DEFAULT '[]',
    portfolio_urls JSONB DEFAULT '[]',
    qualifications JSONB DEFAULT '[]',
    availability JSONB DEFAULT '{}',
    ecocash_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing data from users table
INSERT INTO tasker_profiles (
    user_id,
    status,
    onboarding_step,
    bio,
    profile_picture_url,
    selfie_url,
    id_document_urls,
    profession_ids,
    portfolio_urls,
    qualifications,
    availability,
    ecocash_number
)
SELECT 
    id,
    COALESCE(tasker_profile->>'status', 'not_started'),
    COALESCE((tasker_profile->>'onboarding_step')::int, 1),
    tasker_profile->>'bio',
    tasker_profile->>'profile_picture_url',
    tasker_profile->>'selfie_url',
    COALESCE(tasker_profile->'id_document_urls', '[]'::jsonb),
    COALESCE(tasker_profile->'profession_ids', '[]'::jsonb),
    COALESCE(tasker_profile->'portfolio_urls', '[]'::jsonb),
    COALESCE(tasker_profile->'qualifications', '[]'::jsonb),
    COALESCE(tasker_profile->'availability', '{}'::jsonb),
    tasker_profile->>'ecocash_number'
FROM users
WHERE is_tasker = true OR tasker_profile IS NOT NULL;

-- Drop the old column from users table (Optional, but cleaner)
-- ALTER TABLE users DROP COLUMN tasker_profile;
