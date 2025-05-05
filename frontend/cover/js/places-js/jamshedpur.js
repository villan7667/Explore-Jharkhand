
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
        name: "Jublee park", 
        category: "park",
        rating: 4.5,
        reviews: 188,
        images: [
            "/assets/places/jamshedpur/grid/park1.jpg",
            "/assets/places/jamshedpur/grid/park2.jpg",
            "/assets/places/jamshedpur/grid/park3.jpg",
           
        ],
        description: "Jubilee Park is an urban park located in Jamshedpur, Jharkhand, India. ",
        author: {
            name: "966amitm",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 2,
        name: "Dalma wildlife sanctuary",
        category: " wildlife ",
        rating: 3.5,
        reviews: 61,
        images: [
            "/assets/places/jamshedpur/grid/wild1.jpg",
            "/assets/places/jamshedpur/grid/wild2.jpg",
            "/assets/places/jamshedpur/grid/wild3.jpg",
        ],
        description: " Dalma Wildlife Sanctuary is a protected area located in the East Singhbhum district of Jharkhand, India. It is known for its... ",
        author: {
            name: "Amit Kumar",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    },
    {
        id: 3,
        name: "Jrd tata  sports complex",
        category: "Stadium",
        rating: 4.8,
        reviews: 164,
        images: [
           "/assets/places/jamshedpur/grid/jrd1.jpg",
            "/assets/places/jamshedpur/grid/jrd2.jpg",
            "/assets/places/jamshedpur/grid/jrd3.jpg",
        ],
        description: " JRD Tata Sports Complex is a multi-purpose stadium located in Jamshedpur, Jharkhand, India. ",
        author: {
            name: "nikhilt394",
            avatar: "/assets/places/ranchi/reviewer/reviewer3.jpg"
        }
    },
    {
        id: 4,
        name: "Dimna lake",
        category: "Lake",
        rating: 3.4,
        reviews: 89,
        images: [
           "/assets/places/jamshedpur/grid/lake1.jpg",
            "/assets/places/jamshedpur/grid/lake2.jpg",
            "/assets/places/jamshedpur/grid/lake3.jpg",
        ],
        description: " Dimna Lake is a picturesque lake located near Jamshedpur, Jharkhand, India. It is a popular spot for picnics and boating... ",
        author: {
            name: "Amit Kumar",
            avatar: "/assets/places/ranchi/reviewer/reviewer4.jpg"
        }
    },
    {
        id: 5,
        name: "Chandil dam",
        category: "Dam",
        rating: 3.5,
        reviews: 72,
        images: [
           "/assets/places/jamshedpur/grid/dam1.jpg",
            "/assets/places/jamshedpur/grid/dam2.jpg",
            "/assets/places/jamshedpur/grid/dam3.jpg",
        ],
        description: "Chandil Dam is a dam located on the Subarnarekha River in Jharkhand, India. It is known for its scenic beauty and... ",
        author: {
            name: "Ravi Kumar",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 6,
        name: "P & M mall",
        category: "Mall",
        rating: 4.5,
        reviews: 105,
        images: [
          "/assets/places/jamshedpur/grid/pm1.jpg",
            "/assets/places/jamshedpur/grid/pm2.jpg",
            "/assets/places/jamshedpur/grid/pm3.jpg",
        ],
        description: "P & M Mall is a popular shopping mall located in Jamshedpur, Jharkhand, India. It offers a variety of retail stores, dining options... ",
        author: {
            name: "Shopaholic",
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
                <a href="/frontend/com/places/ranchi/showmore-${attraction.id}.html" class="show-more-btn">Show More</a>
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
