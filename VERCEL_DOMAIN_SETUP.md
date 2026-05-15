# 🌐 Configure Custom Domain on Vercel

Your app is deployed! Now let's connect it to `timelymate.app`.

## ✅ Current Status

- ✅ App deployed to: https://web-ointlb8i4-john-1201s-projects.vercel.app
- ⏳ Need to configure: timelymate.app domain

## 📋 Step-by-Step: Add Custom Domain

### Step 1: Go to Vercel Project Settings

1. **Visit Vercel Dashboard**: https://vercel.com/john-1201s-projects/web
2. **Click "Settings"** tab (top navigation)
3. **Click "Domains"** in the left sidebar

### Step 2: Add Domain

1. **Click "Add Domain"** button
2. **Enter domain**: `timelymate.app`
3. **Click "Add"**

### Step 3: Configure DNS

Vercel will show you DNS configuration options:

**Option A: CNAME (Recommended)**
- **Type**: CNAME
- **Name**: `@` or leave blank
- **Value**: `cname.vercel-dns.com`
- **TTL**: 3600 (or default)

**Option B: A Records**
- Vercel will provide IP addresses
- Add A records pointing to those IPs

### Step 4: Update DNS at Your Domain Provider

1. **Go to your domain registrar** (where you bought timelymate.app)
2. **Find DNS settings** (usually under "DNS Management" or "Name Servers")
3. **Add the CNAME or A records** as shown in Vercel
4. **Save changes**

### Step 5: Wait for DNS Propagation

- DNS changes can take 5-60 minutes to propagate
- Vercel will show status: "Valid Configuration" when ready
- SSL certificate will be automatically provisioned

### Step 6: Verify

Once DNS propagates:
- ✅ Vercel shows "Valid Configuration"
- ✅ SSL certificate is active
- ✅ Visit https://timelymate.app - should work!

---

## 🔍 Check Current Domain Status

To check if domain is already connected:

1. Go to: https://vercel.com/john-1201s-projects/web/settings/domains
2. Look for `timelymate.app` in the list
3. If it shows "Valid Configuration" ✅ - you're done!
4. If it shows "Invalid Configuration" - follow steps above

---

## 🔧 Alternative: Use Vercel CLI

You can also add domain via CLI:

```bash
cd frontend/web
vercel domains add timelymate.app
```

Then configure DNS as shown above.

---

## ✅ After Domain is Configured

Your app will be accessible at:
- **Primary**: https://timelymate.app
- **Vercel URL**: https://web-ointlb8i4-john-1201s-projects.vercel.app (still works)

Both URLs will work, but the custom domain is what users will see!

---

## 🚨 Troubleshooting

### Domain Not Working

1. **Check DNS propagation**: https://dnschecker.org
2. **Verify DNS records** match Vercel's requirements
3. **Wait longer** - DNS can take up to 48 hours (usually 5-60 min)

### SSL Certificate Issues

- Vercel automatically provisions SSL
- Wait for DNS to propagate first
- SSL usually activates within minutes after DNS is valid

---

**Need help?** Check Vercel's domain documentation or contact your domain registrar support.

