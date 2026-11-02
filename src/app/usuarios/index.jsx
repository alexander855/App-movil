import { Stack } from 'expo-router';
import ListaRecurso from '../../components/ListaRecurso';

export default function Usuarios() {
  return (
    <>
      <Stack.Screen options={{ title: 'Usuarios' }} />
      <ListaRecurso recursoKey="usuarios" />
    </>
  );
}
