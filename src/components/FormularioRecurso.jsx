import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { recursos } from '../lib/recursos';
import { colors, spacing, radius } from '../theme';

function iniciales(config) {
  const valores = {};
  for (const campo of config.campos) {
    if (campo.tipo === 'switch') valores[campo.name] = campo.default ?? false;
    else valores[campo.name] = campo.default ?? '';
  }
  return valores;
}

function normalizar(campo, valor) {
  if (campo.tipo === 'switch') return Boolean(valor);
  if (valor === null || valor === undefined) {
    if (campo.tipo === 'select') return campo.default ?? '';
    return '';
  }
  if (campo.tipo === 'select') return valor;
  return String(valor);
}

function construirPayload(config, valores) {
  const payload = {};
  for (const campo of config.campos) {
    const valor = valores[campo.name];
    if (campo.tipo === 'switch') {
      payload[campo.name] = Boolean(valor);
    } else if (campo.tipo === 'number') {
      payload[campo.name] = valor === '' || valor === null ? null : Number(valor);
    } else if (campo.tipo === 'select' && campo.opcionesDesde) {
      payload[campo.name] = valor === '' || valor === null ? null : Number(valor);
    } else {
      payload[campo.name] = valor;
    }
  }
  return payload;
}

export default function FormularioRecurso({ recursoKey, id }) {
  const config = recursos[recursoKey];
  const editando = id !== undefined && id !== null;

  const [valores, setValores] = useState(() => iniciales(config));
  const [opcionesRemotas, setOpcionesRemotas] = useState({});
  const [cargando, setCargando] = useState(Boolean(editando));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    const fuentes = [
      ...new Set(config.campos.filter((c) => c.opcionesDesde).map((c) => c.opcionesDesde)),
    ];
    if (fuentes.length === 0) return undefined;
    (async () => {
      const nuevas = {};
      for (const fuente of fuentes) {
        try {
          nuevas[fuente] = await api.get(`/${fuente}`);
        } catch {
          nuevas[fuente] = [];
        }
      }
      if (activo) setOpcionesRemotas(nuevas);
    })();
    return () => {
      activo = false;
    };
  }, [config]);

  useEffect(() => {
    if (!editando) return undefined;
    let activo = true;
    (async () => {
      try {
        const data = await api.get(`/${config.ruta}/${id}`);
        if (!activo) return;
        const normalizados = {};
        for (const campo of config.campos) {
          normalizados[campo.name] = normalizar(campo, data[campo.name]);
        }
        setValores(normalizados);
      } catch (e) {
        setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [config, editando, id]);

  const opcionesDeCampo = useMemo(
    () => (campo) => {
      if (campo.opciones) return campo.opciones;
      if (campo.opcionesDesde) {
        const fuente = recursos[campo.opcionesDesde];
        const lista = opcionesRemotas[campo.opcionesDesde] || [];
        const opciones = lista.map((it) => ({ value: it.id, label: fuente.tituloItem(it) }));
        if (campo.permitirVacio) return [{ value: '', label: 'Ninguna' }, ...opciones];
        return opciones;
      }
      return [];
    },
    [opcionesRemotas]
  );

  const cambiar = (name, valor) => {
    setValores((prev) => ({ ...prev, [name]: valor }));
  };

  const guardar = async () => {
    const faltantes = config.campos.filter(
      (c) => c.requerido && (valores[c.name] === '' || valores[c.name] === null)
    );
    if (faltantes.length > 0) {
      Alert.alert('Faltan datos', `Completa: ${faltantes.map((c) => c.label).join(', ')}`);
      return;
    }

    setGuardando(true);
    try {
      const payload = construirPayload(config, valores);
      if (editando) await api.put(`/${config.ruta}/${id}`, payload);
      else await api.post(`/${config.ruta}`, payload);
      router.back();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  };

  const renderCampo = (campo) => {
    const valor = valores[campo.name];

    if (campo.tipo === 'switch') {
      return (
        <View key={campo.name} style={styles.campo}>
          <Text style={styles.label}>{campo.label}</Text>
          <Switch
            value={Boolean(valor)}
            onValueChange={(v) => cambiar(campo.name, v)}
            trackColor={{ true: config.color, false: colors.border }}
          />
        </View>
      );
    }

    if (campo.tipo === 'select') {
      const opciones = opcionesDeCampo(campo);
      return (
        <View key={campo.name} style={styles.campo}>
          <Text style={styles.label}>
            {campo.label}
            {campo.requerido ? ' *' : ''}
          </Text>
          <View style={styles.opciones}>
            {opciones.map((op) => {
              const seleccionado = String(op.value) === String(valor);
              return (
                <Pressable
                  key={String(op.value)}
                  onPress={() => cambiar(campo.name, op.value)}
                  style={[
                    styles.chip,
                    seleccionado && { backgroundColor: config.color, borderColor: config.color },
                  ]}
                >
                  <Text style={[styles.chipTexto, seleccionado && styles.chipTextoActivo]}>
                    {op.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    const keyboardType =
      campo.tipo === 'number'
        ? 'numeric'
        : campo.tipo === 'email'
          ? 'email-address'
          : campo.tipo === 'phone'
            ? 'phone-pad'
            : 'default';

    return (
      <View key={campo.name} style={styles.campo}>
        <Text style={styles.label}>
          {campo.label}
          {campo.requerido ? ' *' : ''}
        </Text>
        <TextInput
          style={[styles.input, campo.multiline && styles.inputMultiline]}
          value={valor === null || valor === undefined ? '' : String(valor)}
          onChangeText={(t) => cambiar(campo.name, t)}
          keyboardType={keyboardType}
          autoCapitalize={campo.tipo === 'email' ? 'none' : 'sentences'}
          multiline={Boolean(campo.multiline)}
          placeholder={campo.label}
          placeholderTextColor={colors.muted}
        />
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={config.color} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {config.campos.map(renderCampo)}

      <Pressable
        onPress={guardar}
        disabled={guardando}
        style={({ pressed }) => [
          styles.guardar,
          { backgroundColor: config.color },
          (pressed || guardando) && styles.presionado,
        ]}
      >
        {guardando ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.textoGuardar}>
            {editando ? 'Actualizar' : 'Registrar'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  contenido: { padding: spacing.md, paddingBottom: spacing.xl },
  campo: { marginBottom: spacing.md },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipTexto: { color: colors.text },
  chipTextoActivo: { color: colors.white, fontWeight: '700' },
  guardar: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  presionado: { opacity: 0.7 },
  textoGuardar: { color: colors.white, fontWeight: '700', fontSize: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, marginBottom: spacing.md },
});
