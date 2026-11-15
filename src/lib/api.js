const configurada = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (
  configurada || 'https://mercado-libre-api.onrender.com/api'
).replace(/\/+$/, '');

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function clearAuthToken() {
  authToken = null;
}

function getHeaders(body) {
  const headers = {};
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function manejar(respuesta) {
  const texto = await respuesta.text();
  const data = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    const mensaje = data?.error || `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }
  return data;
}

export const api = {
  get: (ruta) =>
    fetch(`${API_URL}${ruta}`, {
      headers: getHeaders(),
    }).then(manejar),
  post: (ruta, body) =>
    fetch(`${API_URL}${ruta}`, {
      method: 'POST',
      headers: getHeaders(body),
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    }).then(manejar),
  put: (ruta, body) =>
    fetch(`${API_URL}${ruta}`, {
      method: 'PUT',
      headers: getHeaders(body),
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    }).then(manejar),
  delete: (ruta) =>
    fetch(`${API_URL}${ruta}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(manejar),
};
