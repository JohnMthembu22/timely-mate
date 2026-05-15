# Quick Deploy Guide - Get Your App Online in 5 Minutes

## 🚀 Fastest Way: Deploy to Vercel (Frontend Only)

This is the quickest way to get your app online for client demos.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Frontend
```bash
cd frontend/web
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Follow Prompts
- Login to Vercel (or create account at vercel.com)
- Confirm settings (defaults are usually fine)
- Wait for deployment (~2 minutes)

### Step 5: Share Your URL
Your app will be live at: `https://your-app-name.vercel.app`

---

## 🎯 Alternative: Deploy via Vercel Dashboard (No CLI)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your Git repository OR drag & drop the `frontend/web` folder
4. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend/web` (if deploying from repo root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

---

## ✅ That's It!

Your app is now live and shareable with clients!

**Note:** This deploys the frontend only. For full-stack deployment with backend, see `DEPLOYMENT_GUIDE.md`

---

## 🔄 Update Your Deployment

After making changes:
```bash
cd frontend/web
vercel --prod
```

Or just push to Git if you connected a repository (auto-deploys).

