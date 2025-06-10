// Global variables
let currentUser = null
let currentPage = "dashboardPage"
let isDarkMode = false
let sidebarOpen = false
let isAuthenticated = false
let socket = null
let refreshInterval = null
const io = window.io

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
      showAlert(`New guide application from ${data.guide.name}`, "info")
      if (currentPage === "guidesPage") {
        loadGuidesData()
      }
      updateNotificationBadges()
    })

    socket.on("guide-approved", (data) => {
      showAlert(`Guide ${data.guide.name} approved by ${data.approvedBy}`, "success")
      if (currentPage === "guidesPage") {
        loadGuidesData()
      }
    })

    socket.on("new-attraction", (data) => {
      showAlert(`New attraction added: ${data.attraction.name}`, "success")
      if (currentPage === "attractionsPage") {
        loadAttractionsData()
      }
      updateDashboardStats()
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

function showDashboard() {
  const loginPage = document.getElementById("loginPage")
  const dashboard = document.getElementById("dashboard")

  if (loginPage) loginPage.style.display = "none"
  if (dashboard) dashboard.classList.add("active")

  loadDashboardData()
  updateNotificationBadges()
}

// Alert function
function showAlert(message, type = "info") {
  const alertElement = document.getElementById("custom-alert")
  const messageElement = document.getElementById("alert-message")

  if (alertElement && messageElement) {
    messageElement.textContent = message
    alertElement.className = `custom-alert ${type}`
    alertElement.classList.remove("hidden")

    if (alertElement.hideTimeout) {
      clearTimeout(alertElement.hideTimeout)
    }

    alertElement.hideTimeout = setTimeout(() => {
      alertElement.classList.add("hidden")
    }, 9000)
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

      switch (currentPage) {
        case "dashboardPage":
          loadDashboardData()
          break
        case "guidesPage":
          loadGuidesData()
          break
      }
    }
  }, 30000)
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
      break
    case "guidesPage":
      loadGuidesData()
      break
    case "attractionsPage":
      loadAttractionsData()
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
      }

      if (elements.totalUsers) elements.totalUsers.textContent = data.stats.totalUsers || 0
      if (elements.totalAttractions) elements.totalAttractions.textContent = data.stats.totalAttractions || 0
      if (elements.totalReviews) elements.totalReviews.textContent = data.stats.totalReviews || 0
      if (elements.pendingGuides) elements.pendingGuides.textContent = data.stats.pendingGuides || 0
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

async function loadDashboardData() {
  try {
    updateDashboardStats()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
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
    // User didn't cancel
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

// Utility functions
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
      const alertBadge = document.getElementById("alert-badge")

      if (alertBadge) {
        alertBadge.setAttribute("data-count", guideCount > 0 ? guideCount : "")
      }
    }
  } catch (error) {
    console.error("Error updating badges:", error)
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

// attractions page
async function loadAttractionsData() {
  console.log("Attractions data loading function called")
}

console.log("✅ Admin portal JavaScript loaded successfully!")
