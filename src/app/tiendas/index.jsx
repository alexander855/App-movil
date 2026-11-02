import { Stack } from 'expo-router';
import ListaRecurso from '../../components/ListaRecurso';

export default function Tiendas() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tiendas' }} />
      <ListaRecurso recursoKey="tiendas" conDetalle />
    </>
  );
}
