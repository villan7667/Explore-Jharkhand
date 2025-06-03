
// Load Navbar and Footer HTML content dynamically

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
        name: "Dassam Falls", category: "Waterfalls",rating: 4.5,reviews: 188,
        images: [
            "/assets/places/ranchi/grid/Dassam Falls1.jpg",
            "/assets/places/ranchi/grid/Dassam Falls2.jpeg",
            "/assets/places/ranchi/grid/Dassam Falls3.jpeg",
        ],
        description: "Visited the falls right after the rains. The road is reasonably ok. There are 2 entrances to the falls, but for better...",
        author: {
            name: "966amitm",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 2,
        name: "Patratu Valley",
        category: "Valleys",
        rating: 3.5,
        reviews: 61,
        images: [
            "/assets/places/ranchi/grid/Patratu Valley 1.jpeg",
            "/assets/places/ranchi/grid/Patratu Valley 2.jpeg",
            "/assets/places/ranchi/grid/Patratu Valley 3.jpeg",
        ],
        description: "Patratu valley was very famous and beautiful place. View was really excellent. View of road from hill was awesome.",
        author: {
            name: "NatvarPI",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    },
    {
        id: 3,
        name: "Rock Garden",
        category: "Parks",
        rating: 4.8,
        reviews: 164,
        images: [
            "/assets/places/ranchi/grid/Rock Garden 1.jpeg",
            "/assets/places/ranchi/grid/Rock Garden 2.jpeg",
            "/assets/places/ranchi/grid/Rock Garden 3.jpeg",
        ],
        description: "Rock garden is locate don the top of a hill. From here you can have a pleasant view of kanke dam. There are couple of...",
        author: {
            name: "nikhilt394",
            avatar: "/assets/places/ranchi/reviewer/reviewer3.jpg"
        }
    },
    {
        id: 4,
        name: "Tagore Hill",
        category: "Historic Sites",
        rating: 3.4,
        reviews: 89,
        images: [
            "/assets/places/ranchi/grid/Tagore hill.1.jpeg",
            "/assets/places/ranchi/grid/Tagore hill.2.jpeg",
            "/assets/places/ranchi/grid/Tagore hill.3.jpeg",
        ],
        description: "Tagore Hill, also known as Morabadi Hill, is a historic site where Rabindranath Tagore spent time writing. The views...",
        author: {
            name: "TravellerX",
            avatar: "/assets/places/ranchi/reviewer/reviewer4.jpg"
        }
    },
    {
        id: 5,
        name: "Biodiversity",
        category: "park",
        rating: 3.5,
        reviews: 72,
        images: [
            "/assets/places/ranchi/grid/biodiversity 1.jpg",
            "/assets/places/ranchi/grid/biodiversity 2.jpg",
            "/assets/places/ranchi/grid/biodiversity 3.jpg",
        ],
        description: "Biodiversity is a popular spot for locals and tourists alike. It offers boating facilities and is surrounded by...",
        author: {
            name: "LakeExplorer",
            avatar: "/assets/places/ranchi/reviewer/reviewer2.jpg"
        }
    },
    {
        id: 6,
        name: "Jagannath Temple",
        category: "Religious Sites",
        rating: 4.5,
        reviews: 105,
        images: [
            "/assets/places/ranchi/grid/Jagannath-Temple.1.jpg",
            "/assets/places/ranchi/grid/Jagannath Temple.2.jpeg",
            "/assets/places/ranchi/grid/Jagannath Temple.3.jpeg",
        ],
        description: "The Jagannath Temple in Ranchi is a beautiful replica of the famous temple in Puri. It's known for its...",
        author: {
            name: "TempleVisitor",
            avatar: "/assets/places/ranchi/reviewer/reviewer1.jpg"
        }
    }
];

const nearbyAttractions = [
    {
        id: 8,
        name: "Sun Temple",
        location: "Bundu",
        category: "Religious Sites",
        rating: 4,
        reviews: 60,
        distance: "35 km away",
        images: [
            "/assets/places/ranchi/grid/sun temple 1.jpg",
            "/assets/places/ranchi/grid/sun temple 2 .jpg",
            "/assets/places/ranchi/grid/sun temple 3.jpg",
        ]
    },
    {
        id: 9,
        name: "Patratu Dam",
        location: "Patratu",
        category: "Dams",
        rating: 4,
        reviews: 31,
        distance: "29 km away",
        images: [
            "/assets/places/ranchi/grid/Patratu Dam 1.jpg",
            "/assets/places/ranchi/grid/Patratu Dam 2.jpg",
            "/assets/places/ranchi/grid/Patratu Dam 3.jpg",
        ]
    },
    {
        id: 12,
        name: "Hundru Falls",
        location: "Ranchi",
        category: "Waterfalls",
        rating: 4,
        reviews: 215,
        distance: "45 km away",
        images: [
            "/assets/places/ranchi/grid/hundru fall 1.jpg",
            "/assets/places/ranchi/grid/hundru fall 2.jpg",
            "/assets/places/ranchi/grid/hundru fall 3.jpg",
        ]
    },
    {
        id: 13,
        name: "pahari mandir ranchi",
        location: "Ranchi",
        category: "Tample",
        rating: 4.5,
        reviews: 178,
        distance: "170 km away",
        images: [
            "/assets/places/ranchi/grid/pahari mandir .1.jpg",
            "/assets/places/ranchi/grid/pahari mandir .2.jpg",
            "/assets/places/ranchi/grid/pahari mandir .3.jpg",
        ]
    },
    {
        id: 14,
        name: "Jonha Falls",
        location: "Ranchi",
        category: "Waterfalls",
        rating: 4,
        reviews: 87,
        distance: "40 km away",
        images: [
            "/assets/places/ranchi/grid/jonha falls .1.jpg",
            "/assets/places/ranchi/grid/jonha falls.2.jpg",
            "/assets/places/ranchi/grid/jonha falls .3.jpg",
        ]
    },
    {
        id: 15,
        name: "Shiv temple ",
        location: "Ranchi",
        category: "Temple",
        rating: 4,
        reviews: 87,
        distance: "40 km away",
        images: [
            "/assets/places/ranchi/grid/shiv temple.1.jpg",
            "/assets/places/ranchi/grid/shiv temple.2.jpg",
            "/assets/places/ranchi/grid/shiv temple.3.jpg",
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
