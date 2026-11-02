import { Stack } from 'expo-router';
import ListaRecurso from '../../components/ListaRecurso';

export default function Productos() {
  return (
    <>
      <Stack.Screen options={{ title: 'Productos' }} />
      <ListaRecurso recursoKey="productos" />
    </>
  );
}
