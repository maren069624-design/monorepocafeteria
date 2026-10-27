import type { Locator, Page } from '@playwright/test';

export class PaginaAutenticacion {
  readonly correo: Locator;
  readonly clave: Locator;
  readonly botonIniciarSesion: Locator;

  constructor(private readonly page: Page) {
    this.correo = page.getByRole('textbox', { name: 'Correo' });
    this.clave = page.getByRole('textbox', { name: 'Contraseña' });
    this.botonIniciarSesion = page.getByRole('button', { name: 'Iniciar sesión' });
  }

  async ir() {
    await this.page.goto('/');
  }

  async iniciarSesion(correo: string, clave: string) {
    await this.correo.fill(correo);
    await this.clave.fill(clave);
    await this.botonIniciarSesion.click();
  }
}