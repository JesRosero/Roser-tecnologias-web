-- Ejecutar en Supabase SQL Editor
-- Elimina políticas anteriores y crea las correctas para el bucket 'productos'

DELETE FROM storage.policies WHERE bucket_id = 'productos';

INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES
  ('Acceso total anon', 'productos', 'SELECT', 'true'),
  ('Acceso total anon', 'productos', 'INSERT', 'true'),
  ('Acceso total anon', 'productos', 'UPDATE', 'true'),
  ('Acceso total anon', 'productos', 'DELETE', 'true');
