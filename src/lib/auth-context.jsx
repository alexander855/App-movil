import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken, clearAuthToken } from './api';

const AuthContext = createContext(null);

const initialState = {
  cargando: true,
  sesion: null,
  usuario: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LISTO':
      return {
        cargando: false,
        sesion: action.sesion ?? null,
        usuario: action.usuario ?? null,
      };
    case 'LOGIN':
      return {
        cargando: false,
        sesion: action.sesion,
        usuario: action.usuario,
      };
    case 'LOGOUT':
      return {
        cargando: false,
        sesion: null,
        usuario: null,
      };
    default:
      return state;
  }
}

const TOKEN_KEY = '@mercado-libre/token';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const cargarSesion = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        clearAuthToken();
        dispatch({ type: 'LISTO', sesion: null, usuario: null });
        return;
      }

      setAuthToken(token);
      const usuario = await api.get('/auth/me');
      dispatch({ type: 'LISTO', sesion: token, usuario });
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      clearAuthToken();
      dispatch({ type: 'LISTO', sesion: null, usuario: null });
    }
  }, []);

  useEffect(() => {
    cargarSesion();
  }, [cargarSesion]);

  const iniciarSesion = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data?.token) {
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      setAuthToken(data.token);
    }
    dispatch({ type: 'LOGIN', sesion: data?.token ?? null, usuario: data?.usuario ?? null });
    return data;
  }, []);

  const cerrarSesion = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    clearAuthToken();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        iniciarSesion,
        cerrarSesion,
        recargar: cargarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
