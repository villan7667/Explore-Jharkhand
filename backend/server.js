const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = 3000

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://hsgf7667:villan7667@cluster7667.h95hy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster7667",
  )
  .then(() => console.log("MongoDB connected at ✅"))
  .catch((err) => console.log(err))

// Admin Schema with plain text passwords and verification
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plain text as requested
  role: { type: String, default: "admin" },
  isVerified: { type: Boolean, default: false }, // Admin verification
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Admin = mongoose.model("Admin", adminSchema)

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

// Attractions Schema
const attractionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  district: { type: String, required: true },
  category: { type: String, required: true },
  entryFee: { type: String, default: "Free" },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, default: "active" },
  images: [String],
  createdAt: { type: Date, default: Date.now },
})

const Attraction = mongoose.model("Attraction", attractionSchema)

// Tourist Guides Schema
const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  languages: [String],
  specialization: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  totalTours: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  appliedDate: { type: Date, default: Date.now },
})

const Guide = mongoose.model("Guide", guideSchema)

// Reviews Schema
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  attraction: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
})

const Review = mongoose.model("Review", reviewSchema)

// Chat Messages Schema
const chatMessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ["user", "admin"], required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
})

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: "my_secret_key_admin_2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Serve static files
app.use(express.static(path.join(__dirname, "host")))

// Create sample data
async function createSampleData() {
  try {
    // Create default admin
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      const defaultAdmin = new Admin({
        username: "admin",
        email: "admin@explorejharkhand.com",
        password: "admin123", // Plain text as requested
        role: "admin",
        isVerified: true,
        isActive: true,
      })
      await defaultAdmin.save()
      console.log("✅ Default admin created - Username: admin, Password: admin123")
    }

    // Create sample attractions
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
        {
          name: "Jagannath Temple",
          description: "Ancient temple dedicated to Lord Jagannath, a significant religious site.",
          district: "Ranchi",
          category: "Religious",
          entryFee: "Free",
          rating: 4.7,
          reviewCount: 456,
          featured: false,
          status: "active",
        },
        {
          name: "Dassam Falls",
          description: "Beautiful waterfall with crystal clear water, ideal for picnics.",
          district: "Ranchi",
          category: "Waterfall",
          entryFee: "₹15",
          rating: 4.2,
          reviewCount: 178,
          featured: false,
          status: "active",
        },
        {
          name: "Patratu Valley",
          description: "Scenic valley with breathtaking views and adventure activities.",
          district: "Ramgarh",
          category: "Adventure",
          entryFee: "₹50",
          rating: 4.4,
          reviewCount: 267,
          featured: true,
          status: "active",
        },
      ]
      await Attraction.insertMany(sampleAttractions)
      console.log("✅ Sample attractions created")
    }

    // Create sample users
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      const sampleUsers = [
        {
          username: "rahul_kumar",
          email: "rahul.kumar@email.com",
          password: "password123",
          role: "traveler",
          location: "Ranchi",
          isActive: true,
        },
        {
          username: "priya_singh",
          email: "priya.singh@email.com",
          password: "password123",
          role: "contributor",
          location: "Jamshedpur",
          isActive: true,
        },
        {
          username: "amit_sharma",
          email: "amit.sharma@email.com",
          password: "password123",
          role: "guide",
          location: "Dhanbad",
          isActive: true,
        },
      ]
      await User.insertMany(sampleUsers)
      console.log("✅ Sample users created")
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
          rating: 4.8,
          totalTours: 156,
          status: "approved",
        },
      ]
      await Guide.insertMany(sampleGuides)
      console.log("✅ Sample guides created")
    }

    // Create sample reviews
    const reviewCount = await Review.countDocuments()
    if (reviewCount === 0) {
      const sampleReviews = [
        {
          user: "Rahul Kumar",
          attraction: "Hundru Falls",
          rating: 5,
          comment: "Amazing waterfall! Perfect for family trips. The natural beauty is breathtaking.",
          status: "pending",
        },
        {
          user: "Priya Singh",
          attraction: "Betla National Park",
          rating: 4,
          comment: "Great wildlife experience, saw tigers! The safari was well organized.",
          status: "approved",
        },
        {
          user: "Amit Sharma",
          attraction: "Jagannath Temple",
          rating: 5,
          comment: "Peaceful and spiritual place. The architecture is magnificent.",
          status: "approved",
        },
      ]
      await Review.insertMany(sampleReviews)
      console.log("✅ Sample reviews created")
    }
  } catch (error) {
    console.error("Error creating sample data:", error)
  }
}

// Call this function when server starts
createSampleData()

// Admin Authentication Routes
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body

  try {
    const admin = await Admin.findOne({ username, isActive: true, isVerified: true })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or admin not verified",
      })
    }

    // Plain text password comparison
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
    }

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
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

    // Create new admin (unverified by default)
    const newAdmin = new Admin({
      username,
      email,
      password, // Plain text as requested
      role: "admin",
      isVerified: false, // Requires verification
    })

    await newAdmin.save()

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
app.get("/api/admin/list", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const admins = await Admin.find(
      {},
      { password: 1, username: 1, email: 1, isVerified: 1, isActive: 1, createdAt: 1 },
    )
    res.json({ success: true, admins })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admins" })
  }
})

app.put("/api/admin/verify/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    await Admin.findByIdAndUpdate(req.params.id, { isVerified: true })
    res.json({ success: true, message: "Admin verified successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying admin" })
  }
})

// Attractions CRUD
app.get("/api/attractions", async (req, res) => {
  try {
    const attractions = await Attraction.find().sort({ createdAt: -1 })
    res.json({ success: true, attractions })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching attractions" })
  }
})

app.post("/api/attractions", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const attraction = new Attraction(req.body)
    await attraction.save()
    res.json({ success: true, message: "Attraction created successfully", attraction })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating attraction" })
  }
})

app.put("/api/attractions/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, message: "Attraction updated successfully", attraction })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating attraction" })
  }
})

app.delete("/api/attractions/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    await Attraction.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Attraction deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting attraction" })
  }
})

// Users CRUD
app.get("/api/users", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" })
  }
})

app.put("/api/users/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, message: "User updated successfully", user })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user" })
  }
})

app.delete("/api/users/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" })
  }
})

// Guides CRUD
app.get("/api/guides", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const guides = await Guide.find().sort({ appliedDate: -1 })
    res.json({ success: true, guides })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching guides" })
  }
})

app.put("/api/guides/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, message: "Guide updated successfully", guide })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating guide" })
  }
})

// Reviews CRUD
app.get("/api/reviews", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const reviews = await Review.find().sort({ createdAt: -1 })
    res.json({ success: true, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching reviews" })
  }
})

app.put("/api/reviews/:id", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, message: "Review updated successfully", review })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating review" })
  }
})

// Chat routes
app.get("/api/chats", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const chats = await ChatMessage.find().sort({ timestamp: -1 })
    res.json({ success: true, chats })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching chats" })
  }
})

// Dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" })
    }

    const totalUsers = await User.countDocuments()
    const totalAttractions = await Attraction.countDocuments()
    const totalReviews = await Review.countDocuments()
    const pendingGuides = await Guide.countDocuments({ status: "pending" })

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAttractions,
        totalReviews,
        pendingGuides,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" })
  }
})

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "admin.html"))
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/frontend/auth/index.html`)
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`)
})
