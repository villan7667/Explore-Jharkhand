// home page script.js

// Fetch and inject navbar and footer HTML into the document

fetch("/frontend/component/footer/footer.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

// gallery start
let currentImageIndex = 0;
const modal = document.getElementById("custom-gallery-modal");
const modalImg = document.getElementById("custom-gallery-modal-img");
const caption = document.getElementById("custom-gallery-caption");
const images = document.querySelectorAll(".custom-gallery-img");

// Open Modal
function openModal(img) {
  modal.style.display = "flex";
  modalImg.src = img.src;
  caption.innerHTML = img.alt;
  currentImageIndex = Array.from(images).indexOf(img);
}

// Close Modal
function closeModal() {
  modal.style.display = "none";
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
document.addEventListener("keydown", function (e) {
  if (modal.style.display === "flex") {
    if (e.key === "ArrowLeft") changeImage(-1); // Previous
    if (e.key === "ArrowRight") changeImage(1); // Next
    if (e.key === "Escape") closeModal(); // Close modal
  }
});
// gallery end

//dont copy start
document.addEventListener("copy", function (e) {
  e.preventDefault();
  const customMessage =
    'Copy is not allowed on this website... All right reserved in under @ ExploreJharkhand"s Copyright Law { VillaN @ HSGF }.';
  e.clipboardData.setData("text/plain", customMessage);
});
//dont copy end
