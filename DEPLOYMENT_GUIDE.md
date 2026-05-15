# Timely Mate - Deployment Guide for Client Demos

This guide provides multiple options to deploy your Timely Mate app so potential clients can view it online.

## 🚀 Quick Start Options

### Option 1: Vercel (Frontend Only - Easiest for Demo) ⭐ RECOMMENDED FOR QUICK DEMO

**Best for:** Quick client demos, frontend-only showcase
**Cost:** Free
**Time:** 5 minutes

#### Steps:

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory**:
   ```bash
   cd frontend/web
   vercel
   ```

3. **Follow the prompts:**
   - Login to Vercel (or create account)
   - Confirm project settings
   - Deploy!

4. **Your app will be live at:** `https://your-app-name.vercel.app`

#### Manual Deployment via Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your Git repository (or drag & drop the `frontend/web` folder)
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

**Note:** For frontend-only demo, the app will work with localStorage-based authentication (no backend needed for basic demo).

---

### Option 2: Netlify (Frontend Only - Alternative)

**Best for:** Quick client demos, frontend showcase
**Cost:** Free
**Time:** 5 minutes

#### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy**:
   ```bash
   cd frontend/web
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Manual Deployment via Netlify Dashboard:

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure:
   - **Base directory:** `frontend/web`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/web/dist`
5. Click "Deploy site"

---

### Option 3: Render (Full Stack - Already Configured) ⭐ RECOMMENDED FOR FULL APP

**Best for:** Complete app with backend, database, and all features
**Cost:** Free tier available (services sleep after 15 min inactivity)
**Time:** 15-20 minutes

#### Steps:

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Sign up for Render**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Auto-Deploy with render.yaml**:
   - In Render Dashboard, click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create all services

4. **Configure Environment Variables** (if needed):
   - Go to each service → Environment
   - Add any required variables

5. **Your app will be live at:**
   - Frontend: `https://timelymate-frontend.onrender.com`
   - Backend: `https://timelymate-backend.onrender.com`

**Note:** Free tier services sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds to wake up.

---

### Option 4: Railway (Full Stack - Simple Alternative)

**Best for:** Full app deployment with easy setup
**Cost:** $5/month (free trial available)
**Time:** 10-15 minutes

#### Steps:

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Deploy Frontend**:
   - Click "New" → "GitHub Repo"
   - Select your repo
   - Set Root Directory: `frontend/web`
   - Set Build Command: `npm install && npm run build`
   - Set Start Command: `npx serve -s dist -l 3000`
   - Railway will auto-detect and deploy

4. **Deploy Backend** (if needed):
   - Add another service
   - Root Directory: `backend/app`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide connection string automatically

---

### Option 5: Fly.io (Full Stack - Global CDN)

**Best for:** Global distribution, fast performance
**Cost:** Free tier available
**Time:** 15-20 minutes

#### Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**:
   ```bash
   fly auth login
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend/web
   fly launch
   ```

4. **Follow prompts** and Fly will create a `fly.toml` config file

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Code is committed to Git
- [ ] All environment variables are documented
- [ ] Build commands work locally (`npm run build`)
- [ ] No sensitive data in code (use environment variables)
- [ ] API URLs are configurable (not hardcoded)
- [ ] CORS is properly configured (if using backend)

---

## 🔧 Environment Variables Setup

### Frontend Variables (if using backend):

```bash
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=Timely Mate
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=false
```

### Backend Variables:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key-here
ENVIRONMENT=production
DEBUG=false
```

---

## 🎯 Recommended Approach for Client Demos

### For Quick Demo (Frontend Only):
1. **Use Vercel** - Fastest, easiest, free
2. Deploy frontend only
3. App works with localStorage (no backend needed for basic demo)
4. Share the Vercel URL with clients

### For Full Feature Demo:
1. **Use Render** - Already configured, free tier available
2. Deploy both frontend and backend
3. Set up PostgreSQL database
4. Configure environment variables
5. Share the Render frontend URL

---

## 📱 Sharing Your Demo

Once deployed, you can:

1. **Share the URL directly:**
   - Vercel: `https://your-app.vercel.app`
   - Netlify: `https://your-app.netlify.app`
   - Render: `https://timelymate-frontend.onrender.com`

2. **Create a demo account:**
   - Set up a demo user account
   - Share credentials with clients
   - Or create a public demo mode

3. **Add custom domain** (optional):
   - Configure DNS
   - Add custom domain in platform settings
   - SSL is automatic

---

## 🐛 Troubleshooting

### Build Fails:
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in platform dashboard

### App Not Loading:
- Check browser console for errors
- Verify environment variables are set
- Check CORS settings (if using backend)

### Slow First Load (Render Free Tier):
- Normal for free tier (services sleep after inactivity)
- First request wakes up the service (30-60 seconds)
- Consider paid plan for always-on service

---

## 💡 Tips for Client Presentations

1. **Pre-warm the service** before the meeting (make a request 5 min before)
2. **Have a backup** - Screenshots or video demo ready
3. **Test all features** before sharing
4. **Create demo data** that showcases key features
5. **Document login credentials** for demo account

---

## 🚀 Next Steps

1. Choose your deployment platform
2. Deploy the app
3. Test thoroughly
4. Create demo account
5. Share URL with clients!

**Need help?** Check the platform-specific documentation or reach out for support.

