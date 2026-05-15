# Deploying Timely Mate to Render

This guide walks you through deploying Timely Mate to Render, a modern cloud platform that replaces our previous AWS infrastructure.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com))
- Your Timely Mate code repository on GitHub/GitLab/Bitbucket
- Basic understanding of environment variables

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

1. **Fork/Import Repository**
   - Fork this repository to your GitHub account
   - Or import it to your preferred Git provider

2. **Connect to Render**
   - Log in to Render Dashboard
   - Click "Create a new service from Git"
   - Connect your Git provider and select the repository

3. **Auto-Deploy with render.yaml**
   - Render will automatically detect the `render.yaml` file
   - This will create both frontend and backend services plus a PostgreSQL database
   - Click "Apply" to start the deployment

### Option 2: Manual Setup

If you prefer to set up services manually:

#### 1. Create Database
```bash
# In Render Dashboard:
# 1. Go to "Databases" → "New PostgreSQL"
# 2. Name: timely-mate-db
# 3. Plan: Free (or choose based on needs)
# 4. Region: Choose closest to your users
```

#### 2. Create Backend Service
```bash
# In Render Dashboard:
# 1. Go to "Web Services" → "New Web Service"
# 2. Connect your repository
# 3. Configure:
Name: timely-mate-backend
Runtime: Python
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Backend Environment Variables:**
```bash
DATABASE_URL=<your-postgres-connection-string>
ENVIRONMENT=production
DEBUG=false
```

#### 3. Create Frontend Service
```bash
# In Render Dashboard:
# 1. Go to "Static Sites" → "New Static Site" 
# 2. Connect your repository
# 3. Configure:
Name: timely-mate-frontend
Build Command: cd frontend/web && npm ci && npm run build
Publish Directory: frontend/web/dist
```

**Frontend Environment Variables:**
```bash
VITE_API_URL=https://your-backend-service.onrender.com
VITE_APP_NAME=Timely Mate
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PREMIUM_FEATURES=true
VITE_ENABLE_REAL_TIME_CHAT=true
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## Environment Configuration

### Development vs Production

**Development:**
```bash
VITE_API_URL=http://localhost:3000
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

**Production (Render):**
```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
```

## Database Setup

Once your PostgreSQL database is created on Render:

1. **Get Connection String**
   - Go to your database in Render Dashboard
   - Copy the "External Database URL"

2. **Update Backend Environment**
   - Add `DATABASE_URL` to your backend service
   - Paste the connection string

3. **Database Migrations** (if applicable)
   ```bash
   # Your backend should handle migrations automatically
   # or you can run them via Render's shell access
   ```

## Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your frontend service settings
   - Click "Custom Domains"
   - Add your domain (e.g., app.yourcompany.com)

2. **Update DNS**
   - Point your domain's CNAME to the Render hostname
   - Render will automatically provision SSL certificates

## Monitoring and Logs

### View Logs
```bash
# In Render Dashboard:
# 1. Go to your service
# 2. Click "Logs" tab
# 3. View real-time logs or download historical logs
```

### Monitor Performance
- Render provides built-in metrics for CPU, memory, and response times
- Set up alerts for service health
- Monitor database performance

## Scaling

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- 750 hours per month of uptime
- Shared resources

### Paid Plans
- No sleep mode
- Dedicated resources
- Priority support
- Advanced metrics

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Render Dashboard
   # Ensure all dependencies are in package.json/requirements.txt
   # Verify Node.js/Python versions
   ```

2. **Environment Variables**
   ```bash
   # Double-check all required environment variables are set
   # Ensure API URL matches your backend service URL
   # Verify database connection string
   ```

3. **CORS Issues**
   ```bash
   # Update backend CORS settings to include frontend domain
   # Check that API URLs are correctly configured
   ```

## Benefits of Render vs AWS

✅ **Simplified Deployment:** No complex infrastructure setup
✅ **Zero Configuration:** Automatic SSL, CDN, and scaling
✅ **Cost Effective:** Pay only for what you use
✅ **Developer Friendly:** Easy monitoring and debugging
✅ **Git Integration:** Automatic deployments on push
✅ **No Vendor Lock-in:** Standard containers and databases

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status Page](https://status.render.com)

## Next Steps

1. Deploy your application using Option 1 (render.yaml)
2. Configure your custom domain
3. Set up monitoring and alerts
4. Test your application thoroughly
5. Set up staging environment (optional)

Your Timely Mate application is now running on modern, scalable infrastructure without the complexity of AWS! 