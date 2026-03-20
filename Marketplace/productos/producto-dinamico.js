const SUPABASE_URL = 'https://usazecwhbsxrtyijchpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYXplY3doYnN4cnR5aWpjaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTQzMzEsImV4cCI6MjA4OTE3MDMzMX0.TLqiJQDCjNAZAWrCn_TNaieq2khaf7ecnic4alNM4mo';

let currentProduct = null;

async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return showError();

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
            { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        const [product] = await res.json();
        if (!product) return showError();

        currentProduct = product;
        renderProduct(product);
        const fbtIds = product.frequently_bought_ids || [];
        if (fbtIds.length) loadFrequentlyBought(product, fbtIds);
        loadRelated(product);
        loadReviews(product.id);
    } catch {
        showError();
    }
}

function renderProduct(p) {
    document.title = `${p.name} - Roser Tecnologías`;

    // Textos
    document.getElementById('productName').textContent = p.name;
    const priceFormatted = `$${Number(p.price).toLocaleString('es-CO')} COP`;
    document.getElementById('buyBoxPrice').textContent = priceFormatted;
    document.getElementById('productDescription').textContent = p.description || '';
    document.getElementById('productPrep').textContent = `${p.preparation_days} días hábiles`;

    // Configuración de Rating estilo: 4.6 de ★★★★★ (9,734)
    const rating = p.rating || 5;
    const count = p.rating_count || 0;
    const starsStr = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    
    const starsEl = document.getElementById('productStars');
    if (starsEl && starsEl.parentElement) {
        starsEl.parentElement.innerHTML = `<span class="rating-score">${Number(rating).toFixed(1)} de</span><span id="productStars" class="stars">${starsStr}</span><span id="productRating" class="rating-count">(${count.toLocaleString('es-CO')})</span>`;
    }

    // Galería o colores
    const colors = p.colors || [];
    if (colors.length) {
        renderColorSelector(colors);
        renderGallery(colors[0].images || [p.image]);
    } else {
        const allImages = [p.image, ...(p.gallery_images || [])].filter(Boolean);
        renderGallery(allImages);
    }

    // Features (Acerca de este producto)
    const features = p.features || [];
    const descEl = document.getElementById('productDescription');
    if (features.length) {
        descEl.outerHTML = `<ul id="productDescription" class="product-features">${
            features.map(f => `<li>${f}</li>`).join('')
        }</ul>`;
    } else {
        descEl.textContent = p.description || '';
    }

    // Specs
    const specs = p.specs || {};
    if (Object.keys(specs).length) {
        document.getElementById('specsTable').innerHTML = Object.entries(specs).map(([k, v]) => `
            <tr><td><strong>${k}:</strong></td><td>${v}</td></tr>
        `).join('');
        document.getElementById('productSpecs').style.display = '';
    }

    // WhatsApp
    $('#BotonWA').floatingWhatsApp({
        phone: '573113579437',
        headerTitle: 'Roser Tecnologías',
        popupMessage: p.whatsapp_message || `¡Hola! ¿En qué podemos ayudarte?`,
        showPopup: true,
        position: 'right',
        size: '60px',
        backgroundColor: '#25D366',
        zIndex: 9999
    });

    // Mostrar página
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('productPage').classList.remove('hidden');

    initImageZoom();
}

async function loadRelated(p) {
    const cats = (p.categories || []);
    if (!cats.length) return;

    const catsParam = `{${cats.join(',')}}`;
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=neq.${p.id}&stock=eq.true&categories=ov.${encodeURIComponent(catsParam)}&select=id,name,price,image,categories`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const all = await res.json();
    const grid = document.getElementById('relatedGrid');
    if (!all.length) { grid.closest('.related-products').style.display = 'none'; return; }

    const scored = all.map(r => ({
        ...r,
        score: (r.categories || []).filter(c => cats.includes(c)).length
    })).sort((a, b) => b.score - a.score);

    grid.innerHTML = scored.map(r => `
        <div class="related-item" onclick="window.location.href='producto-dinamico.html?id=${r.id}'">
            <img src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'">
            <h3>${r.name}</h3>
            <p class="price">$${Number(r.price).toLocaleString('es-CO')} COP</p>
        </div>
    `).join('');

}

async function loadFrequentlyBought(main, ids) {
    const idsParam = ids.map(id => `"${id}"`).join(',');
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=in.(${ids.join(',')})&select=id,name,price,image`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const companions = await res.json();
    if (Array.isArray(companions) && companions.length) renderFrequentlyBought(main, companions);
}

function renderFrequentlyBought(main, companions) {
    if (!companions.length) return;
    const section = document.getElementById('frequentlyBought');
    const itemsEl = document.getElementById('fbtItems');
    const summaryEl = document.getElementById('fbtSummary');

    // Estado de checks
    const checked = [true, ...companions.map(() => true)];
    const allProducts = [main, ...companions];

    function calcTotal() {
        return allProducts.reduce((sum, p, i) => checked[i] ? sum + Number(p.price) : sum, 0);
    }

    function renderItems() {
        itemsEl.innerHTML = allProducts.map((p, i) => `
            <div class="fbt-item">
                <input type="checkbox" class="fbt-item-check" ${checked[i] ? 'checked' : ''}
                    onchange="fbtToggle(${i})" ${i === 0 ? 'disabled' : ''}>
                <img src="${p.image}" alt="${p.name}" onerror="this.style.opacity='0'">
                <p>${i === 0 ? '<strong>Este producto:</strong> ' : ''}${p.name}</p>
                <span class="fbt-price">$${Number(p.price).toLocaleString('es-CO')} COP</span>
            </div>
            ${i < allProducts.length - 1 ? '<span class="fbt-plus">+</span>' : ''}
        `).join('');
    }

    function renderSummary() {
        const total = calcTotal();
        const count = checked.filter(Boolean).length;
        summaryEl.innerHTML = `
            <div class="fbt-total-label">Precio total: <span class="fbt-total-price">$${total.toLocaleString('es-CO')} COP</span></div>
            <button class="fbt-add-btn" onclick="fbtAddAll()">Agregar ${count > 1 ? 'ambos' : 'al'} al carrito</button>
            <div class="fbt-info">
                <span>ℹ️</span>
                <span>Vendidos por Roser Tecnologías</span>
            </div>
        `;
    }

    window.fbtToggle = function(idx) {
        if (idx === 0) return;
        checked[idx] = !checked[idx];
        renderSummary();
    };

    window.fbtAddAll = function() {
        allProducts.forEach((p, i) => {
            if (!checked[i]) return;
            const existing = cart.find(c => c.id === p.id);
            if (existing) existing.quantity += 1;
            else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
        let toast = document.getElementById('cartToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cartToast';
            toast.className = 'cart-toast';
            toast.innerHTML = '<span>✅</span><span>Productos agregados al carrito</span>';
            document.body.appendChild(toast);
        }
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
    };

    renderItems();
    renderSummary();
    section.style.display = '';
}

function renderGallery(images) {
    const allImages = images.filter(Boolean);
    if (!allImages.length) return;
    const mainImg = document.getElementById('mainImage');
    mainImg.src = allImages[0];
    mainImg.alt = currentProduct?.name || '';

    // Preload imagen principal
    const preload = new Image();
    preload.src = allImages[0];

    const MAX = 6;
    const thumbGallery = document.getElementById('thumbnailGallery');
    thumbGallery.innerHTML = allImages.slice(0, MAX).map((src, i) => `
        <img src="${src}" class="thumbnail ${i === 0 ? 'active' : ''}" loading="lazy" onclick="changeMainImage(this)" alt="">
    `).join('');

    if (allImages.length > MAX) {
        thumbGallery.insertAdjacentHTML('beforeend',
            `<div class="thumbnail-more" onclick="openGalleryModal()">+${allImages.length - MAX}</div>`);
    }
    currentGalleryImages = allImages;
}

let currentGalleryImages = [];

function renderColorSelector(colors) {
    const actionsDiv = document.querySelector('.product-actions');
    const existing = document.getElementById('colorSelector');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = 'colorSelector';
    div.className = 'color-selector';
    div.innerHTML = `
        <label>Color: <strong id="selectedColorName">${colors[0].name}</strong></label>
        <div class="color-options">
            ${colors.map((c, i) => `
                <button class="color-circle ${i === 0 ? 'active' : ''}" 
                    style="background:${c.hex}" 
                    title="${c.name}"
                    onclick="selectColor(this, ${i})">
                </button>
            `).join('')}
        </div>
    `;
    actionsDiv.insertBefore(div, actionsDiv.firstChild);

    window._productColors = colors;
    window._selectedColorIdx = 0;
}

window._selectedColorIdx = 0;

window.selectColor = function(btn, idx) {
    document.querySelectorAll('.color-circle').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window._selectedColorIdx = idx;
    const color = window._productColors[idx];
    const nameEl = document.getElementById('selectedColorName');
    if (nameEl) nameEl.textContent = color.name;
    renderGallery(color.images || []);
};

window.openGalleryModal = function() {
    const modal = document.getElementById('galleryModal');
    if (!modal) return;
    const body = document.getElementById('galleryModalBody');
    body.innerHTML = currentGalleryImages.map(src => `
        <img src="${src}" class="gallery-modal-img" onclick="changeMainImage(this); closeGalleryModal()">
    `).join('');
    modal.style.display = 'flex';
};

window.closeGalleryModal = function() {
    const modal = document.getElementById('galleryModal');
    if (modal) modal.style.display = 'none';
};

function showError() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
}

// ── Zoom estilo Amazon ─────────────────────────────────────
function initImageZoom() {
    const container = document.getElementById('mainImageContainer');
    const lens      = document.getElementById('zoomLens');
    const result    = document.getElementById('zoomResult');
    const zoomImg   = document.getElementById('zoomImage');
    const mainImg   = document.getElementById('mainImage');
    if (!container) return;

    const LENS_SIZE = 150;
    const ZOOM      = 2.5;

    // Calcula el rect real de la imagen dentro del contenedor (object-fit: contain)
    function getImageBounds() {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const natW = mainImg.naturalWidth  || cw;
        const natH = mainImg.naturalHeight || ch;
        const scale = Math.min(cw / natW, ch / natH);
        const rendW = natW * scale;
        const rendH = natH * scale;
        return {
            left:   (cw - rendW) / 2,
            top:    (ch - rendH) / 2,
            width:  rendW,
            height: rendH
        };
    }

    container.addEventListener('mousemove', e => {
        const cr = container.getBoundingClientRect();
        const ib = getImageBounds();
        const x  = e.clientX - cr.left;
        const y  = e.clientY - cr.top;

        // Solo activar si el cursor está sobre la imagen real
        if (x < ib.left || x > ib.left + ib.width ||
            y < ib.top  || y > ib.top  + ib.height) {
            lens.style.display   = 'none';
            result.style.display = 'none';
            return;
        }

        // Lens limitado a los bordes de la imagen
        const lx = Math.min(Math.max(x - LENS_SIZE / 2, ib.left), ib.left + ib.width  - LENS_SIZE);
        const ly = Math.min(Math.max(y - LENS_SIZE / 2, ib.top),  ib.top  + ib.height - LENS_SIZE);
        lens.style.left    = lx + 'px';
        lens.style.top     = ly + 'px';
        lens.style.width   = LENS_SIZE + 'px';
        lens.style.height  = LENS_SIZE + 'px';
        lens.style.display = 'block';

        // Imagen del zoom sincronizada con la posición del cursor
        zoomImg.src = mainImg.src;
        const ratioX = (x - ib.left) / ib.width;
        const ratioY = (y - ib.top)  / ib.height;
        const zw = ib.width  * ZOOM;
        const zh = ib.height * ZOOM;
        zoomImg.style.width  = zw + 'px';
        zoomImg.style.height = zh + 'px';
        zoomImg.style.left   = -(ratioX * zw - result.offsetWidth  / 2) + 'px';
        zoomImg.style.top    = -(ratioY * zh - result.offsetHeight / 2) + 'px';

        result.style.display = 'block';
    });

    container.addEventListener('mouseleave', () => {
        lens.style.display   = 'none';
        result.style.display = 'none';
    });
}

window.changeMainImage = function(thumb) {
    const mainImg = document.getElementById('mainImage');
    mainImg.classList.add('img-loading');
    mainImg.onload = () => mainImg.classList.remove('img-loading');
    mainImg.src = thumb.src;
    document.getElementById('zoomImage').src = thumb.src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
};

window.addToCartProduct = function() {
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    const colors = window._productColors;
    const selectedColor = colors?.length ? colors[window._selectedColorIdx || 0] : null;
    const cartImage = selectedColor?.images?.[0] || currentProduct.image;
    const cartName = selectedColor ? `${currentProduct.name} - ${selectedColor.name}` : currentProduct.name;
    const cartId = selectedColor ? `${currentProduct.id}-${selectedColor.name}` : currentProduct.id;

    const existing = cart.find(i => i.id === cartId);
    if (existing) existing.quantity += qty;
    else cart.push({ id: cartId, name: cartName, price: currentProduct.price, image: cartImage, quantity: qty });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();

    // Sonido
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(); osc.stop(ctx.currentTime + 0.3);

    // Toast
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.className = 'cart-toast';
        toast.innerHTML = '<span class="toast-icon">✅</span><span>Agregado al carrito</span>';
        document.body.appendChild(toast);
    }
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);

    // Botón
    const btn = document.querySelector('.add-to-cart-btn');
    btn.textContent = '¡Agregado!';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Agregar al Carrito'; btn.classList.remove('added'); }, 2000);
};

window.contactWhatsApp = function() {
    const msg = currentProduct?.whatsapp_message || `¡Hola! Estoy interesado en: ${currentProduct?.name}`;
    window.open(`https://wa.me/573113579437?text=${encodeURIComponent(msg)}`, '_blank');
};

// ── Auth ──
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

async function initAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    updateAuthBtn();
    updateReviewForm();
}

function updateAuthBtn() {
    const btn = document.getElementById('authNavBtn');
    if (!btn) return;
    if (currentUser) {
        const name = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
        btn.textContent = `👤 ${name}`;
        btn.classList.add('logged');
        btn.onclick = authLogout;
    } else {
        btn.textContent = 'Iniciar sesión';
        btn.classList.remove('logged');
        btn.onclick = openAuthModal;
    }
}

function updateReviewForm() {
    const form = document.querySelector('.review-form-box');
    const loginPrompt = document.getElementById('reviewLoginPrompt');
    if (!form) return;
    if (currentUser) {
        const name = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
        form.style.display = '';
        if (loginPrompt) loginPrompt.style.display = 'none';
        document.getElementById('reviewAuthor').value = name;
        document.getElementById('reviewAuthor').readOnly = true;
        form.querySelector('.review-form-sub').textContent = `Publicando como ${name}`;
    } else {
        form.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = '';
    }
}

window.openAuthModal = function() {
    document.getElementById('authModal').style.display = 'flex';
    showLogin();
};
window.closeAuthModal = function() {
    document.getElementById('authModal').style.display = 'none';
};
window.showLogin = function() {
    document.getElementById('authLogin').style.display = '';
    document.getElementById('authRegister').style.display = 'none';
    document.getElementById('authMsg').textContent = '';
};
window.showRegister = function() {
    document.getElementById('authLogin').style.display = 'none';
    document.getElementById('authRegister').style.display = '';
    document.getElementById('regMsg').textContent = '';
};

window.authLogin = async function() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const msg = document.getElementById('authMsg');
    if (!email || !password) { msg.textContent = 'Completa todos los campos.'; msg.className = 'auth-msg error'; return; }
    msg.textContent = 'Entrando...';
    msg.className = 'auth-msg';
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { msg.textContent = error.message; msg.className = 'auth-msg error'; return; }
    currentUser = data.user;
    updateAuthBtn();
    updateReviewForm();
    closeAuthModal();
};

window.generateUsername = function() {
    const email = document.getElementById('regEmail').value.trim();
    const base = email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') : 'usuario';
    document.getElementById('regUsername').value = base + Math.floor(Math.random() * 100);
};

window.generatePassword = function() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!';
    const pwd = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const input = document.getElementById('regPassword');
    input.value = pwd;
    input.type = 'text';
    setTimeout(() => input.type = 'password', 2000);
};

window.clearRegUsername = function() {};

window.togglePass = function(id, btn) {
    const input = document.getElementById(id);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁️';
};


window.authRegister = async function() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('regMsg');
    if (!username || !email || !password) { msg.textContent = 'Completa todos los campos.'; msg.className = 'auth-msg error'; return; }
    if (password.length < 6) { msg.textContent = 'La contraseña debe tener mínimo 6 caracteres.'; msg.className = 'auth-msg error'; return; }
    msg.textContent = 'Creando cuenta...';
    msg.className = 'auth-msg';
    const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { username } } });
    if (error) { msg.textContent = error.message; msg.className = 'auth-msg error'; return; }
    if (data.user && !data.session) {
        msg.textContent = '✅ Revisa tu correo para confirmar la cuenta.';
        msg.className = 'auth-msg success';
    } else {
        currentUser = data.user;
        updateAuthBtn();
        updateReviewForm();
        closeAuthModal();
    }
};

window.authLogout = async function() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    updateAuthBtn();
    updateReviewForm();
};

$(document).ready(() => { loadProduct(); initAuth(); });

// ── Reseñas ──
let selectedRating = 0;

document.getElementById('starPicker').addEventListener('click', e => {
    const v = parseInt(e.target.dataset.v);
    if (!v) return;
    selectedRating = v;
    document.querySelectorAll('#starPicker span').forEach((s, i) => {
        s.classList.toggle('active', i < v);
    });
});

document.getElementById('starPicker').addEventListener('mouseover', e => {
    const v = parseInt(e.target.dataset.v);
    if (!v) return;
    document.querySelectorAll('#starPicker span').forEach((s, i) => {
        s.classList.toggle('hover', i < v);
    });
});

document.getElementById('starPicker').addEventListener('mouseleave', () => {
    document.querySelectorAll('#starPicker span').forEach(s => s.classList.remove('hover'));
});

async function loadReviews(productId) {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?product_id=eq.${productId}&order=created_at.desc&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const reviews = await res.json();
    renderReviews(reviews);
    updateProductRatingDisplay(reviews);
}

function renderReviews(reviews) {
    const list = document.getElementById('reviewsList');
    const summary = document.getElementById('reviewsSummary');

    if (!reviews.length) {
        list.innerHTML = '<p class="no-reviews">Aún no hay opiniones. ¡Sé el primero!</p>';
        summary.innerHTML = '';
        return;
    }

    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const total = reviews.length;
    const counts = [5,4,3,2,1].map(n => ({ n, c: reviews.filter(r => r.rating === n).length }));

    summary.innerHTML = `
        <div class="reviews-avg-row">
            <span class="avg-number">${avg.toFixed(1)}</span>
            <span class="avg-stars">${starsHTML(avg)}</span>
        </div>
        <p class="avg-label">${total} calificación${total !== 1 ? 'es' : ''} globales</p>
        <div class="reviews-bars">
            ${counts.map(({n, c}) => {
                const pct = total ? Math.round(c / total * 100) : 0;
                return `<div class="bar-row">
                    <a href="#">${n} estrella${n !== 1 ? 's' : ''}</a>
                    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                    <span class="bar-pct">${pct}%</span>
                </div>`;
            }).join('')}
        </div>
    `;

    list.innerHTML = reviews.map(r => {
        const initial = r.author.trim()[0].toUpperCase();
        const date = new Date(r.created_at).toLocaleDateString('es-CO', {year:'numeric', month:'long', day:'numeric'});
        return `
        <div class="review-card" data-id="${r.id}">
            <div class="review-card-top">
                <div class="review-avatar">${initial}</div>
                <span class="review-author">${escapeHtml(r.author)}</span>
            </div>
            <div class="review-rating-row">
                <span class="review-stars">${starsHTML(r.rating)}</span>
            </div>
            <p class="review-date">Publicado el ${date} · <span class="review-time-ago">${timeAgo(r.created_at)}</span></p>
            <p class="review-comment review-comment-text">${escapeHtml(r.comment)}</p>
            ${currentUser && (currentUser.user_metadata?.username || currentUser.email.split('@')[0]) === r.author ? `
            <div class="review-actions">
                <button class="review-edit-btn" onclick="editReview('${r.id}', '${escapeHtml(r.author)}', ${r.rating}, '${escapeHtml(r.comment).replace(/'/g, "&#39;")}')">✏️ Editar</button>
                <button class="review-delete-btn" onclick="deleteReview('${r.id}')">🗑️ Borrar</button>
            </div>` : ''}
        </div>`;
    }).join('');
}

function updateProductRatingDisplay(reviews) {
    if (!reviews.length) return;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    
    const scoreEl = document.querySelector('.rating-score');
    if (scoreEl) scoreEl.textContent = `${avg.toFixed(1)} de`;
    
    document.getElementById('productStars').textContent = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
    document.getElementById('productRating').textContent = `(${reviews.length.toLocaleString('es-CO')})`;
}

window.submitReview = async function() {
    if (!currentUser) { openAuthModal(); return; }
    const author = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
    const comment = document.getElementById('reviewComment').value.trim();
    const msg = document.getElementById('reviewMsg');

    if (!selectedRating) { msg.textContent = 'Selecciona una puntuación.'; msg.className = 'review-msg error'; return; }
    if (!comment) { msg.textContent = 'Escribe un comentario.'; msg.className = 'review-msg error'; return; }

    const btn = document.querySelector('.review-submit-btn');
    btn.disabled = true;
    btn.textContent = editingReviewId ? 'Guardando...' : 'Publicando...';

    let res;
    if (editingReviewId) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${editingReviewId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ author, rating: selectedRating, comment })
        });
    } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ product_id: currentProduct.id, author, rating: selectedRating, comment })
        });
    }

    btn.disabled = false;
    btn.textContent = 'Publicar reseña';

    if (res.ok) {
        msg.textContent = editingReviewId ? '✅ ¡Reseña actualizada!' : '✅ ¡Reseña publicada!';
        msg.className = 'review-msg success';
        document.getElementById('reviewAuthor').value = '';
        document.getElementById('reviewComment').value = '';
        selectedRating = 0;
        editingReviewId = null;
        document.querySelectorAll('#starPicker span').forEach(s => s.classList.remove('active'));
        btn.textContent = 'Publicar opinión';
        loadReviews(currentProduct.id);
    } else {
        msg.textContent = 'Error al publicar. Intenta de nuevo.';
        msg.className = 'review-msg error';
    }
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins || 1} minuto${mins !== 1 ? 's' : ''}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} hora${hrs !== 1 ? 's' : ''}`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `hace ${days} día${days !== 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
    return `hace ${Math.floor(months / 12)} año${Math.floor(months / 12) !== 1 ? 's' : ''}`;
}

function starsHTML(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let editingReviewId = null;

window.editReview = function(id, author, rating, comment) {
    // Cerrar cualquier edición inline previa
    document.querySelectorAll('.review-inline-edit').forEach(el => el.remove());
    document.querySelectorAll('.review-comment-text').forEach(el => el.style.display = '');
    document.querySelectorAll('.review-actions').forEach(el => el.style.display = '');

    const card = document.querySelector(`.review-card[data-id="${id}"]`);
    if (!card) return;

    const commentEl = card.querySelector('.review-comment');
    const actionsEl = card.querySelector('.review-actions');
    commentEl.style.display = 'none';
    actionsEl.style.display = 'none';

    let inlineRating = rating;
    const starsHtml = [1,2,3,4,5].map(v =>
        `<span class="inline-star ${v <= rating ? 'active' : ''}" data-v="${v}">★</span>`
    ).join('');

    const form = document.createElement('div');
    form.className = 'review-inline-edit';
    form.innerHTML = `
        <div class="inline-star-picker">${starsHtml}</div>
        <textarea class="inline-textarea" rows="3" maxlength="500">${comment}</textarea>
        <div class="inline-actions">
            <button class="inline-save-btn">Guardar</button>
            <button class="inline-cancel-btn">Cancelar</button>
        </div>
        <p class="inline-msg"></p>
    `;
    actionsEl.insertAdjacentElement('beforebegin', form);

    // Estrellas inline
    form.querySelectorAll('.inline-star').forEach(s => {
        s.addEventListener('click', () => {
            inlineRating = parseInt(s.dataset.v);
            form.querySelectorAll('.inline-star').forEach((st, i) => st.classList.toggle('active', i < inlineRating));
        });
        s.addEventListener('mouseover', () => {
            const v = parseInt(s.dataset.v);
            form.querySelectorAll('.inline-star').forEach((st, i) => st.classList.toggle('hover', i < v));
        });
    });
    form.querySelector('.inline-star-picker').addEventListener('mouseleave', () => {
        form.querySelectorAll('.inline-star').forEach(st => st.classList.remove('hover'));
    });

    // Cancelar
    form.querySelector('.inline-cancel-btn').addEventListener('click', () => {
        form.remove();
        commentEl.style.display = '';
        actionsEl.style.display = '';
    });

    // Guardar
    form.querySelector('.inline-save-btn').addEventListener('click', async () => {
        const newComment = form.querySelector('.inline-textarea').value.trim();
        const msgEl = form.querySelector('.inline-msg');
        if (!inlineRating) { msgEl.textContent = 'Selecciona una puntuación.'; msgEl.className = 'inline-msg error'; return; }
        if (!newComment) { msgEl.textContent = 'Escribe un comentario.'; msgEl.className = 'inline-msg error'; return; }

        const saveBtn = form.querySelector('.inline-save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ author, rating: inlineRating, comment: newComment })
        });

        if (res.ok) {
            loadReviews(currentProduct.id);
        } else {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
            msgEl.textContent = 'Error al guardar.';
            msgEl.className = 'inline-msg error';
        }
    });

    form.querySelector('.inline-textarea').focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.deleteReview = async function(id) {
    if (!confirm('¿Borrar esta reseña?')) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        }
    });
    if (res.ok) {
        loadReviews(currentProduct.id);
    } else {
        const err = await res.text();
        console.error('DELETE error', res.status, err);
        alert('No se pudo borrar. Revisa la consola (F12).');
    }
};
