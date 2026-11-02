import { Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';

export default function MenuButton() {
  return (
    <Pressable
      onPress={() => router.push('/menu')}
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}
      hitSlop={8}
    >
      <Text style={styles.texto}>Menú</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presionado: { opacity: 0.6 },
  texto: { color: colors.primary, fontWeight: '600' },
});
