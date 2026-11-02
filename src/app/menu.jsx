import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { recursos } from '../lib/recursos';
import { useAuth } from '../lib/auth-context';
import { colors, spacing, radius } from '../theme';

export default function Menu() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: 'Menú' }} />
      <Text style={styles.titulo}>Administración</Text>
      <Text style={styles.subtitulo}>
        Selecciona un módulo para listar, registrar, editar o eliminar registros.
      </Text>

      <View style={styles.sesion}>
        <View style={styles.sesionInfo}>
          <Text style={styles.sesionNombre}>{usuario?.nombre ?? 'Sesión activa'}</Text>
          <Text style={styles.sesionDetalle}>
            {[usuario?.email, usuario?.rol].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Pressable
          onPress={cerrarSesion}
          style={({ pressed }) => [styles.salirBoton, pressed && styles.presionado]}
        >
          <Text style={styles.salirTexto}>Cerrar sesión</Text>
        </Pressable>
      </View>

      {Object.entries(recursos).map(([clave, config]) => (
        <Pressable
          key={clave}
          onPress={() => router.push(`/${clave}`)}
          style={({ pressed }) => [styles.item, pressed && styles.presionado]}
        >
          <View style={[styles.punto, { backgroundColor: config.color }]} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitulo}>{config.titulo}</Text>
            <Text style={styles.itemSub}>
              Ver {config.titulo.toLowerCase()} registradas · gestionar CRUD
            </Text>
          </View>
          <Text style={styles.flecha}>{'>'}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.md },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitulo: { color: colors.muted, marginTop: 4, marginBottom: spacing.lg },
  sesion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sesionInfo: { flex: 1 },
  sesionNombre: { fontWeight: '700', color: colors.text },
  sesionDetalle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  salirBoton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  salirTexto: { color: colors.danger, fontWeight: '700', fontSize: 13 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  presionado: { opacity: 0.6 },
  punto: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  itemInfo: { flex: 1 },
  itemTitulo: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemSub: { color: colors.muted, marginTop: 2, fontSize: 12 },
  flecha: { color: colors.muted, fontSize: 18, fontWeight: '700' },
});
