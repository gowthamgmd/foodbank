#!/bin/bash

# AWS EC2 Backend Quick Setup Script
# Usage: bash ec2-setup.sh

set -e

echo "🚀 Food Bank Backend - EC2 Setup Script"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on EC2
echo -e "${BLUE}Checking EC2 environment...${NC}"
if ! curl -s http://169.254.169.254/latest/meta-data/instance-id &> /dev/null; then
    echo -e "${YELLOW}Warning: May not be running on EC2${NC}"
fi

# Install Node.js
echo -e "${BLUE}Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install nodejs -y 2>/dev/null || sudo apt-get install nodejs -y
    echo -e "${GREEN}✅ Node.js installed${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed: $(node -v)${NC}"
fi

# Install Python 3
echo -e "${BLUE}Installing Python 3...${NC}"
if ! command -v python3 &> /dev/null; then
    sudo yum install python3 python3-pip -y 2>/dev/null || sudo apt-get install python3 python3-pip -y
    echo -e "${GREEN}✅ Python 3 installed${NC}"
else
    echo -e "${GREEN}✅ Python 3 already installed: $(python3 --version)${NC}"
fi

# Install Git
echo -e "${BLUE}Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo yum install git -y 2>/dev/null || sudo apt-get install git -y
    echo -e "${GREEN}✅ Git installed${NC}"
else
    echo -e "${GREEN}✅ Git already installed: $(git --version)${NC}"
fi

# Install PM2
echo -e "${BLUE}Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

# Install MongoDB
echo -e "${BLUE}Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo "MongoDB not found. Install it with:"
    echo "  sudo yum install mongodb-org -y"
    echo "  sudo systemctl start mongod"
else
    echo -e "${GREEN}✅ MongoDB already installed${NC}"
    sudo systemctl status mongod | grep running && echo -e "${GREEN}✅ MongoDB is running${NC}" || echo -e "${YELLOW}⚠️  MongoDB is not running${NC}"
fi

echo ""
echo -e "${BLUE}Setting up application directory...${NC}"

# Create application directory
if [ ! -d "/home/ec2-user/food-bank" ]; then
    echo "Cloning repository..."
    cd /home/ec2-user
    git clone <YOUR_REPO_URL> food-bank
    cd food-bank
else
    echo -e "${YELLOW}Application directory already exists${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd /home/ec2-user/food-bank/backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Install AI dependencies
echo -e "${BLUE}Installing AI service dependencies...${NC}"
cd /home/ec2-user/food-bank/backend/ai
pip3 install -r requirements.txt
echo -e "${GREEN}✅ AI dependencies installed${NC}"

# Setup environment file
echo -e "${BLUE}Setting up .env file...${NC}"
cd /home/ec2-user/food-bank/backend
if [ ! -f ".env" ]; then
    cat > .env << EOF
MONGODB_URI=mongodb://3.108.155.142:27017/foodbank
AI_BASE_URL=http://3.108.155.142:5001
BACKEND_HOST=0.0.0.0
JWT_SECRET=$(openssl rand -base64 32)
PORT=8080
NODE_ENV=production
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi

# Start with PM2
echo -e "${BLUE}Configuring PM2...${NC}"
pm2 start npm --name "food-bank-backend" --cwd /home/ec2-user/food-bank/backend -- start
pm2 startup
pm2 save
echo -e "${GREEN}✅ PM2 configured${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Backend Status:"
pm2 status
echo ""
echo "🌐 Access Points:"
echo "  Backend: http://3.108.155.142:8080"
echo "  Health:  http://3.108.155.142:8080/health"
echo "  API:     http://3.108.155.142:8080/api"
echo ""
echo "📝 Useful Commands:"
echo "  pm2 status              - Check status"
echo "  pm2 logs                - View logs"
echo "  pm2 restart all         - Restart all apps"
echo "  pm2 stop all            - Stop all apps"
echo ""
echo "  curl http://3.108.155.142:8080/health"
echo ""
