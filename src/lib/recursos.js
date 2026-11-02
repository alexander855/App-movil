/**
 * Definición declarativa de cada módulo administrable.
 * Tanto las listas como los formularios se generan a partir de esta config.
 */
export const recursos = {
  tiendas: {
    ruta: 'tiendas',
    titulo: 'Tiendas',
    singular: 'Tienda',
    color: '#0B57D0',
    campos: [
      { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
      { name: 'propietario', label: 'Propietario', tipo: 'text' },
      { name: 'email', label: 'Email', tipo: 'email' },
      { name: 'telefono', label: 'Teléfono', tipo: 'phone' },
      { name: 'direccion', label: 'Dirección', tipo: 'text' },
      { name: 'ciudad', label: 'Ciudad', tipo: 'text' },
      {
        name: 'estado',
        label: 'Estado',
        tipo: 'select',
        default: 'activa',
        opciones: [
          { value: 'activa', label: 'Activa' },
          { value: 'inactiva', label: 'Inactiva' },
        ],
      },
    ],
    tituloItem: (it) => it.nombre,
    subtituloItem: (it) => [it.ciudad, it.estado].filter(Boolean).join(' · '),
  },

  usuarios: {
    ruta: 'usuarios',
    titulo: 'Usuarios',
    singular: 'Usuario',
    color: '#7C3AED',
    campos: [
      { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
      { name: 'email', label: 'Email', tipo: 'email', requerido: true },
      { name: 'telefono', label: 'Teléfono', tipo: 'phone' },
      {
        name: 'rol',
        label: 'Rol',
        tipo: 'select',
        default: 'vendedor',
        opciones: [
          { value: 'admin', label: 'Administrador' },
          { value: 'vendedor', label: 'Vendedor' },
          { value: 'comprador', label: 'Comprador' },
        ],
      },
      {
        name: 'tienda_id',
        label: 'Tienda',
        tipo: 'select',
        opcionesDesde: 'tiendas',
        permitirVacio: true,
      },
      { name: 'activo', label: 'Activo', tipo: 'switch', default: true },
    ],
    tituloItem: (it) => it.nombre,
    subtituloItem: (it) => [it.email, it.rol].filter(Boolean).join(' · '),
  },

  productos: {
    ruta: 'productos',
    titulo: 'Productos',
    singular: 'Producto',
    color: '#059669',
    campos: [
      { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
      { name: 'descripcion', label: 'Descripción', tipo: 'text', multiline: true },
      { name: 'precio', label: 'Precio', tipo: 'number', requerido: true },
      { name: 'stock', label: 'Stock', tipo: 'number' },
      { name: 'categoria', label: 'Categoría', tipo: 'text' },
      {
        name: 'tienda_id',
        label: 'Tienda',
        tipo: 'select',
        opcionesDesde: 'tiendas',
        permitirVacio: true,
      },
    ],
    tituloItem: (it) => it.nombre,
    subtituloItem: (it) =>
      [it.categoria, it.precio != null ? `$${Number(it.precio).toFixed(2)}` : null]
        .filter(Boolean)
        .join(' · '),
  },
};
