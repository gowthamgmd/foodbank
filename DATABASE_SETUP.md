# Database Setup Guide

Your backend has been converted to use MongoDB. Here are your options:

## ✅ Option 1: Install MongoDB Locally (Recommended for Production)

### Windows Installation:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. Install as a Windows Service (default option)
4. MongoDB will start automatically

Verify installation:
```powershell
mongod --version
```

Start MongoDB (if not running as service):
```powershell
net start MongoDB
```

## ✅ Option 2: Use Docker (Easiest)

1. **Start Docker Desktop** (if installed)
2. Run this command:
```powershell
docker run -d -p 27017:27017 --name foodbank-mongodb mongo:7
```

3. MongoDB will be available at `localhost:27017`

Stop the container:
```powershell
docker stop foodbank-mongodb
```

Remove the container:
```powershell
docker rm foodbank-mongodb
```

## ✅ Option 3: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Get your connection string
5. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodbank
```

## ✅ Option 4: Switch Back to SQLite (Simple, File-based)

If you prefer the simplicity of SQLite, I can revert the backend to use SQLite instead.
Just let me know!

## 🚀 After MongoDB is Running

1. Make sure MongoDB is running
2. Start the backend:
```powershell
cd backend
npm start
```

3. The backend will automatically:
   - Connect to MongoDB
   - Create the database
   - Create a default admin user

## 🔍 Verify MongoDB Connection

Check if MongoDB is accessible:
```powershell
# For local MongoDB
telnet localhost 27017

# Or use MongoDB Compass (GUI)
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
