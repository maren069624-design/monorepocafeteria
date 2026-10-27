import { test as base, expect } from './autenticacion.fixture';
import { PaginaLogout } from '../PO/PaginaLogout';

type FixturesLogout = {
  paginaLogout: PaginaLogout;
};

export const test = base.extend<FixturesLogout>({
  paginaLogout: async ({ paginaAutenticada }, use) => {
    await use(new PaginaLogout(paginaAutenticada));
  },
});

export { expect };