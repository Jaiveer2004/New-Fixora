# Fixora Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Part 1: Deploy Backend to Render](#part-1-deploy-backend-to-render)
- [Part 2: Deploy Frontend to Vercel](#part-2-deploy-frontend-to-vercel)
- [Part 3: Configure Environment Variables](#part-3-configure-environment-variables)
- [Part 4: Post-Deployment Configuration](#part-4-post-deployment-configuration)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Prerequisites

Before starting the deployment process, ensure you have:

### Required Accounts
- ✅ [GitHub Account](https://github.com) - For code hosting
- ✅ [Vercel Account](https://vercel.com) - For frontend deployment
- ✅ [Render Account](https://render.com) - For backend deployment
- ✅ [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) - For database hosting

### Required API Keys
- ✅ Razorpay API credentials (Key ID & Secret)
- ✅ Google Gemini API key
- ✅ Google OAuth credentials (Client ID & Secret)
- ✅ Email service credentials (if using custom SMTP)

### Preparation Steps
1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Set up MongoDB Atlas** (if not already done)
   - Create a new cluster
   - Create a database user
   - Whitelist all IP addresses (0.0.0.0/0) for deployment
   - Get your connection string

---

## Part 1: Deploy Backend to Render

### Step 1: Create a New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `fixora` repository

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Name** | `fixora-backend` (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `fixora-backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter for production) |

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add the following:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fixora?retryWrites=true&w=majority

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-key
ENCRYPTION_KEY=your-encryption-key-32-chars

# Server
NODE_ENV=production
PORT=8000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback

# Email Configuration (Example with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Fixora <noreply@fixora.com>

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Razorpay Webhook Secret (if using webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the build and deployment to complete (5-10 minutes)
3. Once deployed, copy your backend URL: `https://your-app-name.onrender.com`

### Step 5: Update CORS Configuration

After getting your Vercel URL (next step), update your backend's CORS settings:

**In `fixora-backend/src/app.js`:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://your-app.vercel.app',  // Add your Vercel domain
    'https://your-custom-domain.com' // Add custom domain if any
  ],
  credentials: true
}))
```

Commit and push the changes. Render will auto-deploy.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

**Update API URL configuration:**

1. In `fixora-frontend/src/lib/api.ts`, ensure the API URL is read from environment variables:
   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
   ```

2. Commit any changes:
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push
   ```

### Step 2: Deploy to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import your Git Repository**:
   - Select your GitHub repository
   - Click **Import**

### Step 3: Configure Project Settings

| Setting | Value |
|---------|-------|
| **Project Name** | `fixora` (or your preferred name) |
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `fixora-frontend` |
| **Build Command** | `npm run build` (auto-filled) |
| **Output Directory** | `.next` (auto-filled) |
| **Install Command** | `npm install` (auto-filled) |

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```env
# Backend API URL (from Render)
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api

# Razorpay (Public Key)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Google OAuth (if using client-side OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Socket.IO URL (same as backend)
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.onrender.com
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build process (3-5 minutes)
3. Once deployed, your app will be live at: `https://your-project.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

---

## Part 3: Configure Environment Variables

### Backend Environment Variables (.env)

Create these on Render's environment variables section:

```env
# ===== DATABASE =====
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fixora

# ===== AUTHENTICATION & SECURITY =====
JWT_SECRET=your-jwt-secret-must-be-at-least-32-characters-long
SESSION_SECRET=your-session-secret-key-different-from-jwt
ENCRYPTION_KEY=your-encryption-key-32-characters-long

# ===== SERVER =====
NODE_ENV=production
PORT=8000

# ===== PAYMENT GATEWAY =====
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ===== AI SERVICES =====
GEMINI_API_KEY=your_gemini_api_key

# ===== OAUTH =====
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback

# ===== EMAIL SERVICE =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Fixora <noreply@fixora.com>

# ===== FRONTEND URL =====
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Environment Variables (.env.local)

Create these on Vercel's environment variables section:

```env
# ===== API CONFIGURATION =====
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api

# ===== PAYMENT GATEWAY =====
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

# ===== OAUTH =====
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# ===== WEBSOCKET =====
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

---

## Part 4: Post-Deployment Configuration

### 1. Update Google OAuth Redirect URIs

In [Google Cloud Console](https://console.cloud.google.com/):

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add **Authorized Redirect URIs**:
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   https://your-app.vercel.app/auth/callback
   ```

### 2. Update Razorpay Webhook URL

In [Razorpay Dashboard](https://dashboard.razorpay.com):

1. Go to **Settings** → **Webhooks**
2. Add webhook URL:
   ```
   https://your-backend.onrender.com/api/payments/webhook
   ```
3. Select events to subscribe to:
   - `payment.authorized`
   - `payment.failed`
   - `payment.captured`

### 3. Configure MongoDB Atlas Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Click **Add IP Address**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **Confirm**

### 4. Test Your Deployment

1. **Test Backend Health**:
   ```bash
   curl https://your-backend.onrender.com/
   ```
   Expected response: API information JSON

2. **Test Frontend**:
   - Visit `https://your-app.vercel.app`
   - Try user registration/login
   - Test service browsing
   - Test booking flow

3. **Test Integrations**:
   - Google OAuth login
   - Payment gateway (test mode)
   - Email notifications
   - Socket.IO chat/real-time features

---

## Common Issues & Troubleshooting

### Issue 1: Backend Returns 502/503 Error

**Cause**: Render free tier has cold starts (services sleep after 15 minutes of inactivity)

**Solution**:
- First request may take 30-60 seconds to wake up
- Consider upgrading to Render's Starter plan ($7/month) for always-on service
- Implement a health check endpoint and use a service like UptimeRobot to ping it every 5 minutes

### Issue 2: CORS Errors

**Symptoms**: Frontend can't communicate with backend

**Solutions**:
1. Verify CORS configuration in `app.js` includes your Vercel domain
2. Check that `credentials: true` is set in both frontend and backend
3. Ensure environment variables are correctly set on Render
4. Redeploy backend after making changes

**Debug**:
```bash
# Check backend logs on Render
# Dashboard → Your Service → Logs
```

### Issue 3: MongoDB Connection Failed

**Solutions**:
1. Verify `MONGO_URI` is correct in Render environment variables
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Ensure database user has proper permissions
4. Verify connection string format:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
   ```

### Issue 4: Environment Variables Not Working

**Vercel**:
1. Go to **Project Settings** → **Environment Variables**
2. Make sure variables start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding/changing variables

**Render**:
1. Go to **Environment** tab in your service
2. Variables are available immediately but require redeploy
3. Click **Manual Deploy** → **Deploy latest commit**

### Issue 5: Build Fails on Vercel

**Common Causes**:
- TypeScript errors
- Missing dependencies
- Environment variables not set

**Solutions**:
1. Test build locally:
   ```bash
   cd fixora-frontend
   npm run build
   ```
2. Fix any errors shown
3. Check Vercel build logs for specific errors
4. Ensure all required environment variables are set

### Issue 6: WebSocket/Socket.IO Not Connecting

**Solutions**:
1. Verify `NEXT_PUBLIC_SOCKET_URL` points to backend URL
2. Check backend allows WebSocket connections (Render supports this)
3. Update Socket.IO initialization in `socket.service.js` to handle CORS:
   ```javascript
   const io = require('socket.io')(server, {
     cors: {
       origin: process.env.FRONTEND_URL,
       credentials: true
     }
   });
   ```

### Issue 7: Google OAuth Not Working

**Solutions**:
1. Verify redirect URIs in Google Cloud Console
2. Check `GOOGLE_CALLBACK_URL` in backend env vars
3. Ensure `GOOGLE_CLIENT_ID` matches in both frontend and backend
4. Test in incognito mode to avoid cookie issues

### Issue 8: Payment Gateway Errors

**Solutions**:
1. Verify Razorpay keys are correct (test vs live)
2. Check webhook signature verification in backend
3. Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches backend key
4. Test with Razorpay test cards first

---

## Performance Optimization Tips

### 1. Enable Caching
- Use Vercel's Edge Network (automatic)
- Implement API response caching on backend

### 2. Database Indexing
Add indexes to frequently queried fields in MongoDB:
```javascript
// In your models
userSchema.index({ email: 1 });
serviceSchema.index({ category: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
```

### 3. Image Optimization
- Use Next.js Image component for automatic optimization
- Store images in CDN (Cloudinary, AWS S3)

### 4. Monitor Performance
- Use Vercel Analytics
- Set up error tracking (Sentry)
- Monitor Render metrics

---

## Deployment Checklist

### Before Going Live

- [ ] All environment variables configured on both platforms
- [ ] MongoDB Atlas network access configured
- [ ] Google OAuth redirect URIs updated
- [ ] Razorpay webhook configured
- [ ] CORS settings updated with production URLs
- [ ] Test all authentication flows
- [ ] Test payment integration (test mode)
- [ ] Test email notifications
- [ ] Test WebSocket/real-time features
- [ ] Database indexes created
- [ ] Error monitoring set up
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic on both platforms)

### After Deployment

- [ ] Monitor error logs for 24 hours
- [ ] Test from different devices/networks
- [ ] Verify email deliverability
- [ ] Check payment webhooks working
- [ ] Monitor database performance
- [ ] Set up backups for MongoDB
- [ ] Document any production-specific configurations
- [ ] Create rollback plan

---

## Useful Commands

### Vercel CLI (Optional)

Install Vercel CLI for local testing:
```bash
npm i -g vercel

# Login
vercel login

# Deploy from command line
cd fixora-frontend
vercel --prod

# Check deployment logs
vercel logs <deployment-url>
```

### Render CLI (Optional)

Install Render CLI:
```bash
# Using Homebrew (macOS)
brew install render

# Or download from https://render.com/docs/cli
```

---

## Cost Breakdown

### Free Tier Usage

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | Yes | 100GB bandwidth/month |
| **Render** | Yes | 750 hours/month, sleeps after 15min inactivity |
| **MongoDB Atlas** | Yes | 512MB storage |

### Recommended Paid Plans (Production)

| Service | Plan | Cost | Benefits |
|---------|------|------|----------|
| **Vercel** | Pro | $20/month | Unlimited bandwidth, better performance |
| **Render** | Starter | $7/month | Always-on, no cold starts |
| **MongoDB Atlas** | M10 | $57/month | 10GB storage, dedicated cluster |

**Estimated Monthly Cost for Production**: ~$84/month

---

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

## Need Help?

If you encounter issues:

1. Check the **Logs**:
   - Vercel: Project → Deployments → Click deployment → View Function Logs
   - Render: Service → Logs tab

2. Common Error Patterns:
   - `MODULE_NOT_FOUND`: Missing dependency, run `npm install`
   - `ECONNREFUSED`: Wrong API URL or service is down
   - `UnauthorizedError`: JWT/session issue, check auth middleware
   - `ValidationError`: Check request payload matches schema

3. Debug Mode:
   - Enable verbose logging on Render
   - Use `console.log` strategically
   - Check network tab in browser DevTools

---

**Congratulations! 🎉** Your Fixora application is now live on the internet!

Remember to:
- Monitor your application regularly
- Keep dependencies updated
- Back up your database
- Use test mode for payments until thoroughly tested
- Switch to production Razorpay keys only when ready for real transactions
