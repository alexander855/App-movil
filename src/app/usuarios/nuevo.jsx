import { Stack } from 'expo-router';
import FormularioRecurso from '../../components/FormularioRecurso';

export default function NuevoUsuario() {
  return (
    <>
      <Stack.Screen options={{ title: 'Registrar usuario' }} />
      <FormularioRecurso recursoKey="usuarios" />
    </>
  );
}
