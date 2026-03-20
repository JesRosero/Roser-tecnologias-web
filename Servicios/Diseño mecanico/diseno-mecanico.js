// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar navbar existente y reinicializar con rutas correctas
    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    
    // Inicializar componentes compartidos con rutas correctas
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
    
    // Inicializar sidebar y búsqueda después de que el navbar esté listo
    setTimeout(() => {
        initializeSidebar();
        initializeSearch();
    }, 100);
    
    // Inicializar WhatsApp Widget
    $('#BotonWA').floatingWhatsApp({
        phone: '573113579437',
        headerTitle: 'Roser Tecnologías',
        popupMessage: '¡Hola! ¿En qué podemos ayudarte con diseño mecánico?',
        showPopup: true,
        position: "right",
        size: "60px",
        backgroundColor: '#25D366',
        zIndex: 9999
    });
    
    // Cargar servicios
    loadServices();
});

// Función para inicializar sidebar
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

// Función de búsqueda
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

// Services Data
const services = [
    {
        id: 1,
        name: "Diseño de Piezas Mecánicas",
        description: "Diseño CAD de piezas mecánicas personalizadas con especificaciones técnicas detalladas",
        details: [
            "Modelado 3D preciso",
            "Especificaciones técnicas",
            "Tolerancias dimensionales",
            "Selección de materiales"
        ],
        icon: "Diseños mecanicos/3.png"
    },
    {
        id: 2,
        name: "Diseño de Ensambles",
        description: "Diseño completo de ensambles mecánicos con análisis de interferencias",
        details: [
            "Ensambles complejos",
            "Análisis de interferencias",
            "Lista de materiales (BOM)",
            "Explosionados técnicos"
        ],
        icon: "Diseños mecanicos/4.png"
    },
    {
        id: 3,
        name: "Planos Técnicos",
        description: "Elaboración de planos técnicos normalizados para fabricación",
        details: [
            "Planos normalizados",
            "Vistas y cortes técnicos",
            "Acotación detallada",
            "Notas de fabricación"
        ],
        icon: "Diseños mecanicos/5.png"
    },
    {
        id: 4,
        name: "Diseño de Mecanismos",
        description: "Diseño de mecanismos y sistemas de transmisión de movimiento",
        details: [
            "Sistemas de transmisión",
            "Análisis cinemático",
            "Cálculo de fuerzas",
            "Optimización de movimiento"
        ],
        icon: "Diseños mecanicos/6.png"
    }
];

function loadServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = services.map(service => `
        <div class="service-card" data-id="${service.id}">
            <div class="service-icon">
                <img src="${service.icon}" alt="${service.name}">
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <ul class="service-details">
                ${service.details.map(detail => `<li>✓ ${detail}</li>`).join('')}
            </ul>
            <button class="btn-add-cart" onclick="cotizarServicio(${service.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                </svg>
                Cotizar Servicio
            </button>
        </div>
    `).join('');
}

function cotizarServicio(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    const message = `¡Hola! Me gustaría solicitar cotización para:\n\n${service.name}\n${service.description}\n\n¿Podrían proporcionarme más información?`;
    const whatsappUrl = `https://wa.me/573113579437?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Zoom on Scroll Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('zoomed');
        }
    });
}, observerOptions);

setTimeout(() => {
    document.querySelectorAll('.zoom-on-scroll').forEach(element => {
        observer.observe(element);
        element.addEventListener('click', () => {
            element.classList.remove('zoomed');
            setTimeout(() => {
                element.classList.add('zoomed');
            }, 10);
        });
    });
    
    const heroImage = document.querySelector('.slide-in-right');
    if (heroImage) {
        heroImage.addEventListener('click', () => {
            heroImage.style.animation = 'none';
            setTimeout(() => {
                heroImage.style.animation = 'slideInRight 1s ease-out forwards';
            }, 10);
        });
    }
}, 100);
