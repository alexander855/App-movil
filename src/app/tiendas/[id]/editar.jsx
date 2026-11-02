import { Stack, useLocalSearchParams } from 'expo-router';
import FormularioRecurso from '../../../components/FormularioRecurso';

export default function EditarTienda() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ title: 'Editar tienda' }} />
      <FormularioRecurso recursoKey="tiendas" id={id} />
    </>
  );
}
