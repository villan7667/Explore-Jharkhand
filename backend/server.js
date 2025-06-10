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

// Enhanced Admin Schema with proper role hierarchy
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "admin", "moderator"],
    default: "admin",
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canManageAttractions: { type: Boolean, default: true },
    canManageGuides: { type: Boolean, default: true },
    canManageReviews: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: true },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Pre-save middleware to set permissions based on role
adminSchema.pre("save", function (next) {
  if (this.role === "superadmin") {
    this.permissions = {
      canManageUsers: true,
      canManageAttractions: true,
      canManageGuides: true,
      canManageReviews: true,
      canManageAdmins: true,
      canManageSettings: true,
      canViewAnalytics: true,
    }
    this.isVerified = true
  } else if (this.role === "admin") {
    this.permissions = {
      canManageUsers: true,
      canManageAttractions: true,
      canManageGuides: true,
      canManageReviews: true,
      canManageAdmins: false,
      canManageSettings: false,
      canViewAnalytics: true,
    }
  } else if (this.role === "moderator") {
    this.permissions = {
      canManageUsers: false,
      canManageAttractions: false,
      canManageGuides: true,
      canManageReviews: true,
      canManageAdmins: false,
      canManageSettings: false,
      canViewAnalytics: false,
    }
  }
  next()
})

const Admin = mongoose.model("Admin", adminSchema)

// Enhanced User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  phone: { type: String },
  role: {
    type: String,
    enum: ["user", "traveler", "contributor", "guide"],
    default: "user",
  },
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
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active",
  },
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
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
  },
  documents: {
    idProof: String,
    certificate: String,
    experience: String,
  },
  appliedDate: { type: Date, default: Date.now },
  approvedDate: { type: Date },
  rejectedDate: { type: Date },
  rejectedReason: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Guide = mongoose.model("Guide", guideSchema)

// Enhanced Reviews Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  attraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attraction",
    required: true,
  },
  attractionName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  images: [String],
  visitDate: { type: Date },
  travelType: {
    type: String,
    enum: ["Solo", "Couple", "Family", "Friends", "Business"],
  },
  helpful: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
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
  messageType: {
    type: String,
    enum: ["text", "image", "file"],
    default: "text",
  },
  attachments: [String],
  metadata: {
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
  },
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

// Enhanced Bookings Schema with Guide Integration
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
  attraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attraction",
    required: true,
  },
  bookingDate: { type: Date, default: Date.now },
  visitDate: { type: Date, required: true },
  visitTime: { type: String },
  duration: { type: String, required: true },
  groupSize: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded", "failed"],
    default: "pending",
  },
  specialRequests: { type: String },
  guideNotes: { type: String },
  travelerNotes: { type: String },
  pricing: {
    basePrice: { type: Number },
    guidePrice: { type: Number },
    taxes: { type: Number },
    discounts: { type: Number },
  },
  meetingPoint: { type: String },
  endPoint: { type: String },
  itinerary: [String],
  guideRating: { type: Number, min: 1, max: 5 },
  attractionRating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  confirmedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

// Serve static files
app.use(express.static(path.join(__dirname, "../host")))
app.use("/frontend", express.static(path.join(__dirname, "../host/frontend")))
app.use("/public", express.static(path.join(__dirname, "../host/public")))

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Admin room
  socket.on("join-admin", (adminId) => {
    socket.join("admin-room")
    console.log(`Admin ${adminId} joined admin room`)
  })

  // Guide room
  socket.on("join-guide", (guideId) => {
    socket.join(`guide-${guideId}`)
    socket.join("guides-room")
    console.log(`Guide ${guideId} joined guide room`)
  })

  // User room
  socket.on("join-user", (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined user room`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Real-time notification functions
function notifyAdmins(event, data) {
  io.to("admin-room").emit(event, data)
}

function notifyGuides(event, data) {
  io.to("guides-room").emit(event, data)
}

function notifySpecificGuide(guideId, event, data) {
  io.to(`guide-${guideId}`).emit(event, data)
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
        createdBy: superAdmin._id,
      })
      await regularAdmin.save()
      console.log("✅ Regular admin created - Username: admin, Password: admin123")
    }

    // Create sample users if they don't exist
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
        },
      ]
      await User.insertMany(sampleUsers)
      console.log("✅ Sample users created")
    }

    // Create sample attractions if they don't exist
    const attractionCount = await Attraction.countDocuments()
    if (attractionCount === 0) {
      const sampleAttractions = [
        {
          name: "Hundru Falls",
          description: "A spectacular waterfall located 45 km from Ranchi, perfect for family trips and nature lovers.",
          district: "Ranchi",
          category: "Waterfall",
          entryFee: "₹20",
          rating: 4.5,
          reviewCount: 234,
          featured: true,
          status: "active",
        },
        {
          name: "Betla National Park",
          description: "Famous national park known for tigers, elephants, and diverse wildlife.",
          district: "Latehar",
          category: "Wildlife",
          entryFee: "₹100",
          rating: 4.3,
          reviewCount: 189,
          featured: true,
          status: "active",
        },
      ]
      await Attraction.insertMany(sampleAttractions)
      console.log("✅ Sample attractions created")
    }

    console.log("✅ Sample data initialization completed")
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

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    if (!req.session.admin.permissions[permission]) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" })
    }

    next()
  }
}

// Guide middleware functions
const requireGuideAuth = (req, res, next) => {
  if (!req.session.guide) {
    return res.status(401).json({
      success: false,
      message: "Guide authentication required",
    })
  }
  next()
}

// ==================== GUIDE AUTHENTICATION ROUTES ====================

// Guide Login Route - FIXED
app.post("/api/guide/login", async (req, res) => {
  const { username, password } = req.body

  try {
    console.log("Guide login attempt:", username)

    // Find guide by email or name
    const guide = await Guide.findOne({
      $or: [{ email: username }, { name: username }],
    })

    if (!guide) {
      console.log("Guide not found:", username)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Guide not found.",
      })
    }

    console.log("Guide found:", guide.name, "Status:", guide.status)

    // Check password
    if (guide.password !== password) {
      console.log("Invalid password for guide:", username)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      })
    }

    // Check guide status
    if (guide.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your guide application is still pending approval. Please wait for admin verification.",
        status: "pending",
      })
    }

    if (guide.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `Your guide application has been rejected. ${guide.rejectedReason ? "Reason: " + guide.rejectedReason : "Please contact support for more information."}`,
        status: "rejected",
      })
    }

    if (guide.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your guide account has been suspended. Please contact support.",
        status: "suspended",
      })
    }

    if (guide.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your guide account is not approved. Please contact support.",
        status: guide.status,
      })
    }

    // Create session for approved guide
    req.session.guide = {
      id: guide._id,
      name: guide.name,
      email: guide.email,
      status: guide.status,
    }

    console.log("Guide login successful:", guide.name)

    res.json({
      success: true,
      message: "Login successful! Welcome to your guide dashboard.",
      guide: {
        id: guide._id,
        name: guide.name,
        email: guide.email,
        status: guide.status,
      },
    })
  } catch (error) {
    console.error("Guide login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    })
  }
})

// Guide Registration Route - FIXED
app.post("/api/guide/apply", async (req, res) => {
  const { name, email, password, phone, location, experience, specialization } = req.body

  try {
    console.log("Guide application received:", email)

    // Check if guide already exists
    const existingGuide = await Guide.findOne({ email })
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: "A guide with this email already exists. Please use a different email or try logging in.",
      })
    }

    // Create new guide application
    const newGuide = new Guide({
      name,
      email,
      password,
      phone,
      location,
      experience,
      specialization,
      status: "pending",
      appliedDate: new Date(),
    })

    await newGuide.save()
    console.log("New guide application saved:", newGuide.name)

    // Notify admins about new guide application
    notifyAdmins("new-guide-application", {
      guide: {
        id: newGuide._id,
        name: newGuide.name,
        email: newGuide.email,
        location: newGuide.location,
        experience: newGuide.experience,
        specialization: newGuide.specialization,
        appliedDate: newGuide.appliedDate,
      },
    })

    res.json({
      success: true,
      message: "Application submitted successfully! We'll review your application and notify you within 24-48 hours.",
      guide: {
        id: newGuide._id,
        name: newGuide.name,
        email: newGuide.email,
        status: newGuide.status,
      },
    })
  } catch (error) {
    console.error("Guide application error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during application submission. Please try again.",
    })
  }
})

// Guide Session Verification
app.post("/api/guide/verify", (req, res) => {
  if (req.session.guide) {
    res.json({
      success: true,
      guide: req.session.guide,
    })
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    })
  }
})

// Guide Logout
app.post("/api/guide/logout", (req, res) => {
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

// ==================== ADMIN GUIDE MANAGEMENT ROUTES ====================

// Get all guides for admin management
app.get("/api/guides", requireAuth, requirePermission("canManageGuides"), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = {}
    if (status && status !== "all") {
      query.status = status
    }

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
    console.error("Error fetching guides:", error)
    res.status(500).json({ success: false, message: "Error fetching guides" })
  }
})

// Approve guide application
app.put("/api/guides/:id/approve", requireAuth, requirePermission("canManageGuides"), async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        approvedDate: new Date(),
        reviewedBy: req.session.admin.id,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Notify the guide about approval
    notifySpecificGuide(guide._id, "application-approved", {
      guide: {
        id: guide._id,
        name: guide.name,
        status: "approved",
      },
    })

    // Notify all admins
    notifyAdmins("guide-approved", {
      guide: {
        id: guide._id,
        name: guide.name,
        email: guide.email,
      },
      approvedBy: req.session.admin.username,
    })

    res.json({
      success: true,
      message: "Guide application approved successfully",
      guide,
    })
  } catch (error) {
    console.error("Error approving guide:", error)
    res.status(500).json({ success: false, message: "Error approving guide" })
  }
})

// Reject guide application
app.put("/api/guides/:id/reject", requireAuth, requirePermission("canManageGuides"), async (req, res) => {
  try {
    const { reason } = req.body

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectedDate: new Date(),
        rejectedReason: reason || "Application does not meet our requirements",
        reviewedBy: req.session.admin.id,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Notify the guide about rejection
    notifySpecificGuide(guide._id, "application-rejected", {
      guide: {
        id: guide._id,
        name: guide.name,
        status: "rejected",
        reason: guide.rejectedReason,
      },
    })

    res.json({
      success: true,
      message: "Guide application rejected",
      guide,
    })
  } catch (error) {
    console.error("Error rejecting guide:", error)
    res.status(500).json({ success: false, message: "Error rejecting guide" })
  }
})

// Suspend guide
app.put("/api/guides/:id/suspend", requireAuth, requirePermission("canManageGuides"), async (req, res) => {
  try {
    const { reason } = req.body

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      {
        status: "suspended",
        rejectedReason: reason || "Account suspended by admin",
        reviewedBy: req.session.admin.id,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Notify the guide about suspension
    notifySpecificGuide(guide._id, "account-suspended", {
      guide: {
        id: guide._id,
        name: guide.name,
        status: "suspended",
        reason: guide.rejectedReason,
      },
    })

    res.json({
      success: true,
      message: "Guide account suspended",
      guide,
    })
  } catch (error) {
    console.error("Error suspending guide:", error)
    res.status(500).json({ success: false, message: "Error suspending guide" })
  }
})

// ==================== GUIDE DASHBOARD ROUTES ====================

// Guide Dashboard Stats
app.get("/api/guide/stats", requireGuideAuth, async (req, res) => {
  try {
    const guideId = req.session.guide.id

    const [totalTours, pendingRequests, guideData, monthlyBookings] = await Promise.all([
      Booking.countDocuments({ guide: guideId, status: "completed" }),
      Booking.countDocuments({ guide: guideId, status: "pending" }),
      Guide.findById(guideId),
      Booking.find({
        guide: guideId,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        paymentStatus: "paid",
      }),
    ])

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)

    res.json({
      success: true,
      stats: {
        totalTours,
        pendingRequests,
        averageRating: guideData?.rating || 4.8,
        monthlyEarnings,
      },
    })
  } catch (error) {
    console.error("Error fetching guide stats:", error)
    res.status(500).json({ success: false, message: "Error fetching stats" })
  }
})

// Guide Profile
app.get("/api/guide/profile", requireGuideAuth, async (req, res) => {
  try {
    const guideId = req.session.guide.id
    const guide = await Guide.findById(guideId)

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    res.json({
      success: true,
      guide,
    })
  } catch (error) {
    console.error("Error fetching guide profile:", error)
    res.status(500).json({ success: false, message: "Error fetching profile" })
  }
})

// Update Guide Profile
app.put("/api/guide/profile", requireGuideAuth, async (req, res) => {
  try {
    const guideId = req.session.guide.id
    const updateData = { ...req.body, updatedAt: new Date() }

    const guide = await Guide.findByIdAndUpdate(guideId, updateData, {
      new: true,
    })

    if (!guide) {
      return res.status(404).json({ success: false, message: "Guide not found" })
    }

    // Update session data
    req.session.guide.name = guide.name
    req.session.guide.email = guide.email

    res.json({
      success: true,
      message: "Profile updated successfully",
      guide,
    })
  } catch (error) {
    console.error("Error updating guide profile:", error)
    res.status(500).json({ success: false, message: "Error updating profile" })
  }
})

// ==================== ADMIN AUTHENTICATION ROUTES ====================

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

// Dashboard stats
app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const [totalUsers, totalAttractions, totalReviews, pendingGuides, approvedGuides, rejectedGuides, totalGuides] =
      await Promise.all([
        User.countDocuments(),
        Attraction.countDocuments(),
        Review.countDocuments(),
        Guide.countDocuments({ status: "pending" }),
        Guide.countDocuments({ status: "approved" }),
        Guide.countDocuments({ status: "rejected" }),
        Guide.countDocuments(),
      ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAttractions,
        totalReviews,
        pendingGuides,
        approvedGuides,
        rejectedGuides,
        totalGuides,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ success: false, message: "Error fetching stats" })
  }
})

// Traveler Authentication Routes
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

// Static routes
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

app.get("/guide", (req, res) => {
  res.sendFile(path.join(__dirname, "../host/frontend/guide/guide.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

// 404 handler
app.use((req, res) => {
  console.log(`404 - File not found: ${req.path}`)
  res.status(404).send(`
    <h1>404 - File Not Found</h1>
    <p>Path: ${req.path}</p>
    <p><a href="/frontend/auth/index.html">Go to Login</a></p>
    <p><a href="/frontend/admin/admin.html">Go to Admin</a></p>
    <p><a href="/guide">Go to Guide Portal</a></p>
  `)
})

// Start server
server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`)
  console.log(`🔗 Frontend: http://localhost:${PORT}/frontend/auth/index.html`)
  console.log(`🔗 Admin Portal: http://localhost:${PORT}/admin`)
  console.log(`🔗 Guide Portal: http://localhost:${PORT}/guide`)
  console.log("✅ All guide functionality integrated successfully!")
})
