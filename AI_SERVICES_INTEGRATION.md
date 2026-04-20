# AI Services Integration Guide

## Overview
AI services are now **integrated directly into the backend**. When you start the backend, the AI services automatically spawn as a child process.

## Architecture
```
Backend (Node.js/Express)
    ├── Spawn AI Services (Python/Flask)
    │   ├── /predict  (demand forecasting)
    │   └── /assess   (food quality assessment)
    └── Proxy routes at /api/ai/*
```

## Quick Start

### Windows
```bash
start-dev.bat
```

### Mac/Linux
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## Prerequisites

### Python Requirements
- Python 3.8+ installed
- pip package manager

### Install AI Dependencies (One-time setup)
```bash
cd backend/ai
pip install -r requirements.txt
# or
pip3 install -r requirements.txt
cd ../..
```

## What Gets Started

When you run the backend, you'll see:
```
🤖 Starting integrated AI services...
[AI Service] WARNING in app.run() from the werkzeug server.
[AI Service] Running on http://0.0.0.0:5001
✅ AI Services started successfully
🚀 SMART FOOD BANK - Backend & Integrated AI Services running on http://localhost:8080
   📊 AI Services (Predict/Assess): http://localhost:5001
   📡 Backend API Proxy: http://localhost:8080/api/ai
```

## Endpoints

### AI Service Endpoints (Direct)
- `POST /predict` - Demand forecasting
- `POST /assess` - Food quality assessment
- `GET /health` - Health check

### Backend Proxy Routes
- `POST /api/ai/forecast` - Forward to AI `/predict`
- `POST /api/ai/assess-image` - Forward to AI `/assess` with image
- `GET /api/ai/demand-forecast` - Get demand forecast

## File Structure
```
backend/
├── ai/
│   ├── app.py                    # Flask application
│   ├── train.py                  # Model training script
│   ├── dataset.py                # Dataset generation
│   ├── requirements.txt           # Python dependencies
│   ├── data/
│   │   └── historical_demand.csv  # Training data
│   └── models/
│       ├── prophet_grains.json
│       ├── prophet_dairy.json
│       └── ... (other category models)
├── server.js                      # Backend with AI spawning
└── package.json
```

## Troubleshooting

### "Python executable not found"
```
# Make sure Python is in your PATH
python --version
# or
python3 --version
```

### "No module named 'flask'"
```
# Install dependencies
cd backend/ai
pip install -r requirements.txt
```

### AI Service won't start
```
# Test Flask directly
cd backend/ai
python app.py
# Should see: Running on http://0.0.0.0:5001
```

### Backend starts but AI Services are missing
The backend will start even if AI services fail (with a warning). Check:
1. Python is installed and in PATH
2. Run: `pip install -r backend/ai/requirements.txt`
3. Check backend console for error messages

## Performance Notes
- AI services start automatically (3-5 seconds on first load due to Prophet model imports)
- Subsequent requests are much faster
- AI service runs on port 5001 (default)
- Backend proxies requests from port 8080 to 5001

## Stopping Services

### Windows
Close the terminal windows or press Ctrl+C

### Mac/Linux
Press Ctrl+C to kill all processes

The backend automatically terminates the AI service child process on shutdown.

## Development Tips

### Run AI Services Separately (for debugging)
```bash
cd backend/ai
python app.py
```

### Deploy with Docker
See `docker-compose.yml` - AI services are included in the backend container.

### Production Deployment
The integrated approach is ideal for:
- Easier deployment (single process to manage)
- Reduced infrastructure complexity
- Automatic lifecycle management
