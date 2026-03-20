// Configure navbar with correct paths
NavbarComponent.init({
    logoPath: '../../Imagenes/Rosero.png',
    homeUrl: '../../Pagina Principal/index.html',
    marketplaceUrl: '../../Marketplace/Pagina Marketplace/marketplace.html',
    marketplaceIcon: '../../Marketplace/Iconos/Marketplace.png',
    cartIcon: '../../Imagenes/Carrito.png',
    sidebarBasePath: '../../'
});

// Configure payment modal with correct paths
PaymentModal.init({
    basePath: '../../Marketplace/metodos de pago/'
});

// Configure cart system with correct paths
CartSystem.init({
    imageBasePath: '../../'
});

// Initialize WhatsApp plugin
$(function () {
    $('#BotonWA').floatingWhatsApp({
        phone: '573113579437',
        headerTitle: 'Roser Tecnologías',
        popupMessage: '¡Hola! ¿En qué podemos ayudarte?',
        showPopup: true,
        position: "right",
        size: "60px",
        backgroundColor: '#25D366',
        zIndex: 9999
    });
    
    // Initialize search functionality
    initializeSearch();
});

function initializeSearch() {
    const searchBox = $('.search-box');
    const searchIcon = $('.search-icon');
    const searchInput = $('.search-box input');
    const cancelIcon = $('.cancel-icon');
    
    let products = {};
    loadProductRoutes('../../').then(routes => { products = routes; });
    
    searchIcon.click(function() {
        searchBox.addClass('active');
        searchIcon.addClass('active');
        searchInput.addClass('active');
        cancelIcon.addClass('active');
        searchInput.focus();
    });
    
    cancelIcon.click(function() {
        searchBox.removeClass('active');
        searchIcon.removeClass('active');
        searchInput.removeClass('active');
        cancelIcon.removeClass('active');
        searchInput.val('');
        hideSearchResults();
    });
    
    searchInput.on('input', function() {
        const query = $(this).val().toLowerCase();
        if (query.length > 0) {
            const results = Object.keys(products).filter(product => 
                product.includes(query)
            );
            showSearchResults(results, products);
        } else {
            hideSearchResults();
        }
    });
    
    function showSearchResults(results, products) {
        let dropdown = $('.search-dropdown');
        
        if (dropdown.length === 0) {
            dropdown = $('<div class="search-dropdown"></div>');
            dropdown.css({
                'position': 'absolute',
                'top': '55px',
                'left': '0',
                'width': '100%',
                'background': 'white',
                'border': '1px solid #e0e0e0',
                'border-radius': '8px',
                'box-shadow': '0 4px 12px rgba(0,0,0,0.15)',
                'max-height': '300px',
                'overflow-y': 'auto',
                'z-index': '9999',
                'padding': '8px 0'
            });
            searchBox.append(dropdown);
        }
        
        if (results.length > 0) {
            let html = '';
            results.forEach(result => {
                html += `
                    <div class="search-result-item" data-url="${products[result]}" style="
                        padding: 12px 16px;
                        cursor: pointer;
                        transition: background 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        border-bottom: 1px solid #f0f0f0;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#664AFF">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span style="color: #333; font-size: 14px; text-transform: capitalize; flex: 1;">${result}</span>
                    </div>
                `;
            });
            dropdown.html(html).show();
            
            $('.search-result-item').hover(
                function() { $(this).css('background', '#f8f9fa'); },
                function() { $(this).css('background', 'white'); }
            ).click(function() {
                const url = $(this).data('url');
                window.location.href = url;
            });
        } else {
            dropdown.hide();
        }
    }
    
    function hideSearchResults() {
        $('.search-dropdown').hide();
    }
    
    $(document).click(function(e) {
        if (!searchBox[0].contains(e.target)) {
            searchBox.removeClass('active');
            searchIcon.removeClass('active');
            searchInput.removeClass('active');
            cancelIcon.removeClass('active');
            searchInput.val('');
            hideSearchResults();
        }
    });
}

// Smooth scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.team-member').forEach(el => {
    observer.observe(el);
});

// Photo enlargement animation
document.querySelectorAll('.member-photo img').forEach(img => {
    img.addEventListener('click', function() {
        document.querySelectorAll('.member-photo img').forEach(otherImg => {
            if (otherImg !== this) {
                otherImg.classList.remove('enlarged');
            }
        });
        
        this.classList.toggle('enlarged');
        
        if (this.classList.contains('enlarged')) {
            setTimeout(() => {
                this.classList.remove('enlarged');
            }, 3000);
        }
    });
    
    img.addEventListener('mouseleave', function() {
        this.classList.remove('enlarged');
    });
});