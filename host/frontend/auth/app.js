console.log("Script loaded")

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded")

  // Get navbar elements
  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileNav = document.getElementById("mobile-nav")
  const menuIcon = document.getElementById("menu-icon")
  const closeIcon = document.getElementById("close-icon")

  console.log("Navbar elements found:", {
    mobileMenuButton: !!mobileMenuButton,
    mobileNav: !!mobileNav,
    menuIcon: !!menuIcon,
    closeIcon: !!closeIcon,
  })

  // Mobile menu toggle
  if (mobileMenuButton && mobileNav) {
    mobileMenuButton.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Mobile menu button clicked")

      // Toggle active class
      mobileNav.classList.toggle("active")

      const isActive = mobileNav.classList.contains("active")
      console.log("Menu is now:", isActive ? "open" : "closed")

      // Toggle icons
      if (menuIcon && closeIcon) {
        if (isActive) {
          menuIcon.style.display = "none"
          closeIcon.style.display = "block"
        } else {
          menuIcon.style.display = "block"
          closeIcon.style.display = "none"
        }
      }
    })
  } else {
    console.error("Mobile menu elements not found")
  }

  // Mobile dropdown toggle
  const placesDropdownTrigger = document.getElementById("places-dropdown-trigger")
  const placesDropdownContent = document.getElementById("places-dropdown-content")

  if (placesDropdownTrigger && placesDropdownContent) {
    placesDropdownTrigger.addEventListener("click", function (e) {
      e.preventDefault()
      console.log("Dropdown trigger clicked")

      this.classList.toggle("active")
      placesDropdownContent.classList.toggle("open")
    })
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      mobileNav &&
      mobileMenuButton &&
      !mobileNav.contains(event.target) &&
      !mobileMenuButton.contains(event.target)
    ) {
      mobileNav.classList.remove("active")

      if (menuIcon && closeIcon) {
        menuIcon.style.display = "block"
        closeIcon.style.display = "none"
      }
    }
  })

  // Debug: Log current screen width
  console.log("Current screen width:", window.innerWidth)
  console.log("Mobile menu should be visible at widths < 1024px")

  // Show Custom Alert
  window.showAlert = (message, type = "success") => {
    const alertBox = document.getElementById("custom-alert")
    const messageSpan = document.getElementById("alert-message")

    if (alertBox && messageSpan) {
      messageSpan.textContent = message
      alertBox.className = `custom-alert ${type} show`

      setTimeout(() => {
        alertBox.classList.remove("show")
      }, 3000)
    }
  }

  // Panel switching
  const sign_in_btn = document.querySelector("#sign-in-btn")
  const sign_up_btn = document.querySelector("#sign-up-btn")
  const container = document.querySelector(".container")

  if (sign_up_btn && container) {
    sign_up_btn.addEventListener("click", () => {
      container.classList.add("sign-up-mode")
    })
  }

  if (sign_in_btn && container) {
    sign_in_btn.addEventListener("click", () => {
      container.classList.remove("sign-up-mode")
    })
  }

  // Authentication functions
  async function handleAuth(event, isSignUp) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const data = Object.fromEntries(formData)

    const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))

        // Show success message
        showAlert(isSignUp ? "Account created successfully!" : "Welcome back!", "success")

        // Redirect to home page after short delay
        setTimeout(() => {
          window.location.href = "/home"
        }, 1000)
      } else {
        showAlert(result.message || "Something went wrong", "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showAlert("Network error. Please try again.", "error")
    }
  }

  // Add event listeners to forms
  const signInForm = document.getElementById("sign-in-form")
  const signUpForm = document.getElementById("sign-up-form")

  if (signInForm) {
    signInForm.addEventListener("submit", (e) => handleAuth(e, false))
  }

  if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => handleAuth(e, true))
  }
})

// Check if user is already logged in
window.addEventListener("load", () => {
  const token = localStorage.getItem("token")
  if (token) {
    fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          window.location.href = "/home"
        }
      })
      .catch(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      })
  }
})
