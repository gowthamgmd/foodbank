# AWS EC2 Backend Deployment Guide

## Current Configuration
- **Backend URL**: http://3.108.155.142:8080
- **MongoDB**: mongodb://3.108.155.142:27017/foodbank
- **AI Services**: http://3.108.155.142:5001
- **Instance IP**: 3.108.155.142

## EC2 Security Group Configuration

### Required Inbound Rules:
```
Port 8080  | HTTP   | 0.0.0.0/0      | Backend API
Port 5001  | HTTP   | 0.0.0.0/0      | AI Services
Port 27017 | TCP    | 0.0.0.0/0      | MongoDB
Port 3000  | HTTP   | 0.0.0.0/0      | Frontend
Port 22    | SSH    | Your IP/0.0.0.0 | SSH Access
```

## EC2 Instance Setup

### 1. Connect to EC2 Instance
```bash
ssh -i your-key.pem ec2-user@3.108.155.142
# or
ssh -i your-key.pem ubuntu@3.108.155.142  # for Ubuntu AMI
```

### 2. Install Node.js & npm
```bash
# For Amazon Linux / Amazon Linux 2
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# For Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install Python & pip
```bash
# For Amazon Linux
sudo yum install python3 python3-pip -y

# For Ubuntu
sudo apt-get install python3 python3-pip -y
```

### 4. Install Git
```bash
# For Amazon Linux
sudo yum install git -y

# For Ubuntu
sudo apt-get install git -y
```

## Deploy Application on EC2

### 1. Clone or Upload Repository
```bash
cd /home/ec2-user  # or appropriate home directory
git clone <your-repo-url> food-bank
cd food-bank
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Python AI Services Dependencies
```bash
cd ai
pip3 install -r requirements.txt
cd ..
```

### 4. Create/Update .env File
```bash
cat > .env << EOF
MONGODB_URI=mongodb://3.108.155.142:27017/foodbank
AI_BASE_URL=http://3.108.155.142:5001
BACKEND_HOST=0.0.0.0
JWT_SECRET=$(openssl rand -base64 32)
PORT=8080
NODE_ENV=production
EOF
```

### 5. Start Backend (Option 1: Screen)
```bash
# Install screen
sudo yum install screen -y  # Amazon Linux
# sudo apt-get install screen -y  # Ubuntu

# Start in background
screen -S backend
cd /home/ec2-user/food-bank/backend
npm start
# Ctrl+A then D to detach
```

### 5. Start Backend (Option 2: PM2 - Recommended for Production)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend with PM2
cd /home/ec2-user/food-bank/backend
pm2 start npm --name "food-bank-backend" -- start

# Save PM2 processes to startup
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs food-bank-backend
```

### 6. Install MongoDB on EC2 (if not running separately)
```bash
# For Amazon Linux 2
echo "[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://repo.mongodb.org/yum/KEYS" | sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# For Ubuntu
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Verification Steps

### 1. Check Backend Status
```bash
curl http://3.108.155.142:8080/health
```
Expected response:
```json
{
  "status": "ok",
  "backend": "running",
  "mongodb": "connected",
  "environment": "production",
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

### 2. Check Debug Info
```bash
curl http://3.108.155.142:8080/api/debug/status
```

### 3. Check MongoDB Connection
```bash
curl http://3.108.155.142:8080/health | grep mongodb
```

### 4. Check AI Services
```bash
curl http://3.108.155.142:5001/health
```

### 5. Test Authentication (Register)
```bash
curl -X POST http://3.108.155.142:8080/api/auth/register/donor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 6. Test Login
```bash
curl -X POST http://3.108.155.142:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Monitoring & Logs

### Using PM2
```bash
# View logs
pm2 logs food-bank-backend

# View real-time monitoring
pm2 monit

# View all processes
pm2 list

# Restart
pm2 restart food-bank-backend

# Stop
pm2 stop food-bank-backend
```

### Using Screen
```bash
# Reattach to running screen
screen -r backend

# List screens
screen -ls
```

## Backend Logs Location
```bash
# PM2 logs
~/.pm2/logs/food-bank-backend-out.log
~/.pm2/logs/food-bank-backend-error.log

# Or view real-time
pm2 logs --lines 100 --nostream
```

## Common Issues & Fixes

### Port Already in Use
```bash
# Find what's using port 8080
sudo lsof -i :8080

# Kill the process
sudo kill -9 <PID>
```

### MongoDB Connection Failed
```bash
# Check MongoDB service status
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Permission Denied Errors
```bash
# Run with sudo or fix permissions
sudo chown -R $USER:$USER /home/ec2-user/food-bank
```

### Update EC2 Instance
```bash
# For Amazon Linux
sudo yum update -y

# For Ubuntu
sudo apt-get update && sudo apt-get upgrade -y
```

## Backup & Maintenance

### Backup MongoDB
```bash
mongodump --out /backup/mongodb-$(date +%Y%m%d)
```

### Check Disk Space
```bash
df -h
```

### Check Memory & CPU
```bash
top
ps aux | grep node
```

## Frontend Configuration for EC2 Backend

Frontend should connect to:
```
API_URL=http://3.108.155.142:8080
```

This is already configured in:
- `.env.development`: `VITE_API_URL=http://3.108.155.142:8080`
- `.env.production`: `VITE_API_URL=http://3.108.155.142:8080`

## Production Checklist

- [ ] Security group configured with correct ports
- [ ] MongoDB installed and running
- [ ] Node.js and Python 3 installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] AI dependencies installed (`pip install -r ai/requirements.txt`)
- [ ] `.env` file updated with production values
- [ ] Backend started with PM2 or similar
- [ ] Health check returning `"status": "ok"`
- [ ] MongoDB connection verified
- [ ] Frontend configured to use EC2 backend URL
- [ ] SSL/TLS certificate configured (if using HTTPS)
- [ ] Firewall rules reviewed
- [ ] Backups configured

## Next Steps

1. SSH into EC2 instance
2. Follow deployment steps above
3. Run verification commands
4. Check logs for any errors
5. Deploy frontend to connect to backend

Your backend is ready for production deployment on EC2!
