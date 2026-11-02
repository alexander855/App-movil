import { Stack, useLocalSearchParams } from 'expo-router';
import FormularioRecurso from '../../components/FormularioRecurso';

export default function EditarUsuario() {
  const { id } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ title: 'Editar usuario' }} />
      <FormularioRecurso recursoKey="usuarios" id={id} />
    </>
  );
}
