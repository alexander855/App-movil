const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = require('./db');
const {
  verificarPassword,
  crearToken,
  requireAuth,
  asegurarEsquema,
} = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Autenticación
// ------------------------------------------------------------
const CAMPOS_USUARIO = 'id, nombre, email, telefono, rol, tienda_id, activo, creado_en';

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT ${CAMPOS_USUARIO}, password_hash
       FROM usuarios
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    const usuario = rows[0];

    if (!usuario || !verificarPassword(password, usuario.password_hash)) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Este usuario está inactivo' });
    }

    delete usuario.password_hash;

    res.json({
      token: crearToken(usuario),
      usuario,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${CAMPOS_USUARIO} FROM usuarios WHERE id = $1`,
      [req.usuario.sub]
    );

    const usuario = rows[0];
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// A partir de aquí todas las rutas /api requieren sesión.
app.use('/api', requireAuth);

// ------------------------------------------------------------
// Configuración de recursos CRUD
// ------------------------------------------------------------
const recursos = {
  tiendas: {
    tabla: 'tiendas',
    campos: ['nombre', 'propietario', 'email', 'telefono', 'direccion', 'ciudad', 'estado'],
    obligatorios: ['nombre'],
  },
  usuarios: {
    tabla: 'usuarios',
    campos: ['nombre', 'email', 'telefono', 'rol', 'tienda_id', 'activo'],
    obligatorios: ['nombre', 'email'],
  },
  productos: {
    tabla: 'productos',
    campos: ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'tienda_id'],
    obligatorios: ['nombre'],
  },
};

function tomarCampos(meta, body) {
  const valores = {};
  for (const campo of meta.campos) {
    if (Object.prototype.hasOwnProperty.call(body, campo)) {
      valores[campo] = body[campo];
    }
  }
  return valores;
}

function validar(meta, body) {
  const faltantes = meta.obligatorios.filter(
    (campo) => body[campo] === undefined || body[campo] === null || body[campo] === ''
  );
  if (faltantes.length > 0) {
    return `Campos obligatorios: ${faltantes.join(', ')}`;
  }
  return null;
}

// ------------------------------------------------------------
// Estadísticas para la pantalla principal
// ------------------------------------------------------------
app.get('/api/stats', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM usuarios)  AS usuarios,
        (SELECT COUNT(*)::int FROM tiendas)   AS tiendas,
        (SELECT COUNT(*)::int FROM productos) AS productos,
        (SELECT COUNT(*)::int FROM ventas)    AS ventas,
        (SELECT COALESCE(SUM(total), 0)::float FROM ventas) AS ingresos
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ------------------------------------------------------------
// CRUD genérico por recurso
// ------------------------------------------------------------
for (const [ruta, meta] of Object.entries(recursos)) {
  const { tabla } = meta;

  // Listar
  app.get(`/api/${ruta}`, async (_req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${tabla} ORDER BY id DESC`);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Error al listar ${ruta}` });
    }
  });

  // Obtener uno
  app.get(`/api/${ruta}/:id`, async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${tabla} WHERE id = $1`, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Error al obtener ${ruta}` });
    }
  });

  // Crear
  app.post(`/api/${ruta}`, async (req, res) => {
    const error = validar(meta, req.body);
    if (error) return res.status(400).json({ error });

    const valores = tomarCampos(meta, req.body);
    const columnas = Object.keys(valores);
    const params = columnas.map((_, i) => `$${i + 1}`);

    try {
      const { rows } = await pool.query(
        `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${params.join(', ')}) RETURNING *`,
        Object.values(valores)
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Error al crear ${ruta}: ${err.message}` });
    }
  });

  // Actualizar
  app.put(`/api/${ruta}/:id`, async (req, res) => {
    const valores = tomarCampos(meta, req.body);
    const columnas = Object.keys(valores);
    if (columnas.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const set = columnas.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const valoresArr = Object.values(valores);

    try {
      const { rows } = await pool.query(
        `UPDATE ${tabla} SET ${set} WHERE id = $${columnas.length + 1} RETURNING *`,
        [...valoresArr, req.params.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Error al actualizar ${ruta}: ${err.message}` });
    }
  });

  // Eliminar
  app.delete(`/api/${ruta}/:id`, async (req, res) => {
    try {
      const { rowCount } = await pool.query(`DELETE FROM ${tabla} WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: `Error al eliminar ${ruta}` });
    }
  });
}

// Productos registrados por una tienda
app.get('/api/tiendas/:id/productos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM productos WHERE tienda_id = $1 ORDER BY id DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos de la tienda' });
  }
});

app.get('/', (_req, res) => {
  res.json({ servicio: 'API Mercado Libre', estado: 'ok' });
});

const PORT = Number(process.env.PORT) || 4000;

async function iniciar() {
  try {
    await asegurarEsquema();
    console.log('Esquema de autenticación verificado (password_hash)');
  } catch (err) {
    console.error('Error al asegurar el esquema de autenticación:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}

iniciar();
