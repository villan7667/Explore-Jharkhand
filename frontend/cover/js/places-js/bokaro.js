
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
        name: "Garga Dam", category: "Waterfalls",rating: 3.5,reviews: 158,
        images: [
            "/assets/places/bokaro/grid/garga1.jpg",
            "/assets/places/bokaro/grid/garga2.jpg",
            "/assets/places/bokaro/grid/garga3.jpg",

           
        ],
        description: "Visited the falls right after the rains. The road is reasonably ok. There are 2 entrances to the falls, but for better...",
        author: {
            name: "966amitm",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 2,
        name: " Jawaharlal Nehru Biological Park",
        category: "Wildlife ",
        rating: 3.5,
        reviews: 61,
        images: [
            "/assets/places/bokaro/grid/park1.jpg",
            "/assets/places/bokaro/grid/park2.jpg",
            "/assets/places/bokaro/grid/park3.jpg",
            
        ],
        description: " A large tract of land contains many animal species and diverse bird and reptile populations alongside Royal Bengal Tigers and leopards together with deer along exotic birds.",
        author: {
            name: "NatvarPI",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    },
    {
        id: 3,
        name: " Jagannath Temple",
        category: "Religious Sites",
        rating: 3.8,
        reviews: 164,
        images: [
            "/assets/places/ranchi/grid/Jagannath-Temple.1.jpg",
            "/assets/places/ranchi/grid/Jagannath Temple.2.jpeg",
            "/assets/places/ranchi/grid/Jagannath Temple.3.jpeg",
        ],
        description: "The temple attracts devotees because it contains perfectly sculpted statues of Lord Jagannath alongside Balabhadra and Subhadra.",
        author: {
            name: "nikhilt394",
            avatar: "/assets/places/ranchi/reviewer/reviewer3.jpg"
        }
    },
    {
        id: 4,
        name: "City Park and Lake",
        category: "Gardens",
        rating: 4.5,
        reviews: 19,
        images: [
            "/assets/places/bokaro/grid/city1.jpg",
            "/assets/places/bokaro/grid/city2.jpg",
            "/assets/places/bokaro/grid/city3.jpg",
        ],
            
        description: "Visitors can experience boating picnicking and bird-watching at City Park due to its artificial lake and groomed gardens with its walking trails, The views...",
        author: {
            name: "TravellerX",
            avatar: "/assets/places/ranchi/reviewer/reviewer4.jpg"
        }
    },
    {
        id: 5,
        name: "Kali Bari Temple",
        category: "Religious site",
        rating: 3.5,
        reviews: 82,
        images: [
            "/assets/places/bokaro/grid/kali1.jpg",
            "/assets/places/bokaro/grid/kali2.jpg",
            "/assets/places/bokaro/grid/kali3.jpg",
        
        ],
        description: "The religious site of Kali Bari Temple serves as a sacred temple for Goddess Kali while hosting visitors from all parts of Jharkhand.",
        author: {
            name: "LakeExplorer",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 6,
        name: "Bokaro Steel Plant",
        category: "Industrial Area",
        rating: 4.5,
        reviews: 105,
        images: [
           "/assets/places/bokaro/grid/plant1.jpg",
           "/assets/places/bokaro/grid/plant2.jpg",
           "/assets/places/bokaro/grid/plant3.jpg",
        ],
        description: " Indian market as one of its largest and most technologically advanced facilities.",
        author: {
            name: "TempleVisitor",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    }
];

const nearbyAttractions = [
    {
        id: 8,
        name: " Ayyappa Temple",
        location: "Bokaro",
        category: "Religious Sites",
        rating: 4,
        reviews: 60,
        distance: "35 km away",
        images: [
            "/assets/places/bokaro/grid/temple1.jpg",
            "/assets/places/bokaro/grid/temple2.jpg",
            "/assets/places/bokaro/grid/temple3.jpg",
        ]
    },
    {
        id: 9,
        name: "Shikharji Dham",
        location: "Bokaro",
        category: "Religious Sites",
        rating: 4,
        reviews: 31,
        distance: "29 km away",
        images: [
           "/assets/places/bokaro/grid/dham1.jpg",
            "/assets/places/bokaro/grid/dham2.jpg",
            "/assets/places/bokaro/grid/dham3.jpg",
        ]
    },
    {
        id: 12,
        name: "Amrut Park",
        location: "Bokaro",
        category: "Park",
        rating: 4,
        reviews: 215,
        distance: "45 km away",
        images: [
           "/assets/places/bokaro/grid/amrut1.jpg",
            "/assets/places/bokaro/grid/amrut2.jpg",
            "/assets/places/bokaro/grid/amrut3.jpg",
        ]
    },
    {
        id: 13,
        name: "Tenughat Ghat Dam",
        location: "Bokaro",
        category: "Ghat",
        rating: 4.5,
        reviews: 178,
        distance: "170 km away",
        images: [
           "/assets/places/bokaro/grid/dam1.jpg",
            "/assets/places/bokaro/grid/dam2.jpg",
            "/assets/places/bokaro/grid/dam3.jpg",
        ]
    },
    {
        id: 14,
        name: "Lal pania Waterfall",
        location: "Bokaro",
        category: "Waterfalls",
        rating: 4,
        reviews: 87,
        distance: "40 km away",
        images: [
            "/assets/places/bokaro/grid/pani1.jpg",
            "/assets/places/bokaro/grid/pani2.jpg",
            "/assets/places/bokaro/grid/pani3.jpg",
        ]
    },
    {
        id: 15,
        name: "Sewati Hill",
        location: "Bokaro",
        category: "Hill",
        rating: 4,
        reviews: 87,
        distance: "40 km away",
        images: [
            "/assets/places/bokaro/grid/hill1.jpg",
            "/assets/places/bokaro/grid/hill2.jpg",
            "/assets/places/bokaro/grid/hill3.jpg",
        ]
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
                <a href="/frontend/com/places/bokaro/bokaromore-${attraction.id}.html" class="show-more-btn">Show More</a>
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

