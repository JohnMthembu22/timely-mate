# 🔄 Enable Realtime for Tables - Correct Method

The "Replication" page you're seeing is for **external data warehouses** (like BigQuery). That's different from what we need!

We need to enable **Realtime** for your tables, which allows real-time updates within your app.

## ✅ Method 1: Via SQL Editor (Easiest & Recommended)

1. **Go to SQL Editor** in Supabase Dashboard
2. **Create a new query**
3. **Paste this SQL**:

```sql
-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

4. **Click "Run"**
5. **You should see**: "Success. No rows returned" ✅

That's it! Realtime is now enabled.

---

## ✅ Method 2: Via Database Settings (Alternative)

1. **Go to "Database"** in the left sidebar
2. Look for **"Realtime"** or **"Publications"** (not "Replication")
3. You should see a list of tables with checkboxes
4. **Check the boxes** for:
   - ✅ profiles
   - ✅ projects
   - ✅ teams
   - ✅ team_members
   - ✅ time_entries
   - ✅ notifications
   - ✅ messages

**Note:** The interface might be different depending on your Supabase version. If you don't see this option, use Method 1 (SQL) instead.

---

## 🔍 Verify Realtime is Enabled

After running the SQL, verify it worked:

1. **Go to SQL Editor**
2. **Run this query**:

```sql
-- Check which tables have Realtime enabled
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

3. **You should see all 7 tables listed**:
   - messages
   - notifications
   - profiles
   - projects
   - team_members
   - teams
   - time_entries

---

## ❓ What's the Difference?

- **Replication** (what you saw): Sends data to external services like BigQuery, Snowflake, etc.
- **Realtime** (what we need): Enables real-time updates within your app using Supabase Realtime subscriptions.

---

## ✅ Quick Test

After enabling Realtime, test your setup:

```bash
cd frontend/web
npm run supabase:check
```

This will verify Realtime is working!

---

## 🎯 Summary

**What to do:**
1. Go to **SQL Editor** (not Replication)
2. Run the SQL commands above
3. Verify with the check query
4. Test with `npm run supabase:check`

**You're done!** Your tables now have Realtime enabled. 🎉

