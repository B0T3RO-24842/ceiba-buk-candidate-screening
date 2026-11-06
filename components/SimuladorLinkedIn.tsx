"use client";

import { useMemo, useState } from "react";

interface NormalizadoRespuesta {
  email?: string;
  nombre?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  celular?: string;
  pais?: string;
  ciudad?: string;
  cargo?: { id?: string; nombre?: string };
  cv?: {
    nombre_archivo?: string;
    tipo_mime?: string;
    tamano_bytes?: number;
    contenido_base64?: string;
    referencia?: string;
  };
  origen?: string;
  referrer?: string;
}

interface MapeoRespuesta {
  errores: Record<string, string>;
  advertencias: string[];
  normalizado: NormalizadoRespuesta | null;
  payload: unknown;
}

interface BukRespuesta {
  ok: boolean;
  status: number | null;
  endpoint: string;
  durationMs: number;
  body: unknown;
  error?: string;
  entorno?: "mock" | "buk";
}

interface ResultadoServidor {
  success: boolean;
  httpStatus: number;
  message: string;
  mapeo?: MapeoRespuesta;
  buk?: BukRespuesta;
}

interface CandidatoVista {
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  cargo: string;
  cargoId: string;
  cvNombre: string;
  cvTamano: string;
}

const CV_BASE64_EJEMPLO =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+PgolJUVPRg==";

const EJEMPLO_LINKEDIN = {
  event: "application.created",
  source: "LinkedIn",
  appliedAt: "2026-11-01T15:30:00.000Z",
  candidate: {
    firstName: "Ana",
    lastName: "Pérez",
    secondLastName: "Gómez",
    email: "ana.perez@example.com",
    phone: "+57 300 123 4567",
    headline: "Backend Developer | Java & Spring Boot",
    profileUrl: "https://www.linkedin.com/in/ana-perez-demo",
    location: { country: "Colombia", city: "Bogotá" },
    cv: {
      filename: "ana-perez-cv.pdf",
      mimeType: "application/pdf",
      base64: CV_BASE64_EJEMPLO,
    },
  },
  job: {
    id: "DEV-JAVA-SR",
    title: "Desarrollador Java Senior",
  },
};

type EjemploLinkedIn = typeof EJEMPLO_LINKEDIN;
type EjemploConBandera = EjemploLinkedIn & { demoForceBukFailure?: boolean };

function crearJson(modificar?: (payload: EjemploConBandera) => void): string {
  const copia = JSON.parse(JSON.stringify(EJEMPLO_LINKEDIN)) as EjemploConBandera;
  modificar?.(copia);
  return JSON.stringify(copia, null, 2);
}

const CASOS = [
  {
    id: "exito",
    etiqueta: "Caso exitoso",
    detalle: "Postulación completa",
    tono: "emerald",
    json: crearJson(),
  },
  {
    id: "faltante",
    etiqueta: "Campo faltante",
    detalle: "Llega sin correo",
    tono: "amber",
    json: crearJson((payload) => {
      delete (payload.candidate as Record<string, unknown>).email;
    }),
  },
  {
    id: "cv",
    etiqueta: "CV inválido",
    detalle: "El archivo no es PDF",
    tono: "amber",
    json: crearJson((payload) => {
      payload.candidate.cv.base64 = "esto-no-es-un-pdf";
    }),
  },
  {
    id: "buk",
    etiqueta: "BUK caído",
    detalle: "El servicio responde 503",
    tono: "red",
    json: crearJson((payload) => {
      payload.demoForceBukFailure = true;
    }),
  },
];

const ETIQUETAS_CAMPO: Record<string, string> = {
  email: "Correo electrónico",
  nombre: "Nombre",
  primer_apellido: "Primer apellido",
  segundo_apellido: "Segundo apellido",
  celular: "Celular",
  pais: "País",
  ciudad: "Ciudad",
  cv: "Hoja de vida",
  cargo: "Cargo",
  habeasData: "Autorización de datos",
  origen: "Origen",
  referrer: "Referrer",
  job: "Vacante",
  candidate: "Candidato",
  payload: "Payload",
};

const LIMITE_STRING = 240;

const BOTON_SECUNDARIO =
  "inline-flex items-center justify-center rounded-xl border border-cream-edge bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-dark/50 hover:bg-cream-deep focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60";

function formatearBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function formatearJson(valor: unknown): string {
  if (typeof valor === "string") return valor;
  try {
    return JSON.stringify(valor, null, 2);
  } catch {
    return String(valor);
  }
}

function redactar(valor: unknown): unknown {
  if (typeof valor === "string") {
    if (valor.length > LIMITE_STRING) {
      return `${valor.slice(0, 80)}… (${valor.length} caracteres)`;
    }
    return valor;
  }

  if (Array.isArray(valor)) return valor.map(redactar);

  if (valor && typeof valor === "object") {
    const salida: Record<string, unknown> = {};
    for (const [clave, item] of Object.entries(valor)) {
      salida[clave] = redactar(item);
    }
    return salida;
  }

  return valor;
}

function leerCampo(objeto: unknown, clave: string): string {
  if (objeto && typeof objeto === "object" && clave in objeto) {
    const valor = (objeto as Record<string, unknown>)[clave];
    if (typeof valor === "string" || typeof valor === "number") return String(valor);
  }
  return "";
}

function texto(valor: unknown): string {
  return typeof valor === "string" || typeof valor === "number"
    ? String(valor).trim()
    : "";
}

function objeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

function leerCandidato(entrada: unknown): CandidatoVista | null {
  if (!entrada || typeof entrada !== "object") return null;

  const raiz = objeto(entrada);
  const candidato = objeto(raiz.candidate);
  const ubicacion = objeto(candidato.location);
  const cv = objeto(candidato.cv);
  const cargo = objeto(raiz.job);

  const nombre = [
    texto(candidato.firstName),
    texto(candidato.lastName),
    texto(candidato.secondLastName),
  ]
    .filter(Boolean)
    .join(" ");

  const base64 = texto(cv.base64);
  const tamano = base64 ? Math.round((base64.length * 3) / 4) : 0;

  return {
    nombre: nombre || "Postulante sin nombre",
    email: texto(candidato.email) || "Sin correo",
    telefono: texto(candidato.phone),
    ubicacion: [texto(ubicacion.city), texto(ubicacion.country)]
      .filter(Boolean)
      .join(", "),
    cargo: texto(cargo.title) || "Vacante sin título",
    cargoId: texto(cargo.id),
    cvNombre: texto(cv.filename) || "Sin hoja de vida",
    cvTamano: formatearBytes(tamano),
  };
}

function iniciales(nombre: string): string {
  const partes = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase());
  return partes.join("") || "?";
}

export default function SimuladorLinkedIn() {
  const [entrada, setEntrada] = useState(crearJson());
  const [resultado, setResultado] = useState<ResultadoServidor | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [casoActivo, setCasoActivo] = useState<string | null>(null);
  const [mostrarEditor, setMostrarEditor] = useState(false);

  const entradaParseada = useMemo<unknown>(() => {
    try {
      return JSON.parse(entrada);
    } catch {
      return null;
    }
  }, [entrada]);

  const candidato = useMemo(() => leerCandidato(entradaParseada), [entradaParseada]);

  const erroresMapeo = resultado?.mapeo?.errores ?? {};
  const advertencias = resultado?.mapeo?.advertencias ?? [];
  const bukId = leerCampo(resultado?.buk?.body, "id");
  const entorno =
    resultado?.buk?.entorno === "buk" ? "BUK" : "Mock BUK";

  async function ejecutar(textoJson: string) {
    if (enviando) return;

    setError("");
    setResultado(null);

    try {
      JSON.parse(textoJson);
    } catch {
      setError("El texto no es un JSON válido. Corrige la sintaxis antes de procesar.");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch("/api/simulador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: textoJson,
      });

      const contenido = await respuesta.text();
      let data: ResultadoServidor;

      try {
        data = JSON.parse(contenido) as ResultadoServidor;
      } catch {
        data = {
          success: false,
          httpStatus: respuesta.status,
          message: contenido || "El servidor devolvió una respuesta no JSON.",
        };
      }

      setResultado({ ...data, httpStatus: respuesta.status });
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  function aplicarCaso(caso: (typeof CASOS)[number]) {
    setCasoActivo(caso.id);
    setEntrada(caso.json);
    setError("");
    setResultado(null);
    void ejecutar(caso.json);
  }

  function procesar() {
    setCasoActivo(null);
    void ejecutar(entrada);
  }

  const estado = !resultado
    ? null
    : resultado.success
      ? "exito"
      : resultado.httpStatus === 422
        ? "validacion"
        : "fallo";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-ink">
          Demo interactiva
        </span>
        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Así viaja una postulación a BUK
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
          Elige un escenario y observa qué hace ScreenFlow con la postulación. Los
          datos son ficticios y el envío se hace a un Mock BUK.
        </p>
      </div>

      <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CASOS.map((caso) => {
          const activo = casoActivo === caso.id;
          return (
            <button
              key={caso.id}
              type="button"
              onClick={() => aplicarCaso(caso)}
              disabled={enviando}
              aria-pressed={activo}
              className={`rounded-2xl border p-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                activo
                  ? "border-brand-dark bg-brand-soft/70 shadow-sm"
                  : "border-cream-edge bg-white hover:border-brand-dark/40 hover:bg-cream-deep/60"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">{caso.etiqueta}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    caso.tono === "emerald"
                      ? "bg-emerald-500"
                      : caso.tono === "amber"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
              </span>
              <span className="mt-1 block text-xs text-ink-muted">
                {caso.detalle}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="panel-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-edge bg-cream-deep/60 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-ink">
                1. Postulación recibida
              </h2>
              <p className="text-xs text-ink-muted">
                Evento simulado desde LinkedIn
              </p>
            </div>
            <span className="rounded-full bg-ink px-3 py-1 font-mono text-[11px] font-semibold text-brand">
              application.created
            </span>
          </div>

          <div className="p-5">
            {candidato ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-base font-black text-ink">
                    {iniciales(candidato.nombre)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-ink">
                      {candidato.nombre}
                    </p>
                    <p className="truncate text-sm text-ink-muted">
                      {candidato.email}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-[#0a66c2]/10 px-2.5 py-1 text-[11px] font-bold text-[#0a66c2]">
                    LinkedIn
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-cream-edge bg-cream-deep/40 p-3">
                    <dt className="text-xs font-semibold text-ink-muted">
                      Vacante
                    </dt>
                    <dd className="mt-0.5 font-semibold text-ink">
                      {candidato.cargo}
                    </dd>
                    {candidato.cargoId && (
                      <dd className="font-mono text-[11px] text-ink-muted">
                        {candidato.cargoId}
                      </dd>
                    )}
                  </div>
                  <div className="rounded-xl border border-cream-edge bg-cream-deep/40 p-3">
                    <dt className="text-xs font-semibold text-ink-muted">
                      Ubicación
                    </dt>
                    <dd className="mt-0.5 font-semibold text-ink">
                      {candidato.ubicacion || "No informada"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-cream-edge bg-cream-deep/40 p-3">
                    <dt className="text-xs font-semibold text-ink-muted">
                      Celular
                    </dt>
                    <dd className="mt-0.5 font-semibold text-ink">
                      {candidato.telefono || "No informado"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-cream-edge bg-cream-deep/40 p-3">
                    <dt className="text-xs font-semibold text-ink-muted">
                      Hoja de vida
                    </dt>
                    <dd className="mt-0.5 truncate font-semibold text-ink">
                      {candidato.cvNombre}
                    </dd>
                    <dd className="text-[11px] text-ink-muted">
                      {candidato.cvTamano}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                El editor no contiene un JSON válido. Corrige la sintaxis para ver
                el resumen del candidato.
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={procesar}
                disabled={enviando}
                className="btn-primary"
              >
                {enviando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                    Procesando…
                  </>
                ) : (
                  "Procesar postulación"
                )}
              </button>
              <button
                type="button"
                onClick={() => setMostrarEditor((valor) => !valor)}
                className={BOTON_SECUNDARIO}
                aria-expanded={mostrarEditor}
              >
                {mostrarEditor ? "Ocultar JSON" : "Ver o editar JSON"}
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
              >
                {error}
              </p>
            )}

            {mostrarEditor && (
              <div className="mt-5">
                <label
                  htmlFor="json-entrada"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  JSON de entrada
                </label>
                <textarea
                  id="json-entrada"
                  value={entrada}
                  onChange={(event) => setEntrada(event.target.value)}
                  spellCheck={false}
                  className="field-control min-h-[22rem] resize-y font-mono text-xs leading-relaxed"
                />
                <p className="field-help">
                  Puedes modificar los datos y volver a procesar. El Base64 del CV
                  se omite en las respuestas por seguridad.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="panel-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-edge bg-cream-deep/60 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-ink">2. Resultado en BUK</h2>
              <p className="text-xs text-ink-muted">
                Validación, mapeo y envío
              </p>
            </div>
            {resultado && (
              <span className="rounded-full border border-cream-edge bg-white px-3 py-1 text-xs font-bold text-ink">
                HTTP {resultado.httpStatus}
              </span>
            )}
          </div>

          <div className="p-5">
            {!resultado && !enviando && (
              <div className="rounded-2xl border border-dashed border-cream-edge bg-cream-deep/40 p-5 text-sm text-ink-muted">
                <p className="font-semibold text-ink">Todo listo para probar</p>
                <p className="mt-1">
                  Elige un escenario arriba o pulsa{" "}
                  <strong className="text-ink">Procesar postulación</strong> para ver
                  el resultado del flujo.
                </p>
              </div>
            )}

            {enviando && (
              <div className="rounded-2xl border border-cream-edge bg-cream-deep/40 p-5 text-sm text-ink-muted">
                Enviando la postulación a BUK…
              </div>
            )}

            {resultado && estado && (
              <>
                <div
                  className={`rounded-2xl border p-4 ${
                    estado === "exito"
                      ? "border-emerald-200 bg-emerald-50"
                      : estado === "validacion"
                        ? "border-amber-200 bg-amber-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-black ${
                        estado === "exito"
                          ? "bg-emerald-600 text-white"
                          : estado === "validacion"
                            ? "bg-amber-500 text-white"
                            : "bg-red-600 text-white"
                      }`}
                    >
                      {estado === "exito" ? "✓" : estado === "validacion" ? "!" : "×"}
                    </span>
                    <div>
                      <p
                        className={`text-base font-bold ${
                          estado === "exito"
                            ? "text-emerald-900"
                            : estado === "validacion"
                              ? "text-amber-900"
                              : "text-red-900"
                        }`}
                      >
                        {estado === "exito"
                          ? "Postulación registrada en BUK"
                          : estado === "validacion"
                            ? "La postulación necesita correcciones"
                            : "BUK no confirmó el registro"}
                      </p>
                      <p
                        className={`mt-1 text-sm ${
                          estado === "exito"
                            ? "text-emerald-800"
                            : estado === "validacion"
                              ? "text-amber-800"
                              : "text-red-800"
                        }`}
                      >
                        {resultado.message}
                      </p>
                    </div>
                  </div>
                </div>

                <ol className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { titulo: "Recibida", ok: true },
                    {
                      titulo: "Validada",
                      ok: Object.keys(erroresMapeo).length === 0,
                    },
                    {
                      titulo: "Registrada",
                      ok: Boolean(resultado.buk?.ok),
                    },
                  ].map((paso) => (
                    <li
                      key={paso.titulo}
                      className={`rounded-xl border p-2.5 ${
                        paso.ok
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-red-200 bg-red-50 text-red-900"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {paso.ok ? "✓" : "×"}
                      </span>
                      <span className="text-[11px] font-semibold">
                        {paso.titulo}
                      </span>
                    </li>
                  ))}
                </ol>

                <dl className="mt-4 grid gap-2 rounded-2xl border border-cream-edge bg-cream-deep/40 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted">
                      Entorno
                    </dt>
                    <dd className="font-semibold text-ink">{entorno}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted">
                      Duración del envío
                    </dt>
                    <dd className="font-semibold text-ink">
                      {resultado.buk
                        ? `${resultado.buk.durationMs} ms`
                        : "No se envió"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted">
                      Estado de BUK
                    </dt>
                    <dd className="font-semibold text-ink">
                      {resultado.buk?.status ?? "Sin respuesta"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-muted">
                      ID del registro
                    </dt>
                    <dd className="font-mono text-xs font-semibold text-ink">
                      {bukId || "—"}
                    </dd>
                  </div>
                </dl>

                {Object.keys(erroresMapeo).length > 0 && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-900">
                      Qué debe corregirse
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-red-800">
                      {Object.entries(erroresMapeo).map(([campo, mensaje]) => (
                        <li key={campo} className="flex gap-2">
                          <span className="font-bold">•</span>
                          <span>
                            <strong>
                              {ETIQUETAS_CAMPO[campo] ?? campo}:
                            </strong>{" "}
                            {mensaje}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resultado.buk?.error && (
                  <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                    {resultado.buk.error}
                  </p>
                )}

                {advertencias.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Advertencias</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {advertencias.map((advertencia) => (
                        <li key={advertencia}>{advertencia}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <details className="panel-card p-5">
          <summary className="cursor-pointer list-none text-sm font-bold text-ink">
            Ver payload transformado para BUK
            <span className="ml-2 text-xs font-semibold text-ink-muted">
              (técnico)
            </span>
          </summary>
          {resultado?.mapeo?.payload ? (
            <pre className="mt-4 max-h-96 overflow-auto rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-white/90">
              {formatearJson(redactar(resultado.mapeo.payload))}
            </pre>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-cream-edge bg-cream-deep/40 p-4 text-sm text-ink-muted">
              Procesa un caso exitoso para ver el mapeo LinkedIn → BUK.
            </p>
          )}
        </details>

        <details className="panel-card p-5">
          <summary className="cursor-pointer list-none text-sm font-bold text-ink">
            Ver respuesta completa del servidor
            <span className="ml-2 text-xs font-semibold text-ink-muted">
              (técnico)
            </span>
          </summary>
          {resultado ? (
            <pre className="mt-4 max-h-96 overflow-auto rounded-2xl bg-ink p-4 font-mono text-xs leading-relaxed text-white/90">
              {formatearJson(redactar(resultado))}
            </pre>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-cream-edge bg-cream-deep/40 p-4 text-sm text-ink-muted">
              Aquí verás el estado HTTP, el mapeo y la traza del envío.
            </p>
          )}
        </details>
      </div>

      <div className="mt-6 rounded-2xl border border-cream-edge bg-white/70 p-5">
        <p className="text-sm font-bold text-ink">¿Qué cambia con BUK real?</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Solo la configuración: <code className="rounded bg-cream-deep px-1.5 py-0.5 text-xs">BUK_API_URL</code>{" "}
          y{" "}
          <code className="rounded bg-cream-deep px-1.5 py-0.5 text-xs">BUK_API_TOKEN</code>.
          El contrato de salida, la validación y la trazabilidad ya están
          implementados. CEIBA no entregó credenciales durante el reto, por eso esta
          demo usa un Mock BUK y datos ficticios.
        </p>
      </div>
    </div>
  );
}
