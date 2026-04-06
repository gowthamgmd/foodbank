# Quick Start Guide - MongoDB is Already Running! ✅

## Your Current Status:
- ✅ MongoDB Server: **RUNNING** (Windows Service)
- ✅ MongoDB Compass: **INSTALLED**
- ✅ AI Services: **RUNNING** on port 5001
- ⏳ Backend: Ready to start
- ⏳ Frontend: Ready to start

## Step-by-Step Instructions:

### 1️⃣ Verify MongoDB with Compass (Optional)

1. Open **MongoDB Compass**
2. Connect to: `mongodb://localhost:27017`
3. You should see a successful connection
4. You'll see the `foodbank` database appear after starting the backend

### 2️⃣ Start the Backend

Open a new PowerShell terminal and run:

```powershell
cd "C:\Users\g2621\Desktop\food bank - Copy\backend"
npm start
```

The backend will:
- ✅ Connect to MongoDB
- ✅ Create the `foodbank` database
- ✅ Create a default admin user
- ✅ Start on http://localhost:8080

### 3️⃣ Start the Frontend

Open another PowerShell terminal and run:

```powershell
cd "C:\Users\g2621\Desktop\food bank - Copy\frontend"
npm run dev
```

Frontend will start on http://localhost:3000

### 4️⃣ Login and Test

1. Go to: **http://localhost:3000**
2. Login with:
   - **Email**: admin@foodbank.com
   - **Password**: admin123

## 🎯 All-in-One Start Script

Or simply double-click: **`start-dev.bat`** in the project root folder!

## 📊 View Your Data in MongoDB Compass

After the backend starts:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click on `foodbank` database
4. You'll see collections:
   - users
   - donations
   - inventory
   - beneficiaries
   - parcels
   - pickups
   - feedbacks

## 🔧 MongoDB Management

**Check if MongoDB is running:**
```powershell
Get-Service MongoDB
```

**Stop MongoDB:**
```powershell
Stop-Service MongoDB
```

**Start MongoDB:**
```powershell
Start-Service MongoDB
```

**Restart MongoDB:**
```powershell
Restart-Service MongoDB
```

---

**You're all set! MongoDB is ready. Just start the backend and frontend now! 🚀**
