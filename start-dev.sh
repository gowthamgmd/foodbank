#!/bin/bash

# Smart Food Bank - Development Startup Script

echo "🚀 Starting Smart Food Bank Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start AI Services
echo "${BLUE}Starting AI Services...${NC}"
cd ai-services
python app.py &
AI_PID=$!
cd ..
sleep 3

# Start Backend
echo "${BLUE}Starting Backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..
sleep 3

# Start Frontend
echo "${BLUE}Starting Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "${GREEN}✅ All services started!${NC}"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🤖 AI Services: http://localhost:5001"
echo ""
echo "Default Admin Login:"
echo "  Email: admin@foodbank.com"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "kill $AI_PID $BACKEND_PID $FRONTEND_PID; exit" INT
wait
