# Render Deployment Checklist

Quick reference for deploying Smart Food Bank to Render.com

---

## ✅ Pre-Deployment Setup

### Frontend (Vercel or Render)
- [x] React + Vite configured
- [x] Build command: `npm run build` 
- [x] Output directory: `dist`
- [ ] Update `vercel.json` with backend URL after deployment

### Backend (Render)
- [x] Node.js + Express ready
- [x] MongoDB Atlas connection tested locally
- [x] Start command: `npm start`
- [x] No build command needed

### AI Services (Optional - Flask)
- [x] Python + Prophet models ready
- [ ] Deploy separately if needed

---

## 🚀 Render Backend Deployment Steps

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Click **New → Web Service**
3. Connect GitHub repo: `gowthamgmd/foodbank`

### Step 2: Configure Service
| Setting | Value |
|---------|-------|
| **Name** | `foodbank-backend` |
| **Runtime** | Node |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | *(leave empty)* |
| **Start Command** | `npm start` |
| **Region** | Oregon (US West) |

### Step 3: Add Environment Variables
Click **Environment** and add:

```
MONGODB_URI=mongodb+srv://gow2026:gow1120@cluster0.izogyqx.mongodb.net/?databaseName=Cluster0
JWT_SECRET=<generate-strong-random-key>
NODE_ENV=production
AI_BASE_URL=<your-ai-service-url>
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://your-frontend-url.render.com
CLOUDINARY_CLOUD_NAME=<your-value>
CLOUDINARY_API_KEY=<your-value>
CLOUDINARY_API_SECRET=<your-value>
```

### Step 4: Deploy
- Click **Create Web Service**
- Wait for build and deployment (~2-3 minutes)
- Your backend URL: `https://foodbank-backend.onrender.com`

---

## 🎨 Frontend Deployment on Vercel

### Step 1: Add Vercel Configuration
Update `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://foodbank-backend.onrender.com"
  },
  "routes": [
    {
      "src": "/(?!api).*",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import **GitHub repo** `gowthamgmd/foodbank`
3. Set **Root Directory**: `frontend`
4. Set **Output Directory**: `dist`
5. Add environment: `VITE_API_URL=https://foodbank-backend.onrender.com`
6. Deploy!

Your frontend URL will be: `https://your-project.vercel.app`

---

## 🔗 After Deployment

1. **Test API connection:**
   - Login page should work
   - Try registering a user
   - Check admin dashboard

2. **Update CORS in Backend:**
   If you see CORS errors, add your Vercel frontend URL to `ALLOWED_ORIGINS` in Render environment variables

3. **Verify Environment Variables:**
   ```bash
   # In Render dashboard, check logs for:
   # ✅ Connected to MongoDB
   # ✅ Server running on port xxxx
   ```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `ENOTFOUND _mongodb._tcp...` | Missing `MONGODB_URI` env var in Render |
| Build fails with `npm build` error | Remove build command (leave empty) |
| CORS errors on frontend | Add frontend URL to `ALLOWED_ORIGINS` |
| App times out during startup | Check MongoDB firewall rules allow Render IPs |
| 500 errors but local works | Check env vars copied correctly to Render |

---

## 📊 Service URLs After Deployment

| Service | URL |
|---------|-----|
| **Backend** | `https://foodbank-backend.onrender.com` |
| **Frontend** | `https://foodbank.vercel.app` *(adjust name)* |
| **API Base** | `https://foodbank-backend.onrender.com/api` |

---

## 🔐 Security Reminders

✅ Never commit `.env` files (`.gitignore` already excludes them)  
✅ Never share JWT_SECRET or MongoDB credentials  
✅ Use strong random JWT_SECRET in production  
✅ Regenerate API keys if accidentally exposed in repo history  

---

**Need help?** Check logs in Render dashboard → Logs tab for detailed error messages.
