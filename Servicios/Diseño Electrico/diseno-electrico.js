document.addEventListener('DOMContentLoaded', function() {
    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }

    NavbarComponent.init({
        logoPath: '../../Imagenes/Rosero.png',
        homeUrl: '../../Pagina Principal/index.html',
        marketplaceUrl: '../../Marketplace/Pagina Marketplace/marketplace.html',
        marketplaceIcon: '../../Marketplace/Iconos/Marketplace.png',
        cartIcon: '../../Imagenes/Carrito.png',
        sidebarBasePath: '../../'
    });

    PaymentModal.init({
        basePath: '../../Marketplace/metodos de pago/'
    });

    CartSystem.init({
        imageBasePath: '../../'
    });

    setTimeout(() => {
        initializeSidebar();
        initializeSearch();
    }, 100);

    $('#BotonWA').floatingWhatsApp({
        phone: '573113579437',
        headerTitle: 'Roser Tecnologías',
        popupMessage: '¡Hola! ¿En qué podemos ayudarte con diseño eléctrico?',
        showPopup: true,
        position: "right",
        size: "60px",
        backgroundColor: '#25D366',
        zIndex: 9999
    });

    // Manejar el botón de cotizar del hero
    const heroBtn = document.querySelector('.hero .cta-button');
    if (heroBtn) {
        heroBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const message = 'Hola, me interesa solicitar una cotización para Diseño Eléctrico.';
            const url = `https://wa.me/573113579437?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        });
    }
});

function initializeSidebar() {
    const menuButton = document.querySelector('.menu-button');
    const hamburger = document.querySelector('.hamburger');
    const dropdown = document.querySelector('.sidebar-dropdown');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const appsHeader = document.querySelector('.apps-header');
    const prototypesHeader = document.querySelector('.prototypes-header');
    
    if (menuButton && dropdown) {
        menuButton.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    
    if (hamburger && dropdown) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target) && !menuButton?.contains(e.target) && !hamburger?.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const subsection = this.nextElementSibling;
            const arrow = this.querySelector('.section-arrow');
            
            if (subsection) {
                subsection.classList.toggle('active');
                if (arrow) {
                    arrow.style.transform = subsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    });
    
    if (prototypesHeader) {
        prototypesHeader.addEventListener('click', function() {
            const prototypeSubsection = document.querySelector('.prototype-subsection');
            const arrow = this.querySelector('.section-arrow');
            
            if (prototypeSubsection) {
                prototypeSubsection.classList.toggle('active');
                if (arrow) {
                    arrow.style.transform = prototypeSubsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    }
    
    if (appsHeader) {
        appsHeader.addEventListener('click', function() {
            const subSubsection = document.querySelector('.sub-subsection');
            const arrow = this.querySelector('.section-arrow');
            
            if (subSubsection) {
                subSubsection.classList.toggle('active');
                if (arrow) {
                    arrow.style.transform = subSubsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            }
        });
    }
}

function initializeSearch() {
    const searchBox = $('.search-box');
    const searchIcon = $('.search-icon');
    const searchInput = $('.search-box input[type="text"]');
    const cancelIcon = $('.cancel-icon');
    
    if (!searchBox.length || !searchInput.length) return;
    
    let products = {};
    loadProductRoutes('../../').then(routes => { products = routes; });
    
    searchIcon.on('click', function() {
        searchBox.addClass('active');
        searchIcon.addClass('active');
        searchInput.addClass('active');
        cancelIcon.addClass('active');
        searchInput.focus();
    });
    
    cancelIcon.on('click', function() {
        searchBox.removeClass('active');
        searchIcon.removeClass('active');
        searchInput.removeClass('active');
        cancelIcon.removeClass('active');
        searchInput.val('');
        $('.search-dropdown').remove();
    });
    
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-box').length) {
            searchBox.removeClass('active');
            searchIcon.removeClass('active');
            searchInput.removeClass('active');
            cancelIcon.removeClass('active');
            searchInput.val('');
            $('.search-dropdown').remove();
        }
    });
    
    searchInput.on('input', function() {
        const query = $(this).val().toLowerCase();
        if (query.length > 0) {
            const results = Object.keys(products).filter(product => product.includes(query));
            showSearchResults(results, products, searchBox);
        } else {
            $('.search-dropdown').remove();
        }
    });
}

function showSearchResults(results, products, searchBox) {
    let dropdown = $('.search-dropdown');
    
    if (dropdown.length === 0) {
        dropdown = $('<div class="search-dropdown"></div>').css({
            position: 'absolute',
            top: '50px',
            left: '0',
            width: '100%',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '8px 0'
        });
        searchBox.append(dropdown);
    }
    
    if (results.length > 0) {
        dropdown.empty();
        results.forEach(result => {
            const item = $('<div></div>').css({
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }).html(`
                <span style="color: #664AFF; font-size: 18px; line-height: 1;">★</span>
                <span style="color: #333; font-size: 14px; text-transform: capitalize; flex: 1;">${result}</span>
            `).hover(
                function() { $(this).css('background', '#f8f9fa'); },
                function() { $(this).css('background', 'white'); }
            ).on('click', function() {
                window.location.href = products[result];
            });
            dropdown.append(item);
        });
        dropdown.show();
    } else {
        dropdown.hide();
    }
}
