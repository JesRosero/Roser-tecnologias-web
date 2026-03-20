// Cart system
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-count').text(count);
    if (count > 0) {
        $('#cart-count').show();
    } else {
        $('#cart-count').hide();
    }
}

function updateCartDisplay() {
    const cartBody = $('#cartBody');
    
    if (cart.length === 0) {
        cartBody.html('<p class="empty-cart">Tu carrito está vacío</p>');
        $('#cart-total').text('$0 COP');
        return;
    }
    
    let html = '<div class="cart-items">';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toLocaleString('es-CO')} COP</p>
                </div>
                <div class="cart-item-quantity">
                    <button onclick="decreaseQuantity(${index})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQuantity(${index})">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toLocaleString('es-CO')} COP</div>
                <button class="remove-item" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    });
    
    html += '</div>';
    cartBody.html(html);
    $('#cart-total').text(`$${total.toLocaleString('es-CO')} COP`);
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
};

window.increaseQuantity = function(index) {
    cart[index].quantity++;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
};

window.decreaseQuantity = function(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }
};

window.openCartModal = function() {
    updateCartDisplay();
    $('#cartModal').show();
};

window.closeCartModal = function() {
    $('#cartModal').hide();
};

window.checkout = function() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const phone = '573113579437';
    let message = '¡Hola! Quiero realizar el siguiente pedido:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `• ${item.name}\n  Cantidad: ${item.quantity}\n  Precio: $${itemTotal.toLocaleString('es-CO')} COP\n\n`;
    });
    
    message += `Total: $${total.toLocaleString('es-CO')} COP`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

window.contactWhatsApp = function(productName) {
    const phone = '573113579437';
    const message = `¡Hola! Estoy interesado en el producto: ${productName}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

window.changeMainImage = function(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = thumbnail.src;
    
    $('.thumbnail').removeClass('active');
    $(thumbnail).addClass('active');
};

window.closeGalleryModal = function() {
    $('#galleryModal').hide();
};

$('#cart-button').click(function() {
    openCartModal();
});

updateCartCount();
updateCartDisplay();

// Función genérica para agregar al carrito (se sobrescribe en cada página)
window.addToCartProduct = function() {
    alert('Función no implementada');
};
