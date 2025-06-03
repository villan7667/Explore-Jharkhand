// Load the navbar and footer HTML into the respective elements

fetch("/frontend/component/footer/footer.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

// Contact form submission handling
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Still prevent default, but we use fetch now

    const form = event.target;
    const formData = new FormData(form);

    fetch("https://formspree.io/f/xwplakko", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          // Show the Thank You popup
          const popup = document.getElementById("thank-you-popup");
          popup.classList.add("show-popup");

          // Clear the form
          form.reset();

          // Hide the popup and reload after 3 seconds
          setTimeout(() => {
            popup.classList.remove("show-popup");
            location.reload();
          }, 3000);
        } else {
          alert("Something went wrong. Please try again!");
        }
      })
      .catch((error) => {
        console.error("Formspree error:", error);
        alert("There was a problem submitting the form.");
      });
  });

// Close the Thank You popup when the close button is clicked

let chatId = "";
let userName = "";
let userEmail = "";
let isOpen = false;

function toggleChat() {
  const chatWindow = document.getElementById("chatWindow");
  isOpen = !isOpen;

  if (isOpen) {
    chatWindow.classList.add("open");
    if (chatId) {
      pollMessages();
    }
  } else {
    chatWindow.classList.remove("open");
  }
}

function startChat() {
  const nameInput = document.getElementById("userName");
  const emailInput = document.getElementById("userEmail");

  userName = nameInput.value.trim();
  userEmail = emailInput.value.trim();

  if (!userName || !userEmail) {
    alert("Please enter both name and email");
    return;
  }

  // Generate unique chat ID
  chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Hide welcome form and show chat
  document.getElementById("welcomeForm").style.display = "none";
  document.getElementById("messagesContainer").style.display = "block";
  document.getElementById("messageForm").style.display = "block";

  // Add welcome message
  addMessage(`Hi ${userName}! How can I help you today?`, "admin");

  // Start polling for messages
  pollMessages();
}

function addMessage(content, sender, timestamp = null) {
  const messagesContainer = document.getElementById("messagesContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const time = timestamp ? new Date(timestamp) : new Date();
  const timeString = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
                <div class="message-bubble">${content}</div>
                <div class="message-time">${timeString}</div>
            `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message || !chatId) return;

  // Add user message to chat
  addMessage(message, "user");
  messageInput.value = "";

  try {
    const response = await fetch("/api/chat/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        message,
        name: userName,
        email: userEmail,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Add confirmation message
      setTimeout(() => {
        addMessage(
          "I've received your message and will respond soon!",
          "admin"
        );
      }, 1000);
    } else {
      addMessage(
        "Sorry, there was an error sending your message. Please try again.",
        "admin"
      );
    }
  } catch (error) {
    console.error("Error sending message:", error);
    addMessage(
      "Sorry, there was an error sending your message. Please try again.",
      "admin"
    );
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

async function pollMessages() {
  if (!chatId) return;

  try {
    const response = await fetch(`/api/chat/messages/${chatId}`);
    const messages = await response.json();

    // Clear existing messages and reload all
    const messagesContainer = document.getElementById("messagesContainer");
    messagesContainer.innerHTML = "";

    messages.forEach((msg) => {
      if (msg.sender === "user" && msg.message) {
        addMessage(msg.message, "user", msg.timestamp);
      } else if (msg.sender === "admin" && msg.message) {
        addMessage(msg.message, "admin", msg.timestamp);
      }
    });
  } catch (error) {
    console.error("Error polling messages:", error);
  }
}

// Poll for new messages every 10 seconds when chat is open
setInterval(() => {
  if (isOpen && chatId) {
    pollMessages();
  }
}, 10000);

//dont copy start
document.addEventListener("copy", function (e) {
  e.preventDefault();
  const customMessage =
    'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
  e.clipboardData.setData("text/plain", customMessage);
});
//dont copy end




// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initNavigation();
  initContactForm();
  initTouristGuides();
  initFAQ();
  initNewsletter();
  initScrollAnimations();
  initToast();
  
  // Load dynamic content
  loadGuides();
  loadFAQs();
});

// Navigation functionality
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu) {
      navToggle.addEventListener('click', function() {
          navToggle.classList.toggle('active');
          navMenu.classList.toggle('active');
      });
      
      // Close mobile menu when clicking on links
      const navLinks = navMenu.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              navToggle.classList.remove('active');
              navMenu.classList.remove('active');
          });
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
          if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
              navToggle.classList.remove('active');
              navMenu.classList.remove('active');
          }
      });
  }
}

// Contact form functionality
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const successMessage = document.getElementById('success-message');
  
  if (contactForm) {
      contactForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const submitBtn = contactForm.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerHTML;
          
          // Show loading state
          submitBtn.classList.add('btn-loading');
          submitBtn.disabled = true;
          
          try {
              // Simulate form submission
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Hide form and show success message
              contactForm.style.display = 'none';
              successMessage.classList.remove('hidden');
              successMessage.classList.add('animate-scale-in');
              
              // Show success toast
              showToast('Message sent successfully!', 'We\'ll get back to you within 24 hours.', 'success');
              
              // Reset form after 3 seconds
              setTimeout(() => {
                  contactForm.style.display = 'block';
                  successMessage.classList.add('hidden');
                  contactForm.reset();
                  submitBtn.classList.remove('btn-loading');
                  submitBtn.disabled = false;
                  submitBtn.innerHTML = originalText;
              }, 3000);
              
          } catch (error) {
              console.error('Form submission error:', error);
              showToast('Error sending message', 'Please try again later.', 'error');
              submitBtn.classList.remove('btn-loading');
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
          }
      });
  }
}

// Newsletter functionality
function initNewsletter() {
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterContent = document.getElementById('newsletter-content');
  const newsletterSuccess = document.getElementById('newsletter-success');
  
  if (newsletterForm) {
      newsletterForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const email = document.getElementById('newsletter-email').value;
          const submitBtn = newsletterForm.querySelector('button[type="submit"]');
          
          if (email) {
              submitBtn.classList.add('btn-loading');
              submitBtn.disabled = true;
              
              try {
                  // Simulate subscription
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  
                  newsletterContent.style.display = 'none';
                  newsletterSuccess.classList.remove('hidden');
                  newsletterSuccess.classList.add('animate-scale-in');
                  
                  showToast('Successfully subscribed!', 'You\'ll receive our latest travel updates and offers.', 'success');
                  
                  setTimeout(() => {
                      newsletterContent.style.display = 'block';
                      newsletterSuccess.classList.add('hidden');
                      newsletterForm.reset();
                      submitBtn.classList.remove('btn-loading');
                      submitBtn.disabled = false;
                  }, 3000);
                  
              } catch (error) {
                  console.error('Newsletter subscription error:', error);
                  showToast('Subscription failed', 'Please try again later.', 'error');
                  submitBtn.classList.remove('btn-loading');
                  submitBtn.disabled = false;
              }
          }
      });
  }
}

// FAQ functionality
function initFAQ() {
  const faqContainer = document.getElementById('faq-container');
  
  if (faqContainer) {
      faqContainer.addEventListener('click', function(e) {
          const faqQuestion = e.target.closest('.faq-question');
          if (faqQuestion) {
              const faqItem = faqQuestion.closest('.faq-item');
              const isActive = faqItem.classList.contains('active');
              
              // Close all FAQ items
              faqContainer.querySelectorAll('.faq-item').forEach(item => {
                  item.classList.remove('active');
              });
              
              // Open clicked item if it wasn't active
              if (!isActive) {
                  faqItem.classList.add('active');
              }
          }
      });
  }
}

// Load tourist guides data
function loadGuides() {
  const guides = [
      {
          id: 1,
          name: "Ravi Kumar",
          image: "/placeholder.svg?height=120&width=120",
          specialization: "Ranchi & Netarhat",
          experience: "8+ years",
          languages: ["Hindi", "English"],
          rating: 4.9,
          reviews: 156,
          phone: "+91 9876543210",
          verified: true,
          trusted: true,
          description: "Expert in hill stations and cultural tours"
      },
      {
          id: 2,
          name: "Sunita Singh",
          image: "/placeholder.svg?height=120&width=120",
          specialization: "Deoghar & Bokaro",
          experience: "5 years",
          languages: ["Hindi", "English", "Bengali"],
          rating: 4.8,
          reviews: 89,
          phone: "+91 9123456780",
          verified: true,
          trusted: false,
          description: "Religious sites and temple tour specialist"
      },
      {
          id: 3,
          name: "Ajay Das",
          image: "/placeholder.svg?height=120&width=120",
          specialization: "Jamshedpur & Dhanbad",
          experience: "10+ years",
          languages: ["Hindi", "English", "Santhali"],
          rating: 4.9,
          reviews: 203,
          phone: "+91 9988776655",
          verified: true,
          trusted: true,
          description: "Industrial heritage and nature tours"
      },
      {
          id: 4,
          name: "Priya Verma",
          image: "/placeholder.svg?height=120&width=120",
          specialization: "Wildlife & Nature",
          experience: "7 years",
          languages: ["Hindi", "English"],
          rating: 4.7,
          reviews: 124,
          phone: "+91 9876501234",
          verified: true,
          trusted: false,
          description: "Wildlife photography and nature walks"
      }
  ];
  
  const guidesGrid = document.getElementById('guides-grid');
  if (guidesGrid) {
      guidesGrid.innerHTML = guides.map(guide => createGuideCard(guide)).join('');
      guidesGrid.classList.add('stagger-animation');
  }
}

// Create guide card HTML
function createGuideCard(guide) {
  const stars = '★'.repeat(Math.floor(guide.rating)) + (guide.rating % 1 ? '☆' : '');
  
  return `
      <div class="guide-card hover-lift">
          <div class="guide-avatar">
              <img src="${guide.image}" alt="${guide.name}">
              ${guide.verified ? '<div class="guide-verified"><i class="fas fa-check"></i></div>' : ''}
          </div>
          
          <div class="guide-info">
              <div class="guide-name">
                  ${guide.name}
                  ${guide.trusted ? '<i class="fas fa-award" style="color: #f59e0b;"></i>' : ''}
              </div>
              
              <div class="guide-rating">
                  <span style="color: #fbbf24;">${stars}</span>
                  <span style="font-weight: 500; margin-left: 0.25rem;">${guide.rating}</span>
                  <span style="color: var(--text-light); margin-left: 0.25rem;">(${guide.reviews})</span>
              </div>
              
              <div class="guide-badges">
                  ${guide.verified ? '<span class="badge verified">Verified</span>' : ''}
                  ${guide.trusted ? '<span class="badge trusted">Trusted</span>' : ''}
              </div>
          </div>
          
          <div class="guide-details">
              <div class="guide-detail">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${guide.specialization}</span>
              </div>
              <div class="guide-detail">
                  <i class="fas fa-award"></i>
                  <span>${guide.experience} experience</span>
              </div>
              <div class="guide-detail">
                  <i class="fas fa-language"></i>
                  <span>${guide.languages.join(', ')}</span>
              </div>
          </div>
          
          <div class="guide-description">
              ${guide.description}
          </div>
          
          <div class="guide-actions">
              <button class="btn btn-primary" onclick="contactGuide('${guide.phone}')">
                  <i class="fas fa-phone"></i>
                  Contact Guide
              </button>
              <button class="btn btn-outline" onclick="viewGuideProfile(${guide.id})">
                  View Profile
              </button>
          </div>
      </div>
  `;
}

// Load FAQ data
function loadFAQs() {
  const faqs = [
      {
          question: "What are the best times to visit Jharkhand?",
          answer: "The best time to visit Jharkhand is from October to March when the weather is pleasant and ideal for sightseeing. Avoid monsoon season (July-September) for outdoor activities."
      },
      {
          question: "Do you provide customized tour packages?",
          answer: "Yes, we offer fully customized tour packages based on your preferences, budget, and duration. Our expert team will help you create the perfect itinerary for your Jharkhand adventure."
      },
      {
          question: "Are your tourist guides certified?",
          answer: "All our tourist guides are certified by the Jharkhand Tourism Board and have extensive local knowledge. They are trained in first aid and speak multiple languages."
      },
      {
          question: "What safety measures do you follow?",
          answer: "We prioritize safety with trained guides, emergency contacts, first aid kits, and 24/7 support. All our vehicles are regularly maintained and drivers are experienced."
      },
      {
          question: "Can you arrange accommodation?",
          answer: "Yes, we can arrange accommodation ranging from budget hotels to luxury resorts. We have partnerships with verified properties across Jharkhand."
      },
      {
          question: "What payment methods do you accept?",
          answer: "We accept cash, bank transfers, UPI, credit/debit cards, and digital wallets. Advance booking requires a 30% deposit with the balance due before the tour starts."
      }
  ];
  
  const faqContainer = document.getElementById('faq-container');
  if (faqContainer) {
      faqContainer.innerHTML = faqs.map((faq, index) => createFAQItem(faq, index)).join('');
      
      // Open first FAQ by default
      const firstFAQ = faqContainer.querySelector('.faq-item');
      if (firstFAQ) {
          firstFAQ.classList.add('active');
      }
  }
}

// Create FAQ item HTML
function createFAQItem(faq, index) {
  return `
      <div class="faq-item">
          <button class="faq-question">
              <span>${faq.question}</span>
              <i class="fas fa-chevron-down"></i>
          </button>
          <div class="faq-answer">
              <p>${faq.answer}</p>
          </div>
      </div>
  `;
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
          }
      });
  }, observerOptions);
  
  // Observe elements for scroll animations
  const animatedElements = document.querySelectorAll('.fade-in-on-scroll, .slide-in-left-on-scroll, .slide-in-right-on-scroll');
  animatedElements.forEach(el => observer.observe(el));
  
  // Add scroll classes to elements
  document.querySelectorAll('.contact-grid > *').forEach((el, index) => {
      el.classList.add(index % 2 === 0 ? 'slide-in-left-on-scroll' : 'slide-in-right-on-scroll');
  });
  
  document.querySelectorAll('.method-card, .guide-card, .faq-item').forEach(el => {
      el.classList.add('fade-in-on-scroll');
  });
}

// Toast notification system
function initToast() {
  // Create toast container if it doesn't exist
  if (!document.getElementById('toast')) {
      const toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.innerHTML = `
          <div class="toast-content">
              <i class="toast-icon"></i>
              <div class="toast-text">
                  <div class="toast-title"></div>
                  <div class="toast-message"></div>
              </div>
          </div>
      `;
      document.body.appendChild(toast);
  }
}

function showToast(title, message, type = 'info') {
  const toast = document.getElementById('toast');
  const icon = toast.querySelector('.toast-icon');
  const titleEl = toast.querySelector('.toast-title');
  const messageEl = toast.querySelector('.toast-message');
  
  // Set content
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Set icon based on type
  icon.className = `toast-icon ${type}`;
  switch (type) {
      case 'success':
          icon.innerHTML = '<i class="fas fa-check-circle"></i>';
          break;
      case 'error':
          icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
          break;
      case 'warning':
          icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
          break;
      default:
          icon.innerHTML = '<i class="fas fa-info-circle"></i>';
  }
  
  // Show toast
  toast.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
      toast.classList.remove('show');
  }, 5000);
}

// Guide interaction functions
function contactGuide(phone) {
  window.open(`tel:${phone}`, '_self');
}

function viewGuideProfile(guideId) {
  showToast('Profile View', `Opening profile for guide ID: ${guideId}`, 'info');
  // In a real application, this would navigate to the guide's profile page
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
      }
  }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
          target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
          });
      }
  });
});

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Add real-time form validation
document.addEventListener('input', function(e) {
  if (e.target.type === 'email') {
      const isValid = validateEmail(e.target.value);
      e.target.style.borderColor = isValid ? 'var(--primary-color)' : '#ef4444';
  }
  
  if (e.target.type === 'tel') {
      const isValid = validatePhone(e.target.value);
      e.target.style.borderColor = isValid ? 'var(--primary-color)' : '#ef4444';
  }
});// Component-specific JavaScript functionality

// Tourist Guides Component
class TouristGuidesComponent {
    constructor() {
        this.guides = [];
        this.filteredGuides = [];
        this.currentFilter = 'all';
        this.init();
    }
    
    init() {
        this.loadGuides();
        this.setupFilters();
        this.setupSearch();
    }
    
    loadGuides() {
        // This would typically fetch from an API
        this.guides = [
            {
                id: 1,
                name: "Ravi Kumar",
                image: "/placeholder.svg?height=120&width=120",
                specialization: "Ranchi & Netarhat",
                experience: "8+ years",
                languages: ["Hindi", "English"],
                rating: 4.9,
                reviews: 156,
                phone: "+91 9876543210",
                verified: true,
                trusted: true,
                description: "Expert in hill stations and cultural tours",
                category: "cultural"
            },
            {
                id: 2,
                name: "Sunita Singh",
                image: "/placeholder.svg?height=120&width=120",
                specialization: "Deoghar & Bokaro",
                experience: "5 years",
                languages: ["Hindi", "English", "Bengali"],
                rating: 4.8,
                reviews: 89,
                phone: "+91 9123456780",
                verified: true,
                trusted: false,
                description: "Religious sites and temple tour specialist",
                category: "religious"
            },
            {
                id: 3,
                name: "Ajay Das",
                image: "/placeholder.svg?height=120&width=120",
                specialization: "Jamshedpur & Dhanbad",
                experience: "10+ years",
                languages: ["Hindi", "English", "Santhali"],
                rating: 4.9,
                reviews: 203,
                phone: "+91 9988776655",
                verified: true,
                trusted: true,
                description: "Industrial heritage and nature tours",
                category: "nature"
            },
            {
                id: 4,
                name: "Priya Verma",
                image: "/placeholder.svg?height=120&width=120",
                specialization: "Wildlife & Nature",
                experience: "7 years",
                languages: ["Hindi", "English"],
                rating: 4.7,
                reviews: 124,
                phone: "+91 9876501234",
                verified: true,
                trusted: false,
                description: "Wildlife photography and nature walks",
                category: "wildlife"
            }
        ];
        
        this.filteredGuides = [...this.guides];
        this.render();
    }
    
    setupFilters() {
        // Add filter buttons if they exist
        const filterContainer = document.querySelector('.guide-filters');
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.currentFilter = e.target.dataset.filter;
                    this.filterGuides();
                    this.updateActiveFilter(e.target);
                }
            });
        }
    }
    
    setupSearch() {
        const searchInput = document.querySelector('.guide-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchGuides(e.target.value);
            }, 300));
        }
    }
    
    filterGuides() {
        if (this.currentFilter === 'all') {
            this.filteredGuides = [...this.guides];
        } else {
            this.filteredGuides = this.guides.filter(guide => 
                guide.category === this.currentFilter
            );
        }
        this.render();
    }
    
    searchGuides(query) {
        const searchTerm = query.toLowerCase();
        this.filteredGuides = this.guides.filter(guide =>
            guide.name.toLowerCase().includes(searchTerm) ||
            guide.specialization.toLowerCase().includes(searchTerm) ||
            guide.description.toLowerCase().includes(searchTerm)
        );
        this.render();
    }
    
    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    render() {
        const container = document.getElementById('guides-grid');
        if (container) {
            container.innerHTML = this.filteredGuides.map(guide => 
                this.createGuideCard(guide)
            ).join('');
            
            // Add stagger animation
            container.classList.add('stagger-animation');
        }
    }
    
    createGuideCard(guide) {
        const stars = '★'.repeat(Math.floor(guide.rating)) + (guide.rating % 1 ? '☆' : '');
        
        return `
            <div class="guide-card hover-lift" data-guide-id="${guide.id}">
                <div class="guide-avatar">
                    <img src="${guide.image}" alt="${guide.name}" loading="lazy">
                    ${guide.verified ? '<div class="guide-verified"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="guide-info">
                    <div class="guide-name">
                        ${guide.name}
                        ${guide.trusted ? '<i class="fas fa-award" style="color: #f59e0b;" title="Trusted Guide"></i>' : ''}
                    </div>
                    
                    <div class="guide-rating">
                        <span style="color: #fbbf24;">${stars}</span>
                        <span style="font-weight: 500; margin-left: 0.25rem;">${guide.rating}</span>
                        <span style="color: var(--text-light); margin-left: 0.25rem;">(${guide.reviews})</span>
                    </div>
                    
                    <div class="guide-badges">
                        ${guide.verified ? '<span class="badge verified">Verified</span>' : ''}
                        ${guide.trusted ? '<span class="badge trusted">Trusted</span>' : ''}
                    </div>
                </div>
                
                <div class="guide-details">
                    <div class="guide-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${guide.specialization}</span>
                    </div>
                    <div class="guide-detail">
                        <i class="fas fa-award"></i>
                        <span>${guide.experience} experience</span>
                    </div>
                    <div class="guide-detail">
                        <i class="fas fa-language"></i>
                        <span>${guide.languages.join(', ')}</span>
                    </div>
                </div>
                
                <div class="guide-description">
                    ${guide.description}
                </div>
                
                <div class="guide-actions">
                    <button class="btn btn-primary" onclick="contactGuide('${guide.phone}')">
                        <i class="fas fa-phone"></i>
                        Contact Guide
                    </button>
                    <button class="btn btn-outline" onclick="viewGuideProfile(${guide.id})">
                        View Profile
                    </button>
                </div>
            </div>
        `;
    }
}

// Contact Methods Component
class ContactMethodsComponent {
    constructor() {
        this.methods = [
            {
                icon: 'fas fa-phone',
                title: 'Phone Support',
                description: 'Speak directly with our travel experts',
                contact: '+91 9876543210',
                action: 'Call Now',
                color: 'phone',
                available: '24/7 Available',
                handler: this.handlePhoneCall
            },
            {
                icon: 'fas fa-envelope',
                title: 'Email Support',
                description: 'Send us detailed inquiries',
                contact: 'info@explorejharkhand.com',
                action: 'Send Email',
                color: 'email',
                available: 'Response within 2 hours',
                handler: this.handleEmail
            },
            {
                icon: 'fab fa-whatsapp',
                title: 'WhatsApp',
                description: 'Quick messages and media sharing',
                contact: '+91 9876543210',
                action: 'Chat on WhatsApp',
                color: 'whatsapp',
                available: 'Instant replies',
                handler: this.handleWhatsApp
            },
            {
                icon: 'fas fa-video',
                title: 'Video Call',
                description: 'Face-to-face consultation',
                contact: 'Schedule a meeting',
                action: 'Book Video Call',
                color: 'video',
                available: 'By appointment',
                handler: this.handleVideoCall
            }
        ];
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        const container = document.querySelector('.methods-grid');
        if (container) {
            container.innerHTML = this.methods.map(method => 
                this.createMethodCard(method)
            ).join('');
        }
    }
    
    createMethodCard(method) {
        return `
            <div class="method-card hover-lift" data-method="${method.color}">
                <div class="method-icon ${method.color}">
                    <i class="${method.icon}"></i>
                </div>
                <h3>${method.title}</h3>
                <p>${method.description}</p>
                <div class="method-contact">${method.contact}</div>
                <div class="method-availability">
                    <i class="fas fa-clock"></i>
                    ${method.available}
                </div>
                <button class="btn btn-outline method-action">
                    ${method.action}
                </button>
            </div>
        `;
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('method-action')) {
                const methodCard = e.target.closest('.method-card');
                const methodType = methodCard.dataset.method;
                const method = this.methods.find(m => m.color === methodType);
                
                if (method && method.handler) {
                    method.handler.call(this, method);
                }
            }
        });
    }
    
    handlePhoneCall(method) {
        window.open(`tel:${method.contact}`, '_self');
        showToast('Calling...', `Connecting to ${method.contact}`, 'info');
    }
    
    handleEmail(method) {
        const subject = encodeURIComponent('Inquiry about Jharkhand Tour');
        const body = encodeURIComponent('Hello,\n\nI am interested in learning more about your tour packages.\n\nBest regards');
        window.open(`mailto:${method.contact}?subject=${subject}&body=${body}`, '_self');
        showToast('Opening Email', 'Your email client will open shortly', 'info');
    }
    
    handleWhatsApp(method) {
        const message = encodeURIComponent('Hello! I am interested in your Jharkhand tour packages.');
        const phone = method.contact.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        showToast('Opening WhatsApp', 'Redirecting to WhatsApp...', 'info');
    }
    
    handleVideoCall(method) {
        showToast('Video Call Booking', 'Feature coming soon! Please call us directly.', 'info');
        // In a real application, this would open a booking modal or redirect to a scheduling page
    }
}

// FAQ Component
class FAQComponent {
    constructor() {
        this.faqs = [
            {
                id: 1,
                question: "What are the best times to visit Jharkhand?",
                answer: "The best time to visit Jharkhand is from October to March when the weather is pleasant and ideal for sightseeing. Avoid monsoon season (July-September) for outdoor activities.",
                category: "general"
            },
            {
                id: 2,
                question: "Do you provide customized tour packages?",
                answer: "Yes, we offer fully customized tour packages based on your preferences, budget, and duration. Our expert team will help you create the perfect itinerary for your Jharkhand adventure.",
                category: "packages"
            },
            {
                id: 3,
                question: "Are your tourist guides certified?",
                answer: "All our tourist guides are certified by the Jharkhand Tourism Board and have extensive local knowledge. They are trained in first aid and speak multiple languages.",
                category: "guides"
            },
            {
                id: 4,
                question: "What safety measures do you follow?",
                answer: "We prioritize safety with trained guides, emergency contacts, first aid kits, and 24/7 support. All our vehicles are regularly maintained and drivers are experienced.",
                category: "safety"
            },
            {
                id: 5,
                question: "Can you arrange accommodation?",
                answer: "Yes, we can arrange accommodation ranging from budget hotels to luxury resorts. We have partnerships with verified properties across Jharkhand.",
                category: "accommodation"
            },
            {
                id: 6,
                question: "What payment methods do you accept?",
                answer: "We accept cash, bank transfers, UPI, credit/debit cards, and digital wallets. Advance booking requires a 30% deposit with the balance due before the tour starts.",
                category: "payment"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    render() {
        const container = document.getElementById('faq-container');
        if (container) {
            container.innerHTML = this.faqs.map((faq, index) => 
                this.createFAQItem(faq, index === 0)
            ).join('');
        }
    }
    
    createFAQItem(faq, isOpen = false) {
        return `
            <div class="faq-item ${isOpen ? 'active' : ''}" data-faq-id="${faq.id}">
                <button class="faq-question">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        const container = document.getElementById('faq-container');
        if (container) {
            container.addEventListener('click', (e) => {
                const faqQuestion = e.target.closest('.faq-question');
                if (faqQuestion) {
                    const faqItem = faqQuestion.closest('.faq-item');
                    this.toggleFAQ(faqItem);
                }
            });
        }
    }
    
    toggleFAQ(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }
    
    searchFAQs(query) {
        const searchTerm = query.toLowerCase();
        const filteredFAQs = this.faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.toLowerCase().includes(searchTerm)
        );
        
        const container = document.getElementById('faq-container');
        if (container) {
            container.innerHTML = filteredFAQs.map(faq => 
                this.createFAQItem(faq)
            ).join('');
        }
    }
}

// Newsletter Component
class NewsletterComponent {
    constructor() {
        this.subscribers = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const form = document.getElementById('newsletter-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubscription(e);
            });
        }
    }
    
    async handleSubscription(e) {
        const form = e.target;
        const email = form.querySelector('#newsletter-email').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!this.validateEmail(email)) {
            showToast('Invalid Email', 'Please enter a valid email address.', 'error');
            return;
        }
        
        if (this.isAlreadySubscribed(email)) {
            showToast('Already Subscribed', 'This email is already subscribed to our newsletter.', 'warning');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await this.subscribeUser(email);
            
            // Show success state
            this.showSuccessState();
            
            // Add to subscribers list
            this.subscribers.push({
                email,
                subscribedAt: new Date(),
                active: true
            });
            
            showToast('Successfully subscribed!', 'You\'ll receive our latest travel updates and offers.', 'success');
            
            // Reset after 3 seconds
            setTimeout(() => {
                this.resetForm();
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showToast('Subscription failed', 'Please try again later.', 'error');
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }
    
    async subscribeUser(email) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve({ success: true, email });
                } else {
                    reject(new Error('Subscription failed'));
                }
            }, 1500);
        });
    }
    
    showSuccessState() {
        const content = document.getElementById('newsletter-content');
        const success = document.getElementById('newsletter-success');
        
        if (content && success) {
            content.style.display = 'none';
            success.classList.remove('hidden');
            success.classList.add('animate-scale-in');
        }
    }
    
    resetForm() {
        const content = document.getElementById('newsletter-content');
        const success = document.getElementById('newsletter-success');
        const form = document.getElementById('newsletter-form');
        
        if (content && success && form) {
            content.style.display = 'block';
            success.classList.add('hidden');
            form.reset();
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    isAlreadySubscribed(email) {
        return this.subscribers.some(subscriber => 
            subscriber.email.toLowerCase() === email.toLowerCase() && subscriber.active
        );
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    new TouristGuidesComponent();
    new ContactMethodsComponent();
    new FAQComponent();
    new NewsletterComponent();
});// Live Chat Widget JavaScript

class LiveChatWidget {
    constructor() {
        this.isOpen = false;
        this.isStarted = false;
        this.messages = [];
        this.userName = '';
        this.userEmail = '';
        this.chatId = '';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.addWelcomeMessage();
    }
    
    setupEventListeners() {
        const chatButton = document.getElementById('chat-button');
        const chatClose = document.getElementById('chat-close');
        const startChatBtn = document.getElementById('start-chat');
        const sendMessageBtn = document.getElementById('send-message');
        const messageInput = document.getElementById('message-input');
        
        if (chatButton) {
            chatButton.addEventListener('click', () => this.toggleChat());
        }
        
        if (chatClose) {
            chatClose.addEventListener('click', () => this.closeChat());
        }
        
        if (startChatBtn) {
            startChatBtn.addEventListener('click', () => this.startChat());
        }
        
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            const chatWidget = document.getElementById('chat-widget');
            if (this.isOpen && chatWidget && !chatWidget.contains(e.target)) {
                // Don't close if clicking on the chat button
                if (!e.target.closest('#chat-button')) {
                    this.closeChat();
                }
            }
        });
    }
    
    addWelcomeMessage() {
        this.messages.push({
            id: Date.now(),
            text: 'Hello! How can I help you plan your Jharkhand trip today?',
            sender: 'admin',
            timestamp: new Date()
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.add('open');
            this.isOpen = true;
            
            // Focus on name input if chat hasn't started
            if (!this.isStarted) {
                const nameInput = document.getElementById('chat-name');
                if (nameInput) {
                    setTimeout(() => nameInput.focus(), 100);
                }
            }
        }
    }
    
    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.remove('open');
            this.isOpen = false;
        }
    }
    
    startChat() {
        const nameInput = document.getElementById('chat-name');
        const emailInput = document.getElementById('chat-email');
        
        if (!nameInput || !emailInput) return;
        
        this.userName = nameInput.value.trim();
        this.userEmail = emailInput.value.trim();
        
        if (!this.userName || !this.userEmail) {
            showToast('Missing Information', 'Please enter both name and email', 'warning');
            return;
        }
        
        if (!this.validateEmail(this.userEmail)) {
            showToast('Invalid Email', 'Please enter a valid email address', 'error');
            return;
        }
        
        // Generate unique chat ID
        this.chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Hide welcome form and show chat
        const welcomeDiv = document.getElementById('chat-welcome');
        const messagesDiv = document.getElementById('chat-messages');
        const inputDiv = document.getElementById('chat-input');
        
        if (welcomeDiv) welcomeDiv.style.display = 'none';
        if (messagesDiv) messagesDiv.style.display = 'block';
        if (inputDiv) inputDiv.style.display = 'flex';
        
        this.isStarted = true;
        
        // Add personalized welcome message
        this.addMessage(`Hi ${this.userName}! Thanks for reaching out. How can I assist you with your Jharkhand travel plans?`, 'admin');
        
        // Focus on message input
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            setTimeout(() => messageInput.focus(), 100);
        }
        
        // Start polling for admin messages (in a real app)
        this.startMessagePolling();
    }
    
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';
        
        // Simulate admin response
        this.simulateAdminResponse(message);
        
        // In a real application, send message to server
        this.sendMessageToServer(message);
    }
    
    addMessage(text, sender, timestamp = null) {
        const message = {
            id: Date.now() + Math.random(),
            text,
            sender,
            timestamp: timestamp || new Date()
        };
        
        this.messages.push(message);
        this.renderMessages();
        this.scrollToBottom();
    }
    
    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        container.innerHTML = this.messages.map(message => 
            this.createMessageHTML(message)
        ).join('');
    }
    
    createMessageHTML(message) {
        const time = message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="message ${message.sender}">
                <div class="message-bubble">
                    ${message.text}
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;
    }
    
    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }
    
    simulateAdminResponse(userMessage) {
        const responses = this.getContextualResponse(userMessage);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add typing indicator
        setTimeout(() => {
            this.addMessage(randomResponse, 'admin');
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    getContextualResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
            return [
                'Our tour packages start from ₹2,000 per person for day trips. Would you like me to send you our detailed pricing brochure?',
                'Prices vary based on duration and destinations. I can create a custom quote for you. What\'s your preferred budget range?'
            ];
        }
        
        if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
            return [
                'I\'d be happy to help you book a tour! Let me connect you with our booking specialist.',
                'Great! To proceed with booking, I\'ll need some details about your preferred dates and group size.'
            ];
        }
        
        if (lowerMessage.includes('guide') || lowerMessage.includes('guides')) {
            return [
                'All our guides are certified and have extensive local knowledge. Would you like to see profiles of available guides?',
                'We have expert guides specializing in different areas. What type of tour are you interested in?'
            ];
        }
        
        if (lowerMessage.includes('weather') || lowerMessage.includes('season')) {
            return [
                'The best time to visit Jharkhand is October to March. The weather is pleasant and perfect for sightseeing.',
                'Weather varies by season. Winter months (Nov-Feb) are ideal for most activities. When are you planning to visit?'
            ];
        }
        
        if (lowerMessage.includes('accommodation') || lowerMessage.includes('hotel') || lowerMessage.includes('stay')) {
            return [
                'We can arrange accommodation from budget hotels to luxury resorts. What\'s your preference?',
                'We have partnerships with verified properties across Jharkhand. I can suggest options based on your budget.'
            ];
        }
        
        // Default responses
        return [
            'Thank you for your message! Our team will respond with detailed information shortly.',
            'I\'ve noted your inquiry. One of our travel experts will get back to you soon with personalized recommendations.',
            'Great question! Let me connect you with our specialist who can provide detailed information about this.',
            'I\'m here to help! Our team will provide you with comprehensive details about your inquiry.'
        ];
    }
    
    async sendMessageToServer(message) {
        try {
            // In a real application, this would send to your backend
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: this.chatId,
                    message,
                    name: this.userName,
                    email: this.userEmail,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            const result = await response.json();
            console.log('Message sent successfully:', result);
            
        } catch (error) {
            console.error('Error sending message:', error);
            // Show error message to user
            setTimeout(() => {
                this.addMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'admin');
            }, 1000);
        }
    }
    
    startMessagePolling() {
        // In a real application, this would poll for new admin messages
        this.pollInterval = setInterval(() => {
            this.pollForNewMessages();
        }, 10000); // Poll every 10 seconds
    }
    
    async pollForNewMessages() {
        try {
            // In a real application, this would fetch new messages from server
            const response = await fetch(`/api/chat/messages/${this.chatId}`);
            if (response.ok) {
                const messages = await response.json();
                // Process new messages
                this.processNewMessages(messages);
            }
        } catch (error) {
            console.error('Error polling messages:', error);
        }
    }
    
    processNewMessages(serverMessages) {
        // Filter out messages we already have
        const newMessages = serverMessages.filter(serverMsg => 
            !this.messages.some(localMsg => localMsg.id === serverMsg.id)
        );
        
        // Add new messages
        newMessages.forEach(message => {
            if (message.sender === 'admin') {
                this.addMessage(message.text, 'admin', new Date(message.timestamp));
            }
        });
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    destroy() {
        // Clean up intervals and event listeners
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}

// Chat Analytics (for tracking user interactions)
class ChatAnalytics {
    constructor() {
        this.events = [];
    }
    
    trackEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data,
            sessionId: this.getSessionId()
        };
        
        this.events.push(event);
        this.sendAnalytics(event);
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('chat_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            sessionStorage.setItem('chat_session_id', sessionId);
        }
        return sessionId;
    }
    
    async sendAnalytics(event) {
        try {
            // In a real application, send to analytics service
            await fetch('/api/analytics/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = new LiveChatWidget();
    const chatAnalytics = new ChatAnalytics();
    
    // Track chat widget interactions
    document.addEventListener('click', function(e) {
        if (e.target.closest('#chat-button')) {
            chatAnalytics.trackEvent('chat_button_clicked');
        }
        
        if (e.target.closest('#start-chat')) {
            chatAnalytics.trackEvent('chat_started');
        }
        
        if (e.target.closest('#send-message')) {
            chatAnalytics.trackEvent('message_sent');
        }
    });
    
    // Make chat widget globally accessible for debugging
    window.chatWidget = chatWidget;
    window.chatAnalytics = chatAnalytics;
});

// Chat widget utility functions
function formatChatTime(date) {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function sanitizeMessage(message) {
    // Basic XSS prevention
    const div = document.createElement('div');
    div.textContent = message;
    return div.innerHTML;
}

function detectLanguage(text) {
    // Simple language detection (in a real app, use a proper library)
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    if (hindiPattern.test(text)) {
        return 'hindi';
    } else if (englishPattern.test(text)) {
        return 'english';
    }
    return 'unknown';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiveChatWidget, ChatAnalytics };
}