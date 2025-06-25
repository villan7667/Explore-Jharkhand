// Global variables
let currentUser = null
let currentPage = "dashboardPage"
let isDarkMode = false
let sidebarOpen = false
let isAuthenticated = false
let socket = null
let refreshInterval = null
let currentChatId = null
const io = window.io
let unreadChatCount = 0;


// Initialize Socket.IO connection
function initializeSocket() {
  if (typeof io !== "undefined") {
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

    // Real-time notifications for guide applications
    socket.on("new-guide-application", (data) => {
      showAlert(`New guide application from ${data.guide.name}`, "info", true)
      if (currentPage === "guidesPage") {
        loadGuidesData()
      }
      updateNotificationBadges()
      updateDashboardStats()
    })

    socket.on("guide-approved", (data) => {
      showAlert(`Guide ${data.guide.name} approved by ${data.approvedBy}`, "success")
      if (currentPage === "guidesPage") {
        loadGuidesData()
      }
      updateDashboardStats()
    })

    // Real-time notifications for admin applications
    socket.on("new-admin-application", (data) => {
      showAlert(`New admin application from ${data.admin.username}`, "info", true)
      if (currentPage === "adminManagePage") {
        loadAdminData()
      }
      updateNotificationBadges()
      updateDashboardStats()
    })

    socket.on("admin-approved", (data) => {
      showAlert(`Admin ${data.admin.username} approved`, "success")
      if (currentPage === "adminManagePage") {
        loadAdminData()
      }
      updateDashboardStats()
    })

    socket.on("new-attraction", (data) => {
      showAlert(`New attraction added: ${data.attraction.name}`, "success")
      if (currentPage === "attractionsPage") {
        loadAttractionsData()
      }
      updateDashboardStats()
    })

    // Live Chat Socket Events
    socket.on("new-chat-started", (data) => {
      console.log("New chat started:", data)
      showAlert(`New chat started by ${data.userName}`, "info", true)
      if (currentPage === "chatPage") {
        loadChatList()
      }
      updateChatNotifications()
    })

    socket.on("new-chat-message", (data) => {
      console.log("New chat message:", data)
      showAlert(`New message from ${data.name}`, "info", true)
      if (currentPage === "chatPage") {
        if (currentChatId === data.chatId) {
          loadChatMessages(currentChatId)
        }
        loadChatList()
      }
      updateChatNotifications()
    })

    socket.on("chat-ended", (data) => {
      console.log("Chat ended:", data)
      if (currentPage === "chatPage") {
        loadChatList()
        if (currentChatId === data.chatId) {
          showChatWelcome()
        }
      }
    })
  } else {
    console.warn("Socket.IO not loaded. Real-time features disabled.")
  }
}

// Enhanced authentication functions
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()
    if (data.success && data.admin) {
      currentUser = data.admin
      isAuthenticated = true
    
      showDashboard()
      initializeSocket()
      startAutoRefresh()
    
      
      setTimeout(updateAdminName, 300)
    
      return true
    }
    else {
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

  const submitBtn = form.querySelector('input[type="submit"]')
  const originalText = submitBtn.value
  submitBtn.value = "Logging in..."
  submitBtn.disabled = true

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (data.success) {
      currentUser = data.admin
      isAuthenticated = true
      showAlert("Login successful!", "success")
      showDashboard()

      const adminUsernameEl = document.getElementById("admin-username")
      if (adminUsernameEl) {
        adminUsernameEl.textContent = currentUser.username
      }

      initializeSocket()
      startAutoRefresh()
      form.reset()
    } else {
      showAlert(data.message || "Login failed", "error")
    }
  } catch (error) {
    console.error("Login error:", error)
    showAlert("Network error. Please try again.", "error")
  } finally {
    submitBtn.value = originalText
    submitBtn.disabled = false
  }
}

// Handle admin registration
async function handleAdminRegister(event) {
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

  const submitBtn = form.querySelector('input[type="submit"]')
  const originalText = submitBtn.value
  submitBtn.value = "Registering..."
  submitBtn.disabled = true

  try {
    const response = await fetch("/api/admin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    })

    const data = await response.json()

    if (data.success) {
      showAlert("Registration successful! Your application is pending approval.", "success")
      form.reset()
      toggleToLogin()
    } else {
      showAlert(data.message || "Registration failed", "error")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showAlert("Network error. Please try again.", "error")
  } finally {
    submitBtn.value = originalText
    submitBtn.disabled = false
  }
}

async function logout() {
  try {
    const response = await fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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

// Toggle functions
function toggleToSignUp() {
  const container = document.querySelector(".container")
  if (container) {
    container.classList.add("sign-up-mode")
  }
}

function toggleToLogin() {
  const container = document.querySelector(".container")
  if (container) {
    container.classList.remove("sign-up-mode")
  }
}

function showLoginPage() {
  const loginPage = document.getElementById("loginPage")
  const dashboard = document.getElementById("dashboard")

  if (loginPage) loginPage.style.display = "block"
  if (dashboard) dashboard.classList.remove("active")
}

// Update the showDashboard function to show/hide admin management menu
function showDashboard() {
  const loginPage = document.getElementById("loginPage")
  const dashboard = document.getElementById("dashboard")

  if (loginPage) loginPage.style.display = "none"
  if (dashboard) dashboard.classList.add("active")

  // Show/hide admin management menu based on role
  const adminManageMenuItem = document.getElementById("adminManageMenuItem")
  const adminManageQuickAction = document.getElementById("adminManageQuickAction")
  const pendingAdminsCard = document.getElementById("pendingAdminsCard")

  if (currentUser && currentUser.permissions?.canManageAdmins) {
    if (adminManageMenuItem) adminManageMenuItem.style.display = "block"
    if (adminManageQuickAction) adminManageQuickAction.style.display = "block"
    if (pendingAdminsCard) pendingAdminsCard.style.display = "block"
  } else {
    // Hide Admin Management if user lacks permission
    if (adminManageMenuItem) adminManageMenuItem.style.display = "none"
    if (adminManageQuickAction) adminManageQuickAction.style.display = "none"
    if (pendingAdminsCard) pendingAdminsCard.style.display = "none"
  }
  
  loadDashboardData()
  updateNotificationBadges()
  initializeChatSystem()
}

// Alert function with persistent option
function showAlert(message, type = "info", persistent = false) {
  const alertElement = document.getElementById("custom-alert")
  const messageElement = document.getElementById("alert-message")

  if (alertElement && messageElement) {
    messageElement.textContent = message
    alertElement.className = `custom-alert ${type}`
    alertElement.classList.remove("hidden")

    // Clear existing timeout
    if (alertElement.hideTimeout) {
      clearTimeout(alertElement.hideTimeout)
    }

    // Only auto-hide if not persistent
    if (!persistent) {
      alertElement.hideTimeout = setTimeout(() => {
        alertElement.classList.add("hidden")
      }, 5000)
    }

    // Add close button for persistent notifications
    if (persistent && !alertElement.querySelector(".alert-close")) {
      const closeBtn = document.createElement("button")
      closeBtn.className = "alert-close"
      closeBtn.innerHTML = "×"
      closeBtn.onclick = () => alertElement.classList.add("hidden")
      alertElement.appendChild(closeBtn)
    }
  } else {
    console.log(`${type.toUpperCase()}: ${message}`)
  }
}

// Auto-refresh functionality
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (isAuthenticated) {
      updateDashboardStats()
      updateNotificationBadges()
      updateChatNotifications()

      switch (currentPage) {
        case "dashboardPage":
          loadDashboardData()
          break
        case "guidesPage":
          loadGuidesData()
          break
        case "adminManagePage":
          loadAdminData()
          break
        case "chatPage":
          loadChatList()
          break
      }
    }
  }, 30000) // 30 seconds
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// DOM initialization
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin portal initializing...")

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
    signUpForm.addEventListener("submit", handleAdminRegister)
  }

  // Set up toggle buttons
  const signUpBtn = document.getElementById("sign-up-btn")
  const signInBtn = document.getElementById("sign-in-btn")

  if (signUpBtn) {
    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault()
      toggleToSignUp()
    })
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault()
      toggleToLogin()
    })
  }

  // Mobile menu functionality
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileNav = document.getElementById("mobile-nav")
  const menuIcon = document.getElementById("menu-icon")
  const closeIcon = document.getElementById("close-icon")

  if (mobileMenuButton && mobileNav) {
    mobileMenuButton.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const isActive = mobileNav.classList.contains("active")

      if (isActive) {
        mobileNav.classList.remove("active")
        if (menuIcon) menuIcon.style.display = "block"
        if (closeIcon) closeIcon.style.display = "none"
      } else {
        mobileNav.classList.add("active")
        if (menuIcon) menuIcon.style.display = "none"
        if (closeIcon) closeIcon.style.display = "block"
      }
    })
  }

  // Mobile dropdown functionality
  const dropdownTrigger = document.getElementById("places-dropdown-trigger")
  const dropdownContent = document.getElementById("places-dropdown-content")

  if (dropdownTrigger && dropdownContent) {
    dropdownTrigger.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const isActive = dropdownContent.classList.contains("active")

      if (isActive) {
        dropdownContent.classList.remove("active")
      } else {
        dropdownContent.classList.add("active")
      }
    })
  }

  // Desktop dropdown functionality
  const desktopDropdownTrigger = document.querySelector(".desktop-nav .dropdown-trigger")
  const desktopDropdown = document.querySelector(".desktop-nav .dropdown")

  if (desktopDropdownTrigger && desktopDropdown) {
    desktopDropdownTrigger.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const isActive = desktopDropdown.classList.contains("active")

      if (isActive) {
        desktopDropdown.classList.remove("active")
      } else {
        desktopDropdown.classList.add("active")
      }
    })

    const dropdownParent = document.querySelector(".desktop-nav .dropdown-parent")
    if (dropdownParent) {
      dropdownParent.addEventListener("mouseleave", () => {
        desktopDropdown.classList.remove("active")
      })
    }
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (dropdownContent && !dropdownTrigger.contains(e.target) && !dropdownContent.contains(e.target)) {
      dropdownContent.classList.remove("active")
    }

    if (desktopDropdown && !desktopDropdownTrigger.contains(e.target) && !desktopDropdown.contains(e.target)) {
      desktopDropdown.classList.remove("active")
    }

    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active")
    }
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (mobileNav && !mobileMenuButton.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove("active")
      if (menuIcon) menuIcon.style.display = "block"
      if (closeIcon) closeIcon.style.display = "none"
    }
  })

  // Initialize authentication check
  setTimeout(() => {
    checkAuthStatus()
  }, 100)
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
  const targetPage = document.getElementById(pageId)
  if (targetPage) {
    targetPage.classList.remove("hidden")
    targetPage.classList.add("active")
  }

  // Update sidebar active state
  document.querySelectorAll(".sidebar-menu-link").forEach((link) => {
    link.classList.remove("active")
  })

  const clickedLink = event?.target?.closest(".sidebar-menu-link")
  if (clickedLink) {
    clickedLink.classList.add("active")
  }

  currentPage = pageId

  // Load page-specific data
  switch (pageId) {
    case "dashboardPage":
      loadDashboardData()
      loadAnalyticsData()
      break
    case "guidesPage":
      loadGuidesData()
      break
    case "attractionsPage":
      loadAttractionsData()
      break
    case "adminManagePage":
      loadAdminData()
      break
    case "chatPage":
      initializeChatSystem()
      loadChatList()
      break
    case "analyticsPage":
      loadAnalyticsData()
      break
    case "usersPage":
      loadUsersData()
      break
  }

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    toggleSidebar()
  }
}

// Enhanced data loading functions
async function updateDashboardStats() {
  try {
    const response = await fetch("/api/dashboard/stats", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const elements = {
        totalUsers: document.getElementById("totalUsers"),
        totalAttractions: document.getElementById("totalAttractions"),
        totalReviews: document.getElementById("totalReviews"),
        pendingGuides: document.getElementById("pendingGuides"),
        pendingAdmins: document.getElementById("pendingAdmins"),
      }

      if (elements.totalUsers) elements.totalUsers.textContent = data.stats.totalUsers || 0
      if (elements.totalAttractions) elements.totalAttractions.textContent = data.stats.totalAttractions || 0
      if (elements.totalReviews) elements.totalReviews.textContent = data.stats.totalReviews || 0
      if (elements.pendingGuides) elements.pendingGuides.textContent = data.stats.pendingGuides || 0
      if (elements.pendingAdmins) elements.pendingAdmins.textContent = data.stats.pendingAdmins || 0
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

async function loadDashboardData() {
  try {
    updateDashboardStats()
    loadRecentActivity()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

async function loadRecentActivity() {
  try {
    const response = await fetch("/api/dashboard/recent-activity", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.getElementById("recentActivity")
      if (container && Array.isArray(data.activities)) {
        if (data.activities.length > 0) {
          container.innerHTML = data.activities
            .map(
              (activity) => `
                <div class="activity-item">
                  <i class="fas ${getActivityIcon(activity.type)}"></i>
                  <div>
                    <p>${activity.message}</p>
                    <span>${formatTimeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              `,
            )
            .join("")
        } else {
          container.innerHTML = `
            <div class="activity-item">
              <i class="fas fa-info-circle"></i>
              <div>
                <p>No recent activity</p>
                <span>System is running smoothly</span>
              </div>
            </div>
          `
        }
      }
    }
  } catch (error) {
    console.error("Error loading recent activity:", error)
  }
}

function getActivityIcon(type) {
  switch (type) {
    case "admin_login":
      return "fa-sign-in-alt"
    case "guide_applied":
      return "fa-user-plus"
    case "guide_approved":
      return "fa-user-check"
    case "admin_registered":
      return "fa-user-shield"
    case "user_registered":
      return "fa-user-plus"
    case "chat_started":
      return "fa-comments"
    default:
      return "fa-info-circle"
  }
}

// Load guides data for admin management
async function loadGuidesData() {
  try {
    const response = await fetch("/api/guides", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.querySelector("#guidesPage .card-content")
      if (container && Array.isArray(data.guides)) {
        if (data.guides.length > 0) {
          container.innerHTML = `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Guide Details</th>
                    <th>Contact</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.guides
                    .map(
                      (guide) => `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="fas fa-user-tie text-sm"></i>
                          </div>
                          <div>
                            <p class="font-medium">${guide.name}</p>
                            <p class="text-sm text-gray-500">${guide.specialization}</p>
                            <p class="text-xs text-gray-400">${guide.location}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p class="text-sm">${guide.email}</p>
                          <p class="text-sm text-gray-500">${guide.phone}</p>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-secondary">${guide.experience}</span>
                      </td>
                      <td>
                        <span class="badge badge-${getGuideStatusBadgeClass(guide.status)}">${guide.status}</span>
                      </td>
                      <td>
                        <span class="text-sm">${new Date(guide.appliedDate).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <div class="flex gap-2">
                          ${
                            guide.status === "pending"
                              ? `
                            <button class="btn btn-success btn-sm" onclick="approveGuide('${guide._id}')">
                              <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="rejectGuide('${guide._id}')">
                              <i class="fas fa-times"></i> Reject
                            </button>
                          `
                              : ""
                          }
                          ${
                            guide.status === "approved"
                              ? `
                            <button class="btn btn-warning btn-sm" onclick="suspendGuide('${guide._id}')">
                              <i class="fas fa-ban"></i> Suspend
                            </button>
                          `
                              : ""
                          }
                          <button class="btn btn-secondary btn-sm" onclick="viewGuideDetails('${guide._id}')">
                            <i class="fas fa-eye"></i> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
        } else {
          container.innerHTML = `
            <div class="text-center text-gray-500 mt-8">
              <i class="fas fa-user-tie text-4xl mb-4"></i>
              <p>No guide applications found</p>
              <p class="text-sm">New applications will appear here</p>
            </div>
          `
        }
      }
    }
  } catch (error) {
    console.error("Error loading guides:", error)
    showAlert("Failed to load guides.", "error")
  }
}

// Guide management functions
async function approveGuide(guideId) {
  if (confirm("Are you sure you want to approve this guide application?")) {
    try {
      const response = await fetch(`/api/guides/${guideId}/approve`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Guide application approved successfully!", "success")
        loadGuidesData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error approving guide", "error")
      }
    } catch (error) {
      console.error("Error approving guide:", error)
      showAlert("Network error", "error")
    }
  }
}

async function rejectGuide(guideId) {
  const reason = prompt("Please provide a reason for rejection (optional):")
  if (reason !== null) {
    try {
      const response = await fetch(`/api/guides/${guideId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason: reason || "Application does not meet requirements" }),
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Guide application rejected", "info")
        loadGuidesData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error rejecting guide", "error")
      }
    } catch (error) {
      console.error("Error rejecting guide:", error)
      showAlert("Network error", "error")
    }
  }
}

async function suspendGuide(guideId) {
  const reason = prompt("Please provide a reason for suspension:")
  if (reason) {
    try {
      const response = await fetch(`/api/guides/${guideId}/suspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Guide account suspended", "warning")
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

function viewGuideDetails(guideId) {
  showAlert("Guide details view - Coming soon!", "info")
}

// Admin Management Functions
let currentAdminTab = "pending"

async function loadAdminData() {
  try {
    const response = await fetch("/api/admins", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.querySelector("#adminTable")
      if (container && Array.isArray(data.admins)) {
        const filteredAdmins = filterAdminsByTab(data.admins, currentAdminTab)

        // Update tab counts
        updateAdminTabCounts(data.admins)

        if (filteredAdmins.length > 0) {
          container.innerHTML = filteredAdmins
            .map(
              (admin) => `
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user-shield text-sm"></i>
                      </div>
                      <div>
                        <p class="font-medium">${admin.username}</p>
                        <p class="text-sm text-gray-500">${admin.role}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p class="text-sm">${admin.email}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-${getRoleBadgeClass(admin.role)}">${admin.role}</span>
                  </td>
                  <td>
                    <span class="badge badge-${getAdminStatusBadgeClass(admin.isVerified, admin.isActive)}">${getAdminStatusText(admin.isVerified, admin.isActive)}</span>
                  </td>
                  <td>
                    <span class="text-sm">${new Date(admin.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <span class="text-sm">${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}</span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      ${
                        !admin.isVerified && admin.role !== "superadmin"
                          ? `
                        <button class="btn btn-success btn-sm" onclick="approveAdmin('${admin._id}')">
                          <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectAdmin('${admin._id}')">
                          <i class="fas fa-times"></i> Reject
                        </button>
                      `
                          : ""
                      }
                      ${
                        admin.isVerified && admin.isActive && admin.role !== "superadmin"
                          ? `
                        <button class="btn btn-warning btn-sm" onclick="suspendAdmin('${admin._id}')">
                          <i class="fas fa-ban"></i> Suspend
                        </button>
                      `
                          : ""
                      }
                      ${
                        admin.isVerified && !admin.isActive && admin.role !== "superadmin"
                          ? `
                        <button class="btn btn-success btn-sm" onclick="activateAdmin('${admin._id}')">
                          <i class="fas fa-check"></i> Activate
                        </button>
                      `
                          : ""
                      }
                      <button class="btn btn-secondary btn-sm" onclick="viewAdminDetails('${admin._id}')">
                        <i class="fas fa-eye"></i> View
                      </button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")
        } else {
          container.innerHTML = `
            <tr>
              <td colspan="7" class="text-center text-gray-500 py-8">
                <i class="fas fa-user-shield text-4xl mb-4"></i>
                <p>No ${currentAdminTab} admin applications found</p>
              </td>
            </tr>
          `
        }
      }
    }
  } catch (error) {
    console.error("Error loading admin data:", error)
    showAlert("Failed to load admin data.", "error")
  }
}

// Add this function after the loadAdminData function
async function loadUsersData() {
  try {
    const response = await fetch("/api/users", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.querySelector("#usersPage .card-content")
      if (container && Array.isArray(data.users)) {
        if (data.users.length > 0) {
          container.innerHTML = `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.users
                    .map(
                      (user) => `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-sm"></i>
                          </div>
                          <div>
                            <p class="font-medium">${user.fullName || user.username}</p>
                            <p class="text-sm text-gray-500">@${user.username}</p>
                            <p class="text-xs text-gray-400">${user.location || "Location not set"}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p class="text-sm">${user.email}</p>
                          <p class="text-sm text-gray-500">${user.phone || "Phone not set"}</p>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-${getUserRoleBadgeClass(user.role)}">${user.role}</span>
                      </td>
                      <td>
                        <span class="badge badge-${user.isActive ? "success" : "danger"}">${user.isActive ? "Active" : "Inactive"}</span>
                      </td>
                      <td>
                        <span class="text-sm">${new Date(user.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <span class="text-sm">${user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}</span>
                      </td>
                      <td>
                        <div class="flex gap-2">
                          ${
                            user.isActive
                              ? `
                            <button class="btn btn-warning btn-sm" onclick="deactivateUser('${user._id}')">
                              <i class="fas fa-ban"></i> Deactivate
                            </button>
                          `
                              : `
                            <button class="btn btn-success btn-sm" onclick="activateUser('${user._id}')">
                              <i class="fas fa-check"></i> Activate
                            </button>
                          `
                          }
                          <button class="btn btn-secondary btn-sm" onclick="changeUserRole('${user._id}', '${user.role}')">
                            <i class="fas fa-user-tag"></i> Role
                          </button>
                          <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">
                            <i class="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          `
        } else {
          container.innerHTML = `
            <div class="text-center text-gray-500 mt-8">
              <i class="fas fa-users text-4xl mb-4"></i>
              <p>No users found</p>
              <p class="text-sm">Users will appear here when they register</p>
            </div>
          `
        }
      }
    }
  } catch (error) {
    console.error("Error loading users:", error)
    showAlert("Failed to load users.", "error")
  }
}


// Add user management functions
async function activateUser(userId) {
  if (confirm("Are you sure you want to activate this user?")) {
    try {
      const response = await fetch(`/api/users/${userId}/activate`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("User activated successfully!", "success")
        loadUsersData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error activating user", "error")
      }
    } catch (error) {
      console.error("Error activating user:", error)
      showAlert("Network error", "error")
    }
  }
}

async function deactivateUser(userId) {
  if (confirm("Are you sure you want to deactivate this user?")) {
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("User deactivated successfully!", "success")
        loadUsersData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error deactivating user", "error")
      }
    } catch (error) {
      console.error("Error deactivating user:", error)
      showAlert("Network error", "error")
    }
  }
}

async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("User deleted successfully!", "success")
        loadUsersData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error deleting user", "error")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      showAlert("Network error", "error")
    }
  }
}

async function changeUserRole(userId, currentRole) {
  const roles = ["user", "traveler", "contributor", "guide"]
  const roleOptions = roles
    .map(
      (role) =>
        `<option value="${role}" ${role === currentRole ? "selected" : ""}>${role.charAt(0).toUpperCase() + role.slice(1)}</option>`,
    )
    .join("")

  const newRole = prompt(
    `Select new role for user:\n\nCurrent role: ${currentRole}\n\nEnter new role (user/traveler/contributor/guide):`,
  )

  if (newRole && roles.includes(newRole.toLowerCase()) && newRole.toLowerCase() !== currentRole) {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole.toLowerCase() }),
      })
      const data = await response.json()

      if (data.success) {
        showAlert("User role updated successfully!", "success")
        loadUsersData()
      } else {
        showAlert(data.message || "Error updating user role", "error")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      showAlert("Network error", "error")
    }
  }
}

function getUserRoleBadgeClass(role) {
  switch (role) {
    case "guide":
      return "primary"
    case "contributor":
      return "success"
    case "traveler":
      return "warning"
    case "user":
    default:
      return "secondary"
  }
}

// Update the showPage function to include usersPage
// In the switch statement, add:

// Make the new functions globally available
window.loadUsersData = loadUsersData
window.activateUser = activateUser
window.deactivateUser = deactivateUser
window.deleteUser = deleteUser
window.changeUserRole = changeUserRole

// Settings Functions
async function saveGeneralSettings() {
  const settings = {
    siteTitle: document.getElementById("siteTitle").value,
    contactEmail: document.getElementById("contactEmail").value,
    siteDescription: document.getElementById("siteDescription").value,
  }

  try {
    const response = await fetch("/api/settings/general", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(settings),
    })

    const data = await response.json()
    if (data.success) {
      showAlert("General settings saved successfully!", "success")
    } else {
      showAlert(data.message || "Error saving settings", "error")
    }
  } catch (error) {
    console.error("Error saving general settings:", error)
    showAlert("Network error", "error")
  }
}

async function saveSecuritySettings() {
  const settings = {
    emailNotifications: document.getElementById("emailNotifications").checked,
    autoBackup: document.getElementById("autoBackup").checked,
    maintenanceMode: document.getElementById("maintenanceMode").checked,
  }

  try {
    const response = await fetch("/api/settings/security", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(settings),
    })

    const data = await response.json()
    if (data.success) {
      showAlert("Security settings updated successfully!", "success")
    } else {
      showAlert(data.message || "Error updating settings", "error")
    }
  } catch (error) {
    console.error("Error saving security settings:", error)
    showAlert("Network error", "error")
  }
}

// Live Chat Functions
function initializeChatSystem() {
  console.log("Initializing chat system...")
  loadChatList()
}

async function loadChatList() {
  try {
    const response = await fetch("/api/chats/active", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      displayChatList(data.chats)
      const activeChatCountEl = document.getElementById("activeChatCount")
      if (activeChatCountEl) {
        activeChatCountEl.textContent = data.chats.length
      }
    }
  } catch (error) {
    console.error("Error loading chat list:", error)
  }
}

function displayChatList(chats) {
  const container = document.getElementById("chatList")
  if (!container) return

  if (chats.length > 0) {
    container.innerHTML = chats
      .map(
        (chat) => `
      <div class="chat-item ${chat.chatId === currentChatId ? "active" : ""}" onclick="selectChat('${chat.chatId}', '${chat.name}', '${chat.email}')">
        <div class="chat-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="chat-info">
          <div class="chat-name">${chat.name}</div>
          <div class="chat-preview">${chat.lastMessage || "Chat started"}</div>
          <div class="chat-time">${formatTimeAgo(chat.timestamp)}</div>
        </div>
        ${chat.unreadCount > 0 ? `<div class="chat-unread">${chat.unreadCount}</div>` : ""}
      </div>
    `,
      )
      .join("")
  } else {
    container.innerHTML = `
      <div class="empty-chat-list">
        <i class="fas fa-comments"></i>
        <p>No active chats</p>
        <p class="text-sm">Chats from your contact page will appear here</p>
      </div>
    `
  }
}

async function selectChat(chatId, userName, userEmail) {
  currentChatId = chatId

  try {
    displayChatWindow(userName, userEmail)
    await loadChatMessages(chatId)

    // Update active chat in list
    document.querySelectorAll(".chat-item").forEach((item) => {
      item.classList.remove("active")
    })
    event.currentTarget.classList.add("active")
  } catch (error) {
    console.error("Error selecting chat:", error)
  }
}

function displayChatWindow(userName, userEmail) {
  const chatWelcome = document.getElementById("chatWelcome")
  const chatWindow = document.getElementById("chatWindow")
  const chatHeader = document.getElementById("chatHeader")

  if (chatWelcome) chatWelcome.style.display = "none"
  if (chatWindow) chatWindow.style.display = "flex"

  if (chatHeader) {
    chatHeader.innerHTML = `
      <div class="chat-user-info">
        <div class="chat-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="chat-details">
          <h4>${userName}</h4>
          <p>${userEmail}</p>
          <span class="chat-status online">Online</span>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="btn btn-sm btn-secondary" onclick="refreshChatList()">
          <i class="fas fa-sync-alt"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="endChat()">
          <i class="fas fa-times"></i> End Chat
        </button>
      </div>
    `
  }
}

async function loadChatMessages(chatId) {
  try {
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      displayChatMessages(data.messages)
    }
  } catch (error) {
    console.error("Error loading messages:", error)
  }
}

function displayChatMessages(messages) {
  const container = document.getElementById("chatMessages")
  if (!container) return

  container.innerHTML = messages
    .map(
      (message) => `
    <div class="message ${message.sender === "admin" ? "admin-message" : "user-message"}">
      <div class="message-content">
        <p>${message.message}</p>
        <span class="message-time">${formatTimeAgo(message.timestamp)}</span>
      </div>
    </div>
  `,
    )
    .join("")

  container.scrollTop = container.scrollHeight
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage()
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput")
  const message = input.value.trim()

  if (!message || !currentChatId) return

  try {
    const response = await fetch("/api/chats/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        chatId: currentChatId,
        message: message,
        sender: "admin",
        adminId: currentUser.id,
      }),
    })

    const data = await response.json()

    if (data.success) {
      input.value = ""
      await loadChatMessages(currentChatId)

      // Emit to socket for real-time update to user
      if (socket) {
        socket.emit("admin-message", {
          chatId: currentChatId,
          message: message,
          sender: "admin",
          adminName: currentUser.username,
        })
      }
    }
  } catch (error) {
    console.error("Error sending message:", error)
    showAlert("Failed to send message", "error")
  }
}

function sendQuickReply(message) {
  const input = document.getElementById("chatInput")
  if (input) {
    input.value = message
    sendChatMessage()
  }
}

async function endChat() {
  if (!currentChatId) return

  if (confirm("Are you sure you want to end this chat?")) {
    try {
      const response = await fetch(`/api/chats/${currentChatId}/end`, {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        showAlert("Chat ended successfully", "success")
        showChatWelcome()
        loadChatList()
        currentChatId = null

        // Emit to socket
        if (socket) {
          socket.emit("chat-ended", {
            chatId: currentChatId,
          })
        }
      }
    } catch (error) {
      console.error("Error ending chat:", error)
      showAlert("Failed to end chat", "error")
    }
  }
}

function transferChat() {
  showAlert("Chat transfer feature - Coming soon!", "info")
}

function refreshChatList() {
  loadChatList()
  showAlert("Chat list refreshed", "success")
}

function showChatWelcome() {
  const chatWelcome = document.getElementById("chatWelcome")
  const chatWindow = document.getElementById("chatWindow")

  if (chatWelcome) chatWelcome.style.display = "flex"
  if (chatWindow) chatWindow.style.display = "none"
}

// Attractions Functions
async function loadAttractionsData() {
  try {
    const response = await fetch("/api/attractions", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      displayAttractions(data.attractions)
      updateAttractionStats(data.stats)
    }
  } catch (error) {
    console.error("Error loading attractions:", error)
    showAlert("Failed to load attractions.", "error")
  }
}

function displayAttractions(attractions) {
  const container = document.getElementById("attractionsGrid")
  if (!container) return

  if (attractions.length > 0) {
    container.innerHTML = attractions
      .map(
        (attraction) => `
      <div class="attraction-card">
        <div class="attraction-image">
          <img src="${attraction.image || "/placeholder.svg?height=200&width=300"}" alt="${attraction.name}">
          <div class="attraction-badge">${attraction.category}</div>
        </div>
        <div class="attraction-content">
          <h3 class="attraction-name">${attraction.name}</h3>
          <p class="attraction-location">
            <i class="fas fa-map-marker-alt"></i>
            ${attraction.location}
          </p>
          <p class="attraction-description">${attraction.description.substring(0, 100)}...</p>
          <div class="attraction-stats">
            <span class="stat">
              <i class="fas fa-eye"></i>
              ${attraction.views || 0} views
            </span>
            <span class="stat">
              <i class="fas fa-star"></i>
              ${attraction.rating || 0}/5
            </span>
          </div>
          <div class="attraction-actions">
            <button class="btn btn-sm btn-primary" onclick="editAttraction('${attraction._id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteAttraction('${attraction._id}')">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-map-marker-alt"></i>
        <h3>No attractions found</h3>
        <p>Start by adding your first attraction</p>
        <button class="btn btn-primary" onclick="showAddAttractionModal()">
          <i class="fas fa-plus"></i> Add Attraction
        </button>
      </div>
    `
  }
}

function showAddAttractionModal() {
  const modal = document.getElementById("addAttractionModal")
  if (modal) {
    modal.classList.add("active")
  }
}

function closeAddAttractionModal() {
  const modal = document.getElementById("addAttractionModal")
  if (modal) {
    modal.classList.remove("active")
  }
}

function editAttraction(attractionId) {
  showAlert("Edit attraction feature - Coming soon!", "info")
}

function deleteAttraction(attractionId) {
  if (confirm("Are you sure you want to delete this attraction?")) {
    showAlert("Delete attraction feature - Coming soon!", "info")
  }
}

// Analytics Functions
function loadAnalyticsData() {
  try {
    loadUserDistributionChart()
    loadDestinationsChart()
    loadGrowthChart()
    loadActivityTimeline()
  } catch (error) {
    console.error("Error loading analytics:", error)
  }
}

function loadUserDistributionChart() {
  const canvas = document.getElementById("userDistributionChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const data = [68, 22, 10] // Travelers, Guides, Admins
  const colors = ["#3b82f6", "#10b981", "#f59e0b"]

  drawPieChart(ctx, data, colors, canvas.width, canvas.height)
}

function loadDestinationsChart() {
  const canvas = document.getElementById("destinationsChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const data = [35, 25, 20, 20] // Hundru Falls, Betla, Jagannath, Others
  const colors = ["#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"]

  drawPieChart(ctx, data, colors, canvas.width, canvas.height)
}

function loadGrowthChart() {
  const canvas = document.getElementById("growthChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const data = [180, 210, 234] // Last 3 months
  const colors = ["#10b981", "#3b82f6", "#f59e0b"]

  drawPieChart(ctx, data, colors, canvas.width, canvas.height)
}

function drawPieChart(ctx, data, colors, width, height) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 20

  const total = data.reduce((sum, value) => sum + value, 0)
  let currentAngle = -Math.PI / 2

  ctx.clearRect(0, 0, width, height)

  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index]
    ctx.fill()

    currentAngle += sliceAngle
  })
}

function loadActivityTimeline() {
  const container = document.getElementById("activityTimeline")
  if (!container) return

  const activities = [
    { time: "2 min ago", action: "New user registered", type: "user", icon: "fa-user-plus" },
    { time: "5 min ago", action: "Guide application approved", type: "guide", icon: "fa-user-check" },
    { time: "12 min ago", action: "New attraction added", type: "attraction", icon: "fa-map-marker-alt" },
    { time: "18 min ago", action: "Admin logged in", type: "admin", icon: "fa-sign-in-alt" },
    { time: "25 min ago", action: "Review submitted", type: "review", icon: "fa-star" },
  ]

  container.innerHTML = activities
    .map(
      (activity) => `
    <div class="timeline-item">
      <div class="timeline-icon ${activity.type}">
        <i class="fas ${activity.icon}"></i>
      </div>
      <div class="timeline-content">
        <p class="timeline-action">${activity.action}</p>
        <span class="timeline-time">${activity.time}</span>
      </div>
    </div>
  `,
    )
    .join("")
}

// Utility functions
function getRoleBadgeClass(role) {
  switch (role) {
    case "superadmin":
      return "danger"
    case "admin":
      return "primary"
    case "moderator":
      return "secondary"
    default:
      return "secondary"
  }
}

function getAdminStatusBadgeClass(isVerified, isActive) {
  if (isVerified && isActive) return "success"
  if (isVerified && !isActive) return "warning"
  if (!isVerified) return "danger"
  return "secondary"
}

function getAdminStatusText(isVerified, isActive) {
  if (isVerified && isActive) return "Active"
  if (isVerified && !isActive) return "Suspended"
  if (!isVerified) return "Pending"
  return "Unknown"
}

function getGuideStatusBadgeClass(status) {
  switch (status) {
    case "approved":
      return "success"
    case "pending":
      return "warning"
    case "rejected":
    case "suspended":
      return "danger"
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

async function updateNotificationBadges() {
  try {
    const response = await fetch("/api/dashboard/stats", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const guideCount = data.stats.pendingGuides || 0
      const adminCount = data.stats.pendingAdmins || 0
      const totalNotifications = guideCount + adminCount

      const alertBadge = document.getElementById("alert-badge")

      if (alertBadge) {
        alertBadge.setAttribute("data-count", totalNotifications > 0 ? totalNotifications : "")
      }
    }
  } catch (error) {
    console.error("Error updating badges:", error)
  }
}

async function updateChatNotifications() {
  try {
    const response = await fetch("/api/chats/unread-count", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      // Update chat notification count if needed
      console.log("Unread chat messages:", data.count)
    }
  } catch (error) {
    console.error("Error updating chat notifications:", error)
  }
}

function updateAttractionStats(stats) {
  // Implementation for updating attraction statistics
  console.log("Attraction stats updated:", stats)
}

function getUserRoleBadgeClass(role) {
  switch (role) {
    case "guide":
      return "primary"
    case "contributor":
      return "success"
    case "traveler":
      return "warning"
    case "user":
    default:
      return "secondary"
  }
}

// Make functions globally available
window.showPage = showPage
window.logout = logout
window.toggleSidebar = toggleSidebar
window.toggleTheme = toggleTheme
window.approveGuide = approveGuide
window.rejectGuide = rejectGuide
window.suspendGuide = suspendGuide
window.viewGuideDetails = viewGuideDetails
window.switchAdminTab = switchAdminTab
window.approveAdmin = approveAdmin
window.rejectAdmin = rejectAdmin
window.suspendAdmin = suspendAdmin
window.activateAdmin = activateAdmin
window.viewAdminDetails = viewAdminDetails
window.saveGeneralSettings = saveGeneralSettings
window.saveSecuritySettings = saveSecuritySettings
window.loadAnalyticsData = loadAnalyticsData
window.loadAttractionsData = loadAttractionsData
window.showAddAttractionModal = showAddAttractionModal
window.closeAddAttractionModal = closeAddAttractionModal
window.editAttraction = editAttraction
window.deleteAttraction = deleteAttraction
window.selectChat = selectChat
window.sendChatMessage = sendChatMessage
window.sendQuickReply = sendQuickReply
window.handleChatKeyPress = handleChatKeyPress
window.endChat = endChat
window.transferChat = transferChat
window.refreshChatList = refreshChatList
window.loadUsersData = loadUsersData
window.activateUser = activateUser
window.deactivateUser = deactivateUser
window.deleteUser = deleteUser
window.changeUserRole = changeUserRole

console.log("✅ Admin portal JavaScript loaded successfully!")

function filterAdminsByTab(admins, tab) {
  switch (tab) {
    case "pending":
      return admins.filter((admin) => !admin.isVerified)
    case "active":
      return admins.filter((admin) => admin.isVerified && admin.isActive)
    case "suspended":
      return admins.filter((admin) => admin.isVerified && !admin.isActive)
    case "all":
    default:
      return admins
  }
}

function updateAdminTabCounts(admins) {
  const pendingCount = admins.filter((admin) => !admin.isVerified).length
  const activeCount = admins.filter((admin) => admin.isVerified && admin.isActive).length
  const suspendedCount = admins.filter((admin) => admin.isVerified && !admin.isActive).length

  document.getElementById("pendingAdminsCount").textContent = pendingCount
  document.getElementById("activeAdminsCount").textContent = activeCount
  document.getElementById("suspendedAdminsCount").textContent = suspendedCount
}

function switchAdminTab(tab) {
  currentAdminTab = tab
  loadAdminData()

  // Update active class on tabs
  document.querySelectorAll(".admin-tabs button").forEach((button) => {
    button.classList.remove("active")
  })
  document.querySelector(`.admin-tabs button[data-tab="${tab}"]`).classList.add("active")
}

async function approveAdmin(adminId) {
  if (confirm("Are you sure you want to approve this admin application?")) {
    try {
      const response = await fetch(`/api/admins/${adminId}/approve`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Admin application approved successfully!", "success")
        loadAdminData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error approving admin", "error")
      }
    } catch (error) {
      console.error("Error approving admin:", error)
      showAlert("Network error", "error")
    }
  }
}

async function rejectAdmin(adminId) {
  const reason = prompt("Please provide a reason for rejection (optional):")
  if (reason !== null) {
    try {
      const response = await fetch(`/api/admins/${adminId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason: reason || "Application does not meet requirements" }),
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Admin application rejected", "info")
        loadAdminData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error rejecting admin", "error")
      }
    } catch (error) {
      console.error("Error rejecting admin:", error)
      showAlert("Network error", "error")
    }
  }
}

async function suspendAdmin(adminId) {
  const reason = prompt("Please provide a reason for suspension:")
  if (reason) {
    try {
      const response = await fetch(`/api/admins/${adminId}/suspend`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Admin account suspended", "warning")
        loadAdminData()
      } else {
        showAlert(data.message || "Error suspending admin", "error")
      }
    } catch (error) {
      console.error("Error suspending admin:", error)
      showAlert("Network error", "error")
    }
  }
}

async function activateAdmin(adminId) {
  if (confirm("Are you sure you want to activate this admin?")) {
    try {
      const response = await fetch(`/api/admins/${adminId}/activate`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        showAlert("Admin activated successfully!", "success")
        loadAdminData()
        updateDashboardStats()
      } else {
        showAlert(data.message || "Error activating admin", "error")
      }
    } catch (error) {
      console.error("Error activating admin:", error)
      showAlert("Network error", "error")
    }
  }
}

function viewAdminDetails(adminId) {
  showAlert("Admin details view - Coming soon!", "info")
}


async function checkAuthStatus() {
  try {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()

    if (data.success && data.admin) {
      currentUser = data.admin
      isAuthenticated = true

      console.log("✅ Authenticated as:", currentUser.username)

      showDashboard()
      initializeSocket()
      startAutoRefresh()

      // ✅ Delay updating name slightly to ensure DOM is fully rendered
      setTimeout(updateAdminName, 300)

      return true
    } else {
      console.warn("❌ Not authenticated")
      showLoginPage()
      return false
    }
  } catch (error) {
    console.error("Auth check error:", error)
    showLoginPage()
    return false
  }
}
function updateAdminName() {
  const adminUsernameEl = document.getElementById("admin-username")
  if (adminUsernameEl && currentUser?.username) {
    adminUsernameEl.textContent = currentUser.username
  }
}
async function verifyAdmin(adminId) {
  try {
    const res = await fetch(`/api/admins/${adminId}/verify`, {
      method: "PUT",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      showAlert("Admin verified successfully!", "success");
      loadAdminData();
      updateDashboardStats();
    } else {
      showAlert(data.message || "Verification failed", "error");
    }
  } catch (err) {
    console.error("Error verifying admin:", err);
    showAlert("Network error", "error");
  }
}

async function suspendAdmin(adminId) {
  const confirmSusp = confirm("Are you sure you want to suspend this admin?");
  if (!confirmSusp) return;
  try {
    const res = await fetch(`/api/admins/${adminId}/suspend`, {
      method: "PUT",
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      showAlert("Admin suspended.", "warning");
      loadAdminData();
    } else {
      showAlert(data.message || "Suspension failed", "error");
    }
  } catch (err) {
    console.error("Error suspending admin:", err);
    showAlert("Network error", "error");
  }
}

function viewAdminDetails(adminId) {
  showAlert("Admin details view – Coming soon", "info");
}


async function loadAdminData() {
  try {
    const response = await fetch("/api/admins", {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success) {
      const container = document.querySelector("#adminTable");
      if (container && Array.isArray(data.admins)) {
        const filteredAdmins = filterAdminsByTab(data.admins, currentAdminTab);

        updateAdminTabCounts(data.admins); // Optional helper to update tab badges if you have

        if (filteredAdmins.length > 0) {
          container.innerHTML = filteredAdmins
            .map(
              (admin) => `
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i class="fas fa-user-shield text-sm"></i>
                      </div>
                      <div>
                        <p class="font-medium">${admin.username}</p>
                        <p class="text-sm text-gray-500">${admin.role}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p class="text-sm">${admin.email}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-${getRoleBadgeClass(admin.role)}">${admin.role}</span>
                  </td>
                  <td>
                    <span class="badge badge-${getAdminStatusBadgeClass(admin.isVerified, admin.isActive)}">
                      ${getAdminStatusText(admin.isVerified, admin.isActive)}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm">${new Date(admin.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      ${!admin.isVerified ? `
                        <button class="btn btn-success btn-sm" onclick="verifyAdmin('${admin._id}')">
                          <i class="fas fa-check"></i> Verify
                        </button>
                      ` : ''}
                      ${admin.isActive ? `
                        <button class="btn btn-warning btn-sm" onclick="suspendAdmin('${admin._id}')">
                          <i class="fas fa-ban"></i> Suspend
                        </button>
                      ` : ''}
                      <button class="btn btn-secondary btn-sm" onclick="viewAdminDetails('${admin._id}')">
                        <i class="fas fa-eye"></i> View
                      </button>
                    </div>
                  </td>
                </tr>
              `
            )
            .join("");
        } else {
          container.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-gray-500 py-4">
                <i class="fas fa-user-shield fa-2x mb-2"></i><br>
                No matching admins found for "${currentAdminTab}" tab.
              </td>
            </tr>
          `;
        }
      }
    }
  } catch (error) {
    console.error("Error loading admins:", error);
    showAlert("Failed to load admins.", "error");
  }
}
function getRoleBadgeClass(role) {
  return role === "superadmin" ? "primary" : role === "admin" ? "info" : "secondary";
}

function getAdminStatusBadgeClass(isVerified, isActive) {
  if (!isVerified) return "warning";
  if (!isActive) return "danger";
  return "success";
}

function getAdminStatusText(isVerified, isActive) {
  if (!isVerified) return "Pending";
  if (!isActive) return "Suspended";
  return "Verified";
}

function filterAdminsByTab(admins, tab) {
  if (tab === "pending") return admins.filter(a => !a.isVerified);
  if (tab === "verified") return admins.filter(a => a.isVerified && a.isActive);
  return admins;
}
function updateAdminTabCounts(admins) {
  const pending = admins.filter(a => !a.isVerified).length;
  const verified = admins.filter(a => a.isVerified && a.isActive).length;
  const all = admins.length;

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("verifiedCount").textContent = verified;
  document.getElementById("allCount").textContent = all;
}
function setAdminTab(tab) {
  currentAdminTab = tab
  loadAdminData()
}

function filterAdminsByTab(admins, tab) {
  if (tab === "pending") return admins.filter((a) => !a.isVerified)
  if (tab === "verified") return admins.filter((a) => a.isVerified && a.isActive)
  return admins
}

function updateAdminTabCounts(admins) {
  const pending = admins.filter(a => !a.isVerified).length
  const verified = admins.filter(a => a.isVerified && a.isActive).length
  const all = admins.length

  document.getElementById("pendingCount").textContent = pending
  document.getElementById("verifiedCount").textContent = verified
  document.getElementById("allCount").textContent = all
}
socket.on("new-chat-message", (data) => {
  if (currentPage !== "chatPage" || currentChatId !== data.chatId) {
    incrementChatBell();
    showAlert(`New message from ${data.name}`, "info", true);
  }

  if (currentPage === "chatPage") {
    if (currentChatId === data.chatId) {
      loadChatMessages(currentChatId);
    }
    loadChatList();
  }
  updateChatNotifications();
});

function incrementChatBell() {
  const bell = document.getElementById("alert-badge");
  if (!bell) return;

  let count = parseInt(bell.getAttribute("data-count")) || 0;
  count++;
  bell.setAttribute("data-count", count);
  bell.classList.add("has-new");
}

function updateChatBadge() {
  const badge = document.getElementById("chatBadge");
  if (badge) {
    if (unreadChatCount > 0) {
      badge.textContent = unreadChatCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
}
if (pageId === "chatPage") {
  document.getElementById("alert-badge").setAttribute("data-count", "0");
  document.getElementById("alert-badge").classList.remove("has-new");
}

