// cart-component.js - Sistema de Carrito Global
const CartSystem = {
    cart: [],
    paymentMethodLogos: {},
    imageBasePath: '../',

    init(config = {}) {
        this.imageBasePath = config.imageBasePath || '../';
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.paymentMethodLogos = Object.fromEntries(
            PaymentModal.methods.map(m => [m.name, m.logo])
        );
        this.injectHTML();
        this.updateCount();
        this.startAutoUpdate();
    },

    injectHTML() {
        if (!document.getElementById('cartModal')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="cartModal" class="modal">
                    <div class="modal-content cart-modal-content">
                        <button class="close" onclick="closeCartModal()" style="position: absolute; top: 15px; right: 15px; background: #f44336; color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(244,67,54,0.3); transition: all 0.2s; z-index: 1;" onmouseover="this.style.background='#d32f2f'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#f44336'; this.style.transform='scale(1)'">&times;</button>
                        <div class="cart-header"><h2>Carrito de Compras</h2></div>
                        <div id="cartBody" class="cart-body"><p class="empty-cart">Tu carrito está vacío</p></div>
                        <div class="cart-payment-info" style="padding: 15px 20px; background: #e3f2fd; border-top: 1px solid #bbdefb; border-bottom: 1px solid #bbdefb; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #1565c0; font-weight: 600;">Método de Pago:</span>
                            <div id="cartPaymentMethod" style="font-weight: bold; color: #333;">No seleccionado</div>
                        </div>
                        <div class="cart-footer">
                            <div class="cart-total"><span>Total:</span><span id="cart-total">$0 COP</span></div>
                            <button class="checkout-btn" onclick="checkout()" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                                </svg>
                                Finalizar Compra por WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            `);
        }
    },

    updateCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        $('#cart-count').text(count);
        if (count > 0) {
            $('#cart-count').css('display', 'flex').addClass('show');
        } else {
            $('#cart-count').css('display', 'none').removeClass('show');
        }
    },

    updateDisplay() {
        const cartBody = $('#cartBody');
        const selectedPaymentMethod = localStorage.getItem('selectedPayment') || '';
        
        if (this.cart.length === 0) {
            cartBody.html('<p class="empty-cart">Tu carrito está vacío</p>');
            $('#cart-total').text('$0 COP');
            return;
        }
        
        let html = '<div class="cart-items">';
        let total = 0;
        
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            let imagePath = item.image;
            const marketplaceToken = '/Marketplace/';
            if (imagePath && imagePath.includes(marketplaceToken)) {
                const decodedPath = decodeURIComponent(imagePath);
                const pathIndex = decodedPath.indexOf(marketplaceToken);
                if (pathIndex !== -1) {
                    const relativePath = decodedPath.substring(pathIndex + 1);
                    imagePath = this.imageBasePath + relativePath;
                }
            }
            
            html += `
                <div class="cart-item">
                    <img src="${imagePath}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toLocaleString('es-CO')} COP</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button onclick="CartSystem.decreaseQuantity(${index})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="CartSystem.increaseQuantity(${index})">+</button>
                    </div>
                    <div class="cart-item-total">$${itemTotal.toLocaleString('es-CO')} COP</div>
                    <button class="remove-item" onclick="CartSystem.removeItem(${index})">&times;</button>
                </div>
            `;
        });
        
        html += '</div>';
        cartBody.html(html);
        $('#cart-total').text(`$${total.toLocaleString('es-CO')} COP`);
        
        // Update payment display
        if (selectedPaymentMethod) {
            const logoSrc = this.paymentMethodLogos[selectedPaymentMethod];
            let paymentHtml = '<div style="display: flex; align-items: center; gap: 12px;">';
            paymentHtml += '<div onclick="CartSystem.selectPayment()" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; border-radius: 8px; background: #f5f5f5; transition: all 0.2s;" onmouseover="this.style.background=\'#e0e0e0\'" onmouseout="this.style.background=\'#f5f5f5\'" title="Cambiar método de pago">';
            if (logoSrc) {
                paymentHtml += `<img src="${logoSrc}" alt="${selectedPaymentMethod}" style="height: 24px; object-fit: contain;">`;
            }
            paymentHtml += `<span style="font-weight: bold; color: #333;">${selectedPaymentMethod}</span>`;
            paymentHtml += '</div>';
            paymentHtml += '<button onclick="CartSystem.removePayment()" style="background: #f44336; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background=\'#d32f2f\'; this.style.transform=\'scale(1.1)\'" onmouseout="this.style.background=\'#f44336\'; this.style.transform=\'scale(1)\'" title="Quitar método de pago">&times;</button>';
            paymentHtml += '</div>';
            $('#cartPaymentMethod').html(paymentHtml);
        } else {
            $('#cartPaymentMethod').html('<span style="color: #f57c00; cursor: pointer; padding: 8px 12px; border-radius: 8px; background: #fff3e0; transition: all 0.2s;" onclick="CartSystem.selectPayment();" onmouseover="this.style.background=\'#ffe0b2\'" onmouseout="this.style.background=\'#fff3e0\'">Clic para seleccionar</span>');
        }
    },

    open() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateDisplay();
        $('#cartModal').show();
    },

    close() {
        $('#cartModal').hide();
    },

    removeItem(index) {
        this.cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCount();
        this.updateDisplay();
    },

    increaseQuantity(index) {
        this.cart[index].quantity++;
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCount();
        this.updateDisplay();
    },

    decreaseQuantity(index) {
        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity--;
        } else {
            this.cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCount();
        this.updateDisplay();
    },

    removePayment() {
        localStorage.removeItem('selectedPayment');
        this.updateDisplay();
    },

    selectPayment() {
        this.close();
        PaymentModal.open((method) => {
            setTimeout(() => {
                this.open();
            }, 100);
        });
    },

    checkout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedPaymentMethod = localStorage.getItem('selectedPayment') || '';
        
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
        
        message += `Total: $${total.toLocaleString('es-CO')} COP\n\n`;
        
        if (selectedPaymentMethod) {
            message += `Método de Pago: ${selectedPaymentMethod}`;
        } else {
            message += `Método de Pago: A convenir`;
        }
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    },

    startAutoUpdate() {
        setInterval(() => {
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
            this.updateCount();
        }, 1000);
    },

    addItem(id, name, price, image) {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = this.cart.find(i => i.id === id);
        if (existing) existing.quantity++;
        else this.cart.push({ id, name, price, image, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCount();
        window.notifyAddToCart?.();
    }
};

// Funciones globales para compatibilidad
window.openCartModal = () => CartSystem.open();
window.closeCartModal = () => CartSystem.close();
window.removeFromCart = (index) => CartSystem.removeItem(index);
window.increaseQuantity = (index) => CartSystem.increaseQuantity(index);
window.decreaseQuantity = (index) => CartSystem.decreaseQuantity(index);
window.removePaymentMethod = () => CartSystem.removePayment();
window.selectPaymentMethod = () => CartSystem.selectPayment();
window.checkout = () => CartSystem.checkout();

// No auto-inicializar, esperar configuración manual
