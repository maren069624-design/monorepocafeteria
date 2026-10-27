import type { Locator, Page } from '@playwright/test';

export class PaginaInicio {
  readonly botonCrearCuenta: Locator;

  constructor(private readonly page: Page) {
    this.botonCrearCuenta = page.getByRole('button', {
      name: 'Crear cuenta',
      exact: true,
    });
  }

  async ir() {
    await this.page.goto('/');
  }

  async abrirRegistro() {
    await this.botonCrearCuenta.click();
  }
}