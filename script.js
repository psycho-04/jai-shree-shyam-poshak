const products = [
    {
        id: 1,
        name: "Royal Velvet Zardozi Heavy Dress - Maroon",
        price: 850,
        category: "heavy",
        availableSizes: ["0", "1", "2", "3", "4", "5", "6"],
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 2,
        name: "Pure Silk Peacock Feather Poshak - Green",
        price: 650,
        category: "heavy",
        availableSizes: ["1", "2", "3", "4"],
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 3,
        name: "Handcrafted Summer Cotton Dress - Yellow",
        price: 350,
        category: "cotton",
        availableSizes: ["0", "1", "2"],
        image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 4,
        name: "Gold Embroidery Festival Special - Red",
        price: 1200,
        category: "heavy",
        availableSizes: ["3", "4", "5", "6"],
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 5,
        name: "Daily Wear Printed Silk Poshak - Blue",
        price: 280,
        category: "daily",
        availableSizes: ["0", "1", "2", "3"],
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400"
    }
];

let cart = [];
let activeFilter = 'all';
let activeCategory = 'all';
let searchQuery = '';
const freeShippingThreshold = 999;

function displayProducts() {
    const grid = document.getElementById('product-grid');

    const filteredProducts = products.filter(p => {
        const matchesSize = activeFilter === 'all' || p.availableSizes.includes(activeFilter);
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSize && matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin: 40px 0;">No poshaks found matching your criteria.</p>`;
        return;
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="image-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <div class="price">₹${product.price}</div>
                
                <div class="size-selection">
                    <label for="size-${product.id}">Select Size:</label>
                    <select id="size-${product.id}" class="size-dropdown">
                        ${product.availableSizes.map(size => `<option value="${size}">Size ${size}</option>`).join('')}
                    </select>
                </div>

                <div class="addons-section">
                    <p>Add Matching Shringar:</p>
                    <label class="addon-option">
                        <input type="checkbox" id="mukut-${product.id}"> Matching Mukut (+₹120)
                    </label>
                    <label class="addon-option">
                        <input type="checkbox" id="bansuri-${product.id}"> Golden Bansuri (+₹50)
                    </label>
                </div>

                <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function handleSearch() {
    searchQuery = document.getElementById('search-input').value;
    displayProducts();
}

function filterByCategory(category) {
    activeCategory = category;
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayProducts();
}

function filterBySize(size) {
    activeFilter = size;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayProducts();
}

function toggleSizeGuide(show) {
    document.getElementById('size-guide-modal').style.display = show ? 'flex' : 'none';
}

function togglePaymentModal(show) {
    document.getElementById('payment-modal').style.display = show ? 'flex' : 'none';
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const selectedSize = document.getElementById(`size-${productId}`).value;
    const hasMukut = document.getElementById(`mukut-${productId}`).checked;
    const hasBansuri = document.getElementById(`bansuri-${productId}`).checked;

    let extraCost = 0;
    let addons = [];
    if (hasMukut) { extraCost += 120; addons.push("Mukut"); }
    if (hasBansuri) { extraCost += 50; addons.push("Bansuri"); }

    const itemPrice = product.price + extraCost;
    const itemKey = `${productId}-${selectedSize}-${addons.join('-')}`;

    const existingIndex = cart.findIndex(item => item.key === itemKey);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            ...product,
            key: itemKey,
            selectedSize: selectedSize,
            unitPrice: itemPrice,
            addonsList: addons,
            quantity: 1
        });
    }

    // Reset checkboxes
    document.getElementById(`mukut-${productId}`).checked = false;
    document.getElementById(`bansuri-${productId}`).checked = false;

    updateCartUI();
    toggleCart(true);
}

function updateQuantity(itemKey, change) {
    const itemIndex = cart.findIndex(item => item.key === itemKey);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    updateCartUI();
}

function removeFromCart(itemKey) {
    cart = cart.filter(item => item.key !== itemKey);
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const countElement = document.getElementById('cart-count');
    const clearBtn = document.getElementById('clear-btn');
    const shippingMsg = document.getElementById('shipping-msg');
    const shippingBar = document.getElementById('shipping-bar');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    countElement.innerText = totalCount;
    totalElement.innerText = totalAmount;

    // Free Shipping Progress calculation
    if (totalAmount >= freeShippingThreshold) {
        shippingMsg.innerText = "🎉 Congratulations! You unlocked FREE Shipping!";
        shippingBar.style.width = "100%";
    } else {
        const remaining = freeShippingThreshold - totalAmount;
        const percentage = (totalAmount / freeShippingThreshold) * 100;
        shippingMsg.innerText = `Add ₹${remaining} more for FREE Shipping!`;
        shippingBar.style.width = `${percentage}%`;
    }

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';

    cartList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name} <span class="item-size-badge">Size ${item.selectedSize}</span></h4>
                ${item.addonsList.length > 0 ? `<div class="item-addons-list">+ ${item.addonsList.join(', ')}</div>` : ''}
                <p>₹${item.unitPrice} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity('${item.key}', -1)">-</button>
                <span class="qty-count">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.key}', 1)">+</button>
                <button class="delete-btn" onclick="removeFromCart('${item.key}')" title="Remove Item">&times;</button>
            </div>
        </div>
    `).join('');
}

function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');

    if (forceOpen || !drawer.classList.contains('open')) {
        drawer.classList.add('open');
        overlay.classList.add('open');
    } else {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
    }
}

function openPaymentProcess() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    document.getElementById('qr-total-amount').innerText = totalAmount;
    togglePaymentModal(true);
}

function confirmOrderWhatsApp() {
    const phoneNumber = "919660517992"; // Replace with your WhatsApp number
    let message = "Radhe Radhe! I have completed/placed my order:\n\n";
    cart.forEach((item, index) => {
        const addonsStr = item.addonsList.length > 0 ? ` (+${item.addonsList.join(', ')})` : '';
        message += `${index + 1}. ${item.name} (Size: ${item.selectedSize}${addonsStr}, Qty: ${item.quantity}) - ₹${item.unitPrice * item.quantity}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    message += `\n*Total Amount:* ₹${total}\n\n*Payment Status:* Paid via UPI QR / Pending Confirmation.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

displayProducts();