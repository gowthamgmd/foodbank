@echo off
REM Smart Food Bank - Development Startup Script (Integrated AI Services)

echo Starting Smart Food Bank Development Environment...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 1 /nobreak >nul
powershell -Command "try { $client = New-Object System.Net.Sockets.TcpClient('localhost', 27017); $client.Close(); Write-Host 'MongoDB is running' -ForegroundColor Green } catch { Write-Host 'WARNING: MongoDB is not running!' -ForegroundColor Red; Write-Host 'Please start MongoDB or see DATABASE_SETUP.md for installation instructions' -ForegroundColor Yellow }"
echo.

REM Install Python dependencies for AI services (if first run)
echo Checking AI services dependencies...
cd backend\ai
pip install -q -r requirements.txt >nul 2>&1
cd ..\..
echo ✅ AI dependencies ready
echo.

REM Start Backend (AI Services will be spawned by Backend)
echo Starting Backend + Integrated AI Services...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8080
echo 🤖 AI Services (Integrated): http://localhost:5001
echo 🗄️  MongoDB Atlas: mongodb+srv://cluster.mongodb.net/foodbank
echo.
echo Default Admin Login:
echo   Email: admin@foodbank.com
echo   Password: admin123
echo.
echo Note: AI Services are automatically spawned by the Backend.
echo Close the terminal windows to stop the services.
pause

