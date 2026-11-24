// ============================================================
// Interactive E-Commerce Product Catalog
// ============================================================

// ---------- 1. DATA ----------

// Initial products (each has a unique id)
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 59.99,
    description: "Enjoy high-quality sound and comfortable listening with these wireless headphones.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 89.99,
    description: "Track your daily activities, monitor your fitness, and stay connected.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 74.99,
    description: "Lightweight and comfortable running shoes designed for everyday activities.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Travel Backpack",
    price: 44.99,
    description: "A stylish and durable backpack suitable for travel, work, and daily use.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  }
];

// The one extra product that "Add New Product" creates
const newProduct = {
  id: 5,
  name: "Bluetooth Speaker",
  price: 39.99,
  description: "Enjoy clear audio and powerful sound with this portable Bluetooth speaker.",
  image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
};

// ---------- 2. STATE ----------

let selectedProduct = null; // the currently selected product object (or null)
const cart = [];            // array of { id, name, price, quantity }

// ---------- 3. DOM ELEMENTS ----------

const productGrid = document.querySelector("#product-grid");
const selectedInfo = document.querySelector("#selected-info");
const addToCartBtn = document.querySelector("#add-to-cart-btn");
const cartMessage = document.querySelector("#cart-message");
const addNewBtn = document.querySelector("#add-new-btn");
const addNewMessage = document.querySelector("#add-new-message");
const cartStatus = document.querySelector("#cart-status");
const cartList = document.querySelector("#cart-list");
const totalItemsEl = document.querySelector("#total-items");
const totalPriceEl = document.querySelector("#total-price");

// ---------- 4. HELPER FUNCTIONS ----------

// Format a number as a price with exactly two decimals
function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

// Show a feedback message in a given element. type is "success" or "error".
function showMessage(element, text, type) {
  element.textContent = text;
  element.classList.remove("success", "error");
  if (type) {
    element.classList.add(type);
  }
}

// Inline SVG used if an image fails to load
const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>" +
    "<rect width='100%' height='100%' fill='#dde3ea'/>" +
    "<text x='50%' y='50%' fill='#5d6b7a' font-family='Arial' font-size='28' " +
    "text-anchor='middle' dominant-baseline='middle'>Image unavailable</text></svg>"
  );

// ---------- 5. PRODUCT RENDERING ----------

// Build one product card using createElement() and return it
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.id = product.id;   // unique ID stored on the element
  card.tabIndex = 0;              // lets keyboard users focus the card

  const img = document.createElement("img");
  img.src = product.image;
  img.alt = product.name;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.textContent = product.name;

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = formatPrice(product.price);

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = product.description;

  const badge = document.createElement("p");
  badge.className = "card-badge";

  body.append(title, price, desc, badge);
  card.append(img, body);
  return card;
}

// Render all initial products into the grid
function renderProducts() {
  for (const product of products) {
    productGrid.appendChild(createProductCard(product));
  }
}

// ---------- 6. PRODUCT SELECTION ----------

// Select the product whose card was clicked
function selectProduct(card) {
  const id = Number(card.dataset.id);

  // Remove "selected" (and the badge text) from every card
  const allCards = document.querySelectorAll(".product-card");
  allCards.forEach(function (c) {
    c.classList.remove("selected");
    c.querySelector(".card-badge").textContent = "";
  });

  // Highlight the clicked card
  card.classList.add("selected");
  card.querySelector(".card-badge").textContent = "✓ Selected";

  // Store the product in the variable (look it up from our data)
  selectedProduct = findProductById(id);

  updateSelectedProduct();
  showMessage(cartMessage, "", null); // clear old cart message
}

// Find a product object by its ID (works for initial and new products)
function findProductById(id) {
  return products.find((p) => p.id === id) || null;
}

// Update the "Selected Product" section
function updateSelectedProduct() {
  selectedInfo.innerHTML = ""; // clear previous content

  if (!selectedProduct) {
    const msg = document.createElement("p");
    msg.className = "placeholder";
    msg.textContent = "Select a product to see its details.";
    selectedInfo.appendChild(msg);
    return;
  }

  // textContent keeps the output safe (no HTML injection)
  const name = document.createElement("p");
  name.className = "selected-name";
  name.textContent = selectedProduct.name;

  const price = document.createElement("p");
  price.className = "selected-price";
  price.textContent = formatPrice(selectedProduct.price);

  selectedInfo.append(name, price);
}

// ---------- 7. CART ----------

// Add the selected product to the cart
function addToCart() {
  if (!selectedProduct) {
    showMessage(cartMessage, "Please select a product before adding it to the cart.", "error");
    return;
  }

  // If the product is already in the cart, increase its quantity
  const existing = cart.find((item) => item.id === selectedProduct.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1
    });
  }

  updateCart();
  showMessage(cartMessage, `${selectedProduct.name} was added to your cart.`, "success");
}

// Calculate totals and refresh the cart display
function updateCart() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const item of cart) {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  }

  totalItemsEl.textContent = totalItems;
  totalPriceEl.textContent = formatPrice(totalPrice);

  cartStatus.textContent = totalItems === 0
    ? "Your cart is empty."
    : `You have ${totalItems} item${totalItems === 1 ? "" : "s"} in your cart.`;

  renderCart();
}

// Draw the list of cart items
function renderCart() {
  cartList.innerHTML = "";

  for (const item of cart) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = `${item.name} (${formatPrice(item.price)})`;

    const qty = document.createElement("span");
    qty.className = "qty";
    qty.textContent = `× ${item.quantity}`;

    li.append(label, qty);
    cartList.appendChild(li);
  }
}

// ---------- 8. DYNAMIC PRODUCT ----------

// Create the Bluetooth Speaker and add it to the grid (only once)
function addNewProduct() {
  products.push(newProduct); // keep the data array in sync with the page
  productGrid.appendChild(createProductCard(newProduct));

  // Prevent duplicate insertion
  addNewBtn.disabled = true;
  addNewBtn.textContent = "Product Added";
  showMessage(addNewMessage, "Bluetooth Speaker was added to the catalog.", "success");
}

// ---------- 9. EVENT LISTENERS ----------

// Event delegation: ONE listener on the grid handles every card,
// including cards created later by addNewProduct().
productGrid.addEventListener("click", function (event) {
  const card = event.target.closest(".product-card");
  if (card && productGrid.contains(card)) {
    selectProduct(card);
  }
});

// Keyboard support (Enter or Space) using the same delegation
productGrid.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === " ") {
    const card = event.target.closest(".product-card");
    if (card) {
      event.preventDefault();
      selectProduct(card);
    }
  }
});

// Swap broken images for a placeholder (error events don't bubble,
// so we listen in the capture phase on the grid)
productGrid.addEventListener("error", function (event) {
  if (event.target.tagName === "IMG" && event.target.src !== fallbackImage) {
    event.target.src = fallbackImage;
  }
}, true);

addToCartBtn.addEventListener("click", addToCart);
addNewBtn.addEventListener("click", addNewProduct);

// ---------- 10. START ----------
renderProducts();
updateSelectedProduct();
updateCart();
