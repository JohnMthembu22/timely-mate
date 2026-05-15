# 🚀 Supabase Quick Setup Guide for Timely Mate

This guide will help you set up Supabase properly for your Timely Mate application.

## ✅ Current Status

Your Supabase credentials are already configured in `.env`:
- **Project URL**: `https://dczhtdvbvnxlzcjqxowm.supabase.co`
- **Anon Key**: Configured ✅

## 📋 Setup Steps

### Step 1: Verify Connection

Run the setup script to check your Supabase connection:

```bash
cd frontend/web
npm run supabase:check
```

This will:
- ✅ Test your Supabase connection
- ✅ Check which database tables exist
- ✅ Test real-time functionality
- ✅ Provide setup instructions for missing tables

### Step 2: Set Up Database Tables

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm
   - Navigate to **SQL Editor**

2. **Run the Database Setup Script**:
   - Open the file: `SUPABASE_DATABASE_SETUP.sql` (in project root)
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run** to execute

   This will create:
   - ✅ `profiles` - User profiles
   - ✅ `projects` - Project management
   - ✅ `teams` - Team management
   - ✅ `team_members` - Team membership
   - ✅ `time_entries` - Time tracking
   - ✅ `notifications` - User notifications
   - ✅ `messages` - Chat messages

3. **Enable Row Level Security (RLS)**:
   - RLS is automatically enabled by the SQL script
   - Security policies are created for each table

### Step 3: Enable Realtime

1. **Via Dashboard** (Recommended):
   - Go to **Database** → **Replication**
   - Enable replication for:
     - ✅ `profiles`
     - ✅ `projects`
     - ✅ `teams`
     - ✅ `team_members`
     - ✅ `time_entries`
     - ✅ `notifications`
     - ✅ `messages`

2. **Via SQL** (Alternative):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
   ALTER PUBLICATION supabase_realtime ADD TABLE projects;
   ALTER PUBLICATION supabase_realtime ADD TABLE teams;
   ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
   ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```

### Step 4: Verify Setup

Run the check script again:

```bash
npm run supabase:check
```

You should see:
- ✅ All tables exist
- ✅ Real-time connection working
- ✅ Setup complete!

## 🔧 Troubleshooting

### Connection Issues

If you see connection errors:

1. **Check Environment Variables**:
   ```bash
   cd frontend/web
   cat .env | grep SUPABASE
   ```

2. **Verify Credentials**:
   - Go to Supabase Dashboard → Settings → API
   - Verify your Project URL and Anon Key match

### Missing Tables

If tables are missing:

1. Run the SQL setup script (Step 2)
2. Check for errors in Supabase SQL Editor
3. Verify you have the correct permissions

### Real-time Not Working

If real-time features aren't working:

1. Verify Realtime is enabled (Step 3)
2. Check Supabase Dashboard → Database → Replication
3. Ensure tables are added to the `supabase_realtime` publication

## 📚 Next Steps

Once setup is complete:

1. **Test Authentication**:
   - Try signing up a new user
   - Verify profile is created in `profiles` table

2. **Test Real-time Features**:
   - Create a project (should appear in real-time)
   - Send a message (should appear instantly)
   - Check notifications (should update live)

3. **Review Security**:
   - All tables have Row Level Security enabled
   - Users can only access their own data
   - Policies are defined in the SQL script

## 🔐 Security Notes

- ✅ **Anon Key**: Safe to use in frontend (already configured)
- ✅ **Service Role Key**: NEVER expose in frontend (backend only)
- ✅ **RLS**: Enabled on all tables
- ✅ **Policies**: Users can only access their own data

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Full Setup Guide](./SUPABASE_SETUP.md)

## 🎯 Quick Commands

```bash
# Check Supabase setup
npm run supabase:check

# Start development server
npm run dev

# Validate environment
npm run env:validate development
```

---

**Need Help?** Check the detailed guides:
- `SUPABASE_SETUP.md` - Complete setup guide
- `SUPABASE_CONNECTION_GUIDE.md` - Connection details
- `VERCEL_SUPABASE_SETUP.md` - Production deployment

