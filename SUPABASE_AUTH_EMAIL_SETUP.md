# Supabase auth email — send from timelymate.co.za

Timely Mate uses **Supabase Auth** for sign-up and sign-in. Confirmation emails are sent by Supabase, but you can brand them as **Timely Mate** and send from **`noreply@timelymate.co.za`** instead of the default Supabase address.

## 1. Environment variables (frontend)

In `frontend/web/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://www.timelymate.co.za
```

`VITE_APP_URL` is used for email confirmation (`/auth/callback`) and password reset (`/auth/reset-password`).

## 2. Supabase Auth URL settings

In **Supabase Dashboard → Authentication → URL configuration**:

| Setting | Value |
|--------|--------|
| Site URL | `https://www.timelymate.co.za` |
| Redirect URLs | `https://www.timelymate.co.za/auth/callback` |
| | `https://www.timelymate.co.za/auth/reset-password` |
| | `https://www.timelymate.co.za/**` (optional wildcard) |
| | `http://localhost:3000/auth/callback` (local dev) |
| | `http://localhost:3000/auth/reset-password` (local dev) |

**Important:** After changing Redirect URLs, request a **new** reset email from **Sign in → Forgot password?** Old emails will not work.

## 3. Custom SMTP (required for timelymate.co.za sender)

In **Authentication → SMTP settings**, enable custom SMTP. Example with a transactional provider (Resend, SendGrid, Mailgun, or your host):

| Field | Example |
|-------|---------|
| Sender email | `noreply@timelymate.co.za` |
| Sender name | `Timely Mate` |
| Host | Your provider SMTP host |
| Port | `587` (TLS) |
| Username / Password | From your email provider |

### DNS (on timelymate.co.za)

Add records your provider gives you, typically:

- **SPF** — authorizes the mail server to send for your domain
- **DKIM** — cryptographic signature for deliverability
- **DMARC** (recommended) — policy for spoofing protection

Without SPF/DKIM, confirmation emails may land in spam or be rejected.

## 4. Email templates

In **Authentication → Email templates**, customize:

- **Confirm signup** — subject e.g. `Confirm your Timely Mate account`
- **Reset password** — subject e.g. `Reset your Timely Mate password`

Use Timely Mate branding in the HTML body (logo, support link `support@timelymate.co.za`).

## 5. Database trigger for profiles

Run `SUPABASE_AUTH_PROFILE_TRIGGER.sql` in the SQL editor so each new `auth.users` row gets a matching `profiles` row (even when email confirmation is required before first login).

## 6. Enable email confirmation (recommended for production)

**Authentication → Providers → Email**:

- Enable **Confirm email**
- Users register → receive email from `noreply@timelymate.co.za` → click link → land on `/auth/callback` → signed in → dashboard

For local testing without SMTP, you can temporarily disable confirm email or use Supabase Auth logs.

## 7. What the app does

- **Sign up** → `supabase.auth.signUp` with profile metadata + redirect to `/auth/callback`
- **Sign in** → `supabase.auth.signInWithPassword` (credentials stored hashed in Supabase Auth)
- **Log in / Sign up buttons** → `/login` and `/signup`; app routes require authentication
- **No localStorage password fallback** when Supabase env vars are set

## 8. Verify

1. Register a test user on staging/production.
2. Confirm the email **From** shows `Timely Mate <noreply@timelymate.co.za>`.
3. Click the link → should open `https://www.timelymate.co.za/auth/callback` and redirect to dashboard.
4. Sign out and sign in with the same email/password.
