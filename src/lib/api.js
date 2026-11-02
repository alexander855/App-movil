import Constants from 'expo-constants';

/**
 * Resuelve la IP de la máquina de desarrollo para poder llamar al backend
 * desde un dispositivo físico, emulador o web sin configuración manual.
 * En desarrollo Expo expone `hostUri` (ej: "192.168.1.10:8081").
 */
function resolverHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    '';

  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return 'localhost';
}

const configurada = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (
  configurada || `http://${resolverHost()}:4000/api`
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
