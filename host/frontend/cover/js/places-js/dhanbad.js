// Fetching Navbar and Footer HTML

fetch('/frontend/component/footer/footer.html')
.then(res => res.text())
.then(data => {
  document.getElementById('footer').innerHTML = data;
});



// JavaScript for Carousel, Auto-slide, and Favorite Button HSGF@7667
document.querySelectorAll(".card-carousel").forEach((carousel) => {
    const images = carousel.querySelectorAll("img");
    const dotsContainer = carousel.nextElementSibling;
    const dots = [];
    let currentIndex = 0;

    images.forEach((img, index) => {
        const dot = document.createElement("div");
        dot.className = "dot";
        if (index === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);
        dots.push(dot);

        dot.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    function updateCarousel() {
        images.forEach((img, index) => img.classList.toggle("active", index === currentIndex));
        dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    }, 3000);
});

// Favorite button toggle
document.querySelectorAll(".favorite").forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("active");
    });
});


const topAttractions = [
    {
        id: 1,
        name: "Maithan Dam",
         category: "Dams",
         rating: 4.5,
         reviews: 188,
        images: [
            "/assets/places/dhanbad/grid/midam1.jpg",
            "/assets/places/dhanbad/grid/midam2.jpg",
            "/assets/places/dhanbad/grid/midam3.jpg",
        ],
        description: " Maithan Dam is a large dam on the Barakar River, located in the Dhanbad district of Jharkhand. It is a popular tourist destination...",
        author: {
            name: "966amitm",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 2,
        name: "Bhatinda fall",
        category: "Waterfalls",
        rating: 3.5,
        reviews: 61,
        images: [
           "/assets/places/dhanbad/grid/fall1.jpg",
            "/assets/places/dhanbad/grid/fall2.jpg",
            "/assets/places/dhanbad/grid/fall3.jpg",
        ],
        description: "Bhatinda Falls is a beautiful waterfall located in the Dhanbad district of Jharkhand. It is surrounded by lush greenery and offers a serene environment...",
        author: {
            name: "NatvarPI",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    },
    {
        id: 3,
        name: "Birsa munda park",
        category: "Parks",
        rating: 4.8,
        reviews: 164,
        images: [
            "/assets/places/dhanbad/grid/park1.jpg",
            "/assets/places/dhanbad/grid/park2.jpg",
            "/assets/places/dhanbad/grid/park3.jpg",
        ],
        description: "Birsa Munda Park is a popular park located in Dhanbad. It is known for its beautiful landscapes, walking trails, and recreational facilities...",
        author: {
            name: "nikhilt394",
            avatar: "/assets/places/ranchi/reviewer/reviewer3.jpg"
        }
    },
    {
        id: 4,
        name: "TopChanchi Lake",
        category: "Lakes",
        rating: 3.4,
        reviews: 89,
        images: [
            "/assets/places/dhanbad/grid/chachi1.jpg",
            "/assets/places/dhanbad/grid/chachi2.jpg",
            "/assets/places/dhanbad/grid/chachi3.jpg",
        ],
        description: "Top Chanchi Lake is a picturesque lake located in Dhanbad. It is surrounded by hills and offers boating facilities. The lake is a popular spot for picnics and relaxation...",
        author: {
            name: "kishore kumar",
            avatar: "/assets/places/ranchi/reviewer/reviewer4.jpg"
        }
    },
    {
        id: 5,
        name: "Ram Raj Mandill",
        category: "Religious Sites",
        rating: 3.5,
        reviews: 72,
        images: [
           "/assets/places/dhanbad/grid/ram1.jpg",
            "/assets/places/dhanbad/grid/ram2.jpg",
            "/assets/places/dhanbad/grid/ram3.jpg",
        ],
        description: "Ram Raj Mandir is a famous temple located in Dhanbad. It is dedicated to Lord Rama and attracts many devotees. The temple is known for its beautiful architecture and peaceful ambiance...",
        author: {
            name: "RaviKumar",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 6,
        name: " Panchet dam",
        category: "Dams",
        rating: 4.5,
        reviews: 105,
        images: [
            "/assets/places/dhanbad/grid/dam1.jpg",
            "/assets/places/dhanbad/grid/dam2.jpg",
            "/assets/places/dhanbad/grid/dam3.jpg",
        ],
        description: "panchet dam is a large dam located in the Dhanbad district of Jharkhand. It is built on the Damodar River and is known for its scenic beauty...",
        author: {
            name: "vikramaditya",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    }
];


function createRatingCircles(rating) {
    let html = '<div class="rating-circles">';
    for (let i = 0; i < 5; i++) {
        html += `<div class="rating-circle ${i < Math.floor(rating) ? 'filled' : ''}"></div>`;
    }
    html += '</div>';
    return html;
}

function createAttractionCard(attraction, isNearby = false) {
    return `
        <div class="attraction-card" data-id="${attraction.id}">
            <div class="attraction-image">
                ${attraction.images.map((img, index) => `<img src="/frontend${img}" alt="${attraction.name}" class="${index === 0 ? 'active' : ''}">`).join('')}
                <button class="favorite-btn" onclick="toggleFavorite(this)" aria-label="Add to favorites">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="image-controls">
                    <button class="prev-btn" onclick="changeSlide(${attraction.id}, -1)" aria-label="Previous image">❮</button>
                    <div class="image-indicators">
                        ${attraction.images.map((_, index) => `<div class="image-indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${attraction.id}, ${index})"></div>`).join('')}
                    </div>
                    <button class="next-btn" onclick="changeSlide(${attraction.id}, 1)" aria-label="Next image">❯</button>
                </div>
            </div>
            <div class="attraction-details">
                <h3 class="attraction-name">${attraction.name}</h3>
                <div class="attraction-rating">
                    ${createRatingCircles(attraction.rating)}
                    <span class="review-count">${attraction.reviews} reviews</span>
                </div>
                <p class="attraction-category">${attraction.category}</p>
                ${isNearby ? `
                    <div class="nearby-info">
                        <span>${attraction.location}</span>
                        <span>${attraction.distance}</span>
                    </div>
                ` : `
                    <p class="attraction-description">${attraction.description}</p>
                    <div class="attraction-author">
                        <img src="/frontend${attraction.author.avatar}" alt="${attraction.author.name}" class="author-avatar">
                        <span class="author-name">By ${attraction.author.name}</span>
                    </div>
                `}
                <a href="/frontend/com/places/dhanbad/showmore-${attraction.id}.html" class="show-more-btn">Show More</a>
            </div>
        </div>
    `;
}


function createRatingCircles(rating) {
    let html = '<div class="rating-circles">';
    for (let i = 0; i < 5; i++) {
        html += `<div class="rating-circle ${i < Math.floor(rating) ? 'filled' : ''}"></div>`;
    }
    html += '</div>';
    return html;
}

function createAttractionCard(attraction, isNearby = false) {
    return `
        <div class="attraction-card" data-id="${attraction.id}">
            <div class="attraction-image">
                ${attraction.images.map((img, index) => `<img src="/frontend${img}" alt="${attraction.name}" class="${index === 0 ? 'active' : ''}">`).join('')}
                <button class="favorite-btn" onclick="toggleFavorite(this)" aria-label="Add to favorites">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="image-controls">
                    <button class="prev-btn" onclick="changeSlide(${attraction.id}, -1)" aria-label="Previous image">❮</button>
                    <div class="image-indicators">
                        ${attraction.images.map((_, index) => `<div class="image-indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${attraction.id}, ${index})"></div>`).join('')}
                    </div>
                    <button class="next-btn" onclick="changeSlide(${attraction.id}, 1)" aria-label="Next image">❯</button>
                </div>
            </div>
            <div class="attraction-details">
                <h3 class="attraction-name">${attraction.name}</h3>
                <div class="attraction-rating">
                    ${createRatingCircles(attraction.rating)}
                    <span class="review-count">${attraction.reviews} reviews</span>
                </div>
                <p class="attraction-category">${attraction.category}</p>
                ${isNearby ? `
                    <div class="nearby-info">
                        <span>${attraction.location}</span>
                        <span>${attraction.distance}</span>
                    </div>
                ` : `
                    <p class="attraction-description">${attraction.description}</p>
                    <div class="attraction-author">
                        <img src="/frontend${attraction.author.avatar}" alt="${attraction.author.name}" class="author-avatar">
                        <span class="author-name">By ${attraction.author.name}</span>
                    </div>
                    <a href="/frontend/com/places/ranchi/showmore-${attraction.id}.html" class="show-more-btn">Show More</a>
                `}
            </div>
        </div>
    `;
}

function toggleFavorite(button) {
    button.classList.toggle('active');
}

function changeSlide(attractionId, direction) {
    const attractionCard = document.querySelector(`.attraction-card[data-id="${attractionId}"]`);
    const images = attractionCard.querySelectorAll('.attraction-image img');
    const indicators = attractionCard.querySelectorAll('.image-indicator');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    
    images[currentIndex].classList.remove('active');
    indicators[currentIndex].classList.remove('active');
    
    currentIndex = (currentIndex + direction + images.length) % images.length;
    
    images[currentIndex].classList.add('active');
    indicators[currentIndex].classList.add('active');
}

function goToSlide(attractionId, index) {
    const attractionCard = document.querySelector(`.attraction-card[data-id="${attractionId}"]`);
    const images = attractionCard.querySelectorAll('.attraction-image img');
    const indicators = attractionCard.querySelectorAll('.image-indicator');
    
    images.forEach(img => img.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    images[index].classList.add('active');
    indicators[index].classList.add('active');
}

function showMore(attractionId) {
    console.log(`Show more clicked for attraction ${attractionId}`);
    // Implement show more functionality here
}

function startAutoSlide() {
    setInterval(() => {
        document.querySelectorAll('.attraction-card').forEach(card => {
            const attractionId = card.dataset.id;
            changeSlide(attractionId, 1);
        });
    }, 5000);
}


document.addEventListener('DOMContentLoaded', () => {
    const topAttractionsContainer = document.getElementById('topAttractions');
    const nearbyAttractionsContainer = document.getElementById('nearbyAttractions');

    topAttractions.forEach(attraction => {
        topAttractionsContainer.innerHTML += createAttractionCard(attraction);
    });

    nearbyAttractions.forEach(attraction => {
        nearbyAttractionsContainer.innerHTML += createAttractionCard(attraction, true);
    });

    startAutoSlide();
});






 //dont copy start
 document.addEventListener('copy', function (e) {
    e.preventDefault();
    const customMessage = 'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
    e.clipboardData.setData('text/plain', customMessage);
})
//dont copy end
