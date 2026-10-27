export type DatosRegistro = {
  nombre: string;
  correo: string;
  clave: string;
  confirmacion: string;
  mensaje: string;
};

export const usuariosRegistro: DatosRegistro[] = [
  {
    nombre: 'Bonifacio',
    correo: 'bonifacio@correo.com',
    clave: 'prueba1',
    confirmacion: 'prueba1',
    mensaje: 'Ese correo ya está registrado'
  },
   {
    nombre: 'Alice',
    correo: 'alice@correo.com',
    clave: 'prueba1',
    confirmacion: 'prueba2',
    mensaje: 'Las contraseñas no coinciden'
  }
];