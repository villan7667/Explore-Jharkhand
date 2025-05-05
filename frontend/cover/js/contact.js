// For nav 
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.navbar nav ul li a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}); 


// Contact form submission handling
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Still prevent default, but we use fetch now

    const form = event.target;
    const formData = new FormData(form);

    fetch('https://formspree.io/f/xwplakko', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Show the Thank You popup
            const popup = document.getElementById('thank-you-popup');
            popup.classList.add('show-popup');

            // Clear the form
            form.reset();

            // Hide the popup and reload after 3 seconds
            setTimeout(() => {
                popup.classList.remove('show-popup');
                location.reload();
            }, 3000);
        } else {
            alert('Something went wrong. Please try again!');
        }
    })
    .catch(error => {
        console.error('Formspree error:', error);
        alert('There was a problem submitting the form.');
    });
});

// Close the Thank You popup when the close button is clicked




// start chat box 

const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const closeButton = document.getElementById('closeButton');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const suggestedQuestionsContainer = document.getElementById('suggestedQuestions');

const suggestedQuestions = [
    "What are your business hours?",
    "Do you offer remote services?",
    "How can I schedule an appointment?",
    "What's your refund policy?",
];

const demoAnswers = {
    "What are your business hours?": "Our business hours are Monday to Friday, 9 AM to 6 PM Eastern Time.",
    "Do you offer remote services?": "Yes, we offer a variety of remote services including video consultations and online support.",
    "How can I schedule an appointment?": "You can schedule an appointment through our website's booking system or by calling our office at +91 7667985687.",
    "What's your refund policy?": "We offer a 30-day money-back guarantee on all our products. Services are non-refundable but can be rescheduled within 48 hours of the appointment.",
};

let isOpen = false;

function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('hidden', !isOpen);
    chatButton.innerHTML = isOpen
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
    chatButton.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
}

function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = `<span>${text}</span>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerCaseMessage = message.toLowerCase();
    for (const [question, answer] of Object.entries(demoAnswers)) {
        if (lowerCaseMessage.includes(question.toLowerCase())) {
            return answer;
        }
    }
    return "I'm sorry, I don't have a specific answer for that question. Is there anything else I can help you with?";
}

function handleSendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        addMessage(message, 'user');
        messageInput.value = '';
        
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addMessage(botResponse, 'bot');
        }, 500);
    }
}

function createSuggestedQuestions() {
    suggestedQuestions.forEach(question => {
        const button = document.createElement('button');
        button.classList.add('suggested-question');
        button.textContent = question;
        button.addEventListener('click', () => {
            addMessage(question, 'user');
            setTimeout(() => {
                const botResponse = getBotResponse(question);
                addMessage(botResponse, 'bot');
            }, 500);
        });
        suggestedQuestionsContainer.appendChild(button);
    });
}

chatButton.addEventListener('click', toggleChat);
closeButton.addEventListener('click', toggleChat);
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

createSuggestedQuestions();

// Add initial bot message
addMessage("Hello! How can I assist you today?", 'HSGF');











 //dont copy start
 document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end