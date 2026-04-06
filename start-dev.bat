@echo off
REM Smart Food Bank - Development Startup Script for Windows

echo Starting Smart Food Bank Development Environment...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 1 /nobreak >nul
powershell -Command "try { $client = New-Object System.Net.Sockets.TcpClient('localhost', 27017); $client.Close(); Write-Host 'MongoDB is running' -ForegroundColor Green } catch { Write-Host 'WARNING: MongoDB is not running!' -ForegroundColor Red; Write-Host 'Please start MongoDB or see DATABASE_SETUP.md for installation instructions' -ForegroundColor Yellow }"
echo.

REM Start AI Services
echo Starting AI Services...
start "AI Services" cmd /k "cd ai-services && C:\Users\g2621\AppData\Local\Programs\Python\Python312\python.exe app.py"
timeout /t 3 /nobreak >nul

REM Start Backend
echo Starting Backend...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8080
echo 🤖 AI Services: http://localhost:5001
echo 🗄️  MongoDB Atlas: mongodb+srv://cluster.mongodb.net/foodbank
echo.
echo Default Admin Login:
echo   Email: admin@foodbank.com
echo   Password: admin123
echo.
echo If MongoDB is not running, see DATABASE_SETUP.md
echo Close the terminal windows to stop the services.
pause
