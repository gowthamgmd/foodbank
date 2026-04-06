# Smart Food Bank Management System

A comprehensive food bank management system with AI-powered features for demand forecasting, food quality assessment, and smart donation matching.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **AI Services**: Python Flask (Demand Forecasting, Image Assessment, Sentiment Analysis)
- **Database**: MongoDB (NoSQL document database)

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- MongoDB Atlas account (free tier: https://www.mongodb.com/cloud/atlas)
- Docker and Docker Compose (optional, for containerized deployment)

## 🚀 Quick Start (Development)

### 0. Setup MongoDB Atlas

⚠️ **First**, follow the **DATABASE_SETUP.md** guide to:
1. Create a free MongoDB Atlas account
2. Create a free M0 cluster
3. Set up authentication and IP allowlist
4. Copy your connection string
5. Create `backend/.env` with your MongoDB URI

### 1. Start AI Services

```bash
cd ai-services
pip install -r requirements.txt
python app.py
```

AI services will run on http://localhost:5001

### 2. Start Backend

First, ensure `backend/.env` contains your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://foodbank:password@cluster.mongodb.net/foodbank?retryWrites=true&w=majority
```

Then start the backend:
```bash
cd backend
npm install
npm start
```

Backend will run on http://localhost:8080

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## 🐳 Docker Deployment

To run all services together using Docker:

```bash
# First, set your MongoDB Atlas connection string in docker-compose.yml
# Update MONGODB_URI environment variable in the backend service
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080  
- AI Services: http://localhost:5001

**Note**: By default, docker-compose uses MongoDB Atlas. To use local MongoDB instead, uncomment the `mongodb` service in `docker-compose.yml`

## 👥 Default Accounts

After the backend starts, you can login with:

**Admin Account:**
- Email: admin@foodbank.com
- Password: admin123

You can register new accounts with the following roles:
- DONOR
- BENEFICIARY
- ADMIN

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/:role` - Register new user (role: donor, beneficiary, admin)
- `POST /api/auth/login` - Login

### Donations
- `GET /api/donations` - Get my donations (donor)
- `GET /api/donations/all` - Get all donations (admin)
- `POST /api/donations` - Create donation (donor)
- `PATCH /api/donations/:id/status` - Update donation status

### Inventory
- `GET /api/inventory` - Get all inventory items (admin)
- `GET /api/inventory/expiring` - Get expiring items (admin)
- `POST /api/inventory` - Add inventory item (admin)
- `PUT /api/inventory/:id` - Update inventory item (admin)
- `DELETE /api/inventory/:id` - Remove inventory item (admin)
- `POST /api/inventory/upload-image` - Upload product image (admin)

### Beneficiaries
- `GET /api/beneficiaries` - Get all beneficiaries (admin)
- `GET /api/beneficiaries/:id` - Get beneficiary details
- `GET /api/beneficiaries/:id/recommendations` - Get personalized recommendations

### Parcels
- `POST /api/parcels` - Create parcel (admin)
- `GET /api/parcels/beneficiary/:id` - Get parcels for beneficiary
- `GET /api/parcels` - Get all parcels (admin)

### Pickups
- `GET /api/pickups` - Get all pickups (admin)
- `POST /api/pickups` - Schedule pickup (admin)
- `PATCH /api/pickups/:id/status` - Update pickup status (admin)

### Users
- `GET /api/users/donors` - Get all donors (admin)
- `GET /api/users/beneficiaries` - Get all beneficiaries (admin)
- `PUT /api/users/profile` - Update user profile

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/sentiment` - Get sentiment analysis (admin)

### AI Services
- `POST /api/ai/forecast` - Demand forecasting (admin)
- `POST /api/ai/assess-image` - Food quality assessment (admin, donor)
- `GET /api/ai/match-donations` - Smart donation matching (admin)
- `GET /api/ai/sentiment` - Sentiment analysis (admin)

## 🧠 AI Features

1. **Demand Forecasting**: Predicts future demand for different food categories
2. **Food Quality Assessment**: Analyzes food images to assess freshness and shelf life
3. **Smart Matching**: Matches donations with beneficiaries based on dietary needs and family size
4. **Sentiment Analysis**: Analyzes feedback to understand beneficiary satisfaction

## 📁 Project Structure

```
.
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── context/       # React context (Auth)
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/               # Node.js backend
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   ├── uploads/           # Uploaded files
│   └── Dockerfile
│
├── ai-services/           # Python AI microservices
│   ├── app.py             # Flask application
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml     # Docker orchestration
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Request authorization middleware
- CORS configuration

## 🛠️ Development Tips

### Backend Development
- **Database**: MongoDB Atlas (cloud-based, free tier available)
- **Connection**: `mongodb+srv://username:password@cluster.mongodb.net/foodbank`
- **Setup**: Follow DATABASE_SETUP.md for MongoDB Atlas setup
- **Development**: Use `npm run dev` with nodemon for auto-restart
- **Data Management**: Use MongoDB Compass GUI or mongosh CLI
- **File Uploads**: Stored in `uploads/` directory

### Frontend Development
- API calls automatically proxied to backend during development
- Hot module replacement enabled with Vite
- Tailwind CSS for styling
- Reference documentation in QUICK_START.md

### AI Services Development
- Stub implementations for all AI features
- Ready for integration with real ML models
- Support for Prophet, CNN models, etc.
- Python 3.10+ required

## 🐛 Troubleshooting

### MongoDB connection errors
- Ensure MongoDB Atlas cluster is created
- Check IP allowlist in Network Access (allow from anywhere for dev)
- Verify connection string in `.env` file
- Replace `username` and `password` with actual credentials
- Enable authentication in Database Access

### Backend won't start
- Ensure port 8080 is available
- Check Node.js version (requires 16+)
- Verify MongoDB Atlas credentials are correct
- Check `.env` file in `backend/` directory with proper MONGODB_URI

### Frontend can't connect to backend
- Verify backend is running on http://localhost:8080
- Check browser console for CORS errors
- Ensure vite.config.js proxy is configured correctly
- Try accessing http://localhost:8080/api/donations directly

### MongoDB Atlas connection timeout
- Check IP allowlist (must include your IP)
- Verify username and password in connection string
- Ensure cluster is running (check Atlas dashboard)
- Review backend AI_BASE_URL environment variable

## 📝 License

This project is for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for community food banks**
