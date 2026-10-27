import type { Locator, Page } from '@playwright/test';

export class PaginaLogout {
  readonly botonCerrarSesion: Locator;
  readonly botonIniciarSesion: Locator;

  constructor(page: Page) {
    this.botonCerrarSesion = page.getByRole('button', { name: 'Cerrar sesión' });
    this.botonIniciarSesion = page.getByRole('button', { name: 'Iniciar sesión' });
  }

  async cerrarSesion() {
    await this.botonCerrarSesion.click();
  }
}