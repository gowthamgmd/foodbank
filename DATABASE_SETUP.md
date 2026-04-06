# Database Setup Guide - MongoDB Atlas

Your backend uses **MongoDB Atlas** (cloud-based MongoDB). Here's how to set it up.

## ✅ Recommended: MongoDB Atlas (Cloud - Free Tier)

MongoDB Atlas is a fully managed cloud database - no installation needed!

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account (or sign in if you already have one)
3. Click "Create" to build a new cluster

### Step 2: Create a Free Cluster
1. Select **Shared** (Free tier - M0)
2. Choose your **Preferred Provider** (AWS, Google Cloud, or Azure)
3. Select a **Region** closest to your location
4. Click **Create** (takes 1-3 minutes)

### Step 3: Set Up Authentication
1. In the left sidebar, go to **Database Access**
2. Click **Add New Database User**
3. Create username: `foodbank`
4. Set password: Use a strong password (or Auto-generate)
5. Click **Add User**
6. Keep default permissions

### Step 4: Configure IP Allowlist
1. In the left sidebar, go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (for development)
   - For production, enter specific IP addresses
4. Click **Confirm**

### Step 5: Get Connection String
1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Drivers** → **Node.js** → **Version 5.0 or later**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

### Step 6: Update Environment Variables
1. Open `backend/.env`
2. Replace `MONGODB_URI` with your connection string:
```
MONGODB_URI=mongodb+srv://foodbank:yourpassword@cluster.mongodb.net/foodbank?retryWrites=true&w=majority
```

**Important**: Replace `yourpassword` with the actual password you created

### Step 7: Start Backend
```powershell
cd backend
npm start
```

The backend will automatically:
- Connect to MongoDB Atlas
- Create the database and collections
- Set up a default admin user

---

## 🔄 Alternative Options

### Option 2: Local MongoDB with Docker

If you prefer local development:

```powershell
docker run -d -p 27017:27017 --name foodbank-mongodb mongo:7
```

Then update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/foodbank
```

### Option 3: Install MongoDB Locally

1. Download from: https://www.mongodb.com/try/download/community
2. Install as Windows Service
3. Update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/foodbank
```

---

## 🔍 Verify Connection

### Using MongoDB Atlas UI:
1. Go to your cluster **Overview** page
2. Click **Collections** to view data
3. You should see the `foodbank` database with collections like `users`, `donations`, etc.

### Using MongoDB Compass (GUI):
1. Download: https://www.mongodb.com/products/compass
2. Paste your connection string
3. Click **Connect**

### Using Command Line:
```powershell
# Test connection (replace with your details)
mongosh "mongodb+srv://foodbank:password@cluster.mongodb.net/foodbank"
```

---

## ⚠️ Security Best Practices

1. **Never commit `.env` file** to git (already in `.gitignore`)
2. **Use strong passwords** for database users
3. **Restrict IP access** in production (don't use "Allow from Anywhere")
4. **Rotate credentials** regularly
5. **Use connection strings** in environment variables, never hardcode them
6. **Enable IP whitelist** for production deployments

---

## 🆘 Troubleshooting

**Connection Timeout?**
- Check IP allowlist in Network Access
- Verify username/password in connection string
- Ensure you're using the correct cluster URI

**Authentication Failed?**
- Double-check username and password
- Verify you're connecting to the right database
- Check that user has proper permissions in Database Access

**Still Having Issues?**
- Check MongoDB Atlas status page: https://status.mongodb.com
- Review backend logs for error messages
- Verify `.env` file is in `backend/` directory
# Download from: https://www.mongodb.com/try/download/compass
```

## ⚡ Quick Start with Docker Compose

The easiest way if you have Docker:
```powershell
# Start all services including MongoDB
docker-compose up

# This will start:
# - MongoDB
# - Backend
# - Frontend  
# - AI Services
```

---

**Current Status**: Your backend code is ready for MongoDB. Just choose an option above and start MongoDB!
