const SUPABASE_URL_IDX = 'https://usazecwhbsxrtyijchpl.supabase.co';
const SUPABASE_KEY_IDX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYXplY3doYnN4cnR5aWpjaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTQzMzEsImV4cCI6MjA4OTE3MDMzMX0.TLqiJQDCjNAZAWrCn_TNaieq2khaf7ecnic4alNM4mo';

async function getSiteConfig(key) {
    const res = await fetch(`${SUPABASE_URL_IDX}/rest/v1/site_config?key=eq.${key}&select=value`, {
        headers: { 'apikey': SUPABASE_KEY_IDX, 'Authorization': `Bearer ${SUPABASE_KEY_IDX}` }
    });
    const rows = await res.json();
    return rows[0]?.value ?? null;
}

async function loadDynamicCarousel() {
    const saved = await getSiteConfig('carousel_images');
    if (!saved) return;
    const items = typeof saved === 'string' ? JSON.parse(saved) : saved;
    if (!items.length) return;

    const slider = document.querySelector('.image-slider');
    const barsContainer = document.querySelector('.progress-bars');
    const pauseBtn = barsContainer.querySelector('.pause-btn');

    slider.innerHTML = items.map((item, i) =>
        `<div class="slide${i === 0 ? ' active' : ''}">
            <img src="${item.src}" loading="${i === 0 ? 'eager' : 'lazy'}" alt="">
            ${item.link ? `<a href="${item.link}" class="slide-link-btn">Ver más</a>` : ''}
        </div>`
    ).join('');

    const bars = items.map((_, i) =>
        `<div class="progress-bar${i === 0 ? ' active' : ''}" data-slide="${i}"><div class="progress-fill"></div></div>`
    ).join('');
    barsContainer.innerHTML = '';
    barsContainer.appendChild(pauseBtn);
    barsContainer.insertAdjacentHTML('beforeend', bars);

    // Reinicializar slider con los nuevos elementos
    initSlider();
}

async function loadDynamicExplora() {
    const saved = await getSiteConfig('explora_categorias');
    if (!saved) return;
    const cats = typeof saved === 'string' ? JSON.parse(saved) : saved;
    if (!cats || !cats.length) return;

    const container = document.querySelector('.categories-container');
    if (!container) return;

    const PAGE = 5;
    let page = 0;
    const totalPages = Math.ceil(cats.length / PAGE);

    function renderPage() {
        const start = page * PAGE;
        container.innerHTML = cats.slice(start, start + PAGE).map(cat => `
            <div class="category-card" onclick="window.location.href='${cat.url}'">
                <img src="${cat.img}" alt="${cat.title}" style="object-fit:contain;padding:20px">
                <h3>${cat.title}</h3>
            </div>
        `).join('');
    }

    renderPage();

    if (cats.length > PAGE) {
        const prevBtn = document.getElementById('catPrev');
        const nextBtn = document.getElementById('catNext');
        prevBtn.style.display = '';
        nextBtn.style.display = '';

        prevBtn.addEventListener('click', () => {
            page = (page - 1 + totalPages) % totalPages;
            renderPage();
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        });
        nextBtn.addEventListener('click', () => {
            page = (page + 1) % totalPages;
            renderPage();
        });
    }
}

$(function () {
    Promise.all([loadDynamicCarousel(), loadDynamicExplora()]).finally(() => {
        setTimeout(() => initializeApp(), 100);
    });
});

function initializeApp() {
    // Inicializar componentes
    PaymentModal.init({ basePath: '/Marketplace/metodos de pago/' });
    CartSystem.init({ imageBasePath: '/' });
    
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

    // Cart icon click
    $('.cart-icon').click(() => CartSystem.open());
    $('.close').click(() => CartSystem.close());
    $(window).click((event) => {
        if (event.target.id === 'cartModal') CartSystem.close();
    });
    
    // Search functionality
    const searchBox = $('.search-box');
    const searchIcon = $('.search-icon');
    const searchInput = $('.search-box input');
    const cancelIcon = $('.cancel-icon');
    
    // Product database — cargado dinámicamente desde Supabase
    let products = {};
    loadProductRoutes('../').then(routes => { products = routes; });

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
    
    // Close search when clicking outside
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
    // Contact form
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        let whatsappMessage = `Hola Roser Tecnologías, me contacto desde el sitio web:\n\n`;
        whatsappMessage += `Nombre: ${name}\n`;
        whatsappMessage += `Email: ${email}\n`;
        whatsappMessage += `Mensaje: ${message}`;
        
        const whatsappUrl = `https://wa.me/573113579437?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });
}