-- ============================================================
-- Migración a Supabase - Roser Tecnologías Marketplace
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    price       INTEGER NOT NULL,          -- en COP (pesos colombianos, sin decimales)
    categories  TEXT[] DEFAULT '{}',       -- array de categorías
    image       TEXT,                      -- URL de imagen principal
    detail_url  TEXT,                      -- ruta a la página de detalle
    preparation_days INTEGER DEFAULT 3,
    stock       BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Row Level Security (lectura pública, escritura solo autenticada)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública" ON products
    FOR SELECT USING (TRUE);

CREATE POLICY "Escritura autenticada" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Datos iniciales
-- ============================================================

INSERT INTO products (id, name, description, price, categories, image, detail_url, preparation_days) VALUES
(
    'organizador-magnetico',
    'Organizador Magnético De Cables Hasta 80cm Hexastack H1-80',
    'Organizador magnético de cables hasta 80cm, disponible en 5 colores',
    61069,
    ARRAY['impresion-3d', 'organizacion'],
    '../../Marketplace/productos/Organizador Magnético De Cables/Imagenes-Organizador/Negro/1.jpg',
    '../productos/Organizador Magnético De Cables/producto-organizador-magnetico.html',
    3
),
(
    'caja-tactica',
    'Caja Táctica Para Munición 9mm Roser Tactical Tacbox M9-v1',
    'Caja táctica profesional para almacenamiento seguro de munición 9mm',
    81400,
    ARRAY['impresion-3d', 'seguridad'],
    '../../Marketplace/productos/Caja Táctica Para Munición 9mm/Imagenes-caja-tactica/1.jpg',
    '../productos/Caja Táctica para Munición 9mm/producto-caja-tactica.html',
    2
),
(
    'caja-cables-cctv',
    'Caja Para Cables CCTV Cámaras De Seguridad',
    'Caja compacta organizadora para cables de cámaras CCTV con baluns y borneras',
    36900,
    ARRAY['impresion-3d', 'organizacion', 'seguridad'],
    '../../Marketplace/productos/Caja Para Cables CCTV Cámaras De Seguridad/Imagenes-Caja Para Cables CCTV/Negra/1.png',
    '../productos/Caja Para Cables CCTV Cámaras De Seguridad/producto-caja-cables-cctv.html',
    3
),
(
    'baluns-8-canales',
    'Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales',
    'Caja organizadora para cables de cámaras CCTV con baluns y borneras de 8 canales',
    49800,
    ARRAY['impresion-3d', 'organizacion', 'seguridad'],
    '../../Marketplace/productos/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/Imagenes-Baluns Y Borneras Caja Para Cables/1.png',
    '../productos/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/producto-baluns-8-canales.html',
    3
),
(
    'soporte-qr',
    'Soporte QR para Negocios',
    'Soporte universal para códigos QR de cualquier plataforma de pago digital',
    98000,
    ARRAY['impresion-3d', 'servicios'],
    '../productos/Soporte%20QR/Imagenes-Soporte%20QR/QR1.jpg',
    '../productos/Soporte QR/producto-soporte-qr.html',
    5
)
ON CONFLICT (id) DO NOTHING;
