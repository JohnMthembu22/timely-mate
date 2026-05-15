# 📝 Step-by-Step Guide: Add Project Members by Email in Supabase

This guide will walk you through setting up the project members feature in Supabase, step by step.

## 🎯 What You'll Do

1. Create the `project_members` table
2. Set up security policies
3. Enable Realtime
4. Test the setup

---

## Step 1: Open Supabase SQL Editor

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm
   - Sign in if needed

2. **Click "SQL Editor"** in the left sidebar
   - It's usually near the top of the menu
   - You should see a blank editor area

3. **Click "New query"** (if you see it) or just click in the editor

---

## Step 2: Create the Project Members Table

1. **In the SQL Editor**, you'll paste SQL code
2. **Open the file**: `PROJECT_MEMBERS_TABLE.sql` in your project
3. **Copy ALL the content** from that file (Ctrl+A, then Ctrl+C)
4. **Paste it** into the SQL Editor (Ctrl+V)

You should see SQL that starts with:
```sql
-- Create project_members table for adding users to projects by email
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  ...
```

5. **Click the "Run" button** (usually at the bottom right)
6. **Wait for it to complete** - you should see: ✅ "Success. No rows returned"

---

## Step 3: Verify the Table Was Created

1. **Go to "Table Editor"** in the left sidebar
2. **Look for "project_members"** in the list of tables
3. **You should see it listed** ✅

If you don't see it:
- Refresh the page (F5)
- Check if there were any errors in SQL Editor
- Make sure you copied the entire SQL script

---

## Step 4: Verify Realtime is Enabled

1. **Go to SQL Editor** again
2. **Create a new query**
3. **Paste this SQL**:

```sql
-- Check if project_members has Realtime enabled
SELECT 
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename = 'project_members';
```

4. **Click "Run"**
5. **You should see**: `project_members` in the results ✅

If you don't see it, the SQL script should have enabled it automatically. If not, run this:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
```

---

## Step 5: Test the Setup (Optional)

Let's verify everything works by checking the table structure:

1. **In SQL Editor**, create a new query
2. **Paste this**:

```sql
-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_members'
ORDER BY ordinal_position;
```

3. **Click "Run"**
4. **You should see** all the columns:
   - id
   - project_id
   - user_id
   - email
   - role
   - invited_by
   - invited_at
   - joined_at
   - status

---

## Step 6: Verify Security Policies

1. **In SQL Editor**, create a new query
2. **Paste this**:

```sql
-- Check RLS policies for project_members
SELECT 
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'project_members';
```

3. **Click "Run"**
4. **You should see** 3 policies:
   - "Users can view project members"
   - "Project admins can add members"
   - "Users can update own membership"

---

## ✅ Setup Complete!

Your `project_members` table is now set up with:
- ✅ Table created
- ✅ Row Level Security enabled
- ✅ Security policies configured
- ✅ Realtime enabled
- ✅ Indexes created for performance

---

## 🧪 Quick Test (Optional)

Test adding a member (you'll need a project ID first):

1. **Get a project ID**:
   ```sql
   SELECT id, name FROM projects LIMIT 1;
   ```

2. **Test adding a member** (replace `YOUR_PROJECT_ID` and `test@example.com`):
   ```sql
   -- This will only work if you're authenticated
   -- In your app, use the projectMembersService instead
   INSERT INTO project_members (project_id, email, role, invited_by)
   VALUES (
     'YOUR_PROJECT_ID',
     'test@example.com',
     'member',
     auth.uid()
   );
   ```

---

## 📋 Checklist

After completing all steps, verify:

- [ ] SQL script ran successfully
- [ ] `project_members` table appears in Table Editor
- [ ] Realtime is enabled (Step 4 check passed)
- [ ] Table structure is correct (Step 5 check passed)
- [ ] Security policies exist (Step 6 check passed)

---

## 🚨 Troubleshooting

### Problem: "relation projects does not exist"

**Solution**: You need to create the `projects` table first. Run `SUPABASE_DATABASE_SETUP.sql` first, then come back to this.

### Problem: "permission denied"

**Solution**: Make sure you're logged in as the project owner. Try logging out and back in.

### Problem: "duplicate key value violates unique constraint"

**Solution**: The table already exists! That's OK - the `IF NOT EXISTS` clause should prevent this, but if you see it, the table is already created.

### Problem: Realtime not enabled

**Solution**: Run this manually:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;
```

---

## 🎯 Next Steps

Once the table is set up:

1. **The service is ready** - `projectMembersService.ts` is already created
2. **Use it in your components** - See `ADD_PROJECT_MEMBERS_BY_EMAIL.md` for examples
3. **Test in your app** - Try adding a member via email!

---

## 📚 Related Files

- `PROJECT_MEMBERS_TABLE.sql` - The SQL script you just ran
- `frontend/web/src/services/projectMembersService.ts` - The service to use in your app
- `ADD_PROJECT_MEMBERS_BY_EMAIL.md` - Complete usage guide

---

**You're all set!** Your Supabase database now supports adding project members by email with automatic notifications! 🎉

