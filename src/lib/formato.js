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
  const numero = Number(valor ?? 0);
  const seguro = Number.isFinite(numero) ? numero : 0;
  const [entero, decimales] = Math.abs(seguro).toFixed(2).split('.');
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `Bs ${seguro < 0 ? '-' : ''}${agrupado}.${decimales}`;
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
