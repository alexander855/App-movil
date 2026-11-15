const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatearMoneda(valor) {
  return `$${Number(valor ?? 0).toFixed(2)}`;
}

export function formatearFecha(valor, incluirHora = false) {
  if (!valor) return '—';

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';

  const dia = String(fecha.getDate()).padStart(2, '0');
  const base = `${dia} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

  if (!incluirHora) return base;

  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${base} · ${horas}:${minutos}`;
}
