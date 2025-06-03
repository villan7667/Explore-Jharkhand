// Global variables
let currentUser = null
let currentPage = "dashboardPage"
let isDarkMode = false
let sidebarOpen = false
let isAuthenticated = false
let socket = null
let refreshInterval = null

// Import Socket.IO
const io = require("socket.io-client")

// Initialize Socket.IO connection
function initializeSocket() {
  socket = io()

  socket.on("connect", () => {
    console.log("Connected to server")
    if (currentUser) {
      socket.emit("join-admin", currentUser.id)
    }
  })

  socket.on("disconnect", () => {
    console.log("Disconnected from server")
  })

  // Real-time notifications
  socket.on("new-admin-registration", (data) => {
    showAlert(`New admin registration: ${data.admin.username}`, "info")
    if (currentPage === "adminManagePage") {
      loadAdminData()
    }
    updateNotificationBadges()
  })

  socket.on("new-attraction", (data) => {
    showAlert(`New attraction added: ${data.attraction.name}`, "success")
    if (currentPage === "attractionsPage") {
      loadAttractionsData()
    }
    updateDashboardStats()
  })

  socket.on("guide-status-updated", (data) => {
    showAlert(`Guide ${data.guide.name} status updated to ${data.guide.status}`, "info")
    if (currentPage === "guidesPage") {
      loadGuidesData()
    }
    updateNotificationBadges()
  })

  socket.on("new-message", (data) => {
    if (currentPage === "chatPage") {
      loadChatData()
    }
    updateNotificationBadges()
    showAlert("New message received", "info")
  })

  socket.on("booking-updated", (data) => {
    showAlert(`Booking for ${data.booking.attraction} updated`, "info")
    updateDashboardStats()
  })
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
      initializeSocket()
      startAutoRefresh()
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
      document.getElementById("admin-username").textContent = currentUser.username
      initializeSocket()
      startAutoRefresh()
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
      showAlert("Registration successful! Awaiting verification.", "success")
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
      if (socket) {
        socket.disconnect()
      }
      stopAutoRefresh()
    } else {
      showAlert("Error logging out", "error")
    }
  } catch (error) {
    console.error("Logout error:", error)
    showAlert("Network error during logout", "error")
  }
}

function showLoginPage() {
  document.getElementById("loginPage").style.display = "block"
  document.getElementById("dashboard").classList.remove("active")
}

function showDashboard() {
  document.getElementById("loginPage").style.display = "none"
  document.getElementById("dashboard").classList.add("active")
  loadDashboardData()
  updateNotificationBadges()
}

function showAlert(message, type = "info") {
  const alertElement = document.getElementById("custom-alert")
  const messageElement = document.getElementById("alert-message")

  messageElement.textContent = message
  alertElement.className = `custom-alert ${type}`
  alertElement.classList.remove("hidden")

  setTimeout(() => {
    alertElement.classList.add("hidden")
  }, 4000)
}

// Auto-refresh functionality
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (isAuthenticated) {
      updateDashboardStats()
      updateNotificationBadges()

      // Refresh current page data
      switch (currentPage) {
        case "dashboardPage":
          loadDashboardData()
          break
        case "chatPage":
          loadChatData()
          break
      }
    }
  }, 30000) // Refresh every 30 seconds
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
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

  // Mobile menu functionality
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileNav = document.getElementById("mobile-nav")
  const menuIcon = document.getElementById("menu-icon")
  const closeIcon = document.getElementById("close-icon")

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      const isActive = mobileNav.classList.contains("active")

      if (isActive) {
        mobileNav.classList.remove("active")
        menuIcon.style.display = "block"
        closeIcon.style.display = "none"
      } else {
        mobileNav.classList.add("active")
        menuIcon.style.display = "none"
        closeIcon.style.display = "block"
      }
    })
  }

  // Mobile dropdown functionality
  const dropdownTrigger = document.getElementById("places-dropdown-trigger")
  const dropdownContent = document.getElementById("places-dropdown-content")

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener("click", () => {
      dropdownContent.classList.toggle("active")
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

  // Chat input enter key functionality
  const messageInput = document.getElementById("messageInput")
  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    })
  }
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
    case "adminManagePage":
      loadAdminData()
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

// Data loading functions with enhanced error handling
async function updateDashboardStats() {
  try {
    const response = await fetch("/api/dashboard/stats")
    const data = await response.json()

    if (data.success) {
      document.getElementById("totalUsers").textContent = data.stats.totalUsers
      document.getElementById("totalAttractions").textContent = data.stats.totalAttractions
      document.getElementById("totalReviews").textContent = data.stats.totalReviews
      document.getElementById("pendingGuides").textContent = data.stats.pendingGuides
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

async function loadDashboardData() {
  try {
    updateDashboardStats()

    // Load recent activity
    const analyticsResponse = await fetch("/api/dashboard/analytics?period=7d")
    const analyticsData = await analyticsResponse.json()

    if (analyticsData.success) {
      updateRecentActivity(analyticsData.recentActivity)
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

function updateRecentActivity(recentActivity) {
  const activityContainer = document.getElementById("recentActivity")
  if (!activityContainer) return

  let activityHTML = ""

  // Add recent users
  if (recentActivity.users) {
    recentActivity.users.slice(0, 2).forEach((user) => {
      activityHTML += `
        <div class="activity-item">
          <i class="fas fa-user-plus"></i>
          <div>
            <p>New user registered: ${user.username}</p>
            <span>${formatTimeAgo(user.createdAt)}</span>
          </div>
        </div>
      `
    })
  }

  // Add recent reviews
  if (recentActivity.reviews) {
    recentActivity.reviews.slice(0, 2).forEach((review) => {
      activityHTML += `
        <div class="activity-item">
          <i class="fas fa-star"></i>
          <div>
            <p>New review for ${review.attraction?.name || "Unknown"}</p>
            <span>${formatTimeAgo(review.createdAt)}</span>
          </div>
        </div>
      `
    })
  }

  // Add recent bookings
  if (recentActivity.bookings) {
    recentActivity.bookings.slice(0, 1).forEach((booking) => {
      activityHTML += `
        <div class="activity-item">
          <i class="fas fa-calendar-check"></i>
          <div>
            <p>New booking for ${booking.attraction?.name || "Unknown"}</p>
            <span>${formatTimeAgo(booking.createdAt)}</span>
          </div>
        </div>
      `
    })
  }

  if (activityHTML === "") {
    activityHTML = `
      <div class="activity-item">
        <i class="fas fa-info-circle"></i>
        <div>
          <p>No recent activity</p>
          <span>Check back later</span>
        </div>
      </div>
    `
  }

  activityContainer.innerHTML = activityHTML
}

async function loadAttractionsData() {
  try {
    const response = await fetch("/api/attractions")
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("attractionsTable")
      tbody.innerHTML = data.attractions
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
                <td>${attraction.district}</td>
                <td><span class="badge badge-secondary">${attraction.category}</span></td>
                <td>
                    <div class="flex items-center gap-1">
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="font-medium">${attraction.rating}</span>
                        <span class="text-sm text-gray-500">(${attraction.reviewCount})</span>
                    </div>
                </td>
                <td>${attraction.entryFee}</td>
                <td><span class="badge badge-success">${attraction.status}</span></td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="editAttraction('${attraction._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteAttraction('${attraction._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading attractions:", error)
    showAlert("Error loading attractions", "error")
  }
}

async function loadUsersData() {
  try {
    const response = await fetch("/api/users")
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("usersTable")
      tbody.innerHTML = data.users
        .map(
          (user) => `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-xs"></i>
                        </div>
                        <div>
                            <p class="font-medium">${user.fullName || user.username}</p>
                            <p class="text-sm text-gray-500">${user.email}</p>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                <td><span class="badge badge-${getStatusBadgeClass(user.isActive ? "active" : "inactive")}">${user.isActive ? "Active" : "Inactive"}</span></td>
                <td>${user.location || "N/A"}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary btn-sm" onclick="editUser('${user._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-${user.isActive ? "danger" : "success"} btn-sm" 
                                onclick="toggleUserStatus('${user._id}', ${!user.isActive})">
                            <i class="fas fa-${user.isActive ? "ban" : "check"}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading users:", error)
    showAlert("Error loading users", "error")
  }
}

async function loadGuidesData() {
  try {
    const response = await fetch("/api/guides")
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("guidesTable")
      tbody.innerHTML = data.guides
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
                            ${
                              guide.rating
                                ? `<div class="flex items-center gap-1">
                              <i class="fas fa-star text-yellow-400 text-xs"></i>
                              <span class="text-xs">${guide.rating}</span>
                            </div>`
                                : ""
                            }
                        </div>
                    </div>
                </td>
                <td>${guide.experience}</td>
                <td><span class="badge badge-secondary">${guide.specialization}</span></td>
                <td>${guide.location}</td>
                <td>${new Date(guide.appliedDate).toLocaleDateString()}</td>
                <td><span class="badge badge-${getStatusBadgeClass(guide.status)}">${guide.status}</span></td>
                <td>
                    <div class="flex gap-2">
                        ${
                          guide.status === "pending"
                            ? `
                            <button class="btn btn-success btn-sm" onclick="approveGuide('${guide._id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rejectGuide('${guide._id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        `
                            : `
                            <button class="btn btn-secondary btn-sm" onclick="viewGuide('${guide._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${
                              guide.status === "approved"
                                ? `
                              <button class="btn btn-warning btn-sm" onclick="suspendGuide('${guide._id}')">
                                  <i class="fas fa-pause"></i>
                              </button>
                            `
                                : ""
                            }
                        `
                        }
                    </div>
                </td>
            </tr>
        `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading guides:", error)
    showAlert("Error loading guides", "error")
  }
}

async function loadChatData() {
  try {
    const response = await fetch("/api/chats")
    const data = await response.json()

    if (data.success) {
      const chatList = document.getElementById("chatUsersList")
      if (chatList) {
        chatList.innerHTML = data.chatSessions
          .map(
            (chat) => `
              <div class="chat-item ${chat.unreadCount > 0 ? "active" : ""}" onclick="selectChat('${chat._id}')">
                  <div class="flex items-center gap-3">
                      <div class="relative">
                          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <i class="fas fa-user text-sm"></i>
                          </div>
                          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div class="flex-1">
                          <div class="flex items-center justify-between">
                              <p class="font-medium text-sm">${chat.name}</p>
                              <div class="flex items-center gap-1">
                                  <span class="text-xs text-gray-500">${formatTimeAgo(chat.lastTimestamp)}</span>
                                  ${chat.unreadCount > 0 ? `<span class="badge badge-danger">${chat.unreadCount}</span>` : ""}
                              </div>
                          </div>
                          <p class="text-sm text-gray-500 truncate">${chat.lastMessage}</p>
                      </div>
                  </div>
              </div>
          `,
          )
          .join("")
      }
    }
  } catch (error) {
    console.error("Error loading chat data:", error)
    showAlert("Error loading chat data", "error")
  }
}

async function selectChat(chatId) {
  try {
    const response = await fetch(`/api/chats/${chatId}`)
    const data = await response.json()

    if (data.success) {
      const messagesContainer = document.getElementById("chatMessages")
      const selectedUserName = document.getElementById("selectedUserName")
      const selectedUserStatus = document.getElementById("selectedUserStatus")

      // Update chat header
      if (data.messages.length > 0) {
        const firstMessage = data.messages[0]
        selectedUserName.textContent = firstMessage.name
        selectedUserStatus.textContent = "Online"
      }

      // Update messages
      messagesContainer.innerHTML = data.messages
        .map(
          (message) => `
            <div class="message ${message.sender}">
                <div class="message-content">
                    <p>${message.message}</p>
                    <p class="text-xs mt-1 opacity-70">${new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `,
        )
        .join("")

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      // Store current chat ID
      window.currentChatId = chatId

      // Update chat list to remove unread indicators
      loadChatData()
    }
  } catch (error) {
    console.error("Error loading chat messages:", error)
    showAlert("Error loading chat messages", "error")
  }
}

async function sendMessage() {
  const messageInput = document.getElementById("messageInput")
  const message = messageInput.value.trim()

  if (!message || !window.currentChatId) {
    return
  }

  try {
    const response = await fetch(`/api/chats/${window.currentChatId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    const data = await response.json()

    if (data.success) {
      messageInput.value = ""
      selectChat(window.currentChatId) // Refresh messages
    } else {
      showAlert("Error sending message", "error")
    }
  } catch (error) {
    console.error("Error sending message:", error)
    showAlert("Network error", "error")
  }
}

async function loadReviewsData() {
  try {
    const response = await fetch("/api/reviews")
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("reviewsTable")
      tbody.innerHTML = data.reviews
        .map(
          (review) => `
            <tr>
                <td>${review.userName}</td>
                <td>${review.attractionName}</td>
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
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                <td><span class="badge badge-${review.status === "approved" ? "success" : review.status === "rejected" ? "danger" : "warning"}">${review.status}</span></td>
                <td>
                    <div class="flex gap-2">
                        ${
                          review.status === "pending"
                            ? `
                          <button class="btn btn-success btn-sm" onclick="approveReview('${review._id}')">
                              <i class="fas fa-check"></i>
                          </button>
                          <button class="btn btn-danger btn-sm" onclick="rejectReview('${review._id}')">
                              <i class="fas fa-times"></i>
                          </button>
                        `
                            : `
                          <button class="btn btn-secondary btn-sm" onclick="viewReview('${review._id}')">
                              <i class="fas fa-eye"></i>
                          </button>
                        `
                        }
                    </div>
                </td>
            </tr>
        `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading reviews:", error)
    showAlert("Error loading reviews", "error")
  }
}

async function loadAdminData() {
  try {
    const response = await fetch("/api/admin/list")
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("adminTable")
      tbody.innerHTML = data.admins
        .map(
          (admin) => `
            <tr>
                <td>${admin.username}</td>
                <td>${admin.email}</td>
                <td><code class="px-2 py-1 bg-gray-100 rounded text-sm">${admin.password}</code></td>
                <td><span class="badge badge-${admin.isVerified ? "success" : "warning"}">${admin.isVerified ? "Verified" : "Pending"}</span></td>
                <td><span class="badge badge-${admin.isActive ? "success" : "danger"}">${admin.isActive ? "Active" : "Inactive"}</span></td>
                <td>${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}</td>
                <td>
                    <div class="flex gap-2">
                        ${
                          !admin.isVerified
                            ? `
                            <button class="btn btn-success btn-sm" onclick="verifyAdmin('${admin._id}')">
                                <i class="fas fa-check"></i> Verify
                            </button>
                        `
                            : ""
                        }
                        ${
                          admin.username !== currentUser.username
                            ? `
                          <button class="btn btn-danger btn-sm" onclick="deleteAdmin('${admin._id}')">
                              <i class="fas fa-trash"></i>
                          </button>
                        `
                            : ""
                        }
                    </div>
                </td>
            </tr>
        `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error loading admin data:", error)
    showAlert("Error loading admin data", "error")
  }
}

async function loadAnalyticsData() {
  try {
    const response = await fetch("/api/dashboard/analytics?period=30d")
    const data = await response.json()

    if (data.success) {
      // Update top destinations
      const topDestinations = document.getElementById("topDestinations")
      if (topDestinations && data.topAttractions) {
        topDestinations.innerHTML = data.topAttractions
          .slice(0, 5)
          .map(
            (attraction, index) => `
              <div class="destination-item">
                  <span class="rank">${index + 1}</span>
                  <div class="destination-info">
                      <h4>${attraction.name}</h4>
                      <p>${attraction.views} views</p>
                  </div>
              </div>
          `,
          )
          .join("")
      }
    }
  } catch (error) {
    console.error("Error loading analytics:", error)
    showAlert("Error loading analytics", "error")
  }
}

// Notification badge updates
async function updateNotificationBadges() {
  try {
    const response = await fetch("/api/notifications")
    const data = await response.json()

    if (data.success) {
      // Update chat notification badge
      const chatBadge = document.querySelector(".notification-badge[data-count]")
      const chatNotification = data.notifications.find((n) => n.type === "chats")
      if (chatBadge && chatNotification) {
        chatBadge.setAttribute("data-count", chatNotification.count)
      }

      // Update bell notification badge
      const bellBadge = document.querySelectorAll(".notification-badge")[1]
      const totalNotifications = data.notifications.reduce((sum, n) => sum + n.count, 0)
      if (bellBadge) {
        bellBadge.setAttribute("data-count", totalNotifications)
      }
    }
  } catch (error) {
    console.error("Error updating notification badges:", error)
  }
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

// Action functions with enhanced error handling
async function addAttraction() {
  const form = document.getElementById("addAttractionForm")
  const formData = new FormData(form)

  const attractionData = {
    name: formData.get("name"),
    description: formData.get("description"),
    district: formData.get("district"),
    category: formData.get("category"),
    entryFee: formData.get("entryFee") || "Free",
    featured: formData.get("featured") === "on",
  }

  try {
    const response = await fetch("/api/attractions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attractionData),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Attraction added successfully!", "success")
      closeModal("addAttractionModal")
      form.reset()
      loadAttractionsData()
      updateDashboardStats()
    } else {
      showAlert(data.message || "Error adding attraction", "error")
    }
  } catch (error) {
    console.error("Error adding attraction:", error)
    showAlert("Network error", "error")
  }
}

async function deleteAttraction(id) {
  if (
    confirm("Are you sure you want to delete this attraction? This will also delete all related reviews and bookings.")
  ) {
    try {
      const response = await fetch(`/api/attractions/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Attraction deleted successfully", "success")
        loadAttractionsData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error deleting attraction", "error")
      }
    } catch (error) {
      console.error("Error deleting attraction:", error)
      showAlert("Network error", "error")
    }
  }
}

async function approveGuide(id) {
  try {
    const response = await fetch(`/api/guides/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Guide approved successfully!", "success")
      loadGuidesData()
      updateNotificationBadges()
    } else {
      showAlert(data.message || "Error approving guide", "error")
    }
  } catch (error) {
    console.error("Error approving guide:", error)
    showAlert("Network error", "error")
  }
}

async function rejectGuide(id) {
  const reason = prompt("Please provide a reason for rejection:")
  if (reason && confirm("Are you sure you want to reject this guide application?")) {
    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectedReason: reason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Guide application rejected", "success")
        loadGuidesData()
        updateNotificationBadges()
      } else {
        showAlert(data.message || "Error rejecting guide", "error")
      }
    } catch (error) {
      console.error("Error rejecting guide:", error)
      showAlert("Network error", "error")
    }
  }
}

async function suspendGuide(id) {
  if (confirm("Are you sure you want to suspend this guide?")) {
    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "suspended" }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Guide suspended", "success")
        loadGuidesData()
      } else {
        showAlert(data.message || "Error suspending guide", "error")
      }
    } catch (error) {
      console.error("Error suspending guide:", error)
      showAlert("Network error", "error")
    }
  }
}

async function approveReview(id) {
  try {
    const response = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Review approved!", "success")
      loadReviewsData()
      updateNotificationBadges()
    } else {
      showAlert(data.message || "Error approving review", "error")
    }
  } catch (error) {
    console.error("Error approving review:", error)
    showAlert("Network error", "error")
  }
}

async function rejectReview(id) {
  const reason = prompt("Please provide a reason for rejection:")
  if (reason && confirm("Are you sure you want to reject this review?")) {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          moderatorNote: reason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Review rejected", "success")
        loadReviewsData()
        updateNotificationBadges()
      } else {
        showAlert(data.message || "Error rejecting review", "error")
      }
    } catch (error) {
      console.error("Error rejecting review:", error)
      showAlert("Network error", "error")
    }
  }
}

async function verifyAdmin(id) {
  if (confirm("Are you sure you want to verify this admin?")) {
    try {
      const response = await fetch(`/api/admin/verify/${id}`, {
        method: "PUT",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Admin verified successfully!", "success")
        loadAdminData()
      } else {
        showAlert(data.message || "Error verifying admin", "error")
      }
    } catch (error) {
      console.error("Error verifying admin:", error)
      showAlert("Network error", "error")
    }
  }
}

async function deleteAdmin(id) {
  if (confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Admin deleted successfully", "success")
        loadAdminData()
      } else {
        showAlert(data.message || "Error deleting admin", "error")
      }
    } catch (error) {
      console.error("Error deleting admin:", error)
      showAlert("Network error", "error")
    }
  }
}

async function toggleUserStatus(id, newStatus) {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: newStatus }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert(`User ${newStatus ? "activated" : "deactivated"} successfully`, "success")
      loadUsersData()
    } else {
      showAlert(data.message || "Error updating user", "error")
    }
  } catch (error) {
    console.error("Error updating user:", error)
    showAlert("Network error", "error")
  }
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
    case "approved":
      return "success"
    case "inactive":
    case "rejected":
    case "suspended":
      return "danger"
    case "pending":
      return "warning"
    default:
      return "secondary"
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
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

  localStorage.setItem("theme", isDarkMode ? "dark" : "light")
}

function switchGuideTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active")
  })

  // Add active class to clicked tab
  event.target.classList.add("active")

  // Filter guides based on tab
  loadGuidesData() // You can modify this to filter by status
}

// Placeholder functions for future implementation
function editAttraction(id) {
  showAlert("Edit attraction functionality - Coming soon!", "info")
}

function editUser(id) {
  showAlert("Edit user functionality - Coming soon!", "info")
}

function viewGuide(id) {
  showAlert("View guide functionality - Coming soon!", "info")
}

function viewReview(id) {
  showAlert("View review functionality - Coming soon!", "info")
}

// Search functionality
let searchTimeout = null

function setupSearch() {
  const searchInput = document.querySelector(".search-input")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value)
      }, 500)
    })
  }
}

async function performSearch(query) {
  if (!query.trim()) return

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()

    if (data.success) {
      // Handle search results based on current page
      console.log("Search results:", data.results)
      // You can implement search result display here
    }
  } catch (error) {
    console.error("Search error:", error)
  }
}

// Initialize search when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupSearch()
})
