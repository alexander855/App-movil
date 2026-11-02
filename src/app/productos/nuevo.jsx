import { Stack } from 'expo-router';
import FormularioRecurso from '../../components/FormularioRecurso';

export default function NuevoProducto() {
  return (
    <>
      <Stack.Screen options={{ title: 'Registrar producto' }} />
      <FormularioRecurso recursoKey="productos" />
    </>
  );
}
