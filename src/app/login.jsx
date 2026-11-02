import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../lib/auth-context';
import { colors, spacing, radius } from '../theme';

const CUENTAS_DEMO = [
  { etiqueta: 'Administrador', email: 'ana.torres@tecnomundo.com' },
  { etiqueta: 'Vendedor', email: 'luis.perez@modaurbana.com' },
];

export default function Login() {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña');
      return;
    }

    try {
      setError(null);
      setEnviando(true);
      await iniciarSesion(email.trim(), password);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const usarDemo = (cuenta) => {
    setEmail(cuenta.email);
    setPassword('123456');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.marca}>
          <View style={styles.logo}>
            <Text style={styles.logoTexto}>ML</Text>
          </View>
          <Text style={styles.titulo}>Mercado Libre</Text>
          <Text style={styles.subtitulo}>Panel de administración</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!enviando}
          />

          <Text style={[styles.etiqueta, styles.etiquetaSeparada]}>Contraseña</Text>
          <View style={styles.inputFila}>
            <TextInput
              style={styles.inputPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              placeholderTextColor={colors.muted}
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              editable={!enviando}
              onSubmitEditing={entrar}
              returnKeyType="go"
            />
            <Pressable
              onPress={() => setVerPassword((valor) => !valor)}
              style={styles.verBoton}
              hitSlop={8}
            >
              <Text style={styles.verTexto}>{verPassword ? 'Ocultar' : 'Ver'}</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorCaja}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={entrar}
            disabled={enviando}
            style={({ pressed }) => [
              styles.boton,
              (pressed || enviando) && styles.botonPresionado,
            ]}
          >
            {enviando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.botonTexto}>Iniciar sesión</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.demo}>
          <Text style={styles.demoTitulo}>Cuentas de prueba (contraseña: 123456)</Text>
          <View style={styles.demoBotones}>
            {CUENTAS_DEMO.map((cuenta) => (
              <Pressable
                key={cuenta.email}
                onPress={() => usarDemo(cuenta)}
                style={({ pressed }) => [styles.demoBoton, pressed && styles.demoPresionado]}
              >
                <Text style={styles.demoBotonTexto}>{cuenta.etiqueta}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  marca: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoTexto: { color: colors.white, fontSize: 24, fontWeight: '800' },
  titulo: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitulo: { color: colors.muted, marginTop: 4 },
  tarjeta: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  etiqueta: { color: colors.text, fontWeight: '700', marginBottom: 6, fontSize: 13 },
  etiquetaSeparada: { marginTop: spacing.md },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  inputFila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  verBoton: { paddingHorizontal: spacing.md, paddingVertical: 8 },
  verTexto: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  errorCaja: {
    marginTop: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  error: { color: colors.danger, textAlign: 'center', fontWeight: '600' },
  boton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  botonPresionado: { opacity: 0.7 },
  botonTexto: { color: colors.white, fontWeight: '800', fontSize: 16 },
  demo: { marginTop: spacing.xl, alignItems: 'center' },
  demoTitulo: { color: colors.muted, fontSize: 12, marginBottom: spacing.sm },
  demoBotones: { flexDirection: 'row', gap: spacing.sm },
  demoBoton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  demoPresionado: { opacity: 0.6 },
  demoBotonTexto: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
