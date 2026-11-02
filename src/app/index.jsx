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
              <View key={t.clave} style={[styles.tarjeta, { borderTopColor: t.color }]}>
                <Text style={[styles.numero, { color: t.color }]}>{stats?.[t.clave] ?? 0}</Text>
                <Text style={styles.tarjetaTitulo}>{t.titulo}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ingresos}>
            <Text style={styles.ingresosLabel}>Ingresos por ventas</Text>
            <Text style={styles.ingresosValor}>
              ${Number(stats?.ingresos ?? 0).toFixed(2)}
            </Text>
          </View>
        </>
      )}

      <View style={styles.menuRapido}>
        <Text style={styles.menuTitulo}>Accesos rápidos</Text>
        <Pressable
          onPress={() => router.push('/menu')}
          style={({ pressed }) => [styles.botonMenu, pressed && styles.presionado]}
        >
          <Text style={styles.botonMenuTexto}>Abrir menú de administración</Text>
        </Pressable>
      </View>
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
  },
  numero: { fontSize: 32, fontWeight: '800' },
  tarjetaTitulo: { color: colors.muted, marginTop: 4, fontWeight: '600' },
  ingresos: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  ingresosLabel: { color: '#DCE6FF', fontWeight: '600' },
  ingresosValor: { color: colors.white, fontSize: 28, fontWeight: '800', marginTop: 4 },
  menuRapido: { marginTop: spacing.xl },
  menuTitulo: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  botonMenu: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  presionado: { opacity: 0.6 },
  botonMenuTexto: { color: colors.primary, fontWeight: '700' },
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
