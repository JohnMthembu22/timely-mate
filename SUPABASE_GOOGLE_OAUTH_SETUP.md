# Google sign-in (Gmail) for Timely Mate

Timely Mate uses **Supabase Auth** with the **Google** provider. One button handles both **sign in** and **sign up** — if the Google account is new, Supabase creates the user automatically.

## 1. Enable Google in Supabase

1. Open [Supabase Dashboard → Authentication → Providers → Google](https://supabase.com/dashboard/project/dczhtdvbvnxlzcjqxowm/auth/providers?provider=Google)
2. Turn **Google** on
3. Leave this tab open — you will paste Client ID and Secret from Google Cloud

## 2. Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project (e.g. **Timely Mate**)
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (or Internal if Google Workspace only)
   - App name: **Timely Mate**
   - Support email: your email
   - Authorized domains: `timelymate.co.za`, `supabase.co`
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: **Timely Mate Web**
   - **Authorized JavaScript origins:**
     - `https://www.timelymate.co.za`
     - `http://localhost:3000` (local dev)
     - `https://dczhtdvbvnxlzcjqxowm.supabase.co`
   - **Authorized redirect URIs:**
     - `https://dczhtdvbvnxlzcjqxowm.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** into Supabase Google provider settings → **Save**

## 3. Supabase URL configuration

**Authentication → URL configuration:**

| Setting | Value |
|--------|--------|
| Site URL | `https://www.timelymate.co.za` |
| Redirect URLs | `https://www.timelymate.co.za/auth/callback` |
| | `http://localhost:3000/auth/callback` |

Google OAuth always returns to `/auth/callback` (not the homepage).

## 4. Environment variables

Already required (no extra Google keys in the frontend):

```env
VITE_SUPABASE_URL=https://dczhtdvbvnxlzcjqxowm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://www.timelymate.co.za
```

Redeploy Vercel after any env change.

## 5. Profile row for Google users

Run `SUPABASE_AUTH_PROFILE_TRIGGER.sql` in the SQL editor so new Google users get a `profiles` row. The app also backfills org name from the Google display name or email domain.

## 6. Test

1. Deploy latest code to production
2. Open **Sign in** or **Register**
3. Click **Continue with Google**
4. Pick a Google account
5. You should land on `/auth/callback` then the dashboard

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Redirect URI mismatch | Add `https://dczhtdvbvnxlzcjqxowm.supabase.co/auth/v1/callback` in Google Cloud |
| Lands on homepage `/#` | Add `/auth/callback` to Supabase Redirect URLs and redeploy frontend |
| `access_denied` | User cancelled or app not verified on Google consent screen |
| No profile row | Run profile trigger SQL; check RLS on `profiles` |
