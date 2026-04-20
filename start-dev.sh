#!/bin/bash

# Smart Food Bank - Development Startup Script (Integrated AI Services)

echo "🚀 Starting Smart Food Bank Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check MongoDB connection
echo "Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
  echo -e "${YELLOW}WARNING: MongoDB is not running!${NC}"
  echo "Please start MongoDB or see DATABASE_SETUP.md for installation instructions"
fi
echo ""

# Install Python dependencies for AI services (if first run)
echo "Checking AI services dependencies..."
cd backend/ai
pip install -q -r requirements.txt 2>/dev/null || pip3 install -q -r requirements.txt 2>/dev/null
cd ../..
echo -e "${GREEN}✅ AI dependencies ready${NC}"
echo ""

# Start Backend (AI Services will be spawned by Backend)
echo -e "${BLUE}Starting Backend + Integrated AI Services...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..
sleep 5

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🤖 AI Services (Integrated): http://localhost:5001"
echo "🗄️  MongoDB Atlas: mongodb+srv://cluster.mongodb.net/foodbank"
echo ""
echo "Default Admin Login:"
echo "  Email: admin@foodbank.com"
echo "  Password: admin123"
echo ""
echo -e "${YELLOW}Note: AI Services are automatically spawned by the Backend.${NC}"
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

wait
