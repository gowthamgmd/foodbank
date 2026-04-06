# Quick Start Guide - MongoDB Atlas

## 🎯 Prerequisites

Make sure you have:
- ✅ Node.js (v16+)
- ✅ npm (v8+)  
- ✅ MongoDB Atlas account (free)
- ✅ Git

---

## Step-by-Step Setup

### 1️⃣ Setup MongoDB Atlas (5 minutes)

Follow the detailed guide in **DATABASE_SETUP.md**:

1. Create account at https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Set up authentication (username: `foodbank`)
4. Configure IP allowlist (Allow from Anywhere for dev)
5. Copy connection string

**Example connection string:**
```
mongodb+srv://foodbank:yourpassword@cluster.mongodb.net/foodbank?retryWrites=true&w=majority
```

### 2️⃣ Setup Backend Environment

Create `backend/.env`:

```powershell
cd backend
copy .env.example .env
notepad .env
```

Update in `.env`:
```
MONGODB_URI=mongodb+srv://foodbank:yourpassword@cluster.mongodb.net/foodbank?retryWrites=true&w=majority
JWT_SECRET=SmartFoodBank2024_SuperSecretKey
PORT=8080
NODE_ENV=development
AI_BASE_URL=http://localhost:5001
```

### 3️⃣ Install Dependencies

```powershell
cd backend
npm install
cd ../frontend
npm install
cd ../ai-services
pip install -r requirements.txt
```

### 4️⃣ Start AI Services

Open PowerShell and run:

```powershell
cd "ai-services"
python app.py
```

AI services will start on http://localhost:5001

### 5️⃣ Start Backend

Open a **NEW** PowerShell terminal and run:

```powershell
cd "backend"
npm start
```

You'll see:
```
✅ Connected to MongoDB
🚀 Node.js Backend running on http://localhost:8080
```

### 6️⃣ Start Frontend

Open another **NEW** PowerShell terminal and run:

```powershell
cd "frontend"
npm run dev
```

Frontend will start on http://localhost:3000

---

## 🚀 One-Click Start (Windows)

Or simply double-click: **`start-dev.bat`**

This starts all services automatically!

---

## 🔐 Login Credentials

After the backend starts, login with:

| Field | Value |
|-------|-------|
| Email | admin@foodbank.com |
| Password | admin123 |

---

## 📊 Access Your Data

### Using MongoDB Atlas UI:
1. Go to https://www.mongodb.com/cloud/atlas
2. Select your cluster
3. Click **Collections** tab
4. Browse the `foodbank` database

### Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Click **New Connection**
3. Paste your connection string
4. Click **Connect**

### Using Command Line:
```powershell
mongosh "mongodb+srv://foodbank:password@cluster.mongodb.net/foodbank"
```

---

## ✅ Verify Everything Works

1. Frontend: http://localhost:3000
2. Backend API: http://localhost:8080/api/donations
3. AI Services: http://localhost:5001/health
4. MongoDB Atlas: Check your cluster Collections page

---

## 🔧 Useful Commands

**Stop all services:**
```powershell
# Press Ctrl+C in each terminal
```

**Check Node/npm versions:**
```powershell
node --version
npm --version
```

**Install Python dependencies:**
```powershell
pip install -r requirements.txt
```

**View logs (backend):**
```powershell
# Check the terminal where npm start is running
```

---

## ⚠️ Common Issues

**"MONGODB_URI not found"**
- Check `.env` file exists in `backend/` folder
- Verify connection string is correct

**"Connection timeout"**
- Check IP allowlist in MongoDB Atlas
- Verify credentials in connection string

**"Port 8080 already in use"**
- Change PORT in `.env`
- Or kill the process using: `netstat -ano | findstr :8080`

**"Cannot find module"**
- Run: `npm install` in the respective folder

---

## 📚 Complete Documentation

For more details, see:
- **DATABASE_SETUP.md** - Full MongoDB Atlas setup
- **README.md** - Project overview
- **backend/server.js** - API documentation
- **frontend/src** - React components

---

**You're ready! Start the services and build something amazing! 🎉**
