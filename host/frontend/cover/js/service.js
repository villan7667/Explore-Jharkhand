
// Load Navbar and Footer HTML content dynamically
fetch('/frontend/component/navbar/navbar.html')
.then(res => res.text())
.then(data => {
  document.getElementById('navbar').innerHTML = data;
});
fetch('/frontend/component/footer/footer.html')
.then(res => res.text())
.then(data => {
  document.getElementById('').innerHTML = data;
});




// Hero Slider Functionality
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.currentSlide = 0;
        this.init();
    }

    init() {
        // Set initial state
        this.updateSlides();
        // Start automatic slideshow
        setInterval(() => this.nextSlide(), 5000);
        // Add click events to navigation buttons
        this.navButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.currentSlide = index;
                this.updateSlides();
            });
        });
    }

    updateSlides() {
        // Remove active class from all slides and buttons
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to current slide and button
        this.slides[this.currentSlide].classList.add('active');
        this.navButtons[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlides();
    }
}


//trip planner

class TripPlanner {
    constructor() {
        this.destinations = {
            ranchi: {
                map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117711.91484915413!2d85.2724755!3d23.3440997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f4e104aa5db7dd%3A0xdc09d49d6899f43e!2sRanchi%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1637309285227!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "Private tour of Hundru Falls with expert guide",
                        accommodation: "5-star luxury resort",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Helicopter tour of city + VIP temple visits",
                        accommodation: "5-star luxury resort",
                        transport: "Helicopter + Private luxury vehicle"
                    },
                    day3: {
                        activity: "Private wellness session + Photography tour",
                        accommodation: "5-star luxury resort",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Group tour to Hundru Falls",
                        accommodation: "3-star hotel",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "City sightseeing + Temple visits",
                        accommodation: "3-star hotel",
                        transport: "Shared AC vehicle"
                    },
                    day3: {
                        activity: "Local market tour + Cultural show",
                        accommodation: "3-star hotel",
                        transport: "Shared AC vehicle"
                    }
                }
            },
            
            bokaro: {
                map : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.835824898304!2d86.14113717585925!3d23.6689236797331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5dd78ba0d8dbf%3A0x7f1a117e8d614c5a!2sBokaro!5e0!3m2!1sen!2sin!4v1672567480455!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "Private tour of Bokaro Steel Plant + Lake",
                        accommodation: "Premium hotel",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Exclusive trip to Jawaharlal Nehru Park",
                        accommodation: "Premium hotel",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Group tour of Bokaro Steel Plant",
                        accommodation: "Comfort hotel",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "Visit to city parks + Local market",
                        accommodation: "Comfort hotel",
                        transport: "Shared AC vehicle"
                    }
                }
            },
            deoghar: {
                map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3682.3695984038193!2d86.69757917585752!3d23.591984579744716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f479768fb13371%3A0x7a7de9780b1c16ed!2sDeoghar!5e0!3m2!1sen!2sin!4v1672567620669!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "VIP temple darshan + Private guide",
                        accommodation: "Premium hotel",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Spiritual retreat + Meditation session",
                        accommodation: "Premium hotel",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Temple darshan with group",
                        accommodation: "Comfort hotel",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "Local sightseeing + Shopping",
                        accommodation: "Comfort hotel",
                        transport: "Shared AC vehicle"
                    }
                }
            },
            dhanbad: {
                map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.111816546899!2d86.41487717586021!3d23.795737279710627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5d9e1ba9f55a3%3A0x7f47e4da7cf6d135!2sDhanbad!5e0!3m2!1sen!2sin!4v1672567801601!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "Private tour of coal mines + Science Center",
                        accommodation: "Luxury hotel",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Visit to Topchanchi Lake + Picnic",
                        accommodation: "Luxury hotel",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Group tour of coal mines",
                        accommodation: "Budget hotel",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "Visit to parks + Local sightseeing",
                        accommodation: "Budget hotel",
                        transport: "Shared AC vehicle"
                    }
                }
            },
            jamshedpur: {
                map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.300214768875!2d86.1769691758611!3d23.83153757970495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f6058df34aa481%3A0x6b1c51c7e484db5!2sJamshedpur!5e0!3m2!1sen!2sin!4v1672567978123!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "Private tour of Jubilee Park + Tata Steel Plant",
                        accommodation: "Luxury hotel",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Trip to Dalma Wildlife Sanctuary",
                        accommodation: "Luxury hotel",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Group visit to Jubilee Park",
                        accommodation: "Budget hotel",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "Wildlife sanctuary trip with group",
                        accommodation: "Budget hotel",
                        transport: "Shared AC vehicle"
                    }
                }
            },
            naterhart: {
                map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3685.4817522171394!2d84.264469175853!3d23.47102747981878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398b25cb5cd97ad9%3A0x6b91818aee1802e2!2sNetarhat!5e0!3m2!1sen!2sin!4v1672568121445!5m2!1sen!2sin',
                premium: {
                    day1: {
                        activity: "Private sunrise tour of Magnolia Point",
                        accommodation: "Luxury resort",
                        transport: "Private luxury vehicle"
                    },
                    day2: {
                        activity: "Private nature hike + Sunset point visit",
                        accommodation: "Luxury resort",
                        transport: "Private luxury vehicle"
                    }
                },
                standard: {
                    day1: {
                        activity: "Group visit to Magnolia Point",
                        accommodation: "Comfortable stay in cottages",
                        transport: "Shared AC vehicle"
                    },
                    day2: {
                        activity: "Group hike to nature points",
                        accommodation: "Comfortable stay in cottages",
                        transport: "Shared AC vehicle"
                    }
                }
            }
        };
        this.init();
        
    }
    
    init() {
        const planButton = document.querySelector('button[onclick="planTrip()"]');
        if (planButton) {
            planButton.addEventListener('click', () => this.generatePlans());
        }
    }

    generatePlans() {
        const destination = document.getElementById('destination').value.toLowerCase();
        const date = document.getElementById('travel-date').value;
        const duration = document.getElementById('duration')?.value || 3;

        if (!destination || !date) {
            alert('Please select both destination and date');
            return;
        }

        if (!this.destinations[destination]) {
            alert('Destination not found. Please select a valid destination.');
            return;
        }

        const selectedDestination = this.destinations[destination];

        this.displayPlan('plan1', selectedDestination.premium, 'Premium Plan', destination);
        this.displayPlan('plan2', selectedDestination.standard, 'Standard Plan', destination);
    }

    displayPlan(elementId, plan, planTitle, destination) {
        const planElement = document.getElementById(elementId);
        if (!planElement) return;

        let html = `
            <h3>${planTitle} for ${destination.charAt(0).toUpperCase() + destination.slice(1)}</h3>
            <div class="plan-content">
        `;

        for (const [day, details] of Object.entries(plan)) {
            html += `
                <div class="day-plan">
                    <h4>${day.toUpperCase()}</h4>
                    <ul>
                        <li><i class="fas fa-hiking"></i> ${details.activity}</li>
                        <li><i class="fas fa-hotel"></i> ${details.accommodation}</li>
                        <li><i class="fas fa-car"></i> ${details.transport}</li>
                    </ul>
                </div>
            `;
        }

        html += `</div>`;

        const mapUrl = this.destinations[destination]?.map || '';
        html += `
            <div class="map-embed">
                <iframe 
                    src="${mapUrl}" 
                    width="100%" 
                    height="200" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy">
                </iframe>
            </div>
        `;

        planElement.innerHTML = html;
    }
}







// Chat Widget Functionality
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Initialize chat state
        this.chatContainer = document.querySelector('.chat-container');
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');

        // Add initial welcome message
        this.addMessage('bot', 'Welcome to Explore Jharkhand! How can I help you today?');

        // Add input event listener
        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.chatContainer) {
            this.chatContainer.style.display = this.isOpen ? 'block' : 'none';
        }
    }

    addMessage(sender, text) {
        if (!this.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    sendMessage() {
        if (!this.userInput || !this.chatMessages) return;

        const message = this.userInput.value.trim();
        if (message) {
            this.addMessage('user', message);
            this.userInput.value = '';
            this.generateResponse(message);
        }
    }

    generateResponse(message) {
        const responses = {
            'package': 'We offer various tour packages including Luxury, Adventure, and Cultural tours. Would you like to know more about any specific package?',
            'price': 'Our packages start from ₹5,000 per day. The exact price depends on the chosen package and duration. Please let me know your preferences for a detailed quote.',
            'hotel': 'We have partnerships with various hotels ranging from luxury 5-star resorts to comfortable 3-star accommodations. What type of stay are you looking for?',
            'transport': 'We provide various transportation options including private luxury vehicles, shared AC coaches, and local transport assistance.',
            'default': 'Thank you for your message. How else can I assist you with planning your Jharkhand trip?'
        };

        let response = responses.default;
        for (const [key, value] of Object.entries(responses)) {
            if (message.toLowerCase().includes(key)) {
                response = value;
                break;
            }
        }

        setTimeout(() => {
            this.addMessage('bot', response);
        }, 500);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize slider
    const slider = new HeroSlider();
    
    // Initialize trip planner
    const planner = new TripPlanner();
    
    // Initialize chat
    const chat = new ChatWidget();
    
    // Make chat functions available globally
    window.toggleChat = () => chat.toggleChat();
    window.sendMessage = () => chat.sendMessage();
    window.planTrip = () => planner.generatePlans();
});

// Add scroll-based animations
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        if (element.offsetTop - window.innerHeight < scrolled) {
            element.classList.add('visible');
        }
    });
});

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    return false;
};









   //dont copy start
   document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end