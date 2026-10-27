import { test as base, expect } from '@playwright/test';
import { PaginaInicio } from '../PO/PaginaInicio';
import { PaginaRegistro } from '../PO/PaginaRegistro';

type FixturesRegistro = {
  paginaRegistro: PaginaRegistro;
};

export const test = base.extend<FixturesRegistro>({
  paginaRegistro: async ({ page }, use) => {
    const paginaInicio = new PaginaInicio(page);
    await paginaInicio.ir();
    await paginaInicio.abrirRegistro();

    await use(new PaginaRegistro(page));
  },
});

export { expect };