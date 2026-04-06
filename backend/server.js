const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const multer = require('multer');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://foodbank:password@foodbank-cluster.mongodb.net/foodbank?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'SmartFoodBank2024_SuperSecretKey';
const PORT = process.env.PORT || 8080;
const AI_BASE_URL = process.env.AI_BASE_URL || 'http://localhost:5001';
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// Mongoose Models/Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['DONOR', 'BENEFICIARY', 'ADMIN'] }
}, { timestamps: true });

const DonationSchema = new mongoose.Schema({
    itemName: String,
    description: String, // Description of food (e.g., "leftover wedding food")
    foodCategory: String, // Category: Cooked Meals, Packaged Food, Fresh Produce, etc.
    category: String, // Legacy field
    quantity: Number,
    unit: String,
    status: { type: String, default: 'PENDING' }, // PENDING, APPROVED, REJECTED, PICKED_UP, DISTRIBUTED
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    foodPreparedTime: Date, // Exact timestamp when food was prepared - hours ago calculated dynamically
    imageUrl: String, // URL to uploaded food image
    pickupAddress: String,
    pickupDate: Date,
    aiAssessment: {
        qualityStatus: String, // FRESH, PARTIAL, SPOILED
        shelfLifeDays: Number,
        confidence: Number,
        assessedAt: Date,
        foodPreparedTime: Date // Store food prepared time for AI assessment context
    }
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comments: String
}, { timestamps: true });

const InventorySchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: Number,
    unit: String,
    foodPreparedTime: Date, // Exact timestamp when food was prepared
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    qualityStatus: { type: String, default: 'FRESH' }, // FRESH, PARTIAL, SPOILED
    imageUrl: String,
    status: { type: String, default: 'AVAILABLE' }, // AVAILABLE, ALLOCATED, DISTRIBUTED
    location: String
}, { timestamps: true });

const BeneficiarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizationName: String, // Name of the organization/trust
    organizationDetails: String, // Details about the organization
    peopleSupported: Number, // Total number of people they support
    familySize: Number, // Legacy field
    dietaryRestrictions: String,
    address: String,
    phoneNumber: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

const ParcelSchema = new mongoose.Schema({
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    items: [{ name: String, quantity: Number }], // Array of items
    status: { type: String, default: 'PREPARED' }, // PREPARED, COLLECTED
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const PickupSchema = new mongoose.Schema({
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduledDate: Date,
    address: String,
    status: { type: String, default: 'SCHEDULED' }, // SCHEDULED, IN_TRANSIT, COMPLETED, CANCELLED
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const FoodRequestSchema = new mongoose.Schema({
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantityRequired: Number,
    unit: String,
    totalMembers: Number,
    numberOfKids: Number,
    numberOfElderly: Number,
    preferredFoodCategories: [String],
    urgencyLevel: { type: String, default: 'MEDIUM' }, // LOW, MEDIUM, HIGH
    status: { type: String, default: 'PENDING' }, // PENDING, FULFILLED, PARTIALLY_FULFILLED, CANCELLED
    notes: String
}, { timestamps: true });

// Create Models
const User = mongoose.model('User', UserSchema);
const Donation = mongoose.model('Donation', DonationSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Inventory = mongoose.model('Inventory', InventorySchema);
const Beneficiary = mongoose.model('Beneficiary', BeneficiarySchema);
const Parcel = mongoose.model('Parcel', ParcelSchema);
const Pickup = mongoose.model('Pickup', PickupSchema);
const FoodRequest = mongoose.model('FoodRequest', FoodRequestSchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    // Skip auth for login and register routes
    if (req.path.startsWith('/api/auth/')) {
        return next(); 
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

const requireRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
    next();
};

app.use(authenticateToken);

// ------------- PUBLIC ROUTES (Excluded in Middleware) -------------

app.post('/api/auth/register/:role', async (req, res) => {
    try {
        const { email, password, name, organizationName, organizationDetails, peopleSupported, address, phone } = req.body;
        const role = req.params.role.toUpperCase();
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({ email, password: hashedPassword, name, role });
        
        // Create Beneficiary profile if role is BENEFICIARY
        if (role === 'BENEFICIARY') {
            await Beneficiary.create({
                userId: user._id,
                organizationName: organizationName || name,
                organizationDetails,
                peopleSupported,
                address,
                phoneNumber: phone,
                status: 'ACTIVE'
            });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ------------- PROTECTED ROUTES -------------

// Donations
app.get('/api/donations', async (req, res) => {
    const donations = await Donation.find({ donorId: req.user.id }).populate('donorId', 'name email');
    res.json(donations);
});

app.get('/api/donations/all', requireRole(['ADMIN']), async (req, res) => {
    const donations = await Donation.find().populate('donorId', 'name email');
    res.json(donations);
});

// Get available donations for beneficiaries
app.get('/api/donations/available', async (req, res) => {
    try {
        const donations = await Donation.find({ 
            status: { $in: ['APPROVED', 'PENDING'] }
        }).populate('donorId', 'name email');
        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single donation by ID
app.get('/api/donations/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donorId', 'name email');
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/donations', requireRole(['DONOR']), async (req, res) => {
    try {
        // Calculate foodPreparedTime from foodPreparedHoursAgo
        let foodPreparedTime = null;
        if (req.body.foodPreparedHoursAgo !== undefined && req.body.foodPreparedHoursAgo !== null) {
            const now = new Date();
            foodPreparedTime = new Date(now.getTime() - req.body.foodPreparedHoursAgo * 60 * 60 * 1000);
        }
        
        const donation = await Donation.create({ 
            ...req.body, 
            donorId: req.user.id,
            foodPreparedTime: foodPreparedTime
        });
        
        // Create pickup entry automatically
        if (req.body.pickupDate && req.body.pickupAddress) {
            await Pickup.create({
                donationId: donation._id,
                donorId: req.user.id,
                scheduledDate: req.body.pickupDate,
                address: req.body.pickupAddress,
                status: 'SCHEDULED'
            });
        }
        
        // Add to inventory automatically when donation is created
        await Inventory.create({
            name: donation.itemName || req.body.items?.[0]?.name,
            category: donation.foodCategory || donation.category,
            quantity: donation.quantity || req.body.items?.[0]?.quantity,
            unit: donation.unit,
            foodPreparedTime: foodPreparedTime,
            donorId: req.user.id,
            qualityStatus: 'FRESH',
            imageUrl: donation.imageUrl,
            status: 'AVAILABLE'
        });
        
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/donations/:id/status', requireRole(['ADMIN', 'DONOR']), async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status },
            { new: true }
        );
        
        // Update inventory quality when approved
        if (req.body.status === 'APPROVED') {
            await Inventory.findOneAndUpdate(
                { donorId: donation.donorId, name: donation.itemName },
                { qualityStatus: 'FRESH' }
            );
        }
        // Remove from inventory when rejected
        if (req.body.status === 'REJECTED') {
            await Inventory.findOneAndDelete(
                { donorId: donation.donorId, name: donation.itemName }
            );
        }
        
        res.json({ success: true, donation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload donation image
app.post('/api/donations/upload-image', requireRole(['DONOR']), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI assessment for donation
app.post('/api/donations/:id/ai-assess', requireRole(['ADMIN']), async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation || !donation.imageUrl) {
            return res.status(400).json({ message: 'Donation has no image' });
        }
        
        const assessment = req.body.assessment;
        donation.aiAssessment = {
            ...assessment,
            foodPreparedTime: donation.foodPreparedTime, // Include food prepared time for reference
            assessedAt: new Date()
        };
        
        // Auto-approve if fresh, reject if spoiled
        if (assessment.qualityStatus === 'FRESH') {
            donation.status = 'APPROVED';
        } else if (assessment.qualityStatus === 'SPOILED') {
            donation.status = 'REJECTED';
        }
        
        await donation.save();
        
        // Update inventory quality status based on AI assessment
        await Inventory.findOneAndUpdate(
            { donorId: donation.donorId, name: donation.itemName },
            { qualityStatus: assessment.qualityStatus, imageUrl: donation.imageUrl }
        );
        
        // Remove from inventory if spoiled
        if (assessment.qualityStatus === 'SPOILED') {
            await Inventory.findOneAndDelete(
                { donorId: donation.donorId, name: donation.itemName }
            );
        }
        
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- AI PROXY ROUTES -------------

app.post('/api/ai/forecast', requireRole(['ADMIN']), async (req, res) => {
    try {
        const response = await axios.post(`${AI_BASE_URL}/predict`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('AI forecast error:', error.message);
        res.status(502).json({ message: 'AI Service unreachable', error: error.message });
    }
});

app.post('/api/ai/assess-image', requireRole(['ADMIN', 'DONOR']), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const FormData = require('form-data');
        const fs = require('fs');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path), req.file.originalname);
        
        const response = await axios.post(`${AI_BASE_URL}/assess`, formData, {
            headers: formData.getHeaders()
        });
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json(response.data);
    } catch (error) {
        console.error('AI assess error:', error.message);
        res.status(502).json({ message: 'AI Service unreachable', error: error.message });
    }
});

// Demand forecasting based on inventory and requests
app.get('/api/ai/demand-forecast', requireRole(['ADMIN']), async (req, res) => {
    try {
        // Get historical data
        const [donations, requests, inventory] = await Promise.all([
            Donation.find({ status: 'APPROVED' }).limit(100),
            FoodRequest.find().limit(100),
            Inventory.find()
        ]);
        
        // Prepare data for forecasting
        const forecastData = {
            donations: donations.length,
            requests: requests.length,
            inventory: inventory.length,
            categories: {}
        };
        
        // Group by category
        donations.forEach(d => {
            const cat = d.foodCategory || d.category || 'Other';
            forecastData.categories[cat] = (forecastData.categories[cat] || 0) + 1;
        });
        
        // Call AI service
        const response = await axios.post(`${AI_BASE_URL}/predict`, forecastData);
        res.json(response.data);
    } catch (error) {
        console.error('Demand forecast error:', error.message);
        res.status(502).json({ message: 'AI Service unreachable', error: error.message });
    }
});

// Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const f = await Feedback.create({ ...req.body, userId: req.user.id });
        res.json(f);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------- INVENTORY ROUTES -------------
app.get('/api/inventory', requireRole(['ADMIN']), async (req, res) => {
    try {
        const inventory = await Inventory.find().populate('donorId', 'name email');
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/inventory/expiring', requireRole(['ADMIN']), async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Find items where foodPreparedTime is more than 24 hours ago (no longer safe)
        const expiring = await Inventory.find({
            foodPreparedTime: { $lte: oneDayAgo },
            status: 'AVAILABLE'
        });
        res.json(expiring);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/inventory', requireRole(['ADMIN']), async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/inventory/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
        const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/inventory/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
        await Inventory.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/inventory/upload-image', requireRole(['ADMIN']), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- BENEFICIARY ROUTES -------------
app.get('/api/beneficiaries', requireRole(['ADMIN']), async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.find().populate('userId', 'name email');
        res.json(beneficiaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/beneficiaries/:id', async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findById(req.params.id).populate('userId', 'name email');
        res.json(beneficiary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/beneficiaries/:id/recommendations', async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findById(req.params.id);
        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }
        
        // Get available inventory items based on family size and dietary restrictions
        const inventory = await Inventory.find({ status: 'AVAILABLE' }).limit(10);
        
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- FOOD REQUEST ROUTES -------------
app.post('/api/food-requests', requireRole(['BENEFICIARY']), async (req, res) => {
    try {
        // Get or create beneficiary profile
        let beneficiary = await Beneficiary.findOne({ userId: req.user.id });
        if (!beneficiary) {
            // Auto-create beneficiary profile from user data
            const user = await User.findById(req.user.id);
            beneficiary = await Beneficiary.create({
                userId: user._id,
                organizationName: user.name,
                status: 'ACTIVE'
            });
        }
        
        const foodRequest = await FoodRequest.create({
            ...req.body,
            beneficiaryId: beneficiary._id,
            userId: req.user.id
        });
        
        res.json(foodRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/food-requests', async (req, res) => {
    try {
        let query = {};
        
        // Beneficiaries see their own requests
        if (req.user.role === 'BENEFICIARY') {
            query.userId = req.user.id;
        }
        // Donors and admins see all requests
        
        const requests = await FoodRequest.find(query)
            .populate('beneficiaryId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/food-requests/:id', async (req, res) => {
    try {
        const request = await FoodRequest.findById(req.params.id)
            .populate('beneficiaryId')
            .populate('userId', 'name email');
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/food-requests/:id/status', requireRole(['ADMIN']), async (req, res) => {
    try {
        const request = await FoodRequest.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/food-requests/:id', requireRole(['BENEFICIARY', 'ADMIN']), async (req, res) => {
    try {
        await FoodRequest.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- PARCEL ROUTES -------------
app.post('/api/parcels', requireRole(['ADMIN']), async (req, res) => {
    try {
        const parcel = await Parcel.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.json(parcel);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/parcels/beneficiary/:id', async (req, res) => {
    try {
        const parcels = await Parcel.find({ beneficiaryId: req.params.id });
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/parcels', requireRole(['ADMIN']), async (req, res) => {
    try {
        const parcels = await Parcel.find();
        res.json(parcels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- PICKUP ROUTES -------------
app.get('/api/pickups', requireRole(['ADMIN']), async (req, res) => {
    try {
        const pickups = await Pickup.find()
            .populate('donationId')
            .populate('donorId', 'name email');
        res.json(pickups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pickups', requireRole(['ADMIN']), async (req, res) => {
    try {
        const pickup = await Pickup.create(req.body);
        res.json(pickup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/pickups/:id/status', requireRole(['ADMIN']), async (req, res) => {
    try {
        await Pickup.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update pickup details
app.patch('/api/pickups/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
        const updated = await Pickup.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('donationId')
            .populate('donorId', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete pickup
app.delete('/api/pickups/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
        await Pickup.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single pickup
app.get('/api/pickups/:id', requireRole(['ADMIN']), async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.id)
            .populate('donationId')
            .populate('donorId', 'name email');
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }
        res.json(pickup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------- USER/PROFILE ROUTES -------------
app.get('/api/users/donors', requireRole(['ADMIN']), async (req, res) => {
    try {
        const donors = await User.find({ role: 'DONOR' }).select('name email createdAt');
        res.json(donors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/beneficiaries', requireRole(['ADMIN']), async (req, res) => {
    try {
        const beneficiaries = await User.find({ role: 'BENEFICIARY' }).select('name email createdAt');
        res.json(beneficiaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/profile', async (req, res) => {
    try {
        const { name, email } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.user.id, 
            { name, email }, 
            { new: true }
        ).select('name email role');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/uploads', express.static('uploads'));

// Initialize database and start server
async function startServer() {
    try {
        // Wait for MongoDB connection
        await mongoose.connection.asPromise();
        
        // Create default admin user if not exists
        const adminExists = await User.findOne({ email: 'admin@foodbank.com' });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@foodbank.com',
                password: bcrypt.hashSync('admin123', 10),
                role: 'ADMIN'
            });
            console.log('✅ Default admin user created');
        }

        app.listen(PORT, () => {
            console.log(`🚀 SECURE Node.js Backend & AI Proxy running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();
