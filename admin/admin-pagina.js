// ── Panel switcher ─────────────────────────────────────────
function switchPanel(panel) {
    document.getElementById('panelProductos').style.display = panel === 'productos' ? '' : 'none';
    document.getElementById('panelPaginaPrincipal').style.display = panel === 'pagina-principal' ? 'grid' : 'none';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === panel));
    if (panel === 'pagina-principal') initPaginaPrincipal();
}

// ── Config en Supabase (tabla: site_config) ────────────────
const CFG_URL = `${SUPABASE_URL}/rest/v1/site_config`;

async function getConfig(key) {
    const res = await fetch(`${CFG_URL}?key=eq.${key}&select=value`, { headers });
    const rows = await res.json();
    return rows[0]?.value ?? null;
}

async function setConfig(key, value) {
    await fetch(CFG_URL, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key, value })
    });
}

// ══════════════════════════════════════════════════════════
// CARRUSEL
// ══════════════════════════════════════════════════════════
let carouselItems = []; // { src, link, file? }

async function loadCarousel() {
    const saved = await getConfig('carousel_images');
    carouselItems = saved ? (typeof saved === 'string' ? JSON.parse(saved) : saved) : [];
    renderCarouselPreview();
}

function renderCarouselPreview() {
    const container = document.getElementById('carouselPreview');
    container.innerHTML = '';
    carouselItems.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'carousel-item-row';
        div.innerHTML = `
            <div class="carousel-thumb" style="flex-shrink:0">
                <img src="${item.src}" alt="">
                <span class="thumb-num">${i + 1}</span>
                <button type="button" class="remove-thumb" onclick="removeCarouselItem(${i})">✕</button>
            </div>
            <input type="text" class="carousel-link-input" value="${item.link || ''}" placeholder="Link al hacer clic (opcional, ej: /Marketplace/...)" oninput="carouselItems[${i}].link = this.value">
        `;
        container.appendChild(div);
    });
}

window.removeCarouselItem = function(idx) {
    carouselItems.splice(idx, 1);
    renderCarouselPreview();
};

document.getElementById('carouselFileInput').addEventListener('change', function () {
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            carouselItems.push({ src: e.target.result, link: '', file });
            renderCarouselPreview();
        };
        reader.readAsDataURL(file);
    });
    this.value = '';
});

document.getElementById('saveCarouselBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveCarouselBtn');
    const msg = document.getElementById('carouselMsg');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    msg.className = 'message hidden';

    try {
        const finalItems = [];

        // Leer links del DOM en el momento de guardar
        const linkInputs = document.querySelectorAll('.carousel-link-input');

        for (let i = 0; i < carouselItems.length; i++) {
            const item = carouselItems[i];
            const link = linkInputs[i] ? linkInputs[i].value.trim() : (item.link || '');
            let src = item.src;
            if (item.file) {
                btn.textContent = `Subiendo ${i + 1}/${carouselItems.length}...`;
                const compressed = await compressImage(item.file, 1400, 0.85);
                src = await uploadImage(compressed, `carousel/slide_${Date.now()}_${i}.webp`);
            }
            finalItems.push({ src, link });
        }

        await setConfig('carousel_images', JSON.stringify(finalItems));
        carouselItems = finalItems;
        renderCarouselPreview();
        msg.textContent = `✓ Carrusel guardado (${finalItems.length} imágenes)`;
        msg.className = 'message success';
    } catch (err) {
        msg.textContent = '✗ ' + err.message;
        msg.className = 'message error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Carrusel';
    }
});

// ══════════════════════════════════════════════════════════
// EXPLORA PRODUCTOS
// ══════════════════════════════════════════════════════════
const DEFAULT_CATEGORIAS = [
    { title: 'Impresiones 3D', img: '/Imagenes/i3d.png', url: '/Marketplace/Pagina Marketplace/marketplace.html' },
    { title: '3DCost',         img: '/Imagenes/3D.png',  url: '/Productos-Roser/Apps/3dcost/3dcost.html' },
    { title: 'DePie',          img: '/Imagenes/ceo.png', url: '/Productos-Roser/Prototipos/DePie/DePie.html' },
    { title: 'Diseño Mecánico',img: '/Imagenes/D_mecanico.png', url: '/Servicios/Diseño mecanico/diseno-mecanico.html' },
    { title: 'Diseño Eléctrico',img: '/Imagenes/D_electrico.png', url: '/Servicios/Diseño Electrico/diseno-electrico.html' },
];

let exploraData = [];
let exploraNewFiles = {};

// ── Modal imagen ───────────────────────────────────────────
let exploraImgTargetIdx = null;
let exploraImgPendingFile = null;

function openExploraImgModal(idx) {
    exploraImgTargetIdx = idx;
    exploraImgPendingFile = null;
    const fileInput = document.getElementById('exploraImgFileInput');
    const urlInput  = document.getElementById('exploraImgUrlInput');
    fileInput.value = '';
    urlInput.value  = exploraData[idx].img || '';
    setModalPreview(exploraData[idx].img);
    document.getElementById('exploraImgModal').style.display = 'flex';
}

function setModalPreview(src) {
    const img = document.getElementById('exploraImgPreview');
    const ph  = document.getElementById('exploraImgPreviewPlaceholder');
    if (src) { img.src = src; img.style.display = 'block'; ph.style.display = 'none'; }
    else     { img.style.display = 'none'; ph.style.display = 'block'; }
}

document.getElementById('exploraImgFileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    exploraImgPendingFile = file;
    document.getElementById('exploraImgUrlInput').value = '';
    const reader = new FileReader();
    reader.onload = e => setModalPreview(e.target.result);
    reader.readAsDataURL(file);
});

document.getElementById('exploraImgUrlInput').addEventListener('input', function() {
    exploraImgPendingFile = null;
    document.getElementById('exploraImgFileInput').value = '';
    setModalPreview(this.value.trim());
});

document.getElementById('exploraImgCancelBtn').addEventListener('click', () => {
    document.getElementById('exploraImgModal').style.display = 'none';
});

document.getElementById('exploraImgModal').addEventListener('click', e => {
    if (e.target === document.getElementById('exploraImgModal'))
        document.getElementById('exploraImgModal').style.display = 'none';
});

document.getElementById('exploraImgConfirmBtn').addEventListener('click', () => {
    const idx = exploraImgTargetIdx;
    if (exploraImgPendingFile) {
        exploraNewFiles[idx] = exploraImgPendingFile;
        exploraData[idx].img = document.getElementById('exploraImgPreview').src;
    } else {
        const url = document.getElementById('exploraImgUrlInput').value.trim();
        if (url) exploraData[idx].img = url;
        delete exploraNewFiles[idx];
    }
    document.getElementById('exploraImgModal').style.display = 'none';
    renderExploraCategorias();
});

async function loadExplora() {
    const saved = await getConfig('explora_categorias');
    exploraData = saved ? (typeof saved === 'string' ? JSON.parse(saved) : saved) : JSON.parse(JSON.stringify(DEFAULT_CATEGORIAS));
    exploraNewFiles = {};
    renderExploraCategorias();
}

function renderExploraCategorias() {
    const container = document.getElementById('exploraCategorias');
    container.innerHTML = '';

    exploraData.forEach((cat, i) => {
        const card = document.createElement('div');
        card.className = 'explora-card';
        card.dataset.idx = i;

        // Botón eliminar
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'explora-remove-btn';
        removeBtn.title = 'Eliminar';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            exploraData.splice(i, 1);
            exploraNewFiles = {};
            renderExploraCategorias();
        });

        // Imagen — abre modal
        const imgWrap = document.createElement('div');
        imgWrap.className = 'explora-card-img';
        imgWrap.title = 'Clic para cambiar imagen';
        imgWrap.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = cat.img || '../Imagenes/Rosero.png';
        img.alt = '';
        img.onerror = () => { img.src = '../Imagenes/Rosero.png'; };

        imgWrap.appendChild(img);
        imgWrap.addEventListener('click', () => openExploraImgModal(i));

        // Campos título y URL
        const fields = document.createElement('div');
        fields.className = 'explora-card-fields';

        const titleWrap = document.createElement('div');
        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Título';
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = cat.title;
        titleInput.placeholder = 'Nombre de la categoría';
        titleInput.addEventListener('input', () => { exploraData[i].title = titleInput.value; });
        titleWrap.appendChild(titleLabel);
        titleWrap.appendChild(titleInput);

        const urlWrap = document.createElement('div');
        const urlLabel = document.createElement('label');
        urlLabel.textContent = 'Enlace (URL)';
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.value = cat.url;
        urlInput.placeholder = '/ruta/a/pagina.html';
        urlInput.addEventListener('input', () => { exploraData[i].url = urlInput.value; });
        urlWrap.appendChild(urlLabel);
        urlWrap.appendChild(urlInput);

        fields.appendChild(titleWrap);
        fields.appendChild(urlWrap);

        card.appendChild(removeBtn);
        card.appendChild(imgWrap);
        card.appendChild(fields);
        container.appendChild(card);
    });
}

document.getElementById('addExploraBtn').addEventListener('click', () => {
    exploraData.push({ title: '', img: '/Imagenes/Rosero.png', url: '' });
    renderExploraCategorias();
    document.getElementById('exploraCategorias').lastElementChild?.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('saveExploraBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveExploraBtn');
    const msg = document.getElementById('exploraMsg');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    msg.className = 'message hidden';

    try {
        for (const [idx, file] of Object.entries(exploraNewFiles)) {
            const compressed = await compressImage(file, 400, 0.85);
            const url = await uploadImage(compressed, `explora/cat_${idx}_${Date.now()}.webp`);
            exploraData[idx].img = url;
        }
        exploraNewFiles = {};

        await setConfig('explora_categorias', JSON.stringify(exploraData));
        renderExploraCategorias();
        msg.textContent = '✓ Categorías guardadas';
        msg.className = 'message success';
    } catch (err) {
        msg.textContent = '✗ ' + err.message;
        msg.className = 'message error';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Categorías';
    }
});

// ── Init ───────────────────────────────────────────────────
let paginaInited = false;
function initPaginaPrincipal() {
    if (paginaInited) return;
    paginaInited = true;
    loadCarousel();
    loadExplora();
}
