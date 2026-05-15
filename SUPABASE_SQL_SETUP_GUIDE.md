# 📝 Supabase SQL Editor Setup - Step by Step Guide

This guide will walk you through setting up your Supabase database using the SQL Editor.

## 🎯 What You'll Do

1. Access the Supabase SQL Editor
2. Copy the database setup script
3. Run the script to create all tables
4. Verify everything is set up correctly

---

## Step 1: Access Your Supabase Dashboard

1. **Open your browser** and go to:
   ```
   https://supabase.com/dashboard
   ```

2. **Sign in** to your Supabase account (or create one if you don't have it)

3. **Select your project**:
   - If you see multiple projects, click on **"Timely Mate"** or your project name
   - Your project URL should be: `https://dczhtdvbvnxlzcjqxowm.supabase.co`

---

## Step 2: Navigate to SQL Editor

1. **Look at the left sidebar** in your Supabase dashboard
2. **Find and click** on **"SQL Editor"** 
   - It's usually in the menu with an icon that looks like `</>` or a code symbol
   - If you don't see it, look for **"Database"** → **"SQL Editor"**

   **Visual Guide:**
   ```
   Dashboard
   ├── Table Editor
   ├── SQL Editor  ← Click here!
   ├── Database
   ├── Authentication
   └── ...
   ```

---

## Step 3: Open the Database Setup File

1. **In your project folder**, navigate to:
   ```
   timely-mate-3/SUPABASE_DATABASE_SETUP.sql
   ```

2. **Open the file** in any text editor (VS Code, Notepad, TextEdit, etc.)

3. **Select all the content** (Ctrl+A or Cmd+A)

4. **Copy the entire content** (Ctrl+C or Cmd+C)
   - Make sure you copy everything from the first line to the last line

---

## Step 4: Create a New Query in SQL Editor

1. **Back in Supabase SQL Editor**, you should see:
   - A blank editor area (where you'll paste the SQL)
   - A "New query" button or tab at the top

2. **Click "New query"** (if you see it) or just click in the editor area

3. **The editor should be empty** and ready for your SQL

---

## Step 5: Paste the SQL Script

1. **Click in the SQL Editor** (the big text area)

2. **Paste the SQL script** you copied:
   - Right-click → Paste
   - Or press Ctrl+V (Windows/Linux) or Cmd+V (Mac)

3. **You should see** a long SQL script with:
   - `CREATE TABLE` statements
   - `ALTER TABLE` statements
   - `CREATE POLICY` statements
   - Comments (lines starting with `--`)

   **Example of what you should see:**
   ```sql
   -- Supabase Database Setup for Timely Mate
   -- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- ============================================
   -- PROFILES TABLE
   -- ============================================
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     ...
   ```

---

## Step 6: Run the SQL Script

1. **Look for the "Run" button** in the SQL Editor:
   - It's usually at the bottom right of the editor
   - Or in the top toolbar
   - The button might say "Run", "Execute", or have a play icon ▶️

2. **Click the "Run" button**

3. **Wait for execution** - This may take 10-30 seconds depending on your connection

4. **Check the results**:
   - You should see a success message like "Success. No rows returned"
   - Or a message showing how many queries were executed
   - If there are errors, they will be shown in red

---

## Step 7: Verify Tables Were Created

1. **Go to "Table Editor"** in the left sidebar
   - Click on "Table Editor" (usually right above or below SQL Editor)

2. **You should see** a list of tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `time_entries`
   - ✅ `notifications`
   - ✅ `messages`

3. **If you see all these tables**, you're done with the database setup! 🎉

---

## Step 8: Enable Realtime (Important!)

Real-time features won't work until you enable replication for the tables.

### Option A: Via Dashboard (Easiest)

1. **Go to "Database"** in the left sidebar
2. **Click on "Replication"** (or "Realtime")
3. **You'll see a list of tables** with toggle switches
4. **Enable replication** for these tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `time_entries`
   - ✅ `notifications`
   - ✅ `messages`

5. **Toggle each one ON** (click the switch)

### Option B: Via SQL (Alternative)

1. **Go back to SQL Editor**
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

---

## 🐛 Troubleshooting

### Problem: "SQL Editor" not visible

**Solution:**
- Make sure you're logged into the correct Supabase account
- Try refreshing the page
- Check if you have the correct project selected
- Look for "Database" → "SQL Editor" in the menu

### Problem: "Permission denied" error

**Solution:**
- Make sure you're the project owner or have admin access
- If you're using a team account, ask the owner to grant you permissions
- Try logging out and back in

### Problem: Tables already exist

**Solution:**
- This is OK! The script uses `CREATE TABLE IF NOT EXISTS`
- It won't create duplicates
- You can still run the script safely

### Problem: "Relation does not exist" error

**Solution:**
- Make sure you ran the entire script, not just part of it
- Check that the `profiles` table was created first (it's created early in the script)
- Try running the script again from the beginning

### Problem: Can't find the SQL file

**Solution:**
- The file is at: `timely-mate-3/SUPABASE_DATABASE_SETUP.sql`
- If you can't find it, you can also copy the SQL from the guide below

---

## 📋 Quick Reference: SQL Editor Location

```
Supabase Dashboard
└── Left Sidebar
    ├── Table Editor
    ├── SQL Editor  ← You need this!
    ├── Database
    │   ├── Tables
    │   ├── Replication  ← Enable realtime here
    │   └── ...
    └── ...
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] SQL Editor is accessible
- [ ] Database setup script ran successfully
- [ ] All 7 tables are visible in Table Editor:
  - [ ] `profiles`
  - [ ] `projects`
  - [ ] `teams`
  - [ ] `team_members`
  - [ ] `time_entries`
  - [ ] `notifications`
  - [ ] `messages`
- [ ] Realtime is enabled for all tables
- [ ] No errors in the SQL Editor results

---

## 🎯 Next Steps

Once your database is set up:

1. **Test the connection**:
   ```bash
   cd frontend/web
   npm run supabase:check
   ```

2. **Start using real-time features** in your app

3. **Create test data** (optional):
   - Go to Table Editor
   - Click on a table (e.g., `profiles`)
   - Click "Insert row" to add test data

---

## 📞 Need Help?

If you're stuck:

1. **Check Supabase Documentation**: https://supabase.com/docs/guides/database
2. **Check the SQL Editor guide**: https://supabase.com/docs/guides/database/tables
3. **Look at the error message** in SQL Editor - it usually tells you what's wrong
4. **Make sure you copied the entire SQL script** - missing parts can cause errors

---

## 🎉 You're Done!

Once you see all tables in the Table Editor and Realtime is enabled, your Supabase database is fully set up and ready to use with your Timely Mate app!

**Quick Test:**
- Open your app
- Try creating a user account
- Check the `profiles` table in Supabase - you should see the new user!

