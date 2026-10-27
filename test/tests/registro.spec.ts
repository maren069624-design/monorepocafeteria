import { test, expect } from '../fixtures/registro.fixture';
import { usuariosRegistro } from '../data/usuariosRegistro';

for (const datos of usuariosRegistro) {
	test(
		`resultado del registro de ${datos.nombre}: ${datos.mensaje}`,
		{ tag: '@acceptanceTest' },
		async ({ paginaRegistro }) => {
			await paginaRegistro.completarFormulario(datos);
			await paginaRegistro.registrar();

			await expect(paginaRegistro.mensaje).toContainText(datos.mensaje);
		},
	);
}