import type { Locator, Page } from '@playwright/test';
import type { DatosRegistro } from '../data/usuariosRegistro';

export class PaginaRegistro {
  readonly nombre: Locator;
  readonly correo: Locator;
  readonly clave: Locator;
  readonly confirmacion: Locator;
  readonly botonRegistrarme: Locator;
  readonly mensaje: Locator;

  constructor(page: Page) {
    this.nombre = page.getByRole('textbox', { name: 'Nombre', exact: true });
    this.correo = page.getByRole('textbox', { name: 'Correo', exact: true });
    this.clave = page.getByRole('textbox', { name: 'Contraseña', exact: true });
    this.confirmacion = page.getByRole('textbox', { name: 'Confirmación', exact: true });
    this.botonRegistrarme = page.getByRole('button', { name: 'Registrarme', exact: true });
    this.mensaje = page.locator('#mensaje');
  }

  async completarFormulario(datos: DatosRegistro) {
    await this.nombre.fill(datos.nombre);
    await this.correo.fill(datos.correo);
    await this.clave.fill(datos.clave);
    await this.confirmacion.fill(datos.confirmacion);
  }

  async registrar() {
    await this.botonRegistrarme.click();
  }
}