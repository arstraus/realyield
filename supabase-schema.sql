-- RealYield Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- ============================================
-- SCENARIOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    property_address TEXT,
    property_city TEXT,
    property_state TEXT,
    data JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_name ON scenarios(name);
CREATE INDEX IF NOT EXISTS idx_scenarios_updated ON scenarios(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_favorite ON scenarios(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_scenarios_search ON scenarios USING gin(to_tsvector('english', name || ' ' || COALESCE(property_address, '') || ' ' || COALESCE(property_city, '')));

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only see/modify their own scenarios
-- ============================================

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own scenarios
CREATE POLICY "Users can view own scenarios"
    ON scenarios
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own scenarios
CREATE POLICY "Users can insert own scenarios"
    ON scenarios
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own scenarios
CREATE POLICY "Users can update own scenarios"
    ON scenarios
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own scenarios
CREATE POLICY "Users can delete own scenarios"
    ON scenarios
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scenarios_updated_at
    BEFORE UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- OPTIONAL: Full-text search function
-- ============================================

CREATE OR REPLACE FUNCTION search_scenarios(search_query TEXT)
RETURNS SETOF scenarios AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM scenarios
    WHERE 
        auth.uid() = user_id
        AND (
            name ILIKE '%' || search_query || '%'
            OR property_address ILIKE '%' || search_query || '%'
            OR property_city ILIKE '%' || search_query || '%'
        )
    ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

