# Supabase Connection Guide for Timely Mate

## 🔗 Your Supabase Connection Details

- **Project URL**: `https://dczhtdvbvnxlzcjqxowm.supabase.co`
- **Database Host**: `db.dczhtdvbvnxlzcjqxowm.supabase.co`
- **Database Port**: `5432`
- **Database Name**: `postgres`
- **Database User**: `postgres`

## 📋 Setup Steps

### Step 1: Get Your Supabase Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm
2. Navigate to **Settings** → **API**
3. Copy the **anon/public key** (starts with `eyJ...`)

### Step 2: Add Environment Variables

Update your `.env` file in `frontend/web/`:

```env
VITE_SUPABASE_URL=https://dczhtdvbvnxlzcjqxowm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://dczhtdvbvnxlzcjqxowm.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
3. Select all environments (Production, Preview, Development)
4. Save and redeploy

### Step 3: Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `SUPABASE_DATABASE_SETUP.sql`
3. Click **Run** to execute the SQL script
4. This will create all necessary tables with proper security policies

### Step 4: Enable Realtime

1. Go to Supabase Dashboard → **Database** → **Replication**
2. Enable replication for these tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `time_entries`
   - ✅ `notifications`
   - ✅ `messages`

Or run this SQL in the SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Step 5: Test the Connection

The app will automatically detect Supabase when you add the environment variables. You can test by:

1. Opening the browser console
2. Checking for any Supabase connection errors
3. The app should show "Supabase configured" instead of warnings

## 🔐 Security Notes

- **Never expose your database password** in frontend code
- **Only use the anon key** in the frontend (it's safe)
- **Never commit** `.env` files to git
- **Row Level Security (RLS)** is enabled on all tables for security

## 📊 Database Schema Overview

### Core Tables:
- **profiles** - User profiles and organization data
- **projects** - Project management
- **teams** - Team management
- **team_members** - Team membership
- **time_entries** - Time tracking records
- **notifications** - User notifications
- **messages** - Chat messages

## 🚀 Next Steps

1. ✅ Add your anon key to `.env` and Vercel
2. ✅ Run the SQL setup script
3. ✅ Enable Realtime for tables
4. ✅ Test the connection
5. ✅ Start using real-time features!

Your app is now ready to use Supabase for real-time database operations! 🎉

