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
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { api } from '../../../lib/api';
import { colors, spacing, radius } from '../../../theme';

function Fila({ etiqueta, valor }) {
  if (!valor) return null;
  return (
    <View style={styles.fila}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor}>{valor}</Text>
    </View>
  );
}

export default function DetalleTienda() {
  const { id } = useLocalSearchParams();
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(
    async (esRefresh = false) => {
      try {
        setError(null);
        if (esRefresh) setRefrescando(true);
        else setCargando(true);
        const [t, p] = await Promise.all([
          api.get(`/tiendas/${id}`),
          api.get(`/tiendas/${id}/productos`),
        ]);
        setTienda(t);
        setProductos(p);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [id]
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Tienda' }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Tienda' }} />
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={() => cargar()} style={styles.reintentar}>
          <Text style={styles.textoReintentar}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />}
    >
      <Stack.Screen options={{ title: tienda?.nombre || 'Tienda' }} />

      <View style={styles.tarjetaTienda}>
        <View style={styles.encabezadoTienda}>
          <Text style={styles.nombreTienda}>{tienda?.nombre}</Text>
          <View style={[styles.badge, tienda?.estado === 'activa' ? styles.badgeActiva : styles.badgeInactiva]}>
            <Text style={styles.badgeTexto}>{tienda?.estado}</Text>
          </View>
        </View>
        <Fila etiqueta="Propietario" valor={tienda?.propietario} />
        <Fila etiqueta="Email" valor={tienda?.email} />
        <Fila etiqueta="Teléfono" valor={tienda?.telefono} />
        <Fila etiqueta="Dirección" valor={tienda?.direccion} />
        <Fila etiqueta="Ciudad" valor={tienda?.ciudad} />

        <Pressable
          onPress={() => router.push(`/tiendas/${id}/editar`)}
          style={({ pressed }) => [styles.botonEditar, pressed && styles.presionado]}
        >
          <Text style={styles.textoEditar}>Editar tienda</Text>
        </Pressable>
      </View>

      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Productos de la tienda</Text>
        <Text style={styles.seccionContador}>
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
        </Text>
      </View>

      {productos.length === 0 ? (
        <View style={styles.vacioCaja}>
          <Text style={styles.vacio}>Esta tienda aún no tiene productos registrados.</Text>
        </View>
      ) : (
        productos.map((p) => (
          <View key={p.id} style={styles.tarjetaProducto}>
            <View style={styles.filaProducto}>
              <Text style={styles.nombreProducto} numberOfLines={1}>
                {p.nombre}
              </Text>
              <Text style={styles.precio}>${Number(p.precio).toFixed(2)}</Text>
            </View>
            {p.descripcion ? (
              <Text style={styles.descripcion} numberOfLines={2}>
                {p.descripcion}
              </Text>
            ) : null}
            <View style={styles.metaProducto}>
              {p.categoria ? <Text style={styles.metaTexto}>{p.categoria}</Text> : null}
              <Text style={styles.metaTexto}>Stock: {p.stock}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.md, paddingBottom: spacing.xl },
  tarjetaTienda: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  encabezadoTienda: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nombreTienda: { fontSize: 20, fontWeight: '800', color: colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.lg },
  badgeActiva: { backgroundColor: '#DCFCE7' },
  badgeInactiva: { backgroundColor: '#FEE2E2' },
  badgeTexto: { fontSize: 12, fontWeight: '700', color: colors.text },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  filaEtiqueta: { color: colors.muted },
  filaValor: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  botonEditar: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presionado: { opacity: 0.6 },
  textoEditar: { color: colors.primary, fontWeight: '700' },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  seccionTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  seccionContador: { color: colors.muted, fontWeight: '600' },
  vacioCaja: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  vacio: { color: colors.muted, textAlign: 'center' },
  tarjetaProducto: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nombreProducto: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  precio: { color: '#059669', fontWeight: '800' },
  descripcion: { color: colors.muted, marginTop: 4 },
  metaProducto: { flexDirection: 'row', gap: spacing.md, marginTop: 6 },
  metaTexto: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
