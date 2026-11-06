import type { BukPayload } from "@/types/candidato";

export const BUK_TIMEOUT_MS = 8000;
export const BUK_ENDPOINT_POR_DEFECTO = "http://localhost:4000/api/v1/applicants";

export type EntornoBuk = "mock" | "buk";

export interface OpcionesEnvioBuk {
  forzarFallo?: boolean;
}

export interface ResultadoEnvioBuk {
  ok: boolean;
  status: number | null;
  endpoint: string;
  durationMs: number;
  body: unknown;
  error?: string;
  entorno: EntornoBuk;
}

function normalizarHost(host: string): string {
  return host.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function obtenerEndpointBuk(): string {
  const explicito = process.env.BUK_API_URL?.trim();
  if (explicito) return explicito;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (host) {
    return `https://${normalizarHost(host)}/api/mock-buk/applicants`;
  }

  return BUK_ENDPOINT_POR_DEFECTO;
}

export function obtenerEntornoBuk(): EntornoBuk {
  const modo = process.env.BUK_MODE?.trim().toLowerCase();
  if (modo === "buk" || modo === "real") return "buk";
  if (modo === "mock") return "mock";

  const endpoint = obtenerEndpointBuk();
  return endpoint.includes("/api/mock-buk/") || endpoint.includes("localhost:4000")
    ? "mock"
    : "buk";
}

export async function enviarABuk(
  payload: BukPayload,
  opciones: OpcionesEnvioBuk = {},
): Promise<ResultadoEnvioBuk> {
  const inicio = performance.now();
  const endpoint = obtenerEndpointBuk();
  const entorno = obtenerEntornoBuk();
  const token = process.env.BUK_API_TOKEN?.trim();

  if (!token) {
    return {
      ok: false,
      status: null,
      endpoint,
      durationMs: Math.round(performance.now() - inicio),
      body: null,
      error: "BUK_API_TOKEN no está configurado.",
      entorno,
    };
  }

  if (opciones.forzarFallo && entorno === "buk") {
    return {
      ok: false,
      status: 503,
      endpoint,
      durationMs: Math.round(performance.now() - inicio),
      body: { ok: false, error: "Fallo simulado de BUK para la demo." },
      error: "BUK respondió con estado 503 (simulado).",
      entorno,
    };
  }

  const controller = new AbortController();
  const temporizador = setTimeout(() => controller.abort(), BUK_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (opciones.forzarFallo && entorno === "mock") {
      headers["X-Demo-Force-Failure"] = "1";
    }

    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const texto = await respuesta.text();
    let body: unknown = texto;
    if (texto) {
      try {
        body = JSON.parse(texto);
      } catch {
        body = texto;
      }
    }

    const durationMs = Math.round(performance.now() - inicio);

    if (!respuesta.ok) {
      return {
        ok: false,
        status: respuesta.status,
        endpoint,
        durationMs,
        body,
        error: `BUK respondió con estado ${respuesta.status}.`,
        entorno,
      };
    }

    return {
      ok: true,
      status: respuesta.status,
      endpoint,
      durationMs,
      body,
      entorno,
    };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error desconocido";
    return {
      ok: false,
      status: null,
      endpoint,
      durationMs: Math.round(performance.now() - inicio),
      body: null,
      error: `No se pudo conectar con BUK: ${detalle}`,
      entorno,
    };
  } finally {
    clearTimeout(temporizador);
  }
}
