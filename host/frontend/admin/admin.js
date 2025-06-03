// Global variables
let currentUser = null
let currentPage = "dashboardPage"
let currentChatUser = null
let isDarkMode = false
let sidebarOpen = false
let isAuthenticated = false

// Sample data for demonstration (replace with API calls in production)
const sampleData = {
  attractions: [
    {
      id: 1,
      name: "Hundru Falls",
      district: "Ranchi",
      category: "Waterfall",
      rating: 4.5,
      reviews: 234,
      entryFee: "₹20",
      status: "active",
      featured: true,
      description: "A spectacular waterfall located 45 km from Ranchi",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      name: "Betla National Park",
      district: "Latehar",
      category: "Wildlife",
      rating: 4.3,
      reviews: 189,
      entryFee: "₹100",
      status: "active",
      featured: true,
      description: "Famous national park known for tigers and elephants",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 3,
      name: "Jagannath Temple",
      district: "Ranchi",
      category: "Religious",
      rating: 4.7,
      reviews: 456,
      entryFee: "Free",
      status: "active",
      featured: false,
      description: "Ancient temple dedicated to Lord Jagannath",
      image: "/placeholder.svg?height=100&width=100",
    },
  ],
  users: [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul.kumar@email.com",
      role: "traveler",
      status: "active",
      joinDate: "2024-01-15",
      location: "Ranchi",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya.singh@email.com",
      role: "contributor",
      status: "active",
      joinDate: "2023-12-20",
      location: "Jamshedpur",
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Amit Sharma",
      email: "amit.sharma@email.com",
      role: "guide",
      status: "active",
      joinDate: "2023-11-10",
      location: "Dhanbad",
      lastActive: "30 minutes ago",
    },
  ],
  pendingGuides: [
    {
      id: 1,
      name: "Amit Kumar Sharma",
      email: "amit.sharma@email.com",
      phone: "+91 9876543210",
      experience: "5 years",
      languages: ["Hindi", "English", "Bengali"],
      specialization: "Adventure Tourism",
      location: "Ranchi",
      appliedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya.singh@email.com",
      phone: "+91 9876543211",
      experience: "3 years",
      languages: ["Hindi", "English"],
      specialization: "Cultural Tourism",
      location: "Jamshedpur",
      appliedDate: "2024-01-14",
    },
  ],
  approvedGuides: [
    {
      id: 1,
      name: "Suresh Kumar",
      email: "suresh.kumar@email.com",
      experience: "8 years",
      specialization: "Religious Tourism",
      location: "Deoghar",
      rating: 4.8,
      totalTours: 156,
      status: "active",
    },
  ],
  chatUsers: [
    {
      id: 1,
      name: "Rahul Kumar",
      lastMessage: "Can you help me plan a trip to Ranchi?",
      time: "2 min ago",
      unread: 2,
      status: "online",
    },
    {
      id: 2,
      name: "Priya Singh",
      lastMessage: "What are the best places to visit in winter?",
      time: "15 min ago",
      unread: 0,
      status: "away",
    },
  ],
  reviews: [
    {
      id: 1,
      user: "Rahul Kumar",
      attraction: "Hundru Falls",
      rating: 5,
      comment: "Amazing waterfall! Perfect for family trips.",
      date: "2024-01-15",
      status: "pending",
    },
    {
      id: 2,
      user: "Priya Singh",
      attraction: "Betla National Park",
      rating: 4,
      comment: "Great wildlife experience, saw tigers!",
      date: "2024-01-14",
      status: "approved",
    },
  ],
  recentActivity: [
    {
      id: 1,
      user: "Rahul Kumar",
      action: "registered as a new user",
      time: "30 minutes ago",
      type: "user_signup",
    },
    {
      id: 2,
      user: "Priya Singh",
      action: "left a 5-star review for Hundru Falls",
      time: "2 hours ago",
      type: "review",
    },
    {
      id: 3,
      user: "Admin",
      action: "added new attraction: Pahari Mandir",
      time: "4 hours ago",
      type: "content",
    },
  ],
}

// Authentication functions
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.success && data.admin) {
      currentUser = data.admin
      isAuthenticated = true
      showDashboard()
      return true
    } else {
      showLoginPage()
      return false
    }
  } catch (error) {
    console.error("Auth check error:", error)
    showLoginPage()
    return false
  }
}

async function handleLogin(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    showAlert("Please fill in all fields", "error")
    return
  }

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success) {
      currentUser = data.admin
      isAuthenticated = true
      showAlert("Login successful!", "success")
      showDashboard()
    } else {
      showAlert(data.message || "Login failed", "error")
    }
  } catch (error) {
    console.error("Login error:", error)
    showAlert("Network error. Please try again.", "error")
  }
}

async function handleRegister(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)
  const username = formData.get("username")
  const email = formData.get("email")
  const password = formData.get("password")

  if (!username || !email || !password) {
    showAlert("Please fill in all fields", "error")
    return
  }

  try {
    const response = await fetch("/api/admin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Registration successful! Please sign in.", "success")
      // Switch to sign in form
      document.querySelector(".container").classList.remove("sign-up-mode")
    } else {
      showAlert(data.message || "Registration failed", "error")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showAlert("Network error. Please try again.", "error")
  }
}

async function logout() {
  try {
    const response = await fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.success) {
      currentUser = null
      isAuthenticated = false
      showAlert("Logged out successfully", "success")
      showLoginPage()
    } else {
      showAlert("Error logging out", "error")
    }
  } catch (error) {
    console.error("Logout error:", error)
    showAlert("Network error during logout", "error")
  }
}

function showLoginPage() {
  document.getElementById("loginPage").style.display = "flex"
  document.getElementById("dashboard").classList.remove("active")
}

function showDashboard() {
  document.getElementById("loginPage").style.display = "none"
  document.getElementById("dashboard").classList.add("active")
  loadDashboardData()
}

function showAlert(message, type = "info") {
  const alertElement = document.getElementById("custom-alert")
  const messageElement = document.getElementById("alert-message")

  messageElement.textContent = message
  alertElement.className = `custom-alert ${type}`
  alertElement.classList.remove("hidden")

  setTimeout(() => {
    alertElement.classList.add("hidden")
  }, 3000)
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme) {
    isDarkMode = savedTheme === "dark"
    document.documentElement.setAttribute("data-theme", savedTheme)

    const themeToggle = document.querySelector(".theme-toggle i")
    if (themeToggle) {
      themeToggle.className = isDarkMode ? "fas fa-sun" : "fas fa-moon"
    }
  }

  // Set up form event listeners
  const signInForm = document.getElementById("sign-in-form")
  const signUpForm = document.getElementById("sign-up-form")

  if (signInForm) {
    signInForm.addEventListener("submit", handleLogin)
  }

  if (signUpForm) {
    signUpForm.addEventListener("submit", handleRegister)
  }

  // Set up sign up/sign in toggle buttons
  const signUpBtn = document.getElementById("sign-up-btn")
  const signInBtn = document.getElementById("sign-in-btn")
  const container = document.querySelector(".container")

  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => {
      container.classList.add("sign-up-mode")
    })
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      container.classList.remove("sign-up-mode")
    })
  }

  // Check authentication status
  checkAuthStatus()

  // Add click outside modal to close
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active")
    }
  })

  // Handle window resize for responsive sidebar
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && sidebarOpen) {
      const sidebar = document.querySelector(".sidebar")
      if (sidebar) {
        sidebar.classList.remove("active")
        sidebarOpen = false
      }
    }
  })
})

// Navigation functions
function showPage(pageId) {
  if (!isAuthenticated) {
    showAlert("Please login first", "error")
    return
  }

  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden")
    page.classList.remove("active")
  })

  // Show selected page
  document.getElementById(pageId).classList.remove("hidden")
  document.getElementById(pageId).classList.add("active")

  // Update sidebar active state
  document.querySelectorAll(".sidebar-menu-link").forEach((link) => {
    link.classList.remove("active")
  })
  event.target.classList.add("active")

  currentPage = pageId

  // Load page-specific data
  switch (pageId) {
    case "dashboardPage":
      loadDashboardData()
      break
    case "attractionsPage":
      loadAttractionsData()
      break
    case "usersPage":
      loadUsersData()
      break
    case "guidesPage":
      loadGuidesData()
      break
    case "chatPage":
      loadChatData()
      break
    case "reviewsPage":
      loadReviewsData()
      break
    case "analyticsPage":
      loadAnalyticsData()
      break
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    toggleSidebar()
  }
}

// Data loading functions
function loadDashboardData() {
  loadRecentActivity()
}

function loadRecentActivity() {
  const container = document.getElementById("recentActivity")
  if (!container) return

  container.innerHTML = sampleData.recentActivity
    .map(
      (activity) => `
        <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-xs"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm">
                    <span class="font-medium">${activity.user}</span> ${activity.action}
                </p>
                <p class="text-xs text-gray-500">${activity.time}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

function loadAttractionsData() {
  const tbody = document.getElementById("attractionsTable")
  if (!tbody) return

  tbody.innerHTML = sampleData.attractions
    .map(
      (attraction) => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i class="fas fa-image text-gray-400"></i>
                    </div>
                    <div>
                        <p class="font-medium">${attraction.name}</p>
                        <p class="text-sm text-gray-500">${attraction.description.substring(0, 50)}...</p>
                        ${attraction.featured ? '<span class="badge badge-secondary">Featured</span>' : ""}
                    </div>
                </div>
            </td>
            <td>
                <div class="flex items-center gap-1">
                    <i class="fas fa-map-marker-alt text-xs"></i>
                    ${attraction.district}
                </div>
            </td>
            <td><span class="badge badge-secondary">${attraction.category}</span></td>
            <td>
                <div class="flex items-center gap-1">
                    <i class="fas fa-star text-yellow-400"></i>
                    <span class="font-medium">${attraction.rating}</span>
                    <span class="text-sm text-gray-500">(${attraction.reviews})</span>
                </div>
            </td>
            <td>${attraction.entryFee}</td>
            <td><span class="badge badge-success">${attraction.status}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm" onclick="viewAttraction(${attraction.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editAttraction(${attraction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAttraction(${attraction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function loadUsersData() {
  const tbody = document.getElementById("usersTable")
  if (!tbody) return

  tbody.innerHTML = sampleData.users
    .map(
      (user) => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-xs"></i>
                    </div>
                    <div>
                        <p class="font-medium">${user.name}</p>
                        <p class="text-sm text-gray-500">${user.email}</p>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${user.role}</span></td>
            <td><span class="badge badge-${getStatusBadgeClass(user.status)}">${user.status}</span></td>
            <td>
                <div class="flex items-center gap-1">
                    <i class="fas fa-map-marker-alt text-xs"></i>
                    ${user.location}
                </div>
            </td>
            <td>${user.joinDate}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-${user.status === "active" ? "danger" : "success"} btn-sm" 
                            onclick="toggleUserStatus(${user.id})">
                        <i class="fas fa-${user.status === "active" ? "ban" : "check"}"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function loadGuidesData() {
  loadPendingGuides()
  loadApprovedGuides()
}

function loadPendingGuides() {
  const tbody = document.getElementById("pendingGuidesTable")
  if (!tbody) return

  tbody.innerHTML = sampleData.pendingGuides
    .map(
      (guide) => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-xs"></i>
                    </div>
                    <div>
                        <p class="font-medium">${guide.name}</p>
                        <p class="text-sm text-gray-500">${guide.languages.join(", ")}</p>
                    </div>
                </div>
            </td>
            <td>${guide.experience}</td>
            <td><span class="badge badge-secondary">${guide.specialization}</span></td>
            <td>
                <div class="flex items-center gap-1">
                    <i class="fas fa-map-marker-alt text-xs"></i>
                    ${guide.location}
                </div>
            </td>
            <td>${guide.appliedDate}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm" onclick="viewGuideApplication(${guide.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success btn-sm" onclick="approveGuide(${guide.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectGuide(${guide.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function loadApprovedGuides() {
  const tbody = document.getElementById("approvedGuidesTable")
  if (!tbody) return

  tbody.innerHTML = sampleData.approvedGuides
    .map(
      (guide) => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-xs"></i>
                    </div>
                    <div>
                        <p class="font-medium">${guide.name}</p>
                        <p class="text-sm text-gray-500">${guide.email}</p>
                    </div>
                </div>
            </td>
            <td>${guide.experience}</td>
            <td>
                <div class="flex items-center gap-1">
                    <i class="fas fa-star text-yellow-400"></i>
                    <span class="font-medium">${guide.rating}</span>
                </div>
            </td>
            <td>${guide.totalTours}</td>
            <td><span class="badge badge-success">${guide.status}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-secondary btn-sm" onclick="viewGuide(${guide.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editGuide(${guide.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function loadChatData() {
  const container = document.getElementById("chatUsersList")
  if (!container) return

  container.innerHTML = sampleData.chatUsers
    .map(
      (user) => `
        <div class="chat-item ${user.id === 1 ? "active" : ""}" onclick="selectChatUser(${user.id})">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-sm"></i>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-${user.status === "online" ? "green" : user.status === "away" ? "yellow" : "gray"}-500 rounded-full border-2 border-white"></div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <p class="font-medium text-sm">${user.name}</p>
                        <div class="flex items-center gap-1">
                            <span class="text-xs text-gray-500">${user.time}</span>
                            ${user.unread > 0 ? `<span class="badge badge-danger">${user.unread}</span>` : ""}
                        </div>
                    </div>
                    <p class="text-sm text-gray-500 truncate">${user.lastMessage}</p>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function loadReviewsData() {
  const tbody = document.getElementById("reviewsTable")
  if (!tbody) return

  tbody.innerHTML = sampleData.reviews
    .map(
      (review) => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-xs"></i>
                    </div>
                    <span class="font-medium">${review.user}</span>
                </div>
            </td>
            <td>${review.attraction}</td>
            <td>
                <div class="flex items-center gap-1">
                    ${Array.from(
                      { length: 5 },
                      (_, i) =>
                        `<i class="fas fa-star ${i < review.rating ? "text-yellow-400" : "text-gray-300"}"></i>`,
                    ).join("")}
                </div>
            </td>
            <td class="max-w-xs truncate">${review.comment}</td>
            <td>${review.date}</td>
            <td><span class="badge badge-${review.status === "approved" ? "success" : "warning"}">${review.status}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-success btn-sm" onclick="approveReview(${review.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="rejectReview(${review.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,
    )
    .join("")
}

function loadAnalyticsData() {
  const container = document.getElementById("topDestinations")
  if (!container) return

  const destinations = [
    { name: "Hundru Falls", views: 2847, district: "Ranchi" },
    { name: "Betla National Park", views: 2156, district: "Latehar" },
    { name: "Jagannath Temple", views: 1923, district: "Ranchi" },
    { name: "Dassam Falls", views: 1654, district: "Ranchi" },
    { name: "Patratu Valley", views: 1432, district: "Ramgarh" },
  ]

  container.innerHTML = destinations
    .map(
      (dest, index) => `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
                <span class="badge badge-secondary w-6 h-6 rounded-full flex items-center justify-center text-xs">${index + 1}</span>
                <div>
                    <p class="font-medium text-sm">${dest.name}</p>
                    <p class="text-xs text-gray-500">${dest.district}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium text-sm">${dest.views.toLocaleString()}</p>
                <p class="text-xs text-gray-500">views</p>
            </div>
        </div>
    `,
    )
    .join("")
}

// Chat functions
function selectChatUser(userId) {
  currentChatUser = userId
  const user = sampleData.chatUsers.find((u) => u.id === userId)

  // Update active chat item
  document.querySelectorAll(".chat-item").forEach((item) => item.classList.remove("active"))
  event.target.closest(".chat-item").classList.add("active")

  // Update chat header
  const nameElement = document.getElementById("selectedUserName")
  const statusElement = document.getElementById("selectedUserStatus")
  if (nameElement) nameElement.textContent = user.name
  if (statusElement) statusElement.textContent = user.status

  // Load chat messages
  loadChatMessages(userId)

  // Enable input
  const messageInput = document.getElementById("messageInput")
  const sendButton = document.getElementById("sendButton")
  if (messageInput) messageInput.disabled = false
  if (sendButton) sendButton.disabled = false
}

function loadChatMessages(userId) {
  const container = document.getElementById("chatMessages")
  if (!container) return

  const messages = [
    { sender: "user", content: "Hi, I need help planning a trip to Jharkhand", time: "10:30 AM" },
    {
      sender: "admin",
      content: "Hello! I'd be happy to help you plan your trip. What type of attractions are you interested in?",
      time: "10:32 AM",
    },
    { sender: "user", content: "I'm mainly interested in waterfalls and natural beauty", time: "10:35 AM" },
    {
      sender: "admin",
      content: "Perfect! I recommend Hundru Falls and Dassam Falls near Ranchi. Would you like detailed information?",
      time: "10:37 AM",
    },
  ]

  container.innerHTML = messages
    .map(
      (msg) => `
        <div class="message ${msg.sender}">
            <div class="message-content">
                <p>${msg.content}</p>
                <p class="text-xs mt-1 opacity-70">${msg.time}</p>
            </div>
        </div>
    `,
    )
    .join("")

  container.scrollTop = container.scrollHeight
}

function sendMessage() {
  const input = document.getElementById("messageInput")
  if (!input) return

  const message = input.value.trim()

  if (message && currentChatUser) {
    const container = document.getElementById("chatMessages")
    if (container) {
      const messageDiv = document.createElement("div")
      messageDiv.className = "message admin"
      messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                    <p class="text-xs mt-1 opacity-70">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
            `
      container.appendChild(messageDiv)
      container.scrollTop = container.scrollHeight
    }

    input.value = ""
    showNotification("Message sent", "success")
  }
}

// Handle Enter key in chat input
document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("messageInput")
  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage()
      }
    })
  }
})

// Guide tab switching
function switchGuideTab(tabName) {
  const guidesPage = document.getElementById("guidesPage")
  if (!guidesPage) return

  guidesPage.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
  guidesPage.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

  event.target.classList.add("active")
  const targetTab = document.getElementById(tabName + "GuidesTab")
  if (targetTab) targetTab.classList.add("active")
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) modal.classList.add("active")
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) modal.classList.remove("active")
}

// Action functions
function addAttraction() {
  showNotification("Attraction added successfully!", "success")
  closeModal("addAttractionModal")
  loadAttractionsData()
}

function viewAttraction(id) {
  showNotification("Viewing attraction details", "info")
}

function editAttraction(id) {
  showNotification("Edit attraction functionality", "info")
}

function deleteAttraction(id) {
  if (confirm("Are you sure you want to delete this attraction?")) {
    showNotification("Attraction deleted successfully", "success")
    loadAttractionsData()
  }
}

function approveGuide(id) {
  showNotification("Guide application approved!", "success")
  loadGuidesData()
}

function rejectGuide(id) {
  if (confirm("Are you sure you want to reject this application?")) {
    showNotification("Guide application rejected", "success")
    loadGuidesData()
  }
}

function viewGuideApplication(id) {
  showNotification("Viewing guide application details", "info")
}

function viewGuide(id) {
  showNotification("Viewing guide profile", "info")
}

function editGuide(id) {
  showNotification("Edit guide functionality", "info")
}

function approveReview(id) {
  showNotification("Review approved!", "success")
  loadReviewsData()
}

function rejectReview(id) {
  showNotification("Review rejected", "success")
  loadReviewsData()
}

function viewUser(id) {
  showNotification("Viewing user profile", "info")
}

function editUser(id) {
  showNotification("Edit user functionality", "info")
}

function toggleUserStatus(id) {
  showNotification("User status updated", "success")
  loadUsersData()
}

// Utility functions
function getRoleBadgeClass(role) {
  switch (role) {
    case "admin":
      return "danger"
    case "guide":
      return "primary"
    case "contributor":
      return "success"
    default:
      return "secondary"
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "active":
      return "success"
    case "suspended":
      return "danger"
    case "pending":
      return "warning"
    default:
      return "secondary"
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  if (sidebar) {
    sidebarOpen = !sidebarOpen
    sidebar.classList.toggle("active", sidebarOpen)
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode
  document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light")

  const icon = event.target.querySelector("i")
  if (icon) {
    icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon"
  }

  // Save theme preference
  localStorage.setItem("theme", isDarkMode ? "dark" : "light")
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}
