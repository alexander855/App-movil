import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { api } from '../lib/api';
import { formatearMoneda } from '../lib/formato';
import { colors, spacing, radius } from '../theme';

const TARJETAS = [
  { clave: 'usuarios', titulo: 'Usuarios', color: '#7C3AED' },
  { clave: 'ventas', titulo: 'Ventas', color: '#D97706' },
  { clave: 'productos', titulo: 'Productos', color: '#059669' },
  { clave: 'tiendas', titulo: 'Tiendas', color: '#0B57D0' },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError(null);
      if (esRefresh) setRefrescando(true);
      else setCargando(true);
      const data = await api.get('/stats');
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
    >
      <Stack.Screen options={{ title: 'Panel de administrador' }} />

      <View style={styles.bienvenida}>
        <Text style={styles.saludo}>Resumen general</Text>
        <Text style={styles.sub}>Datos registrados en el sistema</Text>
      </View>

      {error ? (
        <View style={styles.errorCaja}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => cargar()} style={styles.reintentar}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : cargando ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.cargando} />
      ) : (
        <>
          <View style={styles.grid}>
            {TARJETAS.map((t) => (
              <Pressable
                key={t.clave}
                onPress={() => router.push(`/${t.clave}`)}
                style={({ pressed }) => [
                  styles.tarjeta,
                  { borderTopColor: t.color },
                  pressed && styles.presionado,
                ]}
              >
                <Text style={[styles.numero, { color: t.color }]}>{stats?.[t.clave] ?? 0}</Text>
                <Text style={styles.tarjetaTitulo}>{t.titulo}</Text>
                <Text style={[styles.tarjetaEnlace, { color: t.color }]}>Ver detalle ›</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.ingresos}>
            <Text style={styles.ingresosLabel}>Ingresos por ventas</Text>
            <Text style={styles.ingresosValor}>
              {formatearMoneda(stats?.ingresos)}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.md, paddingBottom: spacing.xl },
  bienvenida: { marginBottom: spacing.lg },
  saludo: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tarjeta: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    padding: spacing.md,
    shadowColor: '#0B1B3A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  numero: { fontSize: 32, fontWeight: '800' },
  tarjetaTitulo: { color: colors.muted, marginTop: 4, fontWeight: '600' },
  tarjetaEnlace: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  ingresos: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  ingresosLabel: { color: '#DCE6FF', fontWeight: '600' },
  ingresosValor: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 4 },
  presionado: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  cargando: { marginTop: spacing.xl },
  errorCaja: { alignItems: 'center', marginTop: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  reintentar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  textoReintentar: { color: colors.white, fontWeight: '600' },
});
