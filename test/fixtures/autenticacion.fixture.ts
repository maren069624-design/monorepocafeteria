import { type Page, test as base, expect } from '@playwright/test';
import { usuarioDePrueba } from '../data/usuarios';
import { PaginaAutenticacion } from '../PO/PaginaAutenticacion';

type Fixtures = {
  paginaAutenticada: Page;
};

export const test = base.extend<Fixtures>({
  paginaAutenticada: async ({ page }, use) => {
    const autenticacion = new PaginaAutenticacion(page);
    await autenticacion.ir();
    await autenticacion.iniciarSesion(usuarioDePrueba.correo, usuarioDePrueba.clave);

    await use(page);
  },
});

export { expect };