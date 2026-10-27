# Guía técnica: Playwright con JavaScript y TypeScript

Referencia técnica para el tutor de IA y para el estudiante. Todo lo que se proponga (estructura, localizadores, fixtures, specs, configuración) debe ser coherente con esta guía.

> Las versiones de paquetes se verifican antes de instalar (por ejemplo, con `npm view @playwright/test version`). Los ejemplos de esta guía no fijan una versión vigente.

---

## 1. Qué es Playwright

Playwright automatiza navegadores (Chromium, Firefox y WebKit). Con él, el código abre una página, interactúa como lo haría una persona y verifica resultados.

Sus piezas principales:

1. **Browser, context y page**: el navegador, una sesión aislada con sus propias cookies, y una pestaña.
2. **Locators**: la forma de encontrar elementos. Se evalúan justo antes de actuar.
3. **Acciones**: `click`, `fill`, `check`, `selectOption`, `goto`.
4. **Assertions** (`expect`): verifican el estado del elemento y reintentan hasta que se cumpla o venza el tiempo de espera.
5. **Test runner**: ejecuta los archivos `*.spec.js` o `*.spec.ts`, reporta resultados y permite usar fixtures.

---

## 2. Proyecto y configuración

**Instalación (JavaScript con ES modules):**

```bash
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

**`package.json`:**

```json
{
  "name": "pruebas-cafe",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test"
  }
}
```

`"type": "module"` permite usar `import` y `export`. Sin esa línea, Node espera la sintaxis antigua (`require`).

**`playwright.config.js`:**

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

Con `baseURL`, los `goto('/')` son relativos. Así, si cambia la dirección de la app, solo se modifica la configuración.

**Ejecutar:**

```bash
npm test
```

---

## 3. Localizadores

Los localizadores buscan elementos. Playwright recomienda elegirlos en este orden, del más estable al más frágil:

1. **`getByRole`**: por rol y nombre accesible. Es lo que ve una persona o un lector de pantalla.
2. **`getByLabel`**: para campos de formulario, por su etiqueta.
3. **`getByText`**: para mensajes o textos visibles.
4. **`getByTestId`**: por el atributo `data-testid`. Útil para valores o elementos repetidos.
5. **CSS o XPath**: solo si nada de lo anterior sirve.

**Ejemplos:**

```js
await page.getByRole('button', { name: 'Iniciar sesión' }).click();
await page.getByLabel('Correo').fill('estudiante1@cafe.test');
await expect(page.getByTestId('subtotal')).toHaveText('$12000');
```

**Trampas frecuentes:**

- **Coincidencia parcial.** Por defecto, `name` coincide con cualquier parte del texto, sin distinguir mayúsculas. Si hay un botón "Carrito" y otros con "carrito", el localizador encuentra varios. Usa `exact: true`.

  ```js
  page.getByRole('button', { name: 'Carrito', exact: true })
  ```

- **Elementos repetidos.** Si cada fila tiene su propio botón "Cancelar", acota primero la fila y busca dentro de ella:

  ```js
  page.getByTestId('pedido-7').getByRole('button', { name: 'Cancelar' })
  ```

- **Strict mode.** Si un localizador encuentra más de un elemento y se usa una acción, Playwright falla con *strict mode violation*. Es una señal de que el localizador es ambiguo, no un error de Playwright.

- **Valores que no son controles.** Un `<strong>` no tiene rol. Para leerlo, usa `getByTestId` o `getByText`.

---

## 4. Acciones y esperas

- Playwright espera automáticamente a que un elemento sea visible, esté habilitado y estable antes de actuar. No necesitas `sleep` ni `waitForTimeout`.
- `fill` escribe el texto de una vez. `type` escribe carácter por carácter; úsalo solo si necesitas simular tecleo.
- `click` hace clic; `check` marca una casilla; `selectOption` elige una opción de una lista.
- `page.goto('/')` abre la URL base configurada.

**Regla:** toda acción de Playwright devuelve una promesa. Cada una lleva `await`.

---

## 5. Aserciones (`expect`)

`expect` reintenta la comprobación hasta que se cumpla o se agote el tiempo de espera. Por eso es preferible a comprobar a mano.

```js
await expect(page.getByRole('heading', { name: 'Carrito' })).toBeVisible();
await expect(page.getByTestId('subtotal')).toHaveText('$12000');
await expect(page.getByRole('listitem')).toHaveCount(3);
```

Verificaciones frecuentes: `toBeVisible`, `toHaveText`, `toHaveValue`, `toHaveCount`, `toBeEnabled`, `toHaveURL`.

---

## 6. Fixtures

### Qué es

Un fixture es una pieza de preparación que una prueba pide por nombre. Playwright la ejecuta antes de la prueba y, al terminar, ejecuta lo que va después de `use(...)`.

```text
antes de use(...)    →  preparación
use(page)            →  entrega el valor a la prueba
después de use(...)  →  limpieza (opcional)
```

### Fixture de login

El fixture usa la página de login (sección 8) y entrega una página ya logueada:

```js
// fixtures/login.js
import { test as base, expect } from '@playwright/test';
import { PaginaLogin } from '../pages/PaginaLogin.js';
import { usuarioDePrueba } from '../data/usuarios.js';

export const test = base.extend({
  paginaLogueada: async ({ page }, use) => {
    const login = new PaginaLogin(page);
    await login.ir();
    await login.iniciarSesion(usuarioDePrueba.correo, usuarioDePrueba.clave);
    await expect(page.getByRole('button', { name: 'Carrito', exact: true })).toBeVisible();

    await use(page);
  },
});

export { expect };
```

La prueba lo pide por nombre:

```js
import { test, expect } from '../fixtures/login.js';

test('...', async ({ paginaLogueada: page }) => {
  // la prueba empieza ya logueada
});
```

### Por qué no iniciar sesión en cada prueba

Iniciar sesión en cada prueba es lento y repite código. Hay dos alternativas:

- **Fixture que hace el login** (como arriba): simple y legible.
- **`storageState`**: el login se hace una vez y las cookies se guardan en un archivo JSON. Las pruebas arrancan ya logueadas. Es más rápido, pero el archivo es una credencial: debe ir en `.gitignore`.

Si la sesión vive en el servidor (como `express-session`), la cookie guardada deja de valer al reiniciar el servidor. En ese caso, regenera el archivo.

---

## 7. Archivos `*.spec`

- Un archivo `*.spec.js` (o `*.spec.ts`) contiene **las pruebas**: bloques `test(...)` con sus `expect(...)`.
- Playwright reconoce como prueba los archivos con `.spec.` o `.test.` en el nombre. Por eso `fixtures/login.js` no se ejecuta solo: es código que se importa.
- Un spec no contiene localizadores ni URLs. Usa fixtures y pages (sección 8).
- Un archivo de preparación que no es un test, como `auth.setup.js`, se declara en `playwright.config` con su propio `testMatch` si se usa como proyecto `setup`.

```js
// tests/login.spec.js
import { test, expect } from '../fixtures/login.js';

test('el usuario logueado ve el menú de la tienda', async ({ paginaLogueada: page }) => {
  await expect(page.getByRole('button', { name: 'Carrito', exact: true })).toBeVisible();
});
```

---

## 8. Modelo en capas (recomendado)

Este modelo separa responsabilidades para que un cambio en la aplicación toque un solo archivo.

```text
tests/        login.spec.js     Qué se verifica
   ↓
fixtures/     login.js          Cómo se prepara el estado
   ↓
pages/        PaginaLogin.js    Cómo se encuentra y se usa cada pantalla
   ↓
Playwright    page, expect
```

| Capa | Carpeta | Contiene | No contiene |
|---|---|---|---|
| Pruebas | `tests/` | `test(...)`, `expect(...)`, el flujo de la prueba | Localizadores, URLs, datos fijos |
| Fixtures | `fixtures/` | Preparación y limpieza del estado | Verificaciones de negocio |
| Pages | `pages/` | Localizadores y acciones de una pantalla | Verificaciones, datos de negocio |
| Datos | `data/` | Credenciales, productos, valores de prueba | Lógica |

**Reglas:**

1. **Los selectores viven solo en `pages/`.** Si un localizador aparece en un spec o en un fixture, muévelo a una página.
2. **Las dependencias solo van hacia abajo.** Un spec usa un fixture y un fixture usa una page. Una page nunca importa un spec ni un fixture.
3. **Un método de la page describe una acción de la pantalla**, por ejemplo `iniciarSesion`, no un paso de la prueba.
4. **Un fixture prepara y entrega**: lo que hace antes de `use(...)` es la preparación.
5. **Las verificaciones van en los specs.**
6. **Los datos van en `data/`**, no escritos dentro de la prueba ni de la page.

**Estructura de carpetas:**

```text
pruebas-cafe/
├── playwright.config.js
├── package.json
├── data/
│   └── usuarios.js
├── pages/
│   └── PaginaLogin.js
├── fixtures/
│   └── login.js
└── tests/
    └── login.spec.js
```

**Datos:**

```js
// data/usuarios.js
export const usuarioDePrueba = {
  correo: 'estudiante1@cafe.test',
  clave: 'Cafe2026',
};
```

**Page (localizadores y acciones de la pantalla):**

```js
// pages/PaginaLogin.js
export class PaginaLogin {
  constructor(page) {
    this.page = page;
    this.correo = page.getByLabel('Correo');
    this.clave = page.getByLabel('Contraseña');
    this.botonIngresar = page.getByRole('button', { name: 'Iniciar sesión' });
  }

  async ir() {
    await this.page.goto('/');
  }

  async iniciarSesion(correo, clave) {
    await this.correo.fill(correo);
    await this.clave.fill(clave);
    await this.botonIngresar.click();
  }
}
```

**Spec (solo comportamiento y verificación):**

```js
// tests/login.spec.js
import { test, expect } from '../fixtures/login.js';

test('el usuario logueado ve el menú de la tienda', async ({ paginaLogueada: page }) => {
  await expect(page.getByRole('button', { name: 'Carrito', exact: true })).toBeVisible();
});
```

**Analogía con Serenity BDD** (para quien ya conoce Screenplay):

| Playwright | Serenity BDD |
|---|---|
| `pages/` | `ui/` (localizadores) |
| `fixtures/` | hooks de preparación |
| `tests/` | features y step definitions |

---

## 9. JavaScript básico

Lo mínimo para leer las pruebas:

- **Variables:** `const` por defecto; `let` cuando el valor cambia; `var` no se usa.
- **Tipos:** texto (`'...'`), número, `true` / `false`, `null` (sin valor a propósito), `undefined` (sin valor todavía).
- **Objetos:** datos con nombre, `{ correo: '...', clave: '...' }`. Se leen con punto: `usuario.correo`.
- **Arreglos:** listas ordenadas; el primer elemento es el índice `0`.
- **Plantillas de texto:** `` `Hola ${nombre}` ``.
- **Funciones:** `function nombre() {}` o flecha `() => {}`.
- **Desestructuración:** `const { correo, clave } = usuario;` saca propiedades a variables. En una prueba, `async ({ page }) => ...` toma `page` del objeto que Playwright entrega.
- **Métodos:** `page.getByRole(...)` es una llamada a un método que devuelve un locator; el locator tiene sus propios métodos, como `.fill(...)`.
- **`async` y `await`:** `async` permite usar `await`; `await` espera a que termine la acción. Sin `await`, la prueba sigue sin esperar.
- **`import` y `export`:** `export` pone algo a disposición; `import { x } from '...'` lo trae. `./` es la misma carpeta; `../` es una carpeta arriba.

---

## 10. TypeScript: qué cambia

Todo código JavaScript válido también es TypeScript válido. Cambian estos puntos:

- Los archivos cambian de extensión: `.js` pasa a `.ts`.
- Las variables pueden llevar tipo: `const correo: string = '...';`.
- Un objeto puede tener forma definida con `type`:

  ```ts
  type Credenciales = { correo: string; clave: string };
  ```

- Los fixtures pueden tipar lo que entregan:

  ```ts
  import { test as base, expect, type Page } from '@playwright/test';

  type Fixtures = { paginaLogueada: Page };

  export const test = base.extend<Fixtures>({ ... });
  ```

- Si un nombre está mal escrito, el editor lo marca antes de ejecutar.
- El `import` no lleva `.js` al final: `import { test } from './fixtures/login';`.
- Los comandos y la lógica de Playwright son los mismos.

---

## 11. Errores frecuentes

| Mensaje o síntoma | Qué significa | Qué revisar |
|---|---|---|
| `strict mode violation` | El localizador encontró más de un elemento | Usa `exact: true` o acota con otro localizador |
| `Timeout exceeded` | El elemento no apareció o el localizador no coincide | Revisa el nombre accesible y que la página haya cargado |
| `TypeError: ... is not a function` | Un método se escribió mal o no existe | Compara con la documentación del objeto |
| La prueba pasa sin verificar nada | Falta `await` antes de `expect` o de una acción | Revisa cada `await` |
| `Cannot find module` | La ruta del `import` no existe o falta `"type": "module"` | Revisa la ruta relativa y el `package.json` |
| Las pruebas fallan después de la primera ejecución | El estado de la app cambió (datos o sesión) | Reinicia los datos de la app y vuelve a correr |

---

## 12. Buenas prácticas

- No uses `waitForTimeout`. Usa `expect` o una acción con espera automática.
- No uses localizadores posicionales (`nth(2)`, `first()`) sin una razón clara: se rompen si cambia el orden.
- No pongas credenciales reales en el código. Usa `data/` y, si es necesario, variables de entorno.
- Cada prueba debe poder correr sola, sin depender del orden de otras.
- Cada archivo tiene una sola responsabilidad: una page por pantalla, un fixture por tipo de preparación.

---

## 13. Convenciones

- Nombres de carpetas en minúscula: `tests`, `fixtures`, `pages`, `data`.
- Nombres de clases en `PascalCase`: `PaginaLogin`.
- Nombres de funciones, métodos y variables en `camelCase`: `iniciarSesion`, `usuarioDePrueba`.
- Archivos de pruebas con `.spec.js`: `login.spec.js`.
- Los nombres se escriben en español, salvo que el estudiante pida lo contrario de manera explícita.
