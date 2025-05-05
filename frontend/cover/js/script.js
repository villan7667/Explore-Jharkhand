
//for backend update profile 
document.addEventListener('DOMContentLoaded', () => {
    const userDetails = JSON.parse(localStorage.getItem('user'));

    if (userDetails) {
        document.querySelector('.user-details').innerHTML = `
            ${userDetails.name}<br>${userDetails.email}
        `;
    } else {
        document.querySelector('.user-details').innerHTML = `
            <a href="/frontend/auth/index.html">Login</a>
        `;
    }
});

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
// gallery start
let currentImageIndex = 0;
const modal = document.getElementById('custom-gallery-modal');
const modalImg = document.getElementById('custom-gallery-modal-img');
const caption = document.getElementById('custom-gallery-caption');
const images = document.querySelectorAll('.custom-gallery-img');

// Open Modal
function openModal(img) {
    modal.style.display = 'flex';
    modalImg.src = img.src;
    caption.innerHTML = img.alt;
    currentImageIndex = Array.from(images).indexOf(img);
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
}

// Change Image (Next or Previous)
function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;

    modalImg.src = images[currentImageIndex].src;
    caption.innerHTML = images[currentImageIndex].alt;
}

// Add key listeners for accessibility
document.addEventListener('keydown', function (e) {
    if (modal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeImage(-1); // Previous
        if (e.key === 'ArrowRight') changeImage(1); // Next
        if (e.key === 'Escape') closeModal();       // Close modal
    }
});
 // gallery end 

 //dont copy start
document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end