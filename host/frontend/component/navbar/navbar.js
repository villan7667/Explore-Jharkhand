// Navbar JavaScript with Active State Detection
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileNav = document.getElementById('mobile-nav');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    const placesDropdownTrigger = document.getElementById('places-dropdown-trigger');
    const placesDropdownContent = document.getElementById('places-dropdown-content');
    
    const userDropdownTrigger = document.getElementById('user-dropdown-trigger');
    const userDropdownContent = document.getElementById('user-dropdown-content');
    
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Mobile menu toggle
    if (mobileMenuButton && mobileNav) {
        mobileMenuButton.addEventListener('click', function() {
            const isActive = mobileNav.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Open mobile menu
    function openMobileMenu() {
        mobileNav.classList.add('active');
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close mobile menu
    function closeMobileMenu() {
        mobileNav.classList.remove('active');
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        document.body.style.overflow = '';
        
        // Close all dropdowns when closing menu
        closeAllDropdowns();
    }

    // Places dropdown toggle
    if (placesDropdownTrigger && placesDropdownContent) {
        placesDropdownTrigger.addEventListener('click', function() {
            const isOpen = placesDropdownContent.classList.contains('open');
            
            // Close other dropdowns first
            closeAllDropdowns();
            
            if (!isOpen) {
                placesDropdownContent.classList.add('open');
                placesDropdownTrigger.classList.add('active');
            }
        });
    }

    // User dropdown toggle
    if (userDropdownTrigger && userDropdownContent) {
        userDropdownTrigger.addEventListener('click', function() {
            const isOpen = userDropdownContent.classList.contains('open');
            
            // Close other dropdowns first
            closeAllDropdowns();
            
            if (!isOpen) {
                userDropdownContent.classList.add('open');
                userDropdownTrigger.classList.add('active');
            }
        });
    }

    // Close all dropdowns
    function closeAllDropdowns() {
        if (placesDropdownContent) {
            placesDropdownContent.classList.remove('open');
            placesDropdownTrigger.classList.remove('active');
        }
        
        if (userDropdownContent) {
            userDropdownContent.classList.remove('open');
            userDropdownTrigger.classList.remove('active');
        }
    }

    // Close mobile menu when clicking on nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mobileNav.contains(event.target);
        const isClickOnMenuButton = mobileMenuButton.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnMenuButton && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            closeMobileMenu();
        }
    });

    // 🎯 ACTIVE STATE DETECTION - This is the main functionality you wanted
    function setActiveNavLink() {
        // Get current page path
        const currentPath = window.location.pathname;
        
        // Define page mappings
        const pageMapping = {
            '/frontend/home.html': 'home',
            '/frontend/com/about.html': 'about',
            '/frontend/com/Service.html': 'service',
            '/frontend/com/contact.html': 'contact',
            '/frontend/com/places/ranchi.html': 'places',
            '/frontend/com/places/bokaro.html': 'places',
            '/frontend/com/places/deoghar.html': 'places',
            '/frontend/com/places/jamshedpur.html': 'places',
            '/frontend/com/places/dhanbad.html': 'places',
            '/frontend/com/places/naterhart.html': 'places'
            
        };

        // Remove all existing active classes
        document.querySelectorAll('.nav-list a, .mobile-nav-link, .dropdown a').forEach(link => {
            link.classList.remove('active');
        });

        // Get current page type
        const currentPage = pageMapping[currentPath];

        if (currentPage) {
            // Set active for desktop navigation
            const desktopLinks = document.querySelectorAll('.nav-list > li > a');
            desktopLinks.forEach(link => {
                const href = link.getAttribute('href');
                
                // Check for exact match or places category
                if (href === currentPath || 
                    (currentPage === 'places' && href === '#' && link.textContent.trim() === 'Places')) {
                    link.classList.add('active');
                }
            });

            // Set active for mobile navigation
            const mobileLinks = document.querySelectorAll('.mobile-nav-link');
            mobileLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath) {
                    link.classList.add('active');
                }
            });

            // Set active for dropdown items (places)
            if (currentPage === 'places') {
                const dropdownLinks = document.querySelectorAll('.dropdown a, .mobile-dropdown-content a');
                dropdownLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPath) {
                        link.classList.add('active');
                    }
                });
            }
        }
    }

    // Initialize active state on page load
    setActiveNavLink();

    // User authentication check
    checkUserAuthentication();

    function checkUserAuthentication() {
        // Replace with your actual authentication endpoint
        fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user && data.user.username) {
                updateUserDisplay(data.user.username);
            } else {
                updateUserDisplay('Guest');
            }
        })
        .catch(error => {
            console.log('Auth check failed:', error);
            updateUserDisplay('Guest');
        });
    }

    function updateUserDisplay(username) {
        const userDetails = document.getElementById('user-details');
        const mobileUserName = document.getElementById('mobile-user-name');
        
        const displayName = username === 'Guest' ? 'Guest' : `Logged in as ${username}`;
        
        if (userDetails) {
            userDetails.textContent = displayName;
        }
        
        if (mobileUserName) {
            mobileUserName.textContent = username;
        }
    }

    // Export functions for external use
    window.NavbarUtils = {
        setActiveNavLink: setActiveNavLink,
        closeMobileMenu: closeMobileMenu,
        showNotification: function(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }
    };
});

