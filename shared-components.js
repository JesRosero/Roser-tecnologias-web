// Componentes compartidos para todas las páginas
function addSharedComponents() {
    // Agregar estilos compartidos si no existen
    if (!document.getElementById('shared-styles')) {
        const sharedStyles = document.createElement('style');
        sharedStyles.id = 'shared-styles';
        sharedStyles.textContent = `
            /* Estilos compartidos para búsqueda y carrito */
            .search-box {
                position: relative;
                height: 50px;
                width: 50px;
                border-radius: 50%;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .search-box.active {
                width: 350px;
            }
            
            .search-box input {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 50px;
                background: #fff;
                outline: none;
                padding: 0 60px 0 20px;
                font-size: 16px;
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            .search-box input.active {
                opacity: 1;
            }
            
            .search-box .search-icon {
                position: absolute;
                right: 0px;
                top: 50%;
                transform: translateY(-50%);
                height: 50px;
                width: 50px;
                background: #fff;
                border-radius: 50%;
                text-align: center;
                line-height: 50px;
                cursor: pointer;
                z-index: 1;
                transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .search-box .search-icon svg {
                width: 20px;
                height: 20px;
                fill: #664AFF;
            }
            
            .search-box .search-icon.active {
                right: 5px;
                height: 40px;
                width: 40px;
                background: #664AFF;
                transform: translateY(-50%) rotate(360deg);
            }
            
            .search-box .search-icon.active svg {
                fill: #fff;
            }
            
            .cart-icon {
                position: relative;
                cursor: pointer;
                width: 40px;
                height: 40px;
                background: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: #2c3e50;
                margin-left: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .cart-icon:hover {
                background: #e3f2fd;
                color: #2196F3;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(33,150,243,0.25);
            }

            .cart-count {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #f44336;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                border: 2px solid white;
                text-align: center;
                line-height: 14px;
            }

            .cart-count.show { display: flex; }
            
            .search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            }
            
            .search-results.show {
                display: block;
            }

            .search-shortcuts {
                display: flex;
                gap: 8px;
                padding: 8px 4px;
                margin-top: 8px;
                flex-wrap: wrap;
            }

            .search-shortcut-item {
                background: #f5f7ff;
                color: #213547;
                padding: 6px 10px;
                border-radius: 999px;
                cursor: pointer;
                font-size: 0.9rem;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 6px rgba(102,74,255,0.08);
                border: 1px solid rgba(102,74,255,0.06);
            }

            .search-shortcut-item:hover { background: #664AFF; color: #fff; }
            .search-shortcut-item { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
            .search-result-item {
                padding: 12px 20px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .search-result-item:hover {
                background: #f5f5f5;
            }
            
            .search-result-item:last-child {
                border-bottom: none;
            }
            
            .search-result-icon {
                width: 16px;
                height: 16px;
                fill: #664AFF;
            }
            
            /* Toast Notification Elegante */
            .toast-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: white;
                color: #333;
                padding: 16px 24px;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 15px;
                transform: translateY(100px) scale(0.9);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                z-index: 10000;
                border-left: 6px solid #4CAF50;
                font-family: 'Segoe UI', sans-serif;
                min-width: 300px;
                backdrop-filter: blur(10px);
                background: rgba(255, 255, 255, 0.95);
            }
            
            .toast-notification.show {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            
            .toast-icon-container {
                background: #e8f5e9;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .toast-icon {
                color: #4CAF50;
                font-size: 20px;
                font-weight: bold;
            }
            
            .toast-content {
                display: flex;
                flex-direction: column;
            }
            
            .toast-title {
                font-weight: 700;
                font-size: 15px;
                color: #2c3e50;
                margin-bottom: 2px;
            }
            
            .toast-message {
                font-size: 13px;
                color: #666;
            }
            
            @media (max-width: 480px) {
                .toast-notification {
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(sharedStyles);
    }

    // Ocultar botón de categorías (sidebar) en páginas de productos del marketplace
    if (window.location.pathname.toLowerCase().includes('/marketplace/productos/')) {
        const productStyles = document.createElement('style');
        productStyles.textContent = `
            /* Ocultar botón de menú (3 líneas) en páginas de productos */
            .menu-button, .hamburger, .sidebar-toggle {
                display: none !important;
            }

            /* Estilos Generales de Página de Producto */
            body {
                background-color: #f4f7f9; /* Fondo suave para la página */
            }

            /* Contenedor Principal (asumiendo estructura genérica) */
            body > div:not(#cartModal):not(.navbar):not(#BotonWA):not(.search-dropdown):not(.modal):not(.zoom-modal) {
                max-width: 100% !important;
                width: 100% !important;
                margin: 100px 0 0 0 !important;
                padding: 40px 5%;
                background: white;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; /* Aplicar fuente solo al contenido, no al navbar */
                color: #333;
                border-radius: 0 !important;
                box-shadow: none !important;
                box-sizing: border-box;
            }

            /* Títulos y Precios */
            h1, h2 {
                color: #1a237e;
                font-weight: 800;
                letter-spacing: -0.5px;
                margin-bottom: 10px !important; /* Reducir margen inferior */
            }

            /* Precio destacado */
            div[style*="font-size: 1.8rem"], .product-price {
                font-size: 2.5rem !important;
                color: #2196F3 !important;
                font-weight: 800 !important;
                text-shadow: 0 2px 10px rgba(33, 150, 243, 0.15);
                margin: 10px 0 25px 0 !important; /* Ajustar márgenes para usar el espacio de las estrellas */
            }

            /* Etiquetas de Estado (Nuevo, Usado) */
            div[style*="background: #4CAF50"], div[style*="background: #FF9800"] {
                padding: 6px 16px !important;
                border-radius: 50px !important;
                font-weight: 600 !important;
                text-transform: uppercase;
                font-size: 0.75rem !important;
                letter-spacing: 1px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            /* Botones de Acción */
            button {
                border-radius: 12px !important;
                font-weight: 700 !important;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                border: none !important;
                cursor: pointer;
            }

            button:hover {
                transform: translateY(-3px) !important;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
            }

            /* Botón WhatsApp Específico */
            button[onclick*="contactWhatsApp"] {
                background: linear-gradient(135deg, #25D366 0%, #128C7E 100%) !important;
                padding: 16px 32px !important;
                font-size: 1rem !important;
                box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3) !important;
            }

            /* Tablas de Especificaciones */
            table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-top: 25px;
                border: 1px solid #eef2f5;
                border-radius: 16px;
                overflow: hidden;
            }

            table tr:nth-child(odd) { background-color: #f8fbfd; }
            table tr:hover { background-color: #f0f4f8; }

            table td {
                padding: 16px 24px !important;
                border-bottom: 1px solid #eef2f5;
                color: #546e7a;
            }

            table td:first-child {
                font-weight: 600;
                color: #1565c0;
                width: 35%;
                background-color: rgba(33, 150, 243, 0.03);
            }

            /* Imágenes */
            img { border-radius: 16px !important; }
            
            /* Responsive */
            @media (max-width: 768px) {
                body > div:not(#cartModal):not(.navbar):not(#BotonWA) { padding: 20px; margin: 15px; }
                div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; gap: 30px !important; }
            }
        `;
        document.head.appendChild(productStyles);

        // Script para ocultar estrellas y valoraciones
        const hideRatings = () => {
            const elements = document.querySelectorAll('body > div:not(.navbar) *');
            elements.forEach(el => {
                // Verificar si es un elemento de texto final (sin hijos elementos)
                if (el.children.length === 0 && el.textContent) {
                    const text = el.textContent.trim();
                    // Ocultar si contiene estrellas o la palabra 'valoraciones'
                    if (text.includes('★★') || text.includes('valoraciones')) {
                        el.style.display = 'none';
                    }
                }
            });
        };

        // Script para agregar icono de WhatsApp a botones de contacto
        const addWhatsAppIcon = () => {
            const buttons = document.querySelectorAll('button[onclick*="contactWhatsApp"]');
            buttons.forEach(btn => {
                if (!btn.querySelector('svg') && !btn.querySelector('img')) {
                    const icon = document.createElement('span');
                    icon.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="margin-right: 8px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/></svg>`;
                    btn.insertBefore(icon, btn.firstChild);
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { hideRatings(); addWhatsAppIcon(); });
        } else {
            hideRatings();
            addWhatsAppIcon();
        }
    }

    // Agregar HTML de búsqueda y carrito al navbar si no existe
    /*
    const navbar = document.querySelector('.navbar .nav-container .nav-right');
    const isMarketplace = window.location.pathname.includes('marketplace.html');
    const isIndex = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (navbar && !document.getElementById('shared-search-cart') && !isMarketplace && !isIndex) {
        const searchCartHTML = `
            <div id="shared-search-cart" style="display: flex; align-items: center; gap: 16px;">
                <div class="search-box">
                    <input type="text" placeholder="Buscar productos..." id="shared-search-input">
                    <div class="search-icon" id="shared-search-btn">
                        <svg viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </div>
                    <div class="search-results" id="search-results"></div>
                </div>
                <button class="cart-button" id="shared-cart-button">
                    <svg class="cart-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <span class="cart-count" id="shared-cart-count">0</span>
                </button>
            </div>
        `;
        navbar.insertAdjacentHTML('beforeend', searchCartHTML);
    }
    */

    // Inicializar funcionalidad de búsqueda
    initializeSharedSearch();
    
    // Inicializar carrito compartido
    initializeSharedCart();
}

function initializeSharedSearch() {
    // Solo inicializar si no estamos en marketplace
    if (window.location.pathname.includes('marketplace.html')) {
        return;
    }
    const searchBox = document.querySelector(".search-box");
    const searchBtn = document.querySelector("#shared-search-btn");
    const searchInput = document.querySelector("#shared-search-input");
    const searchResults = document.querySelector("#search-results");
    // shortcuts container (may be present in page)
    const searchShortcuts = document.querySelector('#search-shortcuts');

    // Build robust prefix to Marketplace relative paths
    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _upPrefix = _pathParts.length > 1 ? '../'.repeat(_pathParts.length - 1) : '';

    // Lista de productos (URLs construidas desde la ubicación actual)
    const products = [
        { name: "Organizador Magnético de Cables HexaStack H1-80", url: _upPrefix + "Marketplace/productos/Organizador Magnético De Cables/producto-organizador-magnetico.html" },
        { name: "Caja Táctica para Munición 9mm", url: _upPrefix + "Marketplace/productos/Caja Táctica Para Munición 9mm/producto-caja-tactica-9mm.html" },
        { name: "Organizador de Cables CCTV 4 Canales", url: _upPrefix + "Marketplace/productos/Caja Para Cables CCTV Cámaras De Seguridad/producto-organizador-cables-cctv.html" },
        { name: "Baluns CCTV 8 Canales", url: _upPrefix + "Marketplace/productos/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/producto-balun-cctv.html" },
        { name: "Soporte QR para Negocios", url: _upPrefix + "Marketplace/productos/Soporte QR/producto-soporte-qr.html" }
    ];

    if (searchBtn && searchInput && searchBox && searchResults) {
        searchBtn.onclick = () => {
            searchBox.classList.add("active");
            searchBtn.classList.add("active");
            searchInput.classList.add("active");
            searchInput.focus();
            // show shortcuts when opening the search and input is empty
            if (searchShortcuts && searchInput.value.trim() === '') searchShortcuts.style.display = 'flex';
        };
        
        // Función para mostrar resultados
        function showSearchResults(filteredProducts) {
            if (filteredProducts.length === 0) {
                searchResults.classList.remove("show");
                return;
            }
            
            let html = '';
            filteredProducts.forEach(product => {
                html += `
                    <div class="search-result-item" onclick="window.location.href='${product.url}'">
                        <svg class="search-result-icon" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${product.name}
                    </div>
                `;
            });
            
            searchResults.innerHTML = html;
            searchResults.classList.add("show");
        }
        
        // Búsqueda en tiempo real
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm === '') {
                searchResults.classList.remove("show");
                if (searchShortcuts) searchShortcuts.style.display = 'flex';
                return;
            }

            if (searchShortcuts) searchShortcuts.style.display = 'none';

            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm)
            );

            showSearchResults(filteredProducts);
        });

        // Render shortcuts if container exists (hidden by default)
        if (searchShortcuts) {
            searchShortcuts.innerHTML = '';
            products.slice(0,5).forEach(p => {
                const a = document.createElement('a');
                a.href = p.url;
                a.className = 'search-shortcut-item';
                a.textContent = p.name;
                searchShortcuts.appendChild(a);
            });
            searchShortcuts.style.display = 'none';
        }

        // Hide shortcuts when clicking outside the search box
        document.addEventListener('click', function(e){
            if (searchShortcuts && searchBox && !searchBox.contains(e.target)) {
                searchShortcuts.style.display = 'none';
            }
        });
        
        // Cerrar búsqueda al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target)) {
                searchBox.classList.remove("active");
                searchBtn.classList.remove("active");
                searchInput.classList.remove("active");
                searchResults.classList.remove("show");
                searchInput.value = "";
            }
        });
    }
}

function initializeSharedCart() {
    // Sistema de carrito compartido
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Calcular ruta relativa robusta a marketplace.html desde cualquier subcarpeta
    const _pathParts = window.location.pathname.split('/').filter(Boolean);
    const _upPrefix = _pathParts.length > 1 ? '../'.repeat(_pathParts.length - 1) : '';
    const marketplaceHref = _upPrefix + 'Marketplace/marketplace.html';
    
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.getElementById('shared-cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            if (count > 0) {
                cartCountEl.style.display = 'flex';
            } else {
                cartCountEl.style.display = 'none';
            }
        }
    }
    
    // Botón de carrito
    const cartButton = document.getElementById('shared-cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            // If a page defines openCartModal, prefer that.
            if (typeof window.openCartModal === 'function') {
                try { window.openCartModal(); } catch (err) { console.warn(err); }
                return;
            }

            // If the page has a cart modal element, show it (handles index which uses direct jQuery modal)
            const pageModal = document.getElementById('cartModal');
            if (pageModal) {
                try {
                    if (window.$) $('#cartModal').show();
                    else pageModal.style.display = 'block';
                } catch (err) { console.warn(err); }
                return;
            }

            // Fallback: navigate to marketplace
            window.location.href = marketplaceHref;
        });
    }

    // Attach handlers to any cart icons/buttons present so they open the modal when available
    document.querySelectorAll('.cart-icon, .cart-button').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.openCartModal === 'function') {
                try { window.openCartModal(); } catch (err) { console.warn(err); }
                return;
            }

            const pageModal = document.getElementById('cartModal');
            if (pageModal) {
                try {
                    if (window.$) $('#cartModal').show();
                    else pageModal.style.display = 'block';
                } catch (err) { console.warn(err); }
                return;
            }

            // If not available, try to navigate to marketplace (relative path)
            window.location.href = marketplaceHref;
        });
    });
    
    // Actualizar contador inicial
    updateCartCount();
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            cart = JSON.parse(e.newValue) || [];
            updateCartCount();
        }
    });
}

// Funciones globales para notificaciones y sonido
window.playSuccessSound = function() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        // Efecto de sonido agradable (campana suave)
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.log('Audio context not supported');
    }
};

window.showToast = function(title, message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <div class="toast-icon-container"><span class="toast-icon">✓</span></div>
        <div class="toast-content"><span class="toast-title">${title}</span><span class="toast-message">${message}</span></div>
    `;
    
    void toast.offsetWidth; // Force reflow
    toast.classList.add('show');
    
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 4000);
};

window.notifyAddToCart = function() {
    window.playSuccessSound();
    window.showToast('¡Excelente!', 'Producto agregado al carrito correctamente');
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', addSharedComponents);
// Funcionalidad del search box con botón X
document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.querySelector('.search-box');
    const searchBtn = document.querySelector('.search-icon');
    const cancelBtn = document.querySelector('.cancel-icon');
    const searchInput = document.querySelector('.search-box input');
    
    if (searchBtn && searchInput && searchBox && cancelBtn) {
        searchBtn.onclick = () => {
            searchBox.classList.add('active');
            searchBtn.classList.add('active');
            searchInput.classList.add('active');
            cancelBtn.classList.add('active');
            searchInput.focus();
        };
        
        cancelBtn.onclick = () => {
            searchBox.classList.remove('active');
            searchBtn.classList.remove('active');
            searchInput.classList.remove('active');
            cancelBtn.classList.remove('active');
            searchInput.value = '';
        };
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target)) {
                searchBox.classList.remove('active');
                searchBtn.classList.remove('active');
                searchInput.classList.remove('active');
                cancelBtn.classList.remove('active');
            }
        });
    }
});

// Protección global contra invocaciones accidentales de checkout()
(function(){
    // Registro de interacción del usuario (click/tecla)
    // Track page load time and last user interaction
    window.__pageLoadedAt = Date.now();
    window.__lastUserInteraction = Date.now();
    // Listen to early pointer/mouse/touch events so inline onclick handlers see recent interaction
    ['pointerdown','mousedown','click','keydown','touchstart'].forEach(evt => {
        document.addEventListener(evt, function(){ window.__lastUserInteraction = Date.now(); }, { passive: true });
    });

    // Manejador que envuelve la implementación real de checkout
    function makeSafeCheckout(original) {
        return function safeCheckout(){
            const now = Date.now();
            const timeSinceLoad = now - (window.__pageLoadedAt || 0);
            const timeSinceUser = now - (window.__lastUserInteraction || 0);

            // Block only if call happens very early after load (first 3s)
            // AND there was no recent user interaction (2s). This prevents
            // accidental automatic openings on page load while allowing
            // normal user clicks.
            if (timeSinceLoad < 3000 && timeSinceUser > 2000) {
                console.warn('checkout() bloqueado: llamada temprana sin interacción');
                return;
            }

            return original.apply(this, arguments);
        };
    }

    // Si ya existe, envolverla; si se define después, intentar envolverla más tarde
    if (typeof window.checkout === 'function') {
        window.checkout = makeSafeCheckout(window.checkout);
    } else {
        // Vigilar asignaciones a window.checkout (si la página las define después)
        Object.defineProperty(window, 'checkout', {
            configurable: true,
            set(fn) {
                if (typeof fn === 'function') {
                    const wrapped = makeSafeCheckout(fn);
                    // Reassign the wrapped function and stop intercepting
                    Object.defineProperty(window, 'checkout', { value: wrapped, writable: true, configurable: true });
                } else {
                    Object.defineProperty(window, 'checkout', { value: fn, writable: true, configurable: true });
                }
            },
            get() { return undefined; }
        });
    }
})();