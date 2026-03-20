// Variables del carrusel
let currentSlide = 0;
const totalSlides = 13;

// Función para cambiar slide
function changeSlide(direction) {
    const slides = document.getElementById('carouselSlides');
    const indicators = document.querySelectorAll('.indicator');
    
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Función para ir a un slide específico
function goToSlide(slideIndex) {
    const slides = document.getElementById('carouselSlides');
    const indicators = document.querySelectorAll('.indicator');
    
    currentSlide = slideIndex;
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Inicializar indicadores del carrusel
function initCarouselIndicators() {
    const indicatorsContainer = document.getElementById('carouselIndicators');
    
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('div');
        indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }
}

// Auto-play del carrusel (opcional)
function startAutoPlay() {
    setInterval(() => {
        changeSlide(1);
    }, 5000); // Cambia cada 5 segundos
}

// Animaciones y efectos para 3DCost

// Función para detectar cuando un elemento entra en el viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Función para detectar cuando un elemento está parcialmente visible
function isElementPartiallyVisible(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= windowHeight &&
        rect.left <= windowWidth
    );
}

// Animación de scroll reveal
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        if (isElementPartiallyVisible(element)) {
            element.classList.add('animate-visible');
        }
    });
}

// Efecto parallax suave para elementos flotantes
function parallaxEffect() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-icon');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
    });
}

// Efecto de hover mejorado para las tarjetas
function enhanceCardHovers() {
    const cards = document.querySelectorAll('.feature-card, .screenshot-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // Efecto de seguimiento del mouse
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `translateY(-10px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });
}

// Animación de contador para números
function animateCounters() {
    const counters = document.querySelectorAll('.step-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 50;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Iniciar animación cuando el elemento sea visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Efecto de escritura para títulos
function typewriterEffect() {
    const titles = document.querySelectorAll('.hero-section h1');
    
    titles.forEach(title => {
        const text = title.textContent;
        title.textContent = '';
        title.style.borderRight = '2px solid #2c5aa0';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                // Remover cursor después de completar
                setTimeout(() => {
                    title.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Iniciar después de un pequeño delay
        setTimeout(typeWriter, 500);
    });
}

// Navegación suave mejorada
function smoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Efecto de partículas flotantes
function createFloatingParticles() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        heroSection.appendChild(particle);
    }
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Lazy loading para imágenes
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Efecto de cursor personalizado
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Efectos en hover
    const interactiveElements = document.querySelectorAll('a, button, .feature-card, .screenshot-item');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
}

// Preloader
function initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'loading-animation';
    preloader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(preloader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 1000);
    });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar navbar existente y reinicializar con rutas correctas
    const existingNavbar = document.querySelector('.navbar');
    if (existingNavbar) {
        existingNavbar.remove();
    }
    
    // Inicializar componentes compartidos con rutas correctas
    NavbarComponent.init({
        logoPath: '../../../Imagenes/Rosero.png',
        homeUrl: '../../../Pagina Principal/index.html',
        marketplaceUrl: '../../../Marketplace/Pagina Marketplace/marketplace.html',
        marketplaceIcon: '../../../Marketplace/Iconos/Marketplace.png',
        cartIcon: '../../../Imagenes/Carrito.png',
        sidebarBasePath: '../../../'
    });
    
    PaymentModal.init({
        basePath: '../../../Marketplace/metodos de pago/'
    });
    
    CartSystem.init({
        imageBasePath: '../../../'
    });
    
    // Inicializar sidebar después de que el navbar esté listo
    setTimeout(() => {
        initializeSidebar();
        initializeSearch();
    }, 100);
    
    // Inicializar carrusel
    initCarouselIndicators();
    
    // Inicializar todas las funciones
    animateOnScroll();
    enhanceCardHovers();
    animateCounters();
    typewriterEffect();
    smoothScrolling();
    createFloatingParticles();
    initScrollToTop();
    initLazyLoading();
    
    // Inicializar preloader solo si no es una recarga
    if (!sessionStorage.getItem('visited')) {
        initPreloader();
        sessionStorage.setItem('visited', 'true');
    }
    
    // Optimización del scroll con throttling
    let ticking = false;
    function updateOnScroll() {
        animateOnScroll();
        parallaxEffect();
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });
    
    // Agregar clases de animación con delay escalonado
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = (index * 0.1) + 's';
    });
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
    loadProductRoutes('../../../').then(routes => { products = routes; });
    
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

// Initialize WhatsApp Widget
$(function () {
    $('#BotonWA').floatingWhatsApp({
        phone: '573113579437',
        headerTitle: 'Roser Tecnologías',
        popupMessage: '¡Hola! ¿En qué podemos ayudarte con 3DCost?',
        showPopup: true,
        position: "right",
        size: "60px",
        backgroundColor: '#25D366',
        zIndex: 9999
    });
});


