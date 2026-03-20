const SUPABASE_URL = 'https://usazecwhbsxrtyijchpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYXplY3doYnN4cnR5aWpjaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTQzMzEsImV4cCI6MjA4OTE3MDMzMX0.TLqiJQDCjNAZAWrCn_TNaieq2khaf7ecnic4alNM4mo';
const BUCKET = 'productos';

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

let galleryFiles = [];
let galleryUrls = [];
// colorData[i] = { name, hex, existingUrls[], newFiles[] }
let colorData = [];

// ── Comprimir imagen ──────────────────────────────────────
async function compressImage(file, maxWidth = 1200, quality = 0.82) {
    return new Promise(resolve => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/webp' })), 'image/webp', quality);
        };
        img.src = url;
    });
}

// ── Subir imagen ───────────────────────────────────────────
async function uploadImage(file, path) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': file.type,
            'x-upsert': 'true',
            'cache-control': '3600'
        },
        body: file
    });
    if (!res.ok) { const e = await res.text(); throw new Error('Error subiendo imagen: ' + e); }
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ── Cargar lista ───────────────────────────────────────────
async function loadProducts() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, { headers });
    const products = await res.json();
    renderList(products);
}

function renderList(products) {
    const container = document.getElementById('productsList');
    if (!products.length) { container.innerHTML = '<p class="loading">No hay productos aún.</p>'; return; }
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image || ''}" alt="${p.name}" onerror="this.src='../Imagenes/Rosero.png'">
            <div class="product-card-info">
                <h3>${p.name}</h3>
                <p class="price">$${Number(p.price).toLocaleString('es-CO')} COP</p>
                <p>${(p.categories || []).join(', ')}</p>
            </div>
            <span class="badge ${p.stock ? '' : 'out'}">${p.stock ? 'Activo' : 'Sin stock'}</span>
            <div class="card-actions">
                <button class="btn-view" onclick="window.open('../Marketplace/productos/producto-dinamico.html?id=${p.id}','_blank')">Ver</button>
                <button class="btn-edit" onclick="editProduct('${p.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteProduct('${p.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// ── Toggle sección colores ─────────────────────────────────
document.getElementById('hasColors').addEventListener('change', function () {
    document.getElementById('colorsSection').classList.toggle('hidden', !this.checked);
    document.getElementById('gallerySection').classList.toggle('hidden', this.checked);
});

// ── Agregar bloque de color ────────────────────────────────
document.getElementById('addColorBtn').addEventListener('click', () => addColorBlock());

const PRESET_COLORS = [
    { name: 'Negro',    hex: '#1a1a1a' },
    { name: 'Blanco',   hex: '#ffffff' },
    { name: 'Gris',     hex: '#9e9e9e' },
    { name: 'Rojo',     hex: '#e53935' },
    { name: 'Azul',     hex: '#1e88e5' },
    { name: 'Verde',    hex: '#43a047' },
    { name: 'Amarillo', hex: '#fdd835' },
    { name: 'Naranja',  hex: '#fb8c00' },
    { name: 'Morado',   hex: '#8e24aa' },
    { name: 'Rosa',     hex: '#e91e8c' },
    { name: 'Café',     hex: '#6d4c41' },
    { name: 'Celeste',  hex: '#29b6f6' },
];

function addColorBlock(name = '', hex = '#1a1a1a', existingUrls = []) {
    const idx = colorData.length;
    colorData.push({ name, hex, existingUrls: [...existingUrls], newFiles: [] });

    const container = document.getElementById('colorsContainer');
    const div = document.createElement('div');
    div.className = 'color-block';
    div.dataset.colorIdx = idx;
    div.innerHTML = `
        <div class="color-block-header">
            <input type="color" class="color-swatch-input" value="${hex}" onchange="colorData[${idx}].hex = this.value; this.closest('.color-block').querySelector('.color-swatch-input').value = this.value;">
            <input type="text" placeholder="Nombre del color (ej: Negro)" value="${name}"
                oninput="colorData[${idx}].name = this.value">
            <button type="button" class="btn-remove-color" onclick="removeColorBlock(this, ${idx})">✕</button>
        </div>
        <div class="color-preset-bar">
            ${PRESET_COLORS.map(c => `
                <button type="button" class="color-preset" style="background:${c.hex}" title="${c.name}"
                    onclick="selectPresetColor(this, ${idx}, '${c.name}', '${c.hex}')">
                </button>
            `).join('')}
        </div>
        <div class="upload-area" style="position:relative;padding:10px;text-align:center;margin-top:8px">
            <input type="file" accept="image/png, image/jpg, image/jpeg, image/webp" multiple style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%"
                onchange="handleColorImages(this, ${idx})">
            <span style="color:#888;font-size:0.82rem">📁 Subir imágenes para este color</span>
        </div>
        <div class="color-gallery-preview" id="colorPreview_${idx}">
            ${existingUrls.map((url, i) => colorThumbHTML(url, idx, i, 'url')).join('')}
        </div>
    `;
    container.appendChild(div);
}

window.selectPresetColor = function(btn, idx, name, hex) {
    colorData[idx].hex = hex;
    colorData[idx].name = name;
    const block = btn.closest('.color-block');
    block.querySelector('.color-swatch-input').value = hex;
    block.querySelector('input[type="text"]').value = name;
    block.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

function colorThumbHTML(src, colorIdx, imgIdx, type) {
    return `<div class="gallery-thumb" data-cidx="${colorIdx}" data-iidx="${imgIdx}" data-type="${type}">
        <img src="${src}" alt="">
        <button type="button" class="remove-thumb" onclick="removeColorImage(this)">✕</button>
    </div>`;
}

function handleColorImages(input, colorIdx) {
    Array.from(input.files).forEach(file => {
        const iidx = colorData[colorIdx].newFiles.length;
        colorData[colorIdx].newFiles.push(file);
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById(`colorPreview_${colorIdx}`);
            preview.insertAdjacentHTML('beforeend', colorThumbHTML(e.target.result, colorIdx, iidx, 'file'));
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

function removeColorImage(btn) {
    const div = btn.parentElement;
    const cidx = parseInt(div.dataset.cidx);
    const iidx = parseInt(div.dataset.iidx);
    const type = div.dataset.type;
    if (type === 'file') colorData[cidx].newFiles.splice(iidx, 1);
    else colorData[cidx].existingUrls.splice(iidx, 1);
    div.remove();
}

function removeColorBlock(btn, idx) {
    btn.closest('.color-block').remove();
    colorData.splice(idx, 1);
    // Re-indexar bloques restantes
    document.querySelectorAll('.color-block').forEach((el, i) => {
        el.dataset.colorIdx = i;
    });
}

// ── Preview imagen principal ───────────────────────────────
document.getElementById('imageFileMain').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('imagePreviewMain').src = e.target.result;
        document.getElementById('imagePreviewMain').classList.remove('hidden');
        document.getElementById('uploadPlaceholderMain').classList.add('hidden');
        document.getElementById('image_url').value = '';
    };
    reader.readAsDataURL(file);
});

// ── Preview galería general ────────────────────────────────
document.getElementById('imageFileGallery').addEventListener('change', function () {
    Array.from(this.files).forEach(file => {
        galleryFiles.push(file);
        const reader = new FileReader();
        reader.onload = e => addGalleryThumb(e.target.result, galleryFiles.length - 1, 'file');
        reader.readAsDataURL(file);
    });
    this.value = '';
});

function addGalleryThumb(src, index, type) {
    const preview = document.getElementById('galleryPreview');
    const div = document.createElement('div');
    div.className = 'gallery-thumb';
    div.dataset.index = index;
    div.dataset.type = type;
    div.innerHTML = `<img src="${src}" alt=""><button type="button" class="remove-thumb" onclick="removeGalleryThumb(this)">✕</button>`;
    preview.appendChild(div);
}

function removeGalleryThumb(btn) {
    const div = btn.parentElement;
    const index = parseInt(div.dataset.index);
    const type = div.dataset.type;
    if (type === 'file') galleryFiles.splice(index, 1);
    else galleryUrls.splice(index, 1);
    div.remove();
}

// ── Specs ──────────────────────────────────────────────────
document.getElementById('addSpecBtn').addEventListener('click', () => addSpecRow());
document.getElementById('addFeatureBtn').addEventListener('click', () => addFeatureRow());

function addFeatureRow(value = '') {
    const container = document.getElementById('featuresContainer');
    const div = document.createElement('div');
    div.className = 'spec-row';
    div.innerHTML = `
        <input type="text" placeholder="Ej: Material resistente y duradero" class="feature-value" value="${value}" style="flex:1">
        <button type="button" class="btn-remove-spec" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(div);
}

function getFeatures() {
    return Array.from(document.querySelectorAll('.feature-value'))
        .map(i => i.value.trim()).filter(Boolean);
}

function addSpecRow(key = '', value = '') {
    const container = document.getElementById('specsContainer');
    const div = document.createElement('div');
    div.className = 'spec-row';
    div.innerHTML = `
        <input type="text" placeholder="Ej: Material" class="spec-key" value="${key}">
        <input type="text" placeholder="Ej: PLA de alta calidad" class="spec-value" value="${value}">
        <button type="button" class="btn-remove-spec" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(div);
}

function getSpecs() {
    const specs = {};
    document.querySelectorAll('#specsContainer .spec-row').forEach(row => {
        const k = row.querySelector('.spec-key')?.value.trim();
        const v = row.querySelector('.spec-value')?.value.trim();
        if (k && v) specs[k] = v;
    });
    return specs;
}

// ── Guardar producto ───────────────────────────────────────
document.getElementById('productForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('formMessage');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    msg.className = 'message hidden';

    try {
        const id = document.getElementById('productId2').value.trim();
        const hasColors = document.getElementById('hasColors').checked;

        // Imagen principal
        const mainFile = document.getElementById('imageFileMain').files[0];
        let imageUrl = document.getElementById('image_url').value.trim();
        if (mainFile) {
            const compressed = await compressImage(mainFile);
            imageUrl = await uploadImage(compressed, `${id}/main.webp`);
        }
        if (!imageUrl) throw new Error('Debes subir una imagen principal o pegar una URL');

        // Galería general o colores
        let uploadedGallery = [...galleryUrls];
        let uploadedColors = [];

        if (hasColors) {
            btn.textContent = 'Subiendo imágenes de colores...';
            for (let ci = 0; ci < colorData.length; ci++) {
                const c = colorData[ci];
                if (!c.name.trim()) throw new Error(`El color #${ci + 1} no tiene nombre. Escribe un nombre como "Rojo" o "Negro".`);
                const colorName = c.name.trim();
                const urls = [...c.existingUrls];
                for (let fi = 0; fi < c.newFiles.length; fi++) {
                    const f = c.newFiles[fi];
                    const compressed = await compressImage(f);
                    const url = await uploadImage(compressed, `${id}/colors/${colorName}/${Date.now()}_${fi}.webp`);
                    urls.push(url);
                }
                uploadedColors.push({ name: colorName, hex: c.hex, images: urls });
            }
        } else {
            btn.textContent = 'Subiendo galería...';
            for (let i = 0; i < galleryFiles.length; i++) {
                const f = galleryFiles[i];
                const compressed = await compressImage(f);
                const url = await uploadImage(compressed, `${id}/gallery_${Date.now()}_${i}.webp`);
                uploadedGallery.push(url);
            }
        }

        const categories = document.getElementById('categories').value.split(',').map(c => c.trim()).filter(Boolean);

        const product = {
            id,
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            price: parseInt(document.getElementById('productPrice').value.replace(/\D/g, '')),
            preparation_days: parseInt(document.getElementById('preparation_days').value),
            categories,
            image: imageUrl,
            gallery_images: hasColors ? [] : uploadedGallery,
            colors: hasColors ? uploadedColors : [],
            specs: getSpecs(),
            features: getFeatures(),
            whatsapp_message: document.getElementById('whatsapp_message').value.trim(),
            stock: document.getElementById('stock').checked,
            frequently_bought_ids: fbtSelected.map(p => p.id),
            detail_url: `../productos/producto-dinamico.html?id=${id}`
        };

        const isEdit = document.getElementById('productId').value !== '';
        const url = isEdit
            ? `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`
            : `${SUPABASE_URL}/rest/v1/products`;

        btn.textContent = 'Guardando en base de datos...';
        const res = await fetch(url, {
            method: isEdit ? 'PATCH' : 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(isEdit ? { ...product, id: undefined } : product)
        });

        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Error al guardar'); }

        msg.textContent = isEdit ? '✓ Producto actualizado' : '✓ Producto creado — ya disponible en el marketplace';
        msg.className = 'message success';
        resetForm();
        loadProducts();

    } catch (err) {
        msg.textContent = '✗ ' + err.message;
        msg.className = 'message error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Producto';
    }
});

// ── Editar ─────────────────────────────────────────────────
async function editProduct(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`, { headers });
    const [p] = await res.json();
    if (!p) return;

    resetForm();

    document.getElementById('form-title').textContent = 'Editar Producto';
    document.getElementById('productId').value = p.id;
    document.getElementById('productId2').value = p.id;
    document.getElementById('productId2').disabled = true;
    document.getElementById('productName').value = p.name;
    const formattedPrice = Number(p.price).toLocaleString('es-CO');
    document.getElementById('productPrice').value = formattedPrice;
    document.getElementById('priceDisplay').innerHTML = `<span>$${formattedPrice} COP</span>`;
    document.getElementById('productDescription').value = p.description || '';
    document.getElementById('preparation_days').value = p.preparation_days;
    document.getElementById('categories').value = (p.categories || []).join(',');
    selectedCategories = [...(p.categories || [])];
    renderCategoryTags();
    document.getElementById('whatsapp_message').value = p.whatsapp_message || '';
    document.getElementById('image_url').value = p.image || '';
    document.getElementById('stock').checked = p.stock;

    // Comprados juntos
    fbtSelected = [];
    const fbtIds = p.frequently_bought_ids || [];
    fbtIds.forEach(id => {
        const found = allProductsCache.find(x => x.id === id);
        if (found) fbtSelected.push(found);
    });
    renderFbtSelected();

    if (p.image) {
        document.getElementById('imagePreviewMain').src = p.image;
        document.getElementById('imagePreviewMain').classList.remove('hidden');
        document.getElementById('uploadPlaceholderMain').classList.add('hidden');
    }

    // Colores
    const colors = p.colors || [];
    if (colors.length) {
        document.getElementById('hasColors').checked = true;
        document.getElementById('colorsSection').classList.remove('hidden');
        document.getElementById('gallerySection').classList.add('hidden');
        colors.forEach(c => addColorBlock(c.name, c.hex, c.images || []));
    } else {
        galleryUrls = [...(p.gallery_images || [])];
        galleryUrls.forEach((url, i) => addGalleryThumb(url, i, 'url'));
    }

    // Specs
    Object.entries(p.specs || {}).forEach(([k, v]) => addSpecRow(k, v));

    // Features
    (p.features || []).forEach(f => addFeatureRow(f));

    document.getElementById('cancelBtn').classList.remove('hidden');
    document.getElementById('submitBtn').textContent = 'Actualizar Producto';
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ── Eliminar ───────────────────────────────────────────────
async function deleteProduct(id) {
    if (!confirm(`¿Eliminar "${id}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers });
    if (res.ok) loadProducts();
    else alert('Error al eliminar');
}

// ── Reset ──────────────────────────────────────────────────
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productId2').disabled = false;
    document.getElementById('form-title').textContent = 'Nuevo Producto';
    document.getElementById('submitBtn').textContent = 'Guardar Producto';
    document.getElementById('cancelBtn').classList.add('hidden');
    document.getElementById('imagePreviewMain').classList.add('hidden');
    document.getElementById('uploadPlaceholderMain').classList.remove('hidden');
    document.getElementById('galleryPreview').innerHTML = '';
    document.getElementById('featuresContainer').innerHTML = '';
    document.getElementById('colorsSection').classList.add('hidden');
    document.getElementById('gallerySection').classList.remove('hidden');
    document.getElementById('hasColors').checked = false;
    document.getElementById('specsContainer').innerHTML = `
        <div class="spec-row">
            <input type="text" placeholder="Ej: Material" class="spec-key">
            <input type="text" placeholder="Ej: PLA de alta calidad" class="spec-value">
            <button type="button" class="btn-remove-spec" onclick="this.parentElement.remove()">✕</button>
        </div>`;
    selectedCategories = [];
    renderCategoryTags();
    document.getElementById('categories').value = '';
    fbtSelected = [];
    renderFbtSelected();
    galleryFiles = [];
    galleryUrls = [];
    colorData = [];
}

document.getElementById('cancelBtn').addEventListener('click', resetForm);

// -- Generar ID aleatorio --
document.getElementById('generateIdBtn').addEventListener('click', () => {
    const name = document.getElementById('productName').value.trim();
    const base = name
        ? name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        : 'producto';
    const suffix = Math.random().toString(36).slice(2, 6);
    document.getElementById('productId2').value = `${base}-${suffix}`;
});

// -- Precio formateado --
const priceInput = document.getElementById('productPrice');
priceInput.addEventListener('input', function() {
    const raw = this.value.replace(/\D/g, '');
    if (!raw) { this.value = ''; document.getElementById('priceDisplay').innerHTML = ''; return; }
    const num = parseInt(raw);
    this.value = num.toLocaleString('es-CO');
    document.getElementById('priceDisplay').innerHTML = `<span>$${num.toLocaleString('es-CO')} COP</span>`;
});

// ── Comprados juntos ──
let fbtSelected = []; // [{id, name, image}]
let allProductsCache = [];

async function loadAllProductsCache() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,image&order=name.asc`, { headers });
    allProductsCache = await res.json();
}

function renderFbtDropdown(filter) {
    const dropdown = document.getElementById('fbtDropdown');
    const currentId = document.getElementById('productId2').value.trim();
    const filtered = allProductsCache.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) &&
        !fbtSelected.find(s => s.id === p.id) &&
        p.id !== currentId
    ).slice(0, 8);
    if (!filtered.length) { dropdown.classList.remove('open'); return; }
    dropdown.innerHTML = filtered.map(p => `
        <div class="category-option fbt-option" onclick="addFbtProduct('${p.id}')">
            <img src="${p.image || ''}" onerror="this.style.display='none'" style="width:32px;height:32px;object-fit:contain;border-radius:3px;margin-right:8px;vertical-align:middle;border:1px solid #eee">
            ${p.name}
        </div>
    `).join('');
    dropdown.classList.add('open');
}

window.addFbtProduct = function(id) {
    if (fbtSelected.length >= 3) return;
    const p = allProductsCache.find(x => x.id === id);
    if (!p || fbtSelected.find(s => s.id === id)) return;
    fbtSelected.push(p);
    document.getElementById('fbtSearch').value = '';
    document.getElementById('fbtDropdown').classList.remove('open');
    renderFbtSelected();
};

window.removeFbtProduct = function(id) {
    fbtSelected = fbtSelected.filter(p => p.id !== id);
    renderFbtSelected();
};

function renderFbtSelected() {
    document.getElementById('frequently_bought_ids').value = fbtSelected.map(p => p.id).join(',');
    document.getElementById('fbtSelectedList').innerHTML = fbtSelected.map(p => `
        <div class="fbt-tag">
            <img src="${p.image || ''}" onerror="this.style.display='none'" style="width:28px;height:28px;object-fit:contain;border-radius:3px;border:1px solid #eee">
            <span>${p.name}</span>
            <button type="button" onclick="removeFbtProduct('${p.id}')">x</button>
        </div>
    `).join('');
}

document.getElementById('fbtSearch').addEventListener('input', function() {
    renderFbtDropdown(this.value);
});
document.getElementById('fbtSearch').addEventListener('focus', function() {
    renderFbtDropdown(this.value || '');
});
document.addEventListener('click', e => {
    if (!e.target.closest('#fbtSelectorWrapper'))
        document.getElementById('fbtDropdown').classList.remove('open');
});

// ── Selector de categorías ─────────────────────────────────
let selectedCategories = [];
let allKnownCategories = [];

async function loadAllCategories() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=categories`, { headers });
    const rows = await res.json();
    const set = new Set();
    rows.forEach(r => (r.categories || []).forEach(c => set.add(c)));
    allKnownCategories = [...set].sort();
}

function renderDropdown(filter) {
    const dropdown = document.getElementById('categoryDropdown');
    const filtered = allKnownCategories.filter(c =>
        c.toLowerCase().includes(filter.toLowerCase()) && !selectedCategories.includes(c)
    );
    if (!filtered.length) { dropdown.classList.remove('open'); return; }
    dropdown.innerHTML = filtered.map(c =>
        `<div class="category-option" onclick="addCategory('${c}')">${c}</div>`
    ).join('');
    dropdown.classList.add('open');
}

window.addCategory = function(cat) {
    cat = cat.trim();
    if (!cat || selectedCategories.includes(cat)) return;
    selectedCategories.push(cat);
    if (!allKnownCategories.includes(cat)) allKnownCategories.push(cat);
    document.getElementById('categories').value = selectedCategories.join(',');
    document.getElementById('categorySearch').value = '';
    document.getElementById('categoryDropdown').classList.remove('open');
    renderCategoryTags();
};

window.removeCategory = function(cat) {
    selectedCategories = selectedCategories.filter(c => c !== cat);
    document.getElementById('categories').value = selectedCategories.join(',');
    renderCategoryTags();
};

function renderCategoryTags() {
    document.getElementById('categoryTags').innerHTML = selectedCategories.map(c =>
        `<span class="category-tag">${c}<button type="button" onclick="removeCategory('${c}')">x</button></span>`
    ).join('');
}

document.getElementById('categorySearch').addEventListener('input', function() {
    if (this.value) renderDropdown(this.value);
    else renderDropdown('');
});

document.getElementById('categorySearch').addEventListener('focus', function() {
    renderDropdown(this.value);
});

document.addEventListener('click', e => {
    if (!e.target.closest('#categorySelectorWrapper'))
        document.getElementById('categoryDropdown').classList.remove('open');
});

loadProducts();
loadAllCategories();
loadAllProductsCache();
