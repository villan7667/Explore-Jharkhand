// cart.js

// Load the navbar and footer HTML into the page
fetch('/frontend/component/footer/footer.html')
.then(res => res.text())
.then(data => {
  document.getElementById('footer').innerHTML = data;
});




// Get references to the necessary DOM elements
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total p');
const clearCartButton = document.querySelector('.clear-cart');
const checkoutButton = document.querySelector('.checkout');
const checkoutPopup = document.querySelector('.checkout-popup');
const payButton = document.querySelector('.pay-button');
const retrieveButton = document.querySelector('.retrieve');

// Cart state
let cart = [];

// Add event listeners to the "Add to Cart" buttons
addToCartButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    addToCart(index);
  });
});

// Function to add an item to the cart
function addToCart(index) {
  const productCard = document.querySelectorAll('.product-card')[index];
  const productImageSrc = productCard.querySelector('img').src;

  const product = {
    name: productCard.querySelector('h3').textContent,
    price: parseFloat(productCard.querySelector('.price').textContent.slice(1)),
    quantity: 1,
    image: productImageSrc
  };

  // Check if the product is already in the cart
  const existingItem = cart.find(item => item.name === product.name);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push(product);
  }

  updateCart();
}

// Function to update the cart display
function updateCart() {
  cartItems.innerHTML = '';

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    const productImage = document.createElement('img');
    productImage.src = item.image;
    productImage.alt = item.name;
    productImage.style.width = '50px';

    const productName = document.createElement('span');
    productName.textContent = item.name;

    const quantity = document.createElement('div');
    quantity.classList.add('quantity');

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.addEventListener('click', () => {
      decreaseQuantity(item);
    });

    const quantityInput = document.createElement('span');
    quantityInput.textContent = item.quantity;

    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.addEventListener('click', () => {
      increaseQuantity(item);
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      removeFromCart(item);
    });

    quantity.appendChild(decreaseButton);
    quantity.appendChild(quantityInput);
    quantity.appendChild(increaseButton);

    cartItem.appendChild(productImage);
    cartItem.appendChild(productName);
    cartItem.appendChild(quantity);
    cartItem.appendChild(removeButton);

    cartItems.appendChild(cartItem);
  });

  updateCartTotal();
}

// Function to update the cart total
function updateCartTotal() {
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  cartTotal.textContent = `Total: ₹${total.toFixed(2)}`;
}

// Function to decrease the quantity of an item in the cart
function decreaseQuantity(item) {
  if (item.quantity > 1) {
    item.quantity--;
    updateCart();
  } else {
    removeFromCart(item);
  }
}

// Function to increase the quantity of an item in the cart
function increaseQuantity(item) {
  item.quantity++;
  updateCart();
}

// Function to remove an item from the cart
function removeFromCart(item) {
  cart = cart.filter(cartItem => cartItem !== item);
  updateCart();
}

// Event listener for the "Proceed to Checkout" button
checkoutButton.addEventListener('click', () => {
  checkoutPopup.style.display = 'flex';
});

// Event listener for the "Pay Now" button
payButton.addEventListener('click', () => {
  console.log('Processing payment...');
  checkoutPopup.style.display = 'none';
  cart = []; // Clear cart after payment
  updateCart();
});

// Event listener for the "Retrieve" button
retrieveButton.addEventListener('click', () => {
  if (cart.length > 0) {
    cart.pop();
    updateCart();
  }
});
