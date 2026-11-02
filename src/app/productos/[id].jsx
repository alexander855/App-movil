import { Stack, useLocalSearchParams } from 'expo-router';
import FormularioRecurso from '../../components/FormularioRecurso';

export default function EditarProducto() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ title: 'Editar producto' }} />
      <FormularioRecurso recursoKey="productos" id={id} />
    </>
  );
}
