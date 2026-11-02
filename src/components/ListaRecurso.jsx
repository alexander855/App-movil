import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { api } from '../lib/api';
import { recursos } from '../lib/recursos';
import { colors, spacing, radius } from '../theme';

export default function ListaRecurso({ recursoKey, conDetalle = false }) {
  const config = recursos[recursoKey];
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(
    async (esRefresh = false) => {
      try {
        setError(null);
        if (esRefresh) setRefrescando(true);
        else setCargando(true);
        const data = await api.get(`/${config.ruta}`);
        setItems(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
        setRefrescando(false);
      }
    },
    [config.ruta]
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const confirmarEliminar = (item) => {
    Alert.alert('Eliminar', `¿Eliminar "${config.tituloItem(item)}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/${config.ruta}/${item.id}`);
            cargar(true);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.tarjeta}>
      <Pressable
        onPress={() => conDetalle && router.push(`/${config.ruta}/${item.id}`)}
        disabled={!conDetalle}
        style={({ pressed }) => [styles.info, pressed && conDetalle && styles.presionado]}
      >
        <Text style={styles.tituloItem} numberOfLines={1}>
          {config.tituloItem(item)}
        </Text>
        <Text style={styles.subtituloItem} numberOfLines={1}>
          {config.subtituloItem(item) || '—'}
        </Text>
        {conDetalle ? <Text style={styles.verDetalle}>Ver productos ›</Text> : null}
      </Pressable>
      <View style={styles.acciones}>
        <Pressable
          onPress={() =>
            router.push(conDetalle ? `/${config.ruta}/${item.id}/editar` : `/${config.ruta}/${item.id}`)
          }
          style={({ pressed }) => [styles.accion, pressed && styles.presionado]}
        >
          <Text style={styles.editar}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={() => confirmarEliminar(item)}
          style={({ pressed }) => [styles.accion, pressed && styles.presionado]}
        >
          <Text style={styles.eliminar}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.contador}>
          {items.length} {items.length === 1 ? 'registro' : 'registros'}
        </Text>
        <Pressable
          onPress={() => router.push(`/${config.ruta}/nuevo`)}
          style={({ pressed }) => [
            styles.botonRegistrar,
            { backgroundColor: config.color },
            pressed && styles.presionado,
          ]}
        >
          <Text style={styles.textoBoton}>+ Registrar</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => cargar()} style={styles.reintentar}>
            <Text style={styles.textoReintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={config.color} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} />
          }
          ListEmptyComponent={
            <View style={styles.centro}>
              <Text style={styles.vacio}>No hay registros todavía.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  contador: { color: colors.muted, fontWeight: '600' },
  botonRegistrar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  textoBoton: { color: colors.white, fontWeight: '700' },
  lista: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  tarjeta: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: { marginBottom: spacing.sm },
  tituloItem: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtituloItem: { color: colors.muted, marginTop: 2 },
  verDetalle: { color: colors.primary, marginTop: 6, fontWeight: '600', fontSize: 13 },
  acciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  accion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presionado: { opacity: 0.6 },
  editar: { color: colors.primary, fontWeight: '600' },
  eliminar: { color: colors.danger, fontWeight: '600' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  reintentar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  textoReintentar: { color: colors.white, fontWeight: '600' },
  vacio: { color: colors.muted },
});
