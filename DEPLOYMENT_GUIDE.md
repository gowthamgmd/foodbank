# Deployment Guide: Vercel + Railway

This guide walks through deploying the Smart Food Bank system using **Vercel** for the frontend and **Railway** for backend + AI services.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Vercel                                                 │
│  ├─ Frontend (React + Vite) → https://your-app.vercel.app
│  └─ Auto-deploys on git push                            │
└─────────────────────────────────────────────────────────┘
                        ↓ (API calls)
┌─────────────────────────────────────────────────────────┐
│  Railway                                                │
│  ├─ Backend (Node.js + Express) → https://backend.up.railway.app │
│  ├─ AI Services (Flask/Python) → internal              │
│  └─ MongoDB Atlas (cloud)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Vercel account: https://vercel.com (free)
- Railway account: https://railway.app (free)
- GitHub repository: https://github.com/gowthamgmd/foodbank
- MongoDB Atlas cluster (already set up)
- Cloudinary account (for file uploads): https://cloudinary.com (free)

---

## Step 1: Deploy Backend + AI Services to Railway

### 1.1 Create Railway Account

1. Go to https://railway.app
2. Sign in with GitHub (authorize Railway to access your repos)
3. Click **"Create New Project"**

### 1.2 Import Repository

1. Select **"GitHub Repo"**
2. Search for `foodbank` repository
3. Click **"Create"**
4. Railway auto-detects the structure

### 1.3 Configure Environment Variables

In Railway dashboard:

1. Go to **"Variables"** tab
2. Add these variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/foodbank?retryWrites=true&w=majority
JWT_SECRET = your-secure-jwt-secret-key
NODE_ENV = production
AI_BASE_URL = http://localhost:5001  # Internal — Railway handles this
CLOUDINARY_CLOUD_NAME = your-cloudinary-name
CLOUDINARY_API_KEY = your-cloudinary-key
CLOUDINARY_API_SECRET = your-cloudinary-secret
PORT = 8080
ALLOWED_ORIGINS = https://your-frontend.vercel.app
```

**Get Cloudinary Keys:**
- Go to https://cloudinary.com → Sign up (free)
- Dashboard → Settings → API Keys
- Copy Cloud Name, API Key, API Secret

### 1.4 Deploy

1. Click **"Deploy"** button
2. Railway builds and deploys automatically
3. Copy the deployment URL (e.g., `https://foodbank-backend-prod.up.railway.app`)
4. Save this URL — you'll need it for the frontend

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Select `foodbank` repository
5. Click **"Import"**

### 2.2 Configure Environment Variables

1. In **Project Settings** → **"Environment Variables"**
2. Add:

```
VITE_API_URL = https://your-railway-backend-url.up.railway.app
```

Replace with your actual Railway backend URL from Step 1.4

### 2.3 Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys automatically
3. You'll get a URL like: `https://foodbank.vercel.app`

---

## Step 3: Update Environment Variables

### 3.1 Update Railway Backend ALLOWED_ORIGINS

Go back to Railway dashboard and update:

```
ALLOWED_ORIGINS = https://your-vercel-frontend-url.vercel.app
```

---

## Step 4: Verify Deployment

### 4.1 Test Frontend

1. Open `https://your-vercel-app.vercel.app`
2. Try logging in with test credentials:
   - Email: `donor@test.com`
   - Password: `password123`

### 4.2 Check Backend Connection

Open browser console (F12) and check:
- Look for API calls in Network tab
- Verify `https://your-railway-url.up.railway.app/api/*` requests succeed

### 4.3 Test File Uploads

1. Log in as admin
2. Try uploading an image in any form
3. Verify it uploads to Cloudinary (not local disk)

---

## Step 5: Database Setup (MongoDB Atlas)

If you haven't created a MongoDB Atlas cluster:

1. Go to https://mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Create database user
4. Allowlist your IP (or 0.0.0.0/0 for testing)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/foodbank`
6. Add to Railway environment variables as `MONGODB_URI`

---

## Troubleshooting

### "Network Error" or 404 in Frontend

**Problem**: Frontend can't reach backend API

**Solution**:
1. Verify `VITE_API_URL` is set in Vercel env vars
2. Check Railway deployment URL is correct
3. Verify CORS in backend allows Vercel domain
4. In backend `.env.example`:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

### "Unauthorized" or 401 Errors

**Problem**: JWT token issues

**Solution**:
1. Ensure `JWT_SECRET` is set in Railway env vars
2. Use the same secret everywhere (backend only, really)
3. Clear browser localStorage and re-login

### File Uploads Failing

**Problem**: Images not saving

**Solution**:
1. Verify Cloudinary credentials in Railway env vars
2. Test Cloudinary connection:
   ```bash
   curl -F "file=@test.jpg" https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload?api_key=KEY
   ```

### "Cannot connect to MongoDB"

**Problem**: Database connection failed

**Solution**:
1. Verify MongoDB Atlas credentials in Railway env vars
2. Check IP allowlist in MongoDB Atlas (add Railway IP)
3. Test connection string locally:
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/foodbank"
   ```

---

## Local Development (After Deployment)

To develop locally while using cloud services:

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend is proxied via `vite.config.js` to `http://localhost:8080`

### Backend

Create `backend/.env` locally:

```env
MONGODB_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/foodbank
JWT_SECRET=SmartFoodBank2024_SuperSecretKey
AI_BASE_URL=http://localhost:5001
NODE_ENV=development
```

```bash
cd backend
npm install
npm start
```

### AI Services

```bash
cd ai-services
python -m venv venv
./venv/Scripts/activate  # Windows
python -m pip install -r requirements.txt
python app.py
```

---

## Continuous Deployment

Both Vercel and Railway auto-deploy when you push to `main` branch:

```bash
git add .
git commit -m "New feature"
git push origin main
```

This triggers:
1. **Vercel**: Rebuilds and deploys frontend in ~2 min
2. **Railway**: Rebuilds and deploys backend/AI in ~3 min

---

## Production Tips

1. **Never commit `.env`** — use platform variables
2. **Use strong JWT secret**: `openssl rand -hex 32`
3. **Restrict MongoDB IP allowlist** to Railway server IPs only
4. **Enable HTTPS everywhere** (both platforms default to HTTPS)
5. **Set up error monitoring**: Sentry, Datadog, or Rollbar
6. **Monitor logs**: Railway Dashboard → Logs tab

---

## Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Cloudinary account created with credentials
- [ ] Railway project created with backend + AI services
- [ ] All Railway env variables set correctly
- [ ] Backend deployed successfully on Railway
- [ ] Vercel project created with frontend
- [ ] VITE_API_URL set in Vercel env vars
- [ ] Frontend deployed successfully
- [ ] Update Railway ALLOWED_ORIGINS with frontend URL
- [ ] Test login functionality
- [ ] Test file uploads
- [ ] Verify API calls in Network tab
- [ ] Update GitHub README with live URLs

---

## Summary

| Service | Platform | URL | Purpose |
|---------|----------|-----|---------|
| Frontend | Vercel | `https://yourapp.vercel.app` | React app |
| Backend | Railway | `https://backend.up.railway.app` | Node/Express API |
| AI Services | Railway | (internal) | Flask microservices |
| Database | MongoDB Atlas | (cloud) | Data storage |
| Storage | Cloudinary | (cloud) | Image uploads |

You're now fully deployed to production! 🚀
