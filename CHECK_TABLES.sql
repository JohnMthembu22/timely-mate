-- Quick Diagnostic Query
-- Run this in Supabase SQL Editor to see what tables you have

-- Check all tables in public schema
SELECT 
  table_name,
  'Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected tables:
-- 1. profiles
-- 2. projects
-- 3. teams
-- 4. team_members
-- 5. time_entries
-- 6. notifications
-- 7. messages

-- If you see fewer than 7 tables, some are missing.
-- Use TROUBLESHOOT_TABLES.md to create the missing ones.

