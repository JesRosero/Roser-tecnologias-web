// ============================================================
// Configuración Supabase - Roser Tecnologías
// Reemplaza los valores con los de tu proyecto en:
// Supabase Dashboard → Project Settings → API
// ============================================================
const SUPABASE_URL = 'https://usazecwhbsxrtyijchpl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzYXplY3doYnN4cnR5aWpjaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTQzMzEsImV4cCI6MjA4OTE3MDMzMX0.TLqiJQDCjNAZAWrCn_TNaieq2khaf7ecnic4alNM4mo';  // la que copiaste con el botón Copy

async function getProducts() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&stock=eq.true&order=created_at.asc`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error('Error al cargar productos: ' + res.status);
    return res.json();
}

if (typeof window !== 'undefined') {
    window.ProductsDB = { getProducts };
}
if (typeof module !== 'undefined') {
    module.exports = { getProducts };
}
