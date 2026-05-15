# 🚀 Deploy to Vercel - Step by Step Guide

This guide will help you deploy the latest version of your app to Vercel on timelymate.app.

## 📋 Pre-Deployment Checklist

Before deploying, make sure:
- [ ] All code changes are committed to Git
- [ ] Supabase environment variables are ready
- [ ] Build works locally (`npm run build`)

---

## Method 1: Deploy via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### Step 2: Navigate to Frontend Directory

```bash
cd /Users/johnmthembu/Documents/Work/apps/Timely\ Mate/timely-mate-3/frontend/web
```

### Step 3: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 4: Deploy to Production

```bash
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **Yes** (if you have one) or **No** (to create new)
- What's your project's name? **timelymate** or **web**
- In which directory is your code located? **./** (current directory)
- Want to override settings? **No** (defaults are fine)

### Step 5: Wait for Deployment

The deployment will take 2-5 minutes. You'll see:
- Building...
- Uploading...
- ✅ Deployment complete!

---

## Method 2: Deploy via Vercel Dashboard

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Sign in to your account

### Step 2: Import Project

1. Click **"Add New Project"** (or **"Import Project"**)
2. If you have a Git repository:
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select your repository
   - Click **"Import"**
3. If you don't have Git connected:
   - Click **"Deploy"** → **"Upload"**
   - Drag and drop the `frontend/web` folder

### Step 3: Configure Project Settings

**If deploying from Git:**
- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** `frontend/web` (if deploying from repo root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**If uploading:**
- Vercel will auto-detect Vite settings

### Step 4: Add Environment Variables

Before deploying, add Supabase environment variables:

1. In the project settings, go to **"Environment Variables"**
2. Add these variables:

```
VITE_SUPABASE_URL = https://dczhtdvbvnxlzcjqxowm.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

3. Select environments: **Production**, **Preview**, **Development**
4. Click **"Save"**

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (2-5 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🌐 Step 6: Configure Custom Domain (timelymate.app)

### Option A: If Domain is Already Connected

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Verify `timelymate.app` is listed
4. If not, add it (see Option B)

### Option B: Add Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter: `timelymate.app`
4. Click **"Add"**
5. Follow DNS configuration instructions:
   - Add a CNAME record pointing to Vercel
   - Or add A records (Vercel will provide IPs)
6. Wait for DNS propagation (5-60 minutes)
7. SSL certificate will be automatically provisioned

### Verify Domain

Once DNS is configured:
- Vercel will show ✅ "Valid Configuration"
- SSL certificate will be issued automatically
- Your app will be accessible at `https://timelymate.app`

---

## 🔧 Step 7: Verify Environment Variables

Make sure these are set in Vercel:

1. Go to **"Settings"** → **"Environment Variables"**
2. Verify these exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. If missing, add them (see Step 4 above)
4. **Important:** After adding variables, redeploy:
   - Go to **"Deployments"**
   - Click **"⋯"** on latest deployment
   - Click **"Redeploy"**

---

## ✅ Step 8: Verify Deployment

1. **Visit your app**: https://timelymate.app
2. **Check browser console** for any errors
3. **Test key features**:
   - Login/Signup
   - Dashboard loads
   - Supabase connection works
   - Real-time features work

---

## 🔄 Updating Your Deployment

### After Making Changes:

**Option 1: Auto-Deploy (if Git connected)**
```bash
git add .
git commit -m "Update app"
git push
```
Vercel will automatically deploy!

**Option 2: Manual Deploy**
```bash
cd frontend/web
vercel --prod
```

**Option 3: Via Dashboard**
- Go to Vercel Dashboard
- Click **"Deployments"** → **"Redeploy"**

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- Node.js version (should be 18+)
- All dependencies in `package.json`
- Build logs in Vercel dashboard

**Fix:**
```bash
# Test build locally first
cd frontend/web
npm run build
```

### App Not Loading

**Check:**
- Environment variables are set
- Domain DNS is configured correctly
- Browser console for errors

### Supabase Not Working

**Check:**
- Environment variables are set correctly
- Supabase project is active
- CORS settings in Supabase (should allow your domain)

---

## 📊 Deployment Status

After deployment, you can:
- View deployment logs in Vercel Dashboard
- See build time and size
- Check function logs
- Monitor performance

---

## 🎯 Quick Commands Reference

```bash
# Deploy to production
cd frontend/web
vercel --prod

# Deploy preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

---

## ✅ Success Checklist

After deployment:
- [ ] App is accessible at https://timelymate.app
- [ ] No console errors
- [ ] Supabase connection works
- [ ] Login/Signup works
- [ ] Real-time features work
- [ ] Environment variables are set
- [ ] SSL certificate is active (HTTPS)

---

**Your app is now live! 🎉**

Visit: https://timelymate.app

