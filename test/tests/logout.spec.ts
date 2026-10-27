import { test, expect } from '../fixtures/logout.fixture';

test('cierra la sesión del usuario autenticado', async ({ paginaLogout }) => {
  await paginaLogout.cerrarSesion();

  await expect(paginaLogout.botonIniciarSesion).toBeVisible();
});