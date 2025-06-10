// Global variables
let currentGuide = null
let currentPage = "dashboardPage"
let isDarkMode = false
let sidebarOpen = false
let isAuthenticated = false
let socket = null
let refreshInterval = null
let selectedRequestId = null
const io = window.io

// Enhanced Alert System
class AlertManager {
  constructor() {
    this.alerts = []
    this.container = null
    this.init()
  }

  init() {
    this.container = document.getElementById("alert-container")
    if (!this.container) {
      this.container = document.createElement("div")
      this.container.id = "alert-container"
      this.container.className = "alert-container"
      document.body.appendChild(this.container)
    }
  }

  show(message, type = "info", duration = 8000, persistent = false) {
    const alertId = "alert-" + Date.now() + Math.random().toString(36).substr(2, 9)

    const alertElement = document.createElement("div")
    alertElement.id = alertId
    alertElement.className = `alert alert-${type}`

    const icon = this.getIcon(type)

    alertElement.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">${icon}</div>
                <div class="alert-message">${message}</div>
                <button class="alert-close" onclick="alertManager.close('${alertId}')">&times;</button>
            </div>
            ${!persistent ? '<div class="alert-progress"></div>' : ""}
        `

    this.container.appendChild(alertElement)

    setTimeout(() => {
      alertElement.classList.add("show")
    }, 100)

    if (!persistent && duration > 0) {
      const progressBar = alertElement.querySelector(".alert-progress")
      if (progressBar) {
        progressBar.style.animation = `progress ${duration}ms linear`
      }

      setTimeout(() => {
        this.close(alertId)
      }, duration)
    }

    this.alerts.push({ id: alertId, element: alertElement })

    if (this.alerts.length > 5) {
      this.close(this.alerts[0].id)
    }

    return alertId
  }

  close(alertId) {
    const alertIndex = this.alerts.findIndex((alert) => alert.id === alertId)
    if (alertIndex === -1) return

    const alert = this.alerts[alertIndex]
    alert.element.classList.add("hide")

    setTimeout(() => {
      if (alert.element.parentNode) {
        alert.element.parentNode.removeChild(alert.element)
      }
      this.alerts.splice(alertIndex, 1)
    }, 300)
  }

  closeAll() {
    this.alerts.forEach((alert) => {
      this.close(alert.id)
    })
  }

  getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    }
    return icons[type] || icons.info
  }
}

// Initialize alert manager
const alertManager = new AlertManager()

// Convenience functions for alerts
function showAlert(message, type = "info", duration = 8000) {
  return alertManager.show(message, type, duration)
}

function showSuccessAlert(message, duration = 6000) {
  return alertManager.show(message, "success", duration)
}

function showErrorAlert(message, duration = 10000) {
  return alertManager.show(message, "error", duration)
}

function showWarningAlert(message, duration = 8000) {
  return alertManager.show(message, "warning", duration)
}

function showInfoAlert(message, duration = 6000) {
  return alertManager.show(message, "info", duration)
}

// Initialize Socket.IO connection
function initializeSocket() {
  if (typeof io !== "undefined") {
    socket = io()

    socket.on("connect", () => {
      console.log("Connected to server")
      if (currentGuide) {
        socket.emit("join-guide", currentGuide.id)
      }
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    socket.on("new-booking-request", (data) => {
      showInfoAlert(`New tour request from ${data.traveler.name}`)
      if (currentPage === "requestsPage") {
        loadTourRequests()
      }
      updateNotificationBadges()
    })

    socket.on("booking-confirmed", (data) => {
      showSuccessAlert(`Booking confirmed for ${data.attraction.name}`)
      if (currentPage === "bookingsPage") {
        loadBookingsData()
      }
      updateDashboardStats()
    })

    socket.on("application-approved", (data) => {
      showSuccessAlert("🎉 Congratulations! Your guide application has been approved!", 10000)
      location.reload()
    })

    socket.on("application-rejected", (data) => {
      showErrorAlert(`Your application was rejected: ${data.guide.reason}`, 15000)
    })

    socket.on("account-suspended", (data) => {
      showErrorAlert(`Your account has been suspended: ${data.guide.reason}`, 15000)
      setTimeout(() => {
        logout()
      }, 3000)
    })
  } else {
    console.warn("Socket.IO not loaded. Real-time features disabled.")
  }
}

// Enhanced Authentication functions
async function checkAuthStatus() {
  try {
    const response = await fetch("/api/guide/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()

    if (data.success && data.guide) {
      currentGuide = data.guide
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
  console.log("Login attempt started")

  const form = event.target
  const formData = new FormData(form)
  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    showErrorAlert("Please fill in all fields")
    return
  }

  if (username.length < 3) {
    showErrorAlert("Username must be at least 3 characters long")
    return
  }

  if (password.length < 6) {
    showErrorAlert("Password must be at least 6 characters long")
    return
  }

  const submitBtn = form.querySelector('input[type="submit"]')
  const originalText = submitBtn.value
  submitBtn.value = "Logging in..."
  submitBtn.disabled = true

  try {
    console.log("Sending login request for:", username)

    const response = await fetch("/api/guide/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })

    console.log("Login response received:", response.status)
    const data = await response.json()
    console.log("Login data:", data)

    if (data.success) {
      currentGuide = data.guide
      isAuthenticated = true

      showSuccessAlert("Login successful! Welcome back!", 5000)
      showDashboard()

      const guideNameEl = document.getElementById("guide-name")
      if (guideNameEl) {
        guideNameEl.textContent = currentGuide.name || currentGuide.username
      }

      initializeSocket()
      startAutoRefresh()
      form.reset()
    } else {
      if (data.message.includes("pending")) {
        showWarningAlert("Your guide application is still pending approval. Please wait for admin verification.", 12000)
      } else if (data.message.includes("rejected")) {
        showErrorAlert("Your guide application has been rejected. Please contact support for more information.", 12000)
      } else if (data.message.includes("not approved")) {
        showWarningAlert("Your guide account is not yet approved. Please wait for admin verification.", 10000)
      } else {
        showErrorAlert(data.message || "Login failed. Please check your credentials.", 8000)
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    showErrorAlert("Network error. Please check your connection and try again.", 8000)
  } finally {
    submitBtn.value = originalText
    submitBtn.disabled = false
  }
}

async function handleRegister(event) {
  event.preventDefault()
  console.log("Registration attempt started")

  const form = event.target
  const formData = new FormData(form)

  const registrationData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    experience: formData.get("experience"),
    specialization: formData.get("specialization"),
  }

  // Enhanced validation
  const errors = []

  if (!registrationData.name || registrationData.name.length < 2) {
    errors.push("Full name must be at least 2 characters long")
  }

  if (!registrationData.email || !registrationData.email.includes("@")) {
    errors.push("Please enter a valid email address")
  }

  if (!registrationData.password || registrationData.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }

  if (!registrationData.phone || registrationData.phone.length < 10) {
    errors.push("Please enter a valid phone number")
  }

  if (!registrationData.location || registrationData.location.length < 2) {
    errors.push("Please enter your location")
  }

  if (!registrationData.experience) {
    errors.push("Please enter your experience")
  }

  if (!registrationData.specialization || registrationData.specialization.length < 5) {
    errors.push("Please enter your specialization (at least 5 characters)")
  }

  if (errors.length > 0) {
    errors.forEach((error) => {
      showErrorAlert(error, 6000)
    })
    return
  }

  const submitBtn = form.querySelector('input[type="submit"]')
  const originalText = submitBtn.value
  submitBtn.value = "Submitting Application..."
  submitBtn.disabled = true

  try {
    console.log("Sending registration request:", registrationData)

    const response = await fetch("/api/guide/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(registrationData),
    })

    console.log("Registration response received:", response.status)
    const data = await response.json()
    console.log("Registration data:", data)

    if (data.success) {
      showSuccessAlert("Application submitted successfully! 🎉", 8000)
      showInfoAlert("We'll review your application and notify you via email within 24-48 hours.", 10000)
      toggleToLogin()
      form.reset()
    } else {
      if (data.message.includes("already exists")) {
        showErrorAlert("A guide with this email already exists. Please use a different email or try logging in.", 10000)
      } else {
        showErrorAlert(data.message || "Application failed. Please try again.", 8000)
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    showErrorAlert("Network error. Please check your connection and try again.", 8000)
  } finally {
    submitBtn.value = originalText
    submitBtn.disabled = false
  }
}

async function logout() {
  try {
    const response = await fetch("/api/guide/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    const data = await response.json()

    if (data.success) {
      currentGuide = null
      isAuthenticated = false
      showSuccessAlert("Logged out successfully", 5000)
      showLoginPage()
      if (socket) {
        socket.disconnect()
      }
      stopAutoRefresh()
    } else {
      showErrorAlert("Error logging out", 8000)
    }
  } catch (error) {
    console.error("Logout error:", error)
    showErrorAlert("Network error during logout", 8000)
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
        case "requestsPage":
          loadTourRequests()
          break
        case "bookingsPage":
          loadBookingsData()
          break
        case "chatPage":
          loadChatData()
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
  console.log("Guide portal initializing...")

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
    if (dropdownContent && !dropdownTrigger?.contains(e.target) && !dropdownContent.contains(e.target)) {
      dropdownContent.classList.remove("active")
    }

    if (desktopDropdown && !desktopDropdownTrigger?.contains(e.target) && !desktopDropdown.contains(e.target)) {
      desktopDropdown.classList.remove("active")
    }

    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active")
    }
  })

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (mobileNav && !mobileMenuButton?.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove("active")
      if (menuIcon) menuIcon.style.display = "block"
      if (closeIcon) closeIcon.style.display = "none"
    }
  })

  // Profile form submission
  const profileForm = document.getElementById("profileForm")
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate)
  }

  // Keyboard shortcuts for alerts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      alertManager.closeAll()
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
    showErrorAlert("Please login first")
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
    case "bookingsPage":
      loadBookingsData()
      break
    case "requestsPage":
      loadTourRequests()
      break
    case "profilePage":
      loadProfileData()
      break
    case "availabilityPage":
      loadAvailabilityData()
      break
    case "reviewsPage":
      loadReviewsData()
      break
    case "earningsPage":
      loadEarningsData()
      break
    case "chatPage":
      loadChatData()
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

// Data loading functions
async function updateDashboardStats() {
  try {
    const response = await fetch("/api/guide/stats", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const elements = {
        totalTours: document.getElementById("totalTours"),
        pendingRequests: document.getElementById("pendingRequests"),
        averageRating: document.getElementById("averageRating"),
        monthlyEarnings: document.getElementById("monthlyEarnings"),
      }

      if (elements.totalTours) elements.totalTours.textContent = data.stats.totalTours || 0
      if (elements.pendingRequests) elements.pendingRequests.textContent = data.stats.pendingRequests || 0
      if (elements.averageRating) elements.averageRating.textContent = data.stats.averageRating || "4.8"
      if (elements.monthlyEarnings) elements.monthlyEarnings.textContent = `₹${data.stats.monthlyEarnings || 0}`
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

async function loadDashboardData() {
  try {
    updateDashboardStats()

    const bookingsResponse = await fetch("/api/guide/recent-bookings", {
      credentials: "include",
    })
    const bookingsData = await bookingsResponse.json()

    if (bookingsData.success) {
      updateRecentBookings(bookingsData.bookings)
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

function updateRecentBookings(bookings) {
  const container = document.getElementById("recentBookings")
  if (!container) return

  let bookingsHTML = ""

  if (bookings && bookings.length > 0) {
    bookings.slice(0, 5).forEach((booking) => {
      bookingsHTML += `
                <div class="activity-item">
                    <i class="fas fa-calendar-check"></i>
                    <div>
                        <p>${booking.travelerName} - ${booking.attractionName}</p>
                        <span>${formatTimeAgo(booking.visitDate)}</span>
                    </div>
                </div>
            `
    })
  } else {
    bookingsHTML = `
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <div>
                    <p>No recent bookings</p>
                    <span>Check back later</span>
                </div>
            </div>
        `
  }

  container.innerHTML = bookingsHTML
}

async function loadBookingsData() {
  try {
    const response = await fetch("/api/guide/bookings", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const tbody = document.getElementById("bookingsTable")
      if (tbody) {
        tbody.innerHTML = data.bookings
          .map(
            (booking) => `
                        <tr>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-xs"></i>
                                    </div>
                                    <div>
                                        <p class="font-medium">${booking.travelerName}</p>
                                        <p class="text-sm text-gray-500">${booking.travelerEmail}</p>
                                    </div>
                                </div>
                            </td>
                            <td>${booking.attractionName}</td>
                            <td>
                                <div>
                                    <p class="font-medium">${new Date(booking.visitDate).toLocaleDateString()}</p>
                                    <p class="text-sm text-gray-500">${booking.visitTime || "All day"}</p>
                                </div>
                            </td>
                            <td>${booking.duration}</td>
                            <td>${booking.groupSize} people</td>
                            <td>₹${booking.totalAmount}</td>
                            <td><span class="badge badge-${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                            <td>
                                <div class="flex gap-2">
                                    <button class="btn btn-secondary btn-sm" onclick="viewBookingDetails('${booking._id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${
                                      booking.status === "confirmed"
                                        ? `
                                        <button class="btn btn-success btn-sm" onclick="completeBooking('${booking._id}')">
                                            <i class="fas fa-check"></i>
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
    }
  } catch (error) {
    console.error("Error loading bookings:", error)
    showErrorAlert("Error loading bookings")
  }
}

async function loadTourRequests() {
  try {
    const response = await fetch("/api/guide/requests", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.getElementById("tourRequests")
      if (container) {
        if (data.requests && data.requests.length > 0) {
          container.innerHTML = data.requests
            .map(
              (request) => `
                            <div class="request-card">
                                <div class="request-header">
                                    <div class="request-info">
                                        <h4>${request.travelerName}</h4>
                                        <p>${request.travelerEmail}</p>
                                    </div>
                                    <span class="request-status badge badge-warning">Pending</span>
                                </div>
                                <div class="request-details">
                                    <div class="detail-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${request.attractionName}</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-calendar"></i>
                                        <span>${new Date(request.visitDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-users"></i>
                                        <span>${request.groupSize} people</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-clock"></i>
                                        <span>${request.duration}</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-dollar-sign"></i>
                                        <span>₹${request.totalAmount}</span>
                                    </div>
                                </div>
                                ${
                                  request.specialRequests
                                    ? `
                                    <div class="mb-4">
                                        <strong>Special Requests:</strong>
                                        <p class="text-sm text-gray-600 mt-1">${request.specialRequests}</p>
                                    </div>
                                `
                                    : ""
                                }
                                <div class="request-actions">
                                    <button class="btn btn-secondary" onclick="viewRequestDetails('${request._id}')">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    <button class="btn btn-danger" onclick="rejectTourRequest('${request._id}')">
                                        <i class="fas fa-times"></i> Reject
                                    </button>
                                    <button class="btn btn-success" onclick="acceptTourRequest('${request._id}')">
                                        <i class="fas fa-check"></i> Accept
                                    </button>
                                </div>
                            </div>
                        `,
            )
            .join("")
        } else {
          container.innerHTML = `
                        <div class="text-center text-gray-500 mt-8">
                            <i class="fas fa-inbox text-4xl mb-4"></i>
                            <p>No pending tour requests</p>
                            <p class="text-sm">New requests will appear here</p>
                        </div>
                    `
        }
      }
    }
  } catch (error) {
    console.error("Error loading tour requests:", error)
    showErrorAlert("Error loading tour requests")
  }
}

async function loadProfileData() {
  try {
    const response = await fetch("/api/guide/profile", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success && data.guide) {
      const guide = data.guide

      const fields = {
        guideName: guide.name,
        guideEmail: guide.email,
        guidePhone: guide.phone,
        guideLocation: guide.location,
        guideBio: guide.bio,
        guideExperience: guide.experience,
        guideLanguages: Array.isArray(guide.languages) ? guide.languages.join(", ") : guide.languages,
        guideSpecialization: guide.specialization,
        halfDayPrice: guide.pricing?.halfDay,
        fullDayPrice: guide.pricing?.fullDay,
      }

      Object.entries(fields).forEach(([fieldId, value]) => {
        const element = document.getElementById(fieldId)
        if (element && value) {
          element.value = value
        }
      })
    }
  } catch (error) {
    console.error("Error loading profile data:", error)
    showErrorAlert("Error loading profile data")
  }
}

async function handleProfileUpdate(event) {
  event.preventDefault()

  const form = event.target
  const formData = new FormData(form)

  const profileData = {
    name: formData.get("name") || document.getElementById("guideName").value,
    email: formData.get("email") || document.getElementById("guideEmail").value,
    phone: formData.get("phone") || document.getElementById("guidePhone").value,
    location: formData.get("location") || document.getElementById("guideLocation").value,
    bio: formData.get("bio") || document.getElementById("guideBio").value,
    experience: formData.get("experience") || document.getElementById("guideExperience").value,
    languages: (formData.get("languages") || document.getElementById("guideLanguages").value)
      .split(",")
      .map((lang) => lang.trim()),
    specialization: formData.get("specialization") || document.getElementById("guideSpecialization").value,
    pricing: {
      halfDay: Number.parseInt(formData.get("halfDayPrice") || document.getElementById("halfDayPrice").value) || 0,
      fullDay: Number.parseInt(formData.get("fullDayPrice") || document.getElementById("fullDayPrice").value) || 0,
    },
  }

  try {
    const response = await fetch("/api/guide/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    })

    const data = await response.json()

    if (data.success) {
      showSuccessAlert("Profile updated successfully!")
      currentGuide = { ...currentGuide, ...data.guide }

      const guideNameEl = document.getElementById("guide-name")
      if (guideNameEl) {
        guideNameEl.textContent = currentGuide.name || currentGuide.username
      }
    } else {
      showErrorAlert(data.message || "Error updating profile")
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    showErrorAlert("Network error. Please try again.")
  }
}

async function loadAvailabilityData() {
  try {
    const response = await fetch("/api/guide/availability", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.getElementById("availabilitySchedule")
      if (container) {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        container.innerHTML = `
                    <div class="schedule-grid">
                        ${days
                          .map((day, index) => {
                            const dayData = data.availability?.[day] || { available: false, slots: [] }
                            return `
                                <div class="day-card ${dayData.available ? "available" : ""}">
                                    <div class="day-name">${dayNames[index]}</div>
                                    <div class="availability-toggle">
                                        <label>
                                            <input type="checkbox" ${dayData.available ? "checked" : ""} 
                                                   onchange="toggleDayAvailability('${day}', this.checked)">
                                            Available
                                        </label>
                                    </div>
                                    <div class="time-slots">
                                        ${
                                          dayData.available && dayData.slots
                                            ? dayData.slots
                                                .map(
                                                  (slot) => `
                                                <div class="time-slot">${slot}</div>
                                            `,
                                                )
                                                .join("")
                                            : '<div class="time-slot">Not available</div>'
                                        }
                                    </div>
                                </div>
                            `
                          })
                          .join("")}
                    </div>
                `
      }
    }
  } catch (error) {
    console.error("Error loading availability data:", error)
    showErrorAlert("Error loading availability data")
  }
}

async function loadReviewsData() {
  try {
    const response = await fetch("/api/guide/reviews", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.getElementById("reviewsList")
      if (container) {
        if (data.reviews && data.reviews.length > 0) {
          container.innerHTML = data.reviews
            .map(
              (review) => `
                            <div class="review-card">
                                <div class="review-header">
                                    <div class="reviewer-info">
                                        <div class="reviewer-avatar">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div class="reviewer-name">${review.travelerName}</div>
                                            <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div class="rating-stars">
                                        ${Array.from(
                                          { length: 5 },
                                          (_, i) => `
                                            <i class="fas fa-star ${i < review.rating ? "star" : "text-gray-300"}"></i>
                                        `,
                                        ).join("")}
                                    </div>
                                </div>
                                <div class="review-text">${review.comment}</div>
                                ${review.attractionName ? `<div class="text-sm text-gray-500 mt-2">Tour: ${review.attractionName}</div>` : ""}
                            </div>
                        `,
            )
            .join("")
        } else {
          container.innerHTML = `
                        <div class="text-center text-gray-500 mt-8">
                            <i class="fas fa-star text-4xl mb-4"></i>
                            <p>No reviews yet</p>
                            <p class="text-sm">Complete tours to receive reviews from travelers</p>
                        </div>
                    `
        }
      }
    }
  } catch (error) {
    console.error("Error loading reviews:", error)
    showErrorAlert("Error loading reviews")
  }
}

async function loadEarningsData() {
  try {
    const response = await fetch("/api/guide/earnings", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const elements = {
        totalEarnings: document.getElementById("totalEarnings"),
        monthEarnings: document.getElementById("monthEarnings"),
        pendingPayment: document.getElementById("pendingPayment"),
      }

      if (elements.totalEarnings) elements.totalEarnings.textContent = `₹${data.earnings.total || 0}`
      if (elements.monthEarnings) elements.monthEarnings.textContent = `₹${data.earnings.thisMonth || 0}`
      if (elements.pendingPayment) elements.pendingPayment.textContent = `₹${data.earnings.pending || 0}`

      const paymentContainer = document.getElementById("paymentHistory")
      if (paymentContainer && data.payments) {
        if (data.payments.length > 0) {
          paymentContainer.innerHTML = data.payments
            .map(
              (payment) => `
                            <div class="flex justify-between items-center p-4 border-b">
                                <div>
                                    <p class="font-medium">${payment.description}</p>
                                    <p class="text-sm text-gray-500">${new Date(payment.date).toLocaleDateString()}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-medium text-green-600">₹${payment.amount}</p>
                                    <span class="badge badge-${payment.status === "paid" ? "success" : "warning"}">${payment.status}</span>
                                </div>
                            </div>
                        `,
            )
            .join("")
        } else {
          paymentContainer.innerHTML = `
                        <div class="text-center text-gray-500 mt-8">
                            <i class="fas fa-receipt text-4xl mb-4"></i>
                            <p>No payment history</p>
                            <p class="text-sm">Complete tours to start earning</p>
                        </div>
                    `
        }
      }
    }
  } catch (error) {
    console.error("Error loading earnings data:", error)
    showErrorAlert("Error loading earnings data")
  }
}

async function loadChatData() {
  try {
    const response = await fetch("/api/guide/messages", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const chatListContainer = document.getElementById("chatList")
      if (chatListContainer && data.conversations) {
        if (data.conversations.length > 0) {
          chatListContainer.innerHTML = data.conversations
            .map(
              (conversation) => `
                            <div class="chat-item" onclick="selectConversation('${conversation.id}')">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-medium">${conversation.travelerName}</p>
                                        <p class="text-sm text-gray-500 truncate">${conversation.lastMessage}</p>
                                    </div>
                                    ${conversation.unreadCount > 0 ? `<span class="badge badge-danger">${conversation.unreadCount}</span>` : ""}
                                </div>
                            </div>
                        `,
            )
            .join("")
        } else {
          chatListContainer.innerHTML = `
                        <div class="text-center text-gray-500 mt-8 p-4">
                            <i class="fas fa-comments text-4xl mb-4"></i>
                            <p>No conversations</p>
                            <p class="text-sm">Messages from travelers will appear here</p>
                        </div>
                    `
        }
      }
    }
  } catch (error) {
    console.error("Error loading chat data:", error)
    showErrorAlert("Error loading messages")
  }
}

async function loadAttractionsData() {
  try {
    const response = await fetch("/api/attractions", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const container = document.getElementById("attractionsList")
      if (container) {
        container.innerHTML = data.attractions
          .map(
            (attraction) => `
                        <div class="card mb-4">
                            <div class="card-content">
                                <div class="flex items-start gap-4">
                                    <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-image text-gray-400"></i>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-lg mb-2">${attraction.name}</h4>
                                        <p class="text-gray-600 mb-2">${attraction.description.substring(0, 150)}...</p>
                                        <div class="flex items-center gap-4 text-sm text-gray-500">
                                            <span><i class="fas fa-map-marker-alt"></i> ${attraction.district}</span>
                                            <span><i class="fas fa-tag"></i> ${attraction.category}</span>
                                            <span><i class="fas fa-star text-yellow-400"></i> ${attraction.rating} (${attraction.reviewCount} reviews)</span>
                                            <span><i class="fas fa-ticket-alt"></i> ${attraction.entryFee}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
          )
          .join("")
      }
    }
  } catch (error) {
    console.error("Error loading attractions:", error)
    showErrorAlert("Error loading attractions")
  }
}

// Action functions
async function acceptTourRequest(requestId) {
  try {
    const response = await fetch(`/api/guide/requests/${requestId}/accept`, {
      method: "POST",
      credentials: "include",
    })

    const data = await response.json()

    if (data.success) {
      showSuccessAlert("Tour request accepted successfully!")
      loadTourRequests()
      updateDashboardStats()
    } else {
      showErrorAlert(data.message || "Error accepting request")
    }
  } catch (error) {
    console.error("Error accepting request:", error)
    showErrorAlert("Network error. Please try again.")
  }
}

async function rejectTourRequest(requestId) {
  if (confirm("Are you sure you want to reject this tour request?")) {
    try {
      const response = await fetch(`/api/guide/requests/${requestId}/reject`, {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        showInfoAlert("Tour request rejected")
        loadTourRequests()
      } else {
        showErrorAlert(data.message || "Error rejecting request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      showErrorAlert("Network error. Please try again.")
    }
  }
}

async function completeBooking(bookingId) {
  if (confirm("Mark this booking as completed?")) {
    try {
      const response = await fetch(`/api/guide/bookings/${bookingId}/complete`, {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success) {
        showSuccessAlert("Booking marked as completed!")
        loadBookingsData()
        updateDashboardStats()
      } else {
        showErrorAlert(data.message || "Error completing booking")
      }
    } catch (error) {
      console.error("Error completing booking:", error)
      showErrorAlert("Network error. Please try again.")
    }
  }
}

async function toggleDayAvailability(day, isAvailable) {
  try {
    const response = await fetch("/api/guide/availability", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        day,
        available: isAvailable,
        slots: isAvailable ? ["09:00-12:00", "14:00-17:00"] : [],
      }),
    })

    const data = await response.json()

    if (data.success) {
      showSuccessAlert(`${day} availability updated`)
      loadAvailabilityData()
    } else {
      showErrorAlert(data.message || "Error updating availability")
    }
  } catch (error) {
    console.error("Error updating availability:", error)
    showErrorAlert("Network error. Please try again.")
  }
}

function selectConversation(conversationId) {
  const chatTitle = document.getElementById("chatTitle")
  const chatMessages = document.getElementById("chatMessages")

  if (chatTitle) {
    chatTitle.textContent = "Loading conversation..."
  }

  if (chatMessages) {
    chatMessages.innerHTML = `
            <div class="text-center text-gray-500 mt-8">
                <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                <p>Loading messages...</p>
            </div>
        `
  }

  showInfoAlert("Chat functionality - Coming soon!")
}

function sendMessage() {
  const messageInput = document.getElementById("messageInput")
  if (messageInput && messageInput.value.trim()) {
    showInfoAlert("Message sending functionality - Coming soon!")
    messageInput.value = ""
  }
}

function viewRequestDetails(requestId) {
  selectedRequestId = requestId
  showInfoAlert("Request details functionality - Coming soon!")
}

function viewBookingDetails(bookingId) {
  showInfoAlert("Booking details functionality - Coming soon!")
}

// Utility functions
function getStatusBadgeClass(status) {
  switch (status) {
    case "confirmed":
    case "completed":
      return "success"
    case "pending":
      return "warning"
    case "cancelled":
    case "rejected":
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
    const response = await fetch("/api/guide/notifications", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.success) {
      const notificationBadge = document.getElementById("notification-badge")
      const messageBadge = document.getElementById("message-badge")

      if (notificationBadge) {
        const totalNotifications = (data.notifications.pendingRequests || 0) + (data.notifications.newBookings || 0)
        notificationBadge.setAttribute("data-count", totalNotifications > 0 ? totalNotifications : "")
      }

      if (messageBadge) {
        const unreadMessages = data.notifications.unreadMessages || 0
        messageBadge.setAttribute("data-count", unreadMessages > 0 ? unreadMessages : "")
      }
    }
  } catch (error) {
    console.error("Error updating notification badges:", error)
  }
}

// Make functions globally available
window.showPage = showPage
window.logout = logout
window.toggleSidebar = toggleSidebar
window.toggleTheme = toggleTheme
window.acceptTourRequest = acceptTourRequest
window.rejectTourRequest = rejectTourRequest
window.completeBooking = completeBooking
window.toggleDayAvailability = toggleDayAvailability
window.selectConversation = selectConversation
window.sendMessage = sendMessage
window.viewRequestDetails = viewRequestDetails
window.viewBookingDetails = viewBookingDetails
window.alertManager = alertManager

console.log("✅ Guide portal JavaScript loaded successfully!")
