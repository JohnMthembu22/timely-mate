# ⚡ Quick SQL Setup Guide

## 🚀 Fast Setup (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm
2. Sign in if needed

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button (top right)

### Step 3: Copy & Paste SQL
1. Open the file: `SUPABASE_DATABASE_SETUP.sql` in your project
2. **Copy ALL the content** (Ctrl+A, then Ctrl+C)
3. **Paste it** into the SQL Editor (Ctrl+V)

### Step 4: Run It
1. Click the **"Run"** button (bottom right, or press Ctrl+Enter)
2. Wait 10-30 seconds
3. You should see: ✅ "Success. No rows returned"

### Step 5: Enable Realtime
1. Go to **"Database"** → **"Replication"** in left sidebar
2. Toggle ON for these tables:
   - ✅ profiles
   - ✅ projects
   - ✅ teams
   - ✅ team_members
   - ✅ time_entries
   - ✅ notifications
   - ✅ messages

### Step 6: Verify
1. Go to **"Table Editor"** in left sidebar
2. You should see all 7 tables listed ✅

---

## 🎯 That's It!

Your database is now set up. Test it:

```bash
cd frontend/web
npm run supabase:check
```

---

## 📍 Where to Find SQL Editor

**In Supabase Dashboard:**
- Left sidebar → **"SQL Editor"**
- Or: **"Database"** → **"SQL Editor"**

**Visual:**
```
┌─────────────────────┐
│  Supabase Dashboard │
├─────────────────────┤
│ 📊 Table Editor     │
│ 📝 SQL Editor  ←─── Click here!
│ 🗄️  Database        │
│ 🔐 Authentication   │
└─────────────────────┘
```

---

## ❓ Common Issues

**"Can't find SQL Editor"**
→ Look in left sidebar, it's usually near the top

**"Permission denied"**
→ Make sure you're logged in as the project owner

**"Tables already exist"**
→ That's OK! The script won't break anything

**"Error running SQL"**
→ Make sure you copied the ENTIRE file, not just part of it

---

**Need more details?** See `SUPABASE_SQL_SETUP_GUIDE.md` for the full step-by-step guide.

