import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { api } from '../../lib/api';
import { formatearFecha, formatearMoneda } from '../../lib/formato';
import { colors, spacing, radius } from '../../theme';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (esRefresh = false) => {
    try {
      setError(null);
      if (esRefresh) setRefrescando(true);
      else setCargando(true);
      const data = await api.get('/ventas');
      setVentas(data);
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

  const ingresos = ventas.reduce((total, v) => total + Number(v.total || 0), 0);
  const unidades = ventas.reduce((total, v) => total + Number(v.cantidad || 0), 0);

  const renderVenta = ({ item }) => {
    const unitario = Number(item.cantidad) > 0 ? Number(item.total) / Number(item.cantidad) : 0;

    return (
      <Pressable
        onPress={() => router.push(`/ventas/${item.id}`)}
        style={({ pressed }) => [styles.tarjeta, pressed && styles.presionado]}
      >
        <View style={styles.tarjetaEncabezado}>
          <Text style={styles.producto} numberOfLines={1}>
            {item.producto || 'Producto eliminado'}
          </Text>
          <Text style={styles.total}>{formatearMoneda(item.total)}</Text>
        </View>

        <Text style={styles.comprador} numberOfLines={1}>
          {item.usuario || 'Cliente no registrado'}
        </Text>

        <View style={styles.etiquetas}>
          {item.tienda ? <Text style={styles.etiqueta}>{item.tienda}</Text> : null}
          {item.categoria ? <Text style={styles.etiqueta}>{item.categoria}</Text> : null}
        </View>

        <View style={styles.pie}>
          <Text style={styles.pieTexto}>
            {item.cantidad} × {formatearMoneda(unitario)}
          </Text>
          <Text style={styles.pieTexto}>{formatearFecha(item.fecha)}</Text>
        </View>

        <Text style={styles.verDetalle}>Ver detalle ›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Ventas' }} />

      {error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => cargar()} style={styles.reintentar}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={colors.warning} />
        </View>
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderVenta}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />
          }
          ListHeaderComponent={
            <View style={styles.resumen}>
              <View style={styles.resumenFila}>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValor}>{ventas.length}</Text>
                  <Text style={styles.resumenEtiqueta}>Ventas</Text>
                </View>
                <View style={styles.resumenItem}>
                  <Text style={styles.resumenValor}>{unidades}</Text>
                  <Text style={styles.resumenEtiqueta}>Unidades</Text>
                </View>
                <View style={styles.resumenItem}>
                  <Text style={[styles.resumenValor, styles.resumenIngresos]}>
                    {formatearMoneda(ingresos)}
                  </Text>
                  <Text style={styles.resumenEtiqueta}>Ingresos</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Text style={styles.vacio}>Todavía no hay ventas registradas.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  lista: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  resumen: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resumenFila: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  resumenItem: { flex: 1 },
  resumenValor: { fontSize: 18, fontWeight: '800', color: colors.text },
  resumenIngresos: { color: colors.success, fontSize: 16 },
  resumenEtiqueta: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  tarjeta: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  presionado: { opacity: 0.6 },
  tarjetaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  producto: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  total: { color: colors.success, fontWeight: '800', fontSize: 16 },
  comprador: { color: colors.muted, marginTop: 4 },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 8 },
  etiqueta: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pieTexto: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  verDetalle: { color: colors.warning, marginTop: 8, fontWeight: '700', fontSize: 13 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  reintentar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  textoReintentar: { color: colors.white, fontWeight: '600' },
  vacio: { color: colors.muted, textAlign: 'center' },
});
