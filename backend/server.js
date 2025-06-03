const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const cors = require("cors")
const path = require("path")
const http = require("http")
const socketIo = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 3000

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://hsgf7667:villan7667@cluster7667.h95hy.mongodb.net/explorejharkhand?retryWrites=true&w=majority&appName=Cluster7667",
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err))

// Enhanced Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canManageAttractions: { type: Boolean, default: true },
    canManageGuides: { type: Boolean, default: true },
    canManageReviews: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: false },
  },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Admin = mongoose.model("Admin", adminSchema)

// Enhanced User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  phone: { type: String },
  role: { type: String, enum: ["user", "traveler", "contributor", "guide"], default: "user" },
  location: { type: String },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  preferences: {
    favoriteCategories: [String],
    travelStyle: String,
    budget: String,
  },
  stats: {
    reviewsCount: { type: Number, default: 0 },
    placesVisited: { type: Number, default: 0 },
    contributionsCount: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

// Enhanced Attractions Schema
const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  district: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  entryFee: { type: String, default: "Free" },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
  images: [String],
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  facilities: [String],
  bestTimeToVisit: String,
  duration: String,
  difficulty: { type: String, enum: ["Easy", "Moderate", "Difficult"] },
  tags: [String],
  nearbyAttractions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attraction" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Attraction = mongoose.model("Attraction", attractionSchema)

// Enhanced Tourist Guides Schema
const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  languages: [String],
  specialization: { type: String, required: true },
  location: { type: String, required: true },
  bio: { type: String },
  profileImage: { type: String },
  certifications: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalTours: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  availability: {
    monday: { available: Boolean, slots: [String] },
    tuesday: { available: Boolean, slots: [String] },
    wednesday: { available: Boolean, slots: [String] },
    thursday: { available: Boolean, slots: [String] },
    friday: { available: Boolean, slots: [String] },
    saturday: { available: Boolean, slots: [String] },
    sunday: { available: Boolean, slots: [String] },
  },
  pricing: {
    halfDay: Number,
    fullDay: Number,
    multiDay: Number,
  },
  status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
  documents: {
    idProof: String,
    certificate: String,
    experience: String,
  },
  appliedDate: { type: Date, default: Date.now },
  approvedDate: { type: Date },
  rejectedReason: { type: String },
})

const Guide = mongoose.model("Guide", guideSchema)

// Enhanced Reviews Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  attraction: { type: mongoose.Schema.Types.ObjectId, ref: "Attraction", required: true },
  attractionName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  images: [String],
  visitDate: { type: Date },
  travelType: { type: String, enum: ["Solo", "Couple", "Family", "Friends", "Business"] },
  helpful: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  moderatorNote: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Review = mongoose.model("Review", reviewSchema)

// Enhanced Chat Messages Schema
const chatMessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ["user", "admin"], required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
  attachments: [String],
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

// Bookings Schema
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
  attraction: { type: mongoose.Schema.Types.ObjectId, ref: "Attraction", required: true },
  bookingDate: { type: Date, required: true },
  visitDate: { type: Date, required: true },
  duration: { type: String, required: true },
  groupSize: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  specialRequests: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Booking = mongoose.model("Booking", bookingSchema)

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  pageViews: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  topAttractions: [{ attraction: String, views: Number }],
  userActivity: {
    registrations: { type: Number, default: 0 },
    logins: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
})

const Analytics = mongoose.model("Analytics", analyticsSchema)

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(
  session({
    secret: "explore_jharkhand_admin_secret_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Serve static files - Updated to match your project structure
app.use(express.static(path.join(__dirname, "../host")))
app.use("/frontend", express.static(path.join(__dirname, "../host/frontend")))
app.use("/public", express.static(path.join(__dirname, "../host/public")))

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id)

  socket.on("join-admin", (adminId) => {
    socket.join("admin-room")
    console.log(`Admin ${adminId} joined admin room`)
  })

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id)
  })
})

// Real-time notification function
function notifyAdmins(event, data) {
  io.to("admin-room").emit(event, data)
}

// Create comprehensive sample data
async function createSampleData() {
  try {
    // Create super admin if doesn't exist
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      const superAdmin = new Admin({
        username: "superadmin",
        email: "superadmin@explorejharkhand.com",
        password: "admin123",
        role: "superadmin",
        isVerified: true,
        isActive: true,
        permissions: {
          canManageUsers: true,
          canManageAttractions: true,
          canManageGuides: true,
          canManageReviews: true,
          canManageAdmins: true,
        },
      })
      await superAdmin.save()
      console.log("✅ Super admin created - Username: superadmin, Password: admin123")

      // Create regular admin
      const regularAdmin = new Admin({
        username: "admin",
        email: "admin@explorejharkhand.com",
        password: "admin123",
        role: "admin",
        isVerified: true,
        isActive: true,
      })
      await regularAdmin.save()
      console.log("✅ Regular admin created - Username: admin, Password: admin123")
    }

    // Create sample users
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      const sampleUsers = [
        {
          username: "rahul_kumar",
          email: "rahul.kumar@email.com",
          password: "password123",
          fullName: "Rahul Kumar",
          phone: "+91 9876543210",
          role: "traveler",
          location: "Ranchi, Jharkhand",
          isActive: true,
          isEmailVerified: true,
          preferences: {
            favoriteCategories: ["Waterfall", "Adventure"],
            travelStyle: "Adventure",
            budget: "Medium",
          },
          stats: {
            reviewsCount: 5,
            placesVisited: 12,
            contributionsCount: 3,
          },
        },
        {
          username: "priya_singh",
          email: "priya.singh@email.com",
          password: "password123",
          fullName: "Priya Singh",
          phone: "+91 9876543211",
          role: "contributor",
          location: "Jamshedpur, Jharkhand",
          isActive: true,
          isEmailVerified: true,
          preferences: {
            favoriteCategories: ["Religious", "Cultural"],
            travelStyle: "Cultural",
            budget: "Low",
          },
          stats: {
            reviewsCount: 8,
            placesVisited: 15,
            contributionsCount: 6,
          },
        },
        {
          username: "amit_sharma",
          email: "amit.sharma@email.com",
          password: "password123",
          fullName: "Amit Sharma",
          phone: "+91 9876543212",
          role: "guide",
          location: "Dhanbad, Jharkhand",
          isActive: true,
          isEmailVerified: true,
          stats: {
            reviewsCount: 12,
            placesVisited: 25,
            contributionsCount: 10,
          },
        },
        {
          username: "neha_gupta",
          email: "neha.gupta@email.com",
          password: "password123",
          fullName: "Neha Gupta",
          phone: "+91 9876543213",
          role: "traveler",
          location: "Bokaro, Jharkhand",
          isActive: true,
          isEmailVerified: false,
          preferences: {
            favoriteCategories: ["Wildlife", "Nature"],
            travelStyle: "Nature",
            budget: "High",
          },
          stats: {
            reviewsCount: 3,
            placesVisited: 8,
            contributionsCount: 1,
          },
        },
        {
          username: "suresh_yadav",
          email: "suresh.yadav@email.com",
          password: "password123",
          fullName: "Suresh Yadav",
          phone: "+91 9876543214",
          role: "contributor",
          location: "Deoghar, Jharkhand",
          isActive: false,
          isEmailVerified: true,
          stats: {
            reviewsCount: 2,
            placesVisited: 5,
            contributionsCount: 2,
          },
        },
      ]
      await User.insertMany(sampleUsers)
      console.log("✅ Sample users created")
    }

    // Create sample attractions
    const attractionCount = await Attraction.countDocuments()
    if (attractionCount === 0) {
      const sampleAttractions = [
        {
          name: "Hundru Falls",
          description:
            "A spectacular waterfall located 45 km from Ranchi, perfect for family trips and nature lovers. The waterfall cascades from a height of 98 meters, creating a mesmerizing view.",
          district: "Ranchi",
          category: "Waterfall",
          subCategory: "Natural Wonder",
          entryFee: "₹20",
          rating: 4.5,
          reviewCount: 234,
          featured: true,
          status: "active",
          location: {
            latitude: 23.4241,
            longitude: 85.6158,
            address: "Hundru Falls, Ranchi, Jharkhand 835202",
          },
          facilities: ["Parking", "Food Stalls", "Restrooms", "Photography"],
          bestTimeToVisit: "October to March",
          duration: "2-3 hours",
          difficulty: "Easy",
          tags: ["waterfall", "nature", "photography", "family-friendly"],
          views: 2847,
          likes: 456,
        },
        {
          name: "Betla National Park",
          description:
            "Famous national park known for tigers, elephants, and diverse wildlife. Spread over 979 sq km, it's one of the first tiger reserves in India.",
          district: "Latehar",
          category: "Wildlife",
          subCategory: "National Park",
          entryFee: "₹100",
          rating: 4.3,
          reviewCount: 189,
          featured: true,
          status: "active",
          location: {
            latitude: 23.8833,
            longitude: 84.1833,
            address: "Betla National Park, Latehar, Jharkhand",
          },
          facilities: ["Safari", "Guest House", "Guide Service", "Canteen"],
          bestTimeToVisit: "November to April",
          duration: "Full Day",
          difficulty: "Moderate",
          tags: ["wildlife", "tiger", "safari", "nature"],
          views: 2156,
          likes: 389,
        },
        {
          name: "Jagannath Temple",
          description:
            "Ancient temple dedicated to Lord Jagannath, a significant religious site with beautiful architecture and spiritual atmosphere.",
          district: "Ranchi",
          category: "Religious",
          subCategory: "Hindu Temple",
          entryFee: "Free",
          rating: 4.7,
          reviewCount: 456,
          featured: false,
          status: "active",
          location: {
            latitude: 23.3441,
            longitude: 85.3096,
            address: "Jagannath Temple, Ranchi, Jharkhand",
          },
          facilities: ["Parking", "Prasad Counter", "Shoe Stand", "Wheelchair Access"],
          bestTimeToVisit: "Year Round",
          duration: "1-2 hours",
          difficulty: "Easy",
          tags: ["temple", "religious", "spiritual", "architecture"],
          views: 1923,
          likes: 567,
        },
        {
          name: "Dassam Falls",
          description:
            "Beautiful waterfall with crystal clear water, ideal for picnics and nature photography. The water falls from a height of 44 meters.",
          district: "Ranchi",
          category: "Waterfall",
          subCategory: "Natural Wonder",
          entryFee: "₹15",
          rating: 4.2,
          reviewCount: 178,
          featured: false,
          status: "active",
          location: {
            latitude: 23.4667,
            longitude: 85.5167,
            address: "Dassam Falls, Ranchi, Jharkhand",
          },
          facilities: ["Parking", "Food Stalls", "Changing Rooms"],
          bestTimeToVisit: "July to February",
          duration: "2-3 hours",
          difficulty: "Easy",
          tags: ["waterfall", "picnic", "photography"],
          views: 1654,
          likes: 234,
        },
        {
          name: "Patratu Valley",
          description:
            "Scenic valley with breathtaking views and adventure activities. Known for its beautiful landscape and boating facilities.",
          district: "Ramgarh",
          category: "Adventure",
          subCategory: "Valley",
          entryFee: "₹50",
          rating: 4.4,
          reviewCount: 267,
          featured: true,
          status: "active",
          location: {
            latitude: 23.6833,
            longitude: 85.1667,
            address: "Patratu Valley, Ramgarh, Jharkhand",
          },
          facilities: ["Boating", "Adventure Sports", "Restaurant", "Parking"],
          bestTimeToVisit: "October to March",
          duration: "Half Day",
          difficulty: "Moderate",
          tags: ["valley", "adventure", "boating", "scenic"],
          views: 1876,
          likes: 345,
        },
        {
          name: "Netarhat",
          description:
            "Hill station known as Queen of Chotanagpur, famous for sunrise and sunset views. Perfect for a peaceful getaway.",
          district: "Latehar",
          category: "Hill Station",
          subCategory: "Hill Station",
          entryFee: "Free",
          rating: 4.6,
          reviewCount: 312,
          featured: true,
          status: "active",
          location: {
            latitude: 23.4667,
            longitude: 84.2667,
            address: "Netarhat, Latehar, Jharkhand",
          },
          facilities: ["Hotels", "Restaurants", "Viewpoints", "Trekking"],
          bestTimeToVisit: "October to April",
          duration: "2-3 Days",
          difficulty: "Easy",
          tags: ["hill-station", "sunrise", "sunset", "peaceful"],
          views: 2234,
          likes: 456,
        },
        {
          name: "Deoghar Temple",
          description:
            "Sacred Jyotirlinga temple dedicated to Lord Shiva, major pilgrimage site attracting millions of devotees annually.",
          district: "Deoghar",
          category: "Religious",
          subCategory: "Jyotirlinga",
          entryFee: "Free",
          rating: 4.8,
          reviewCount: 567,
          featured: true,
          status: "active",
          location: {
            latitude: 24.4833,
            longitude: 86.7,
            address: "Baba Baidyanath Temple, Deoghar, Jharkhand",
          },
          facilities: ["Dharamshala", "Prasad Counter", "Medical Aid", "Security"],
          bestTimeToVisit: "July to March",
          duration: "Half Day",
          difficulty: "Easy",
          tags: ["jyotirlinga", "shiva", "pilgrimage", "sacred"],
          views: 3456,
          likes: 789,
        },
        {
          name: "Jonha Falls",
          description:
            "Beautiful waterfall also known as Gautamdhara, perfect for trekking and nature walks. Hidden gem with pristine beauty.",
          district: "Ranchi",
          category: "Waterfall",
          subCategory: "Hidden Gem",
          entryFee: "₹10",
          rating: 4.1,
          reviewCount: 145,
          featured: false,
          status: "active",
          location: {
            latitude: 23.2833,
            longitude: 85.4167,
            address: "Jonha Falls, Ranchi, Jharkhand",
          },
          facilities: ["Trekking Path", "Natural Pool", "Photography"],
          bestTimeToVisit: "July to January",
          duration: "3-4 hours",
          difficulty: "Moderate",
          tags: ["waterfall", "trekking", "hidden-gem", "nature"],
          views: 1234,
          likes: 189,
        },
      ]
      await Attraction.insertMany(sampleAttractions)
      console.log("✅ Sample attractions created")
    }

    // Create sample guides
    const guideCount = await Guide.countDocuments()
    if (guideCount === 0) {
      const sampleGuides = [
        {
          name: "Amit Kumar Sharma",
          email: "amit.guide@email.com",
          phone: "+91 9876543210",
          experience: "5 years",
          languages: ["Hindi", "English", "Bengali"],
          specialization: "Adventure Tourism",
          location: "Ranchi",
          bio: "Experienced adventure guide with deep knowledge of Jharkhand's natural beauty and trekking routes.",
          certifications: ["Wilderness First Aid", "Rock Climbing Instructor"],
          availability: {
            monday: { available: true, slots: ["9:00 AM", "2:00 PM"] },
            tuesday: { available: true, slots: ["9:00 AM", "2:00 PM"] },
            wednesday: { available: false, slots: [] },
            thursday: { available: true, slots: ["9:00 AM"] },
            friday: { available: true, slots: ["9:00 AM", "2:00 PM"] },
            saturday: { available: true, slots: ["8:00 AM", "1:00 PM"] },
            sunday: { available: true, slots: ["8:00 AM", "1:00 PM"] },
          },
          pricing: {
            halfDay: 1500,
            fullDay: 2500,
            multiDay: 2000,
          },
          status: "pending",
        },
        {
          name: "Priya Singh",
          email: "priya.guide@email.com",
          phone: "+91 9876543211",
          experience: "3 years",
          languages: ["Hindi", "English"],
          specialization: "Cultural Tourism",
          location: "Jamshedpur",
          bio: "Cultural enthusiast specializing in heritage sites and local traditions of Jharkhand.",
          certifications: ["Cultural Heritage Guide"],
          rating: 4.2,
          totalTours: 45,
          pricing: {
            halfDay: 1200,
            fullDay: 2000,
            multiDay: 1800,
          },
          status: "pending",
        },
        {
          name: "Suresh Kumar",
          email: "suresh.guide@email.com",
          phone: "+91 9876543212",
          experience: "8 years",
          languages: ["Hindi", "English", "Santali"],
          specialization: "Religious Tourism",
          location: "Deoghar",
          bio: "Expert in religious sites and pilgrimage tours across Jharkhand with extensive knowledge of local customs.",
          certifications: ["Religious Tourism Specialist", "First Aid Certified"],
          rating: 4.8,
          totalTours: 156,
          totalEarnings: 234000,
          pricing: {
            halfDay: 1800,
            fullDay: 3000,
            multiDay: 2500,
          },
          status: "approved",
          approvedDate: new Date(),
        },
        {
          name: "Ravi Prasad",
          email: "ravi.guide@email.com",
          phone: "+91 9876543213",
          experience: "6 years",
          languages: ["Hindi", "English", "Odia"],
          specialization: "Wildlife Tourism",
          location: "Latehar",
          bio: "Wildlife expert and naturalist with deep knowledge of Jharkhand's flora and fauna.",
          certifications: ["Wildlife Guide License", "Nature Photography"],
          rating: 4.5,
          totalTours: 89,
          totalEarnings: 156000,
          pricing: {
            halfDay: 2000,
            fullDay: 3500,
            multiDay: 3000,
          },
          status: "approved",
          approvedDate: new Date(),
        },
        {
          name: "Anjali Kumari",
          email: "anjali.guide@email.com",
          phone: "+91 9876543214",
          experience: "2 years",
          languages: ["Hindi", "English"],
          specialization: "Heritage Tourism",
          location: "Hazaribagh",
          bio: "Young and enthusiastic guide specializing in historical sites and heritage tourism.",
          certifications: ["Heritage Guide Certificate"],
          pricing: {
            halfDay: 1000,
            fullDay: 1800,
            multiDay: 1500,
          },
          status: "rejected",
          rejectedReason: "Insufficient experience documentation",
        },
      ]
      await Guide.insertMany(sampleGuides)
      console.log("✅ Sample guides created")
    }

    // Create sample reviews
    const reviewCount = await Review.countDocuments()
    if (reviewCount === 0) {
      const users = await User.find().limit(5)
      const attractions = await Attraction.find().limit(8)

      const sampleReviews = [
        {
          user: users[0]._id,
          userName: users[0].fullName,
          attraction: attractions[0]._id,
          attractionName: attractions[0].name,
          rating: 5,
          title: "Absolutely Stunning!",
          comment:
            "Amazing waterfall! Perfect for family trips. The natural beauty is breathtaking and the trek is enjoyable. Highly recommended for nature lovers.",
          visitDate: new Date("2024-01-15"),
          travelType: "Family",
          helpful: 12,
          status: "pending",
        },
        {
          user: users[1]._id,
          userName: users[1].fullName,
          attraction: attractions[1]._id,
          attractionName: attractions[1].name,
          rating: 4,
          title: "Great Wildlife Experience",
          comment:
            "Great wildlife experience, saw tigers! The safari was well organized and guides were knowledgeable. Worth the visit for wildlife enthusiasts.",
          visitDate: new Date("2024-02-10"),
          travelType: "Friends",
          helpful: 8,
          status: "approved",
        },
        {
          user: users[2]._id,
          userName: users[2].fullName,
          attraction: attractions[2]._id,
          attractionName: attractions[2].name,
          rating: 5,
          title: "Spiritual Experience",
          comment:
            "Peaceful and spiritual place. The architecture is magnificent and the atmosphere is divine. A must-visit for spiritual seekers.",
          visitDate: new Date("2024-01-25"),
          travelType: "Solo",
          helpful: 15,
          status: "approved",
        },
        {
          user: users[3]._id,
          userName: users[3].fullName,
          attraction: attractions[5]._id,
          attractionName: attractions[5].name,
          rating: 4,
          title: "Beautiful Hill Station",
          comment:
            "Beautiful hill station with amazing sunrise views. Perfect for weekend getaway. The weather was pleasant and views were spectacular.",
          visitDate: new Date("2024-02-20"),
          travelType: "Couple",
          helpful: 6,
          status: "pending",
        },
        {
          user: users[4]._id,
          userName: users[4].fullName,
          attraction: attractions[6]._id,
          attractionName: attractions[6].name,
          rating: 5,
          title: "Sacred Place",
          comment:
            "Sacred place with great spiritual energy. Must visit during Shravan month. The temple complex is well maintained and peaceful.",
          visitDate: new Date("2024-03-01"),
          travelType: "Family",
          helpful: 20,
          status: "approved",
        },
        {
          user: users[0]._id,
          userName: users[0].fullName,
          attraction: attractions[4]._id,
          attractionName: attractions[4].name,
          rating: 4,
          title: "Scenic Beauty",
          comment:
            "Scenic beauty at its best. Great for photography and adventure activities. The valley offers stunning views and peaceful environment.",
          visitDate: new Date("2024-02-28"),
          travelType: "Friends",
          helpful: 9,
          status: "pending",
        },
      ]
      await Review.insertMany(sampleReviews)
      console.log("✅ Sample reviews created")
    }

    // Create sample chat messages
    const chatCount = await ChatMessage.countDocuments()
    if (chatCount === 0) {
      const sampleChats = [
        {
          chatId: "chat_001",
          name: "Rahul Kumar",
          email: "rahul.kumar@email.com",
          message: "Hi, I need help planning a trip to Ranchi. Can you suggest some good places to visit?",
          sender: "user",
          isRead: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          chatId: "chat_001",
          name: "Admin",
          email: "admin@explorejharkhand.com",
          message:
            "Hello Rahul! I'd be happy to help. For Ranchi, I recommend Hundru Falls, Jagannath Temple, and Rock Garden. How many days are you planning?",
          sender: "admin",
          isRead: true,
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        },
        {
          chatId: "chat_001",
          name: "Rahul Kumar",
          email: "rahul.kumar@email.com",
          message: "I'm planning for 3 days. Are there any good hotels near these places?",
          sender: "user",
          isRead: false,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        {
          chatId: "chat_002",
          name: "Priya Singh",
          email: "priya.singh@email.com",
          message: "What are the best places to visit in winter season? I'm particularly interested in wildlife.",
          sender: "user",
          isRead: false,
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        },
        {
          chatId: "chat_003",
          name: "Amit Sharma",
          email: "amit.sharma@email.com",
          message: "Can you help me find a good guide for Betla National Park? I want to book a safari.",
          sender: "user",
          isRead: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      ]
      await ChatMessage.insertMany(sampleChats)
      console.log("✅ Sample chat messages created")
    }

    // Create sample bookings
    const bookingCount = await Booking.countDocuments()
    if (bookingCount === 0) {
      const users = await User.find().limit(3)
      const guides = await Guide.find({ status: "approved" }).limit(2)
      const attractions = await Attraction.find().limit(5)

      const sampleBookings = [
        {
          user: users[0]._id,
          guide: guides[0]._id,
          attraction: attractions[0]._id,
          bookingDate: new Date(),
          visitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          duration: "Full Day",
          groupSize: 4,
          totalAmount: 2500,
          status: "confirmed",
          paymentStatus: "paid",
          specialRequests: "Need photography assistance",
        },
        {
          user: users[1]._id,
          guide: guides[1]._id,
          attraction: attractions[1]._id,
          bookingDate: new Date(),
          visitDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          duration: "Full Day",
          groupSize: 2,
          totalAmount: 3000,
          status: "pending",
          paymentStatus: "pending",
        },
        {
          user: users[2]._id,
          attraction: attractions[2]._id,
          bookingDate: new Date(),
          visitDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          duration: "Half Day",
          groupSize: 1,
          totalAmount: 500,
          status: "confirmed",
          paymentStatus: "paid",
        },
      ]
      await Booking.insertMany(sampleBookings)
      console.log("✅ Sample bookings created")
    }

    // Create analytics data
    const analyticsCount = await Analytics.countDocuments()
    if (analyticsCount === 0) {
      const today = new Date()
      const sampleAnalytics = []

      for (let i = 30; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        sampleAnalytics.push({
          date: date,
          pageViews: Math.floor(Math.random() * 1000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 300) + 100,
          newUsers: Math.floor(Math.random() * 50) + 10,
          bookings: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 50000) + 10000,
          topAttractions: [
            { attraction: "Hundru Falls", views: Math.floor(Math.random() * 100) + 50 },
            { attraction: "Betla National Park", views: Math.floor(Math.random() * 80) + 40 },
            { attraction: "Deoghar Temple", views: Math.floor(Math.random() * 120) + 60 },
          ],
          userActivity: {
            registrations: Math.floor(Math.random() * 10) + 2,
            logins: Math.floor(Math.random() * 100) + 50,
            reviews: Math.floor(Math.random() * 15) + 5,
          },
        })
      }

      await Analytics.insertMany(sampleAnalytics)
      console.log("✅ Sample analytics data created")
    }
  } catch (error) {
    console.error("Error creating sample data:", error)
  }
}

// Initialize sample data
createSampleData()

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.admin) {
    return res.status(401).json({ success: false, message: "Authentication required" })
  }
  next()
}

// Admin Authentication Routes
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const admin = await Admin.findOne({
      username,
      isActive: true,
      isVerified: true,
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or admin not verified",
      })
    }

    if (admin.password !== password) {
      admin.loginAttempts += 1
      await admin.save()
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Reset login attempts and update last login
    admin.loginAttempts = 0
    admin.lastLogin = new Date()
    await admin.save()

    // Create session
    req.session.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    }

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
})

app.post("/api/admin/register", async (req, res) => {
  const { username, email, password } = req.body

  try {
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    })

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this username or email already exists",
      })
    }

    const newAdmin = new Admin({
      username,
      email,
      password,
      role: "admin",
      isVerified: false,
    })

    await newAdmin.save()

    // Notify other admins about new registration
    notifyAdmins("new-admin-registration", {
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    })

    res.json({
      success: true,
      message: "Admin registered successfully. Awaiting verification.",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        isVerified: newAdmin.isVerified,
      },
    })
  } catch (error) {
    console.error("Admin registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
})

app.post("/api/admin/verify", (req, res) => {
  if (req.session.admin) {
    res.json({
      success: true,
      admin: req.session.admin,
    })
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    })
  }
})

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
      })
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    })
  })
})

// Admin management routes
app.get("/api/admin/list", requireAuth, async (req, res) => {
  try {
    const admins = await Admin.find(
      {},
      {
        password: 1,
        username: 1,
        email: 1,
        isVerified: 1,
        isActive: 1,
        role: 1,
        permissions: 1,
        createdAt: 1,
        lastLogin: 1,
        loginAttempts: 1,
      },
    ).sort({ createdAt: -1 })

    res.json({ success: true, admins })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admins" })
  }
})

app.put("/api/admin/verify/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageAdmins) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, updatedAt: new Date() },
      { new: true },
    )

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" })
    }

    // Notify about admin verification
    notifyAdmins("admin-verified", {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    })

    res.json({ success: true, message: "Admin verified successfully", admin })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying admin" })
  }
})

app.delete("/api/admin/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageAdmins) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const admin = await Admin.findByIdAndDelete(req.params.id)
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" })
    }

    res.json({ success: true, message: "Admin deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting admin" })
  }
})

// Dashboard stats with real-time data
app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAttractions,
      totalReviews,
      pendingGuides,
      pendingReviews,
      activeUsers,
      totalBookings,
      pendingBookings,
      totalRevenue,
      todayStats,
    ] = await Promise.all([
      User.countDocuments(),
      Attraction.countDocuments(),
      Review.countDocuments(),
      Guide.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "pending" }),
      User.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Analytics.findOne({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ])

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAttractions,
        totalReviews,
        pendingGuides,
        pendingReviews,
        activeUsers,
        totalBookings,
        pendingBookings,
        totalRevenue: revenue,
        todayPageViews: todayStats?.pageViews || 0,
        todayVisitors: todayStats?.uniqueVisitors || 0,
        todayRegistrations: todayStats?.userActivity?.registrations || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ success: false, message: "Error fetching stats" })
  }
})

// Real-time analytics endpoint
app.get("/api/dashboard/analytics", requireAuth, async (req, res) => {
  try {
    const { period = "7d" } = req.query
    const startDate = new Date()

    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    const analytics = await Analytics.find({
      date: { $gte: startDate },
    }).sort({ date: 1 })

    const topAttractions = await Attraction.find().sort({ views: -1 }).limit(10).select("name views likes reviewCount")

    const recentActivity = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("username createdAt"),
      Review.find().sort({ createdAt: -1 }).limit(5).populate("user", "username").populate("attraction", "name"),
      Booking.find().sort({ createdAt: -1 }).limit(5).populate("user", "username").populate("attraction", "name"),
    ])

    res.json({
      success: true,
      analytics,
      topAttractions,
      recentActivity: {
        users: recentActivity[0],
        reviews: recentActivity[1],
        bookings: recentActivity[2],
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ success: false, message: "Error fetching analytics" })
  }
})

// Attractions CRUD with enhanced features
app.get("/api/attractions", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, district, status } = req.query
    const query = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }
    if (category) query.category = category
    if (district) query.district = district
    if (status) query.status = status

    const attractions = await Attraction.find(query)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Attraction.countDocuments(query)

    res.json({
      success: true,
      attractions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attractions" })
  }
})

app.post("/api/attractions", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageAttractions) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const attractionData = {
      ...req.body,
      createdBy: req.session.admin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const attraction = new Attraction(attractionData)
    await attraction.save()

    // Notify about new attraction
    notifyAdmins("new-attraction", {
      attraction: {
        id: attraction._id,
        name: attraction.name,
        district: attraction.district,
      },
    })

    res.json({ success: true, message: "Attraction created successfully", attraction })
  } catch (error) {
    console.error("Error creating attraction:", error)
    res.status(500).json({ success: false, message: "Error creating attraction" })
  }
})

app.put("/api/attractions/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageAttractions) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true },
    )

    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found" })
    }

    res.json({ success: true, message: "Attraction updated successfully", attraction })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating attraction" })
  }
})

app.delete("/api/attractions/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageAttractions) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const attraction = await Attraction.findByIdAndDelete(req.params.id)
    if (!attraction) {
      return res.status(404).json({ success: false, message: "Attraction not found" })
    }

    // Also delete related reviews and bookings
    await Review.deleteMany({ attraction: req.params.id })
    await Booking.deleteMany({ attraction: req.params.id })

    res.json({ success: true, message: "Attraction deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting attraction" })
  }
})

// Users CRUD with enhanced features
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageUsers) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const { page = 1, limit = 10, search, role, status } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ]
    }
    if (role) query.role = role
    if (status === "active") query.isActive = true
    if (status === "inactive") query.isActive = false

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" })
  }
})

app.put("/api/users/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageUsers) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ success: true, message: "User updated successfully", user })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user" })
  }
})

app.delete("/api/users/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageUsers) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Also delete related data
    await Review.deleteMany({ user: req.params.id })
    await Booking.deleteMany({ user: req.params.id })
    await ChatMessage.deleteMany({ email: user.email })

    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" })
  }
})

// Guides CRUD with enhanced features
app.get("/api/guides", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageGuides) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const { page = 1, limit = 10, search, status, specialization } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }
    if (status) query.status = status
    if (specialization) query.specialization = specialization

    const guides = await Guide.find(query)
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Guide.countDocuments(query)

    res.json({
      success: true,
      guides,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching guides" })
  }
})

app.put("/api/guides/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageGuides) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const updateData = { ...req.body }

    if (req.body.status === "approved") {
      updateData.approvedDate = new Date()
    }

    const guide = await Guide.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Notify about guide status change
    notifyAdmins("guide-status-updated", {
      guide: {
        id: guide._id,
        name: guide.name,
        status: guide.status,
      },
    })

    res.json({ success: true, message: "Guide updated successfully", guide })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating guide" })
  }
})

app.delete("/api/guides/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageGuides) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const guide = await Guide.findByIdAndDelete(req.params.id)
    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Also delete related bookings
    await Booking.deleteMany({ guide: req.params.id })

    res.json({ success: true, message: "Guide deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting guide" })
  }
})

// Reviews CRUD with enhanced features
app.get("/api/reviews", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageReviews) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const { page = 1, limit = 10, search, status, rating } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { attractionName: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ]
    }
    if (status) query.status = status
    if (rating) query.rating = Number.parseInt(rating)

    const reviews = await Review.find(query)
      .populate("user", "username email")
      .populate("attraction", "name district")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Review.countDocuments(query)

    res.json({
      success: true,
      reviews,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reviews" })
  }
})

app.put("/api/reviews/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageReviews) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true })

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    // Update attraction rating if review is approved
    if (req.body.status === "approved") {
      const attraction = await Attraction.findById(review.attraction)
      if (attraction) {
        const allReviews = await Review.find({
          attraction: review.attraction,
          status: "approved",
        })
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

        await Attraction.findByIdAndUpdate(review.attraction, {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        })
      }
    }

    res.json({ success: true, message: "Review updated successfully", review })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating review" })
  }
})

app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
  try {
    if (!req.session.admin.permissions.canManageReviews) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" })
    }

    // Update attraction rating after review deletion
    const attraction = await Attraction.findById(review.attraction)
    if (attraction) {
      const allReviews = await Review.find({
        attraction: review.attraction,
        status: "approved",
      })

      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await Attraction.findByIdAndUpdate(review.attraction, {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        })
      } else {
        await Attraction.findByIdAndUpdate(review.attraction, {
          rating: 0,
          reviewCount: 0,
        })
      }
    }

    res.json({ success: true, message: "Review deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting review" })
  }
})

// Chat routes with real-time functionality
app.get("/api/chats", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    // Get unique chat sessions
    const chatSessions = await ChatMessage.aggregate([
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $last: "$message" },
          lastTimestamp: { $last: "$timestamp" },
          name: { $last: "$name" },
          email: { $last: "$email" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$sender", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastTimestamp: -1 } },
      { $limit: limit * 1 },
      { $skip: (page - 1) * limit },
    ])

    res.json({ success: true, chatSessions })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching chats" })
  }
})

app.get("/api/chats/:chatId", requireAuth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ chatId: req.params.chatId }).sort({ timestamp: 1 })

    // Mark user messages as read
    await ChatMessage.updateMany({ chatId: req.params.chatId, sender: "user", isRead: false }, { isRead: true })

    res.json({ success: true, messages })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching chat messages" })
  }
})

app.post("/api/chats/:chatId/message", requireAuth, async (req, res) => {
  try {
    const { message } = req.body
    const chatId = req.params.chatId

    // Get chat info
    const lastMessage = await ChatMessage.findOne({ chatId }).sort({ timestamp: -1 })

    const newMessage = new ChatMessage({
      chatId,
      name: "Admin",
      email: req.session.admin.email,
      message,
      sender: "admin",
      adminId: req.session.admin.id,
      timestamp: new Date(),
      isRead: true,
    })

    await newMessage.save()

    // Emit real-time message
    io.emit("new-message", {
      chatId,
      message: newMessage,
    })

    res.json({ success: true, message: newMessage })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error sending message" })
  }
})

// Bookings management
app.get("/api/bookings", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    const query = {}

    if (status) query.status = status
    if (search) {
      const users = await User.find({
        $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }).select("_id")

      const attractions = await Attraction.find({
        name: { $regex: search, $options: "i" },
      }).select("_id")

      query.$or = [{ user: { $in: users.map((u) => u._id) } }, { attraction: { $in: attractions.map((a) => a._id) } }]
    }

    const bookings = await Booking.find(query)
      .populate("user", "username email phone")
      .populate("guide", "name phone specialization")
      .populate("attraction", "name district category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Booking.countDocuments(query)

    res.json({
      success: true,
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings" })
  }
})

app.put("/api/bookings/:id", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("user", "username email")
      .populate("attraction", "name")

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Notify about booking status change
    notifyAdmins("booking-updated", {
      booking: {
        id: booking._id,
        user: booking.user.username,
        attraction: booking.attraction.name,
        status: booking.status,
      },
    })

    res.json({ success: true, message: "Booking updated successfully", booking })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating booking" })
  }
})

// Real-time notifications endpoint
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const notifications = []

    // Get pending items that need attention
    const [pendingGuides, pendingReviews, unreadChats, pendingBookings] = await Promise.all([
      Guide.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "pending" }),
      ChatMessage.countDocuments({ sender: "user", isRead: false }),
      Booking.countDocuments({ status: "pending" }),
    ])

    if (pendingGuides > 0) {
      notifications.push({
        type: "guides",
        count: pendingGuides,
        message: `${pendingGuides} guide application${pendingGuides > 1 ? "s" : ""} pending approval`,
        priority: "medium",
      })
    }

    if (pendingReviews > 0) {
      notifications.push({
        type: "reviews",
        count: pendingReviews,
        message: `${pendingReviews} review${pendingReviews > 1 ? "s" : ""} pending moderation`,
        priority: "low",
      })
    }

    if (unreadChats > 0) {
      notifications.push({
        type: "chats",
        count: unreadChats,
        message: `${unreadChats} unread message${unreadChats > 1 ? "s" : ""}`,
        priority: "high",
      })
    }

    if (pendingBookings > 0) {
      notifications.push({
        type: "bookings",
        count: pendingBookings,
        message: `${pendingBookings} booking${pendingBookings > 1 ? "s" : ""} pending confirmation`,
        priority: "medium",
      })
    }

    res.json({ success: true, notifications })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notifications" })
  }
})

// Search endpoint
app.get("/api/search", requireAuth, async (req, res) => {
  try {
    const { q, type } = req.query
    const results = {}

    if (!q) {
      return res.json({ success: true, results })
    }

    const searchRegex = { $regex: q, $options: "i" }

    if (!type || type === "attractions") {
      results.attractions = await Attraction.find({
        $or: [{ name: searchRegex }, { description: searchRegex }, { district: searchRegex }],
      })
        .limit(5)
        .select("name district category rating")
    }

    if (!type || type === "users") {
      results.users = await User.find({
        $or: [{ username: searchRegex }, { email: searchRegex }, { fullName: searchRegex }],
      })
        .limit(5)
        .select("username email fullName role isActive")
    }

    if (!type || type === "guides") {
      results.guides = await Guide.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { specialization: searchRegex }],
      })
        .limit(5)
        .select("name email specialization status rating")
    }

    res.json({ success: true, results })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error performing search" })
  }
})

// File upload endpoint (for future use)
app.post("/api/upload", requireAuth, async (req, res) => {
  try {
    // This would handle file uploads for images, documents, etc.
    // For now, return a placeholder response
    res.json({
      success: true,
      message: "File upload endpoint ready",
      url: "/placeholder.svg?height=200&width=200",
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error uploading file" })
  }
})

// Existing user routes (keeping compatibility)
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body

  try {
    const existing = await User.findOne({ username })
    if (existing) return res.status(400).json({ message: "Username already exists" })

    const user = new User({ username, email, password })
    await user.save()

    req.session.user = { id: user._id, username: user.username }
    res.status(200).json({ user: { username: user.username }, token: "session_token" })
  } catch (err) {
    res.status(500).json({ message: "Error registering user" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ message: "User not found" })

    if (user.password !== password) return res.status(401).json({ message: "Incorrect password" })

    req.session.user = { id: user._id, username: user.username }
    res.status(200).json({ user: { username: user.username }, token: "session_token" })
  } catch (err) {
    res.status(500).json({ message: "Error logging in" })
  }
})

app.post("/api/auth/verify", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user })
  } else {
    res.status(401).json({ user: null })
  }
})

// Static routes - Fixed paths
app.get("/", (req, res) => {
  res.redirect("/frontend/auth/index.html")
})

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/frontend/auth/index.html")
  })
})

app.get("/home", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "../host/frontend/home.html"))
  } else {
    res.redirect("/frontend/auth/index.html")
  }
})

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../host/frontend/admin/admin.html"))
})

app.get("/admin/chats", (req, res) => {
  if (req.session.admin) {
    res.sendFile(path.join(__dirname, "../host/frontend/admin/chats/admin-chats.html"))
  } else {
    res.redirect("/frontend/admin/admin.html")
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

// 404 handler - REMOVE THE CATCH-ALL ROUTE
app.use((req, res) => {
  console.log(`404 - File not found: ${req.path}`)
  res.status(404).send(`
    <h1>404 - File Not Found</h1>
    <p>Path: ${req.path}</p>
    <p><a href="/frontend/auth/index.html">Go to Login</a></p>
    <p><a href="/frontend/admin/admin.html">Go to Admin</a></p>
  `)
})

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`)
  console.log(`🌐 Frontend: http://localhost:${PORT}/frontend/auth/index.html`)
  console.log(`🔐 Admin panel: http://localhost:${PORT}/frontend/admin/admin.html`)
  console.log(`📊 Direct admin access: http://localhost:${PORT}/admin`)
  console.log(`🚀 Real-time features enabled with Socket.IO`)
  console.log(`📁 Serving files from: ${path.join(__dirname, "../host")}`)
})
