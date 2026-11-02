const crypto = require('crypto');
const pool = require('./db');

const SECRET = process.env.AUTH_SECRET || 'mercado-libre-secreto-de-desarrollo';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const PASSWORD_POR_DEFECTO = '123456';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verificarPassword(password, almacenado) {
  if (typeof almacenado !== 'string') return false;

  const [algoritmo, salt, hash] = almacenado.split(':');
  if (algoritmo !== 'scrypt' || !salt || !hash) return false;

  const calculado = crypto.scryptSync(password, salt, 64);
  const esperado = Buffer.from(hash, 'hex');

  if (calculado.length !== esperado.length) return false;
  return crypto.timingSafeEqual(calculado, esperado);
}

function firmar(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

function crearToken(usuario) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: usuario.id,
      rol: usuario.rol,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');

  return `${payload}.${firmar(payload)}`;
}

function verificarToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;

  const [payload, firma] = token.split('.');
  const esperada = Buffer.from(firmar(payload));
  const recibida = Buffer.from(firma || '');

  if (esperada.length !== recibida.length) return null;
  if (!crypto.timingSafeEqual(esperada, recibida)) return null;

  try {
    const datos = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!datos.exp || datos.exp < Date.now()) return null;
    return datos;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null;
  const datos = verificarToken(token);

  if (!datos) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión de nuevo.' });
  }

  req.usuario = datos;
  next();
}

/**
 * Se ejecuta al arrancar el servidor para que una base de datos ya existente
 * obtenga la columna de contraseñas sin necesidad de volver a ejecutar el SQL.
 */
async function asegurarEsquema() {
  await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash TEXT');

  const { rows } = await pool.query(
    'SELECT id FROM usuarios WHERE password_hash IS NULL'
  );

  for (const { id } of rows) {
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [
      hashPassword(PASSWORD_POR_DEFECTO),
      id,
    ]);
  }
}

module.exports = {
  PASSWORD_POR_DEFECTO,
  hashPassword,
  verificarPassword,
  crearToken,
  requireAuth,
  asegurarEsquema,
};
