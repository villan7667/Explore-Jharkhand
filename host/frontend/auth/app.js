
// Show Custom Alert
function showAlert(message, type = "success") {
  const alertBox = document.getElementById("custom-alert");
  const messageSpan = document.getElementById("alert-message");

  messageSpan.textContent = message;
  alertBox.className = `custom-alert ${type} show`;

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// Panel switching
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Navbar toggle for mobile
function toggleMenu() {
  const navList = document.getElementById('nav-list');
  navList.classList.toggle('active');
}

// Authentication functions
async function handleAuth(event, isSignUp) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Store token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Show success message
      showAlert(isSignUp ? 'Account created successfully!' : 'Welcome back!', 'success');

      // Redirect to home page after short delay
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    } else {
      showAlert(result.message || 'Something went wrong', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('Network error. Please try again.', 'error');
  }
}

// Add event listeners to forms
document.getElementById('sign-in-form').addEventListener('submit', (e) => handleAuth(e, false));
document.getElementById('sign-up-form').addEventListener('submit', (e) => handleAuth(e, true));

// Check if user is already logged in
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        window.location.href = '/home';
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  }
});
