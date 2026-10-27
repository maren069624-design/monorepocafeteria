import { test, expect } from '@playwright/test';
import { PaginaAutenticacion } from '../PO/PaginaAutenticacion';
import { usuarioDePrueba } from '../data/usuarios';

test('inicia sesión con credenciales válidas', async ({ page }) => {
  
  const autenticacion = new PaginaAutenticacion(page);
  await autenticacion.ir();
  await autenticacion.iniciarSesion(usuarioDePrueba.correo, usuarioDePrueba.clave);

  await expect(autenticacion.botonIniciarSesion).not.toBeVisible();
});