-- ============================================================
--  Base de datos: mercado_libre
--  Panel de administrador - Mercado Libre
--  Motor: PostgreSQL 18
-- ============================================================
--  Cómo ejecutarlo:
--    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f "database\mercado_libre.sql"
--  (Pedirá la contraseña del usuario postgres)
-- ============================================================

-- 1) Crear la base de datos (si no existe).
--    Si ya existe, ignora el error con \gexec.
SELECT 'CREATE DATABASE mercado_libre'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mercado_libre')\gexec

\connect mercado_libre

-- 2) Borrar tablas previas para poder re-ejecutar el script limpiamente.
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS tiendas CASCADE;

-- ============================================================
--  TABLAS
-- ============================================================

-- Tiendas registradas
CREATE TABLE tiendas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    propietario VARCHAR(120),
    email       VARCHAR(120),
    telefono    VARCHAR(30),
    direccion   VARCHAR(200),
    ciudad      VARCHAR(80),
    estado      VARCHAR(30) NOT NULL DEFAULT 'activa',
    creado_en   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Usuarios (vendedores/compradores) asociados opcionalmente a una tienda
CREATE TABLE usuarios (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(120) NOT NULL,
    email     VARCHAR(120) NOT NULL UNIQUE,
    telefono  VARCHAR(30),
    rol           VARCHAR(30) NOT NULL DEFAULT 'vendedor',
    tienda_id     INTEGER REFERENCES tiendas(id) ON DELETE SET NULL,
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    -- Hash de la contraseña. El servidor lo genera al arrancar
    -- usando la contraseña por defecto 123456 para los registros de prueba.
    password_hash TEXT,
    creado_en     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Productos publicados por una tienda
CREATE TABLE productos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio      NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    categoria   VARCHAR(80),
    tienda_id   INTEGER REFERENCES tiendas(id) ON DELETE CASCADE,
    creado_en   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ventas (se usan para las estadísticas del panel)
CREATE TABLE ventas (
    id          SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    cantidad    INTEGER NOT NULL DEFAULT 1,
    total       NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
--  DATOS DE PRUEBA
-- ============================================================

INSERT INTO tiendas (nombre, propietario, email, telefono, direccion, ciudad, estado) VALUES
('TecnoMundo',      'Ana Torres',    'contacto@tecnomundo.com',   '555-1001', 'Av. Reforma 120',   'Ciudad de México', 'activa'),
('Moda Urbana',     'Luis Pérez',    'ventas@modaurbana.com',     '555-1002', 'Calle 5 de Mayo 45', 'Puebla',           'activa'),
('Hogar Feliz',     'María Gómez',   'info@hogarfiliz.com',       '555-1003', 'Blvd. Independencia 88', 'Guadalajara',  'activa'),
('Deportes Pro',    'Carlos Ruiz',   'ventas@deportespro.com',    '555-1004', 'Av. Juárez 210',     'Monterrey',        'inactiva');

INSERT INTO usuarios (nombre, email, telefono, rol, tienda_id, activo) VALUES
('Ana Torres',     'ana.torres@tecnomundo.com',   '555-2001', 'admin',   1, TRUE),
('Luis Pérez',     'luis.perez@modaurbana.com',   '555-2002', 'vendedor',2, TRUE),
('María Gómez',    'maria.gomez@hogarfiliz.com',  '555-2003', 'vendedor',3, TRUE),
('Carlos Ruiz',    'carlos.ruiz@deportespro.com', '555-2004', 'vendedor',4, FALSE),
('Sofía Ramírez',  'sofia.ramirez@gmail.com',     '555-2005', 'comprador',NULL, TRUE);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria, tienda_id) VALUES
('Laptop 14 pulgadas',    'Laptop con 16GB RAM y SSD 512GB', 12999.00, 12,  'Electrónica', 1),
('Mouse inalámbrico',     'Mouse ergonómico recargable',        349.90, 80,  'Accesorios',  1),
('Camiseta algodón',      'Camiseta unisex talla M',             199.00, 150, 'Ropa',        2),
('Tenis deportivos',      'Tenis para correr modelo Pro',       1499.00, 40,  'Calzado',     2),
('Licuadora 2 litros',    'Licuadora de 6 velocidades',          899.00, 25,  'Hogar',       3),
('Juego de sartenes',     'Set de 5 sartenes antiadherentes',   1299.00, 18,  'Hogar',       3),
('Balón de fútbol',       'Balón profesional número 5',           499.00, 60,  'Deportes',    4);

INSERT INTO ventas (producto_id, usuario_id, cantidad, total) VALUES
(1, 5, 1, 12999.00),
(2, 5, 2, 699.80),
(3, 5, 3, 597.00),
(4, 4, 1, 1499.00),
(5, 3, 1, 899.00),
(7, 2, 4, 1996.00);

-- ============================================================
--  Verificación rápida
-- ============================================================
SELECT 'tiendas' AS tabla, COUNT(*) AS registros FROM tiendas
UNION ALL SELECT 'usuarios',  COUNT(*) FROM usuarios
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'ventas',    COUNT(*) FROM ventas;
