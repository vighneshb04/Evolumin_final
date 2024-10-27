let cart = [];

function addToCart(product, price, quantity) {
    quantity = parseInt(quantity);
    const existingProduct = cart.find(item => item.product === product);
    if (existingProduct) {
        existingProduct.quantity += quantity;
        existingProduct.total = existingProduct.quantity * existingProduct.price;
    } else {
        cart.push({ product, price, quantity, total: price * quantity });
    }
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
        renderCartItems();
    }
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = '';
        let totalAmount = 0;
        cart.forEach((item, index) => {
            totalAmount += item.total;
            cartItems.innerHTML += `
                <tr>
                    <td>${item.product}</td>
                    <td>$${item.price}</td>
                    <td>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
                    </td>
                    <td>$${item.total}</td>
                    <td><button onclick="removeFromCart(${index})">Remove</button></td>
                </tr>
            `;
        });
        const totalAmountElem = document.getElementById('totalAmount');
        if (totalAmountElem) {
            totalAmountElem.textContent = `$${totalAmount.toFixed(2)}`;
        }
    }
}

function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    const item = cart[index];
    if (item) {
        item.quantity = quantity;
        item.total = item.quantity * item.price;
        renderCartItems();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCartItems();
}

function showFileName() {
    const fileInput = document.getElementById('prescriptionInput');
    const fileLabel = document.getElementById('fileLabel');
    if (fileInput && fileInput.files[0] && fileLabel) {
        fileLabel.textContent = `Selected file: ${fileInput.files[0].name}`;
    }
}

// Popup controls
document.getElementById('openPopupBtn')?.addEventListener('click', function() {
    document.getElementById('popupForm').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
});

document.getElementById('closePopupBtn')?.addEventListener('click', function() {
    document.getElementById('popupForm').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

document.getElementById('overlay')?.addEventListener('click', function() {
    document.getElementById('popupForm').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
});

// Flip card function
function flipCard(card) {
    if (card) {
        card.classList.toggle("flipped");
    }
}

// Async form submission handler
const onSubmit = async (event) => {
    event.preventDefault();
    console.log("Sending...");
    const formData = new FormData(event.target);
        
    formData.append("access_key", "b8b9dac1-b4bd-4893-afd5-066d75b323fe");
    
    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            console.log("Form submitted successfully!");
            alert("Form submitted successfully!");
        } else {
            console.error("Error submitting the form");
            alert("Error submitting the form. Please try again.");
        }
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to submit. Please check your connection and try again.");
    }
};
