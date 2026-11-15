import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { api } from '../../lib/api';
import { formatearFecha, formatearMoneda } from '../../lib/formato';
import { colors, spacing, radius } from '../../theme';

function Fila({ etiqueta, valor }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor}>{valor || '—'}</Text>
    </View>
  );
}

export default function DetalleVenta() {
  const { id } = useLocalSearchParams();
  const [venta, setVenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setCargando(true);
      const data = await api.get(`/ventas/${id}`);
      setVenta(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Detalle de venta' }} />
        <ActivityIndicator size="large" color={colors.warning} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Stack.Screen options={{ title: 'Detalle de venta' }} />
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={cargar} style={styles.reintentar}>
          <Text style={styles.textoReintentar}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const cantidad = Number(venta?.cantidad || 0);
  const total = Number(venta?.total || 0);
  const unitario = cantidad > 0 ? total / cantidad : 0;

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: `Venta #${id}` }} />

      <View style={styles.totalCaja}>
        <Text style={styles.totalEtiqueta}>Total de la venta</Text>
        <Text style={styles.totalValor}>{formatearMoneda(total)}</Text>
        <Text style={styles.totalFecha}>{formatearFecha(venta?.fecha, true)}</Text>
      </View>

      <Text style={styles.seccionTitulo}>Producto</Text>
      <View style={styles.tarjeta}>
        <Fila etiqueta="Producto" valor={venta?.producto || 'Producto eliminado'} />
        <Fila etiqueta="Categoría" valor={venta?.categoria} />
        <Fila etiqueta="Tienda" valor={venta?.tienda} />
        <Fila etiqueta="Cantidad" valor={`${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}`} />
        <Fila etiqueta="Precio unitario" valor={formatearMoneda(unitario)} />
        {venta?.precio_actual != null ? (
          <Fila
            etiqueta="Precio actual en catálogo"
            valor={formatearMoneda(venta.precio_actual)}
          />
        ) : null}
      </View>

      <Text style={styles.seccionTitulo}>Comprador</Text>
      <View style={styles.tarjeta}>
        <Fila etiqueta="Nombre" valor={venta?.usuario || 'Cliente no registrado'} />
        <Fila etiqueta="Email" valor={venta?.usuario_email} />
      </View>

      <Text style={styles.seccionTitulo}>Información de la venta</Text>
      <View style={styles.tarjeta}>
        <Fila etiqueta="Folio" valor={`#${venta?.id}`} />
        <Fila etiqueta="Fecha y hora" valor={formatearFecha(venta?.fecha, true)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.md, paddingBottom: spacing.xl },
  totalCaja: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  totalEtiqueta: { color: colors.muted, fontWeight: '600' },
  totalValor: { color: colors.success, fontSize: 34, fontWeight: '800', marginTop: 4 },
  totalFecha: { color: colors.muted, fontSize: 12, marginTop: 6 },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tarjeta: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 5,
  },
  filaEtiqueta: { color: colors.muted, flexShrink: 0 },
  filaValor: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  reintentar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  textoReintentar: { color: colors.white, fontWeight: '600' },
});
