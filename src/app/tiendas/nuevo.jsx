import { Stack } from 'expo-router';
import FormularioRecurso from '../../components/FormularioRecurso';

export default function NuevaTienda() {
  return (
    <>
      <Stack.Screen options={{ title: 'Registrar tienda' }} />
      <FormularioRecurso recursoKey="tiendas" />
    </>
  );
}
