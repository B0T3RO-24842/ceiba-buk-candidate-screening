# ScreenFlow

**Sistema de tamizaje automatizado de talento que conecta LinkedIn con BUK.**

ScreenFlow recibe una postulación simulada desde LinkedIn, valida y normaliza los datos del candidato, transforma el evento al contrato de BUK y registra al postulante en la vacante correcta. Todo el flujo ocurre en un único despliegue de Next.js y devuelve trazabilidad completa de cada envío.

> Proyecto académico desarrollado para **CEIBA Software** en el marco del **Reto #1 SENA**, aprobado por la empresa.
>
> Esta es una vitrina de portafolio. La demo usa datos ficticios y un **Mock BUK** interno. No representa una integración en producción ni un acceso oficial a los sistemas de CEIBA.

**Demo:** _(se actualiza al desplegar en Vercel)_
**Contacto:** [LinkedIn — Samuel Botero Londoño](https://www.linkedin.com/in/samuel-botero-londo%C3%B1o-597b38447/)

---

## El problema

El equipo de talento recibe postulaciones por LinkedIn y debe copiarlas manualmente a BUK. Ese puente consume tiempo, genera errores de digitación y pierde candidatos en el camino.

ScreenFlow automatiza el puente con reglas explícitas:

- Normaliza estructuras anidadas o planas de LinkedIn.
- Valida campos obligatorios, correo único y hoja de vida en PDF.
- Fuerza el origen correcto: `origen: "LinkedIn"` y `referrer: "Importadores Curriculum"`.
- Envía el CV en Base64 (máximo 5 MB) o una URL de referencia.
- Devuelve el mapeo, el estado HTTP y la traza del envío a BUK.
- Conserva un formulario web como interfaz secundaria de prueba.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Node.js 24
- Vercel (hosting)

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Landing del proyecto: problema, flujo, arquitectura y notas de producción. |
| `/simulador` | Demo interactiva con casos de éxito, validación y fallo de BUK. |
| `/postular` | Formulario de postulación con preentrevista y evaluación. |
| `/api/simulador` | Recibe el JSON de LinkedIn, mapea, valida y envía a BUK. |
| `/api/postular` | Recibe el formulario y evalúa al candidato. |
| `/api/health` | Estado del servicio y del entorno de BUK configurado. |
| `/api/mock-buk/applicants` | Mock interno de BUK (requiere Bearer token). |
| `/api/mock-buk/health` | Salud del mock interno. |

## Arquitectura

```text
app/
  (site)/
    layout.tsx                 Header y footer compartidos
    page.tsx                   Landing del proyecto
    postular/page.tsx          Formulario de postulación
    simulador/page.tsx         Demo interactiva
  api/
    health/route.ts            Estado del servicio
    mock-buk/
      applicants/route.ts      Mock interno de BUK
      health/route.ts          Salud del mock
    postular/route.ts          Formulario → evaluación → BUK
    simulador/route.ts         JSON LinkedIn → mapeo → BUK
  layout.tsx                   Metadata, fuentes y estilos globales
  robots.ts
  sitemap.ts
components/
  FormularioPostulacion.tsx    UI del formulario
  SimuladorLinkedIn.tsx        UI del simulador
  ScreenFlowLogo.tsx           Marca
  SiteHeader.tsx               Navegación compartida
  SiteFooter.tsx               Footer con contexto académico y contacto
lib/
  mapper.ts                    LinkedIn → modelo interno → payload BUK
  buk.ts                       Cliente HTTP y resolución de entorno
  evaluador.ts                 Validaciones y evaluación
  mock-buk.ts                  Validación y registro del mock interno
  vacantes.ts                  Catálogo y pesos de las vacantes
scripts/
  mock-buk.mjs                 Mock BUK opcional para desarrollo local
types/
  candidato.ts                 Tipos de candidato, LinkedIn y BUK
```

Flujo principal:

```text
JSON LinkedIn
  → POST /api/simulador
  → mapearLinkedInABuk()
  → validarCamposBUK() / validarPDF()
  → enviarABuk()
  → Mock BUK interno o BUK real
  → respuesta con mapeo + estado HTTP + traza
```

Responsabilidades clave:

- `lib/mapper.ts` resuelve alias anidados y planos, valida campos obligatorios, revisa el Base64 del PDF (`%PDF-`, máximo 5 MB), mapea la vacante y fuerza `origen` y `referrer`.
- `lib/buk.ts` centraliza el envío con timeout de 8 segundos, token Bearer, resolución automática del endpoint y resultado estructurado (`ok`, `status`, `endpoint`, `durationMs`, `body`, `error`, `entorno`).
- `app/api/simulador/route.ts` acepta solo JSON, limita el cuerpo a 8 MB, omite el Base64 en la respuesta, responde `422` ante errores de mapeo y `502` cuando BUK falla.
- `lib/mock-buk.ts` valida el contrato, controla el correo único de forma idempotente y enmascara datos en los logs.

## Configuración

Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

Variables:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `BUK_API_TOKEN` | Sí | Token Bearer privado. Se usa tanto para BUK como para el mock interno. |
| `BUK_API_URL` | No | Endpoint POST de BUK. Si está vacío, se usa el mock interno. |
| `BUK_MODE` | No | `mock` o `buk`. Solo etiqueta el entorno en la UI y el health check. |
| `NEXT_PUBLIC_SITE_URL` | No | URL pública para metadata y Open Graph. En Vercel se detecta sola. |
| `MOCK_BUK_PORT` | No | Puerto del mock local opcional (`scripts/mock-buk.mjs`). |

### Resolución del endpoint

1. Si `BUK_API_URL` tiene valor, se usa ese endpoint.
2. Si está vacío y existe `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`, se usa `https://<host>/api/mock-buk/applicants`.
3. En local, si está vacío, se usa `http://localhost:4000/api/v1/applicants`.

El token se lee solo en el servidor mediante `process.env.BUK_API_TOKEN`; nunca se expone al navegador.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Para usar el mock interno sin levantar otro proceso, deja `BUK_API_URL` vacío y define un token:

```dotenv
BUK_API_TOKEN=demo_token_local
BUK_API_URL=
BUK_MODE=mock
```

Abre `http://localhost:3000/simulador` y prueba cualquiera de los escenarios.

Si prefieres el mock independiente de `scripts/mock-buk.mjs`:

```bash
npm run mock:buk
```

y configura `BUK_API_URL=http://localhost:4000/api/v1/applicants`.

## Casos de la demo

| Caso | Qué demuestra | Resultado esperado |
| --- | --- | --- |
| Caso exitoso | Flujo completo con datos válidos y CV PDF. | `200` con ID de BUK. |
| Campo faltante | Validación antes de llamar a BUK. | `422` con el campo señalado. |
| CV inválido | Verificación de la firma `%PDF-`. | `422` sin llamar a BUK. |
| BUK caído | Manejo del fallo del servicio. | `502` con traza del error. |
| Duplicado | Idempotencia por correo. | `200` con `duplicado: true`. |
| Formulario | Evaluación y respuesta neutral. | Postulación recibida. |

## Endpoints

### `POST /api/simulador`

Recibe el JSON de LinkedIn y devuelve el resultado del mapeo y del envío a BUK.

```http
POST /api/simulador
Content-Type: application/json

{
  "source": "LinkedIn",
  "appliedAt": "2026-11-01T15:30:00.000Z",
  "candidate": {
    "firstName": "Ana",
    "lastName": "Pérez",
    "email": "ana.perez@example.com",
    "phone": "+57 300 123 4567",
    "location": { "country": "Colombia", "city": "Bogotá" },
    "cv": {
      "filename": "ana-perez-cv.pdf",
      "mimeType": "application/pdf",
      "base64": "<base64 del PDF>"
    }
  },
  "job": { "id": "DEV-JAVA-SR", "title": "Desarrollador Java Senior" }
}
```

Respuestas:

- `200`: postulante registrado. Incluye `mapeo` y `buk`.
- `400`: JSON inválido.
- `413`: cuerpo mayor a 8 MB.
- `415`: `Content-Type` distinto de `application/json`.
- `422`: faltan campos obligatorios o el CV no es válido. Incluye `mapeo.errores`; no se llama a BUK.
- `502`: BUK no respondió o rechazó el registro. Incluye la traza en `buk`.

### `POST /api/postular`

Formulario web. Recibe `multipart/form-data` con los datos del candidato, el archivo `cv`, el `cargoId` y las `respuestas` de la preentrevista.

Siempre responde de forma neutral, incluso si el candidato no es apto o BUK falla:

```json
{ "success": true, "message": "¡Postulación recibida con éxito!" }
```

Solo los candidatos aptos (sin fallos obligatorios y con compatibilidad mayor o igual al 80%) se envían a BUK.

### `GET /api/health`

Devuelve el estado del servicio, el entorno de BUK y si el token está configurado. No expone el token ni la URL completa con credenciales.

## Contrato de entrada del simulador

El mapper acepta alias anidados y planos. Los principales son:

| Dato | Alias aceptados | Campo BUK |
| --- | --- | --- |
| Correo | `candidate.email`, `email`, `correo`, `contact.email` | `email` |
| Nombre | `candidate.firstName`, `firstName`, `nombre`, `candidate.name` | `nombre` |
| Primer apellido | `candidate.lastName`, `lastName`, `apellido`, `primerApellido` | `primer_apellido` |
| Segundo apellido | `candidate.secondLastName`, `segundoApellido`, `apellido2` | `segundo_apellido` (opcional) |
| Celular | `candidate.phone`, `phone`, `celular`, `telefono` | `celular` |
| País | `candidate.location.country`, `pais`, `country` | `pais` |
| Ciudad | `candidate.location.city`, `ciudad`, `city` | `ciudad` |
| CV Base64 | `candidate.cv.base64`, `cv.contenido_base64`, `cvBase64` | `cv.contenido_base64` |
| Nombre del CV | `candidate.cv.filename`, `cv.nombre_archivo` | `cv.nombre_archivo` |
| Tipo del CV | `candidate.cv.mimeType`, `cv.tipo_mime` | `cv.tipo_mime` |
| Referencia del CV | `candidate.cv.url`, `cv.referencia` | `cv.referencia` (respaldo) |
| ID de vacante | `job.id`, `jobId`, `cargoId`, `vacanteId` | `cargo.id` |
| Título de vacante | `job.title`, `jobTitle`, `cargo.nombre` | `cargo.nombre` |
| Fecha | `appliedAt`, `fecha_postulacion` | `fecha_postulacion` |
| Perfil | `candidate.profileUrl`, `candidate.headline` | `linkedin.profile_url`, `linkedin.headline` |
| Origen | `source`, `origen` | `origen` se fuerza a `"LinkedIn"` |
| Referrer | — | `referrer` se fuerza a `"Importadores Curriculum"` |

Campos obligatorios: `email` (llave única), `nombre`, `primer_apellido`, `celular`, `pais`, `ciudad`, `cv` y `cargo.id`. `habeasData` se fuerza a `true` y se agrega `acepta_tratamiento_datos: true`.

## Validación del CV

- Acepta Base64 puro o data URL (`data:application/pdf;base64,...`).
- Elimina espacios y saltos de línea antes de decodificar.
- Rechaza archivos de más de 5 MB.
- Exige la firma `%PDF-` en los primeros bytes.
- Si no se informa nombre, usa `hoja-de-vida.pdf`; si no se informa MIME, usa `application/pdf`.
- Si llega una URL de referencia, se acepta con una advertencia. El contrato de producción de BUK puede exigir Base64.

## Despliegue en Vercel

1. Importa el repositorio `B0T3RO-24842/ceiba-buk-candidate-screening` en Vercel.
2. Framework preset: **Next.js**.
3. Configura las variables de entorno:

```env
BUK_API_TOKEN=un_token_largo_y_aleatorio
BUK_API_URL=
BUK_MODE=mock
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

4. Deploy.
5. Verifica `/api/health`, `/simulador` y los casos de éxito, `422` y `502`.
6. Cada push a `main` redespliega automáticamente.

### Conectar BUK real

Solo cambia la configuración:

```env
BUK_API_URL=https://tu-instancia.buk.co/api/v1/applicants
BUK_MODE=buk
BUK_API_TOKEN=<token real>
```

El contrato de salida, la validación y la trazabilidad ya están implementados.

## Verificación

```bash
npm run typecheck
npm run build
```

El build debe generar las rutas `/`, `/postular`, `/simulador`, `/api/health`, `/api/postular`, `/api/simulador` y `/api/mock-buk/*`.

## Seguridad y privacidad

- Token de BUK solo en el servidor.
- El Base64 del CV se omite de las respuestas del simulador.
- Las respuestas correctas y los pesos de las vacantes no se envían al navegador del formulario.
- El CV se procesa en memoria; la app no lo almacena en disco.
- El mock enmascara correo y token en sus logs.
- Se envía `habeasData: true` y `acepta_tratamiento_datos: true`.
- El formulario conserva la respuesta neutral para no revelar el resultado del filtro.

## Limitaciones

- El mock guarda registros en memoria; en serverless se reinicia con cada instancia.
- No hay reintentos ni outbox si BUK falla. En el simulador se informa `502`; en el formulario la respuesta sigue siendo neutral.
- No hay rate limiting, CAPTCHA ni autenticación de postulantes.
- Vercel Hobby limita el cuerpo de la petición a ~4,5 MB; para CV grandes usa una URL de referencia.
- Las vacantes y los pesos están en código (`lib/vacantes.ts`).
- La integración real con LinkedIn requeriría su API oficial o un acuerdo de partner, fuera del alcance del reto.
- No incluye panel de reclutador ni persistencia local.

## Contexto académico

Proyecto desarrollado para **CEIBA Software** en el marco del **Reto #1 SENA** y aprobado por la empresa. El objetivo del reto era conectar las postulaciones de LinkedIn con BUK sin intervención manual, manteniendo validación, trazabilidad y privacidad de los datos.

Esta publicación es una demostración de portafolio. No afirma uso en producción ni afiliación oficial más allá del reto académico.
