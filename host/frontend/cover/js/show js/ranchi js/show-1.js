// Fetch and inject navbar and footer HTML content

fetch("/frontend/component/footer/footer.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  // Show the first slide initially
  slides[currentSlide].classList.add("active");

  // Function to show next slide
  function nextSlide() {
    // Remove active class from current slide
    slides[currentSlide].classList.remove("active");

    // Move to next slide
    currentSlide = (currentSlide + 1) % slides.length;

    // Add active class to new slide
    slides[currentSlide].classList.add("active");
  }

  // Start auto sliding
  setInterval(nextSlide, 5000);
});

// Format numbers with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Animate counter with easing
function animateCounter(element, start, end, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (end - start) * easeOutQuart);

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
// Initialize Intersection Observer
function initObserver() {
  const numbers = document.querySelectorAll(".number");
  const animatedElements = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animatedElements.has(entry.target)) {
          const element = entry.target;
          const value = parseInt(element.dataset.value);

          animatedElements.add(element);
          animateCounter(element, 0, value, 2000);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "50px",
    }
  );

  numbers.forEach((number) => observer.observe(number));
} // Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initObserver();
});

// Favorite button functionality
document.querySelectorAll(".favorite-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const icon = this.querySelector(".material-icons");
    if (icon.textContent === "favorite_border") {
      icon.textContent = "favorite";
      icon.style.color = "#ff0000";
    } else {
      icon.textContent = "favorite_border";
      icon.style.color = "inherit";
    }
  });
});

// Review action buttons functionality
document.querySelectorAll(".review-actions button").forEach((btn) => {
  btn.addEventListener("click", function () {
    const icon = this.querySelector(".material-icons");
    if (icon.textContent.includes("_border")) {
      icon.textContent = icon.textContent.replace("_border", "");
    } else {
      icon.textContent = icon.textContent + "_border";
    }
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
// Auto sliding for testimonials
