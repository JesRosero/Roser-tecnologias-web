const SUPABASE_URL = 'https://usazecwhbsxrtyijchpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYXplY3doYnN4cnR5aWpjaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTQzMzEsImV4cCI6MjA4OTE3MDMzMX0.TLqiJQDCjNAZAWrCn_TNaieq2khaf7ecnic4alNM4mo';

// Cache en memoria para no repetir fetch
let _routesCache = null;

async function loadProductRoutes(prefix = '') {
    if (_routesCache) {
        return buildRoutes(_routesCache, prefix);
    }
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=id,name,detail_url&order=name.asc`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    _routesCache = await res.json();
    return buildRoutes(_routesCache, prefix);
}

function buildRoutes(products, prefix) {
    const routes = {};
    products.forEach(p => {
        // Clave por ID y por nombre (lowercase) para búsqueda flexible
        const url = prefix + `Marketplace/productos/producto-dinamico.html?id=${p.id}`;
        routes[p.id] = url;
        routes[p.name.toLowerCase()] = url;
    });
    return routes;
}

// Compatibilidad con código existente que llama getProductRoutes() de forma síncrona
// Ahora devuelve un objeto vacío hasta que se cargue; usar loadProductRoutes() para async
function getProductRoutes(prefix = '') {
    if (_routesCache) return buildRoutes(_routesCache, prefix);
    return {};
}
