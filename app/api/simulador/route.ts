import { NextResponse } from "next/server";

import { enviarABuk, type ResultadoEnvioBuk } from "@/lib/buk";
import { mapearLinkedInABuk } from "@/lib/mapper";
import type { ArchivoCV, ResultadoMapeo } from "@/types/candidato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MAX_BODY_BYTES = 8 * 1024 * 1024;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function redactarCV(cv: ArchivoCV): ArchivoCV {
  if (!cv.contenido_base64) return cv;

  return {
    ...cv,
    contenido_base64: `[Base64 omitido: ${cv.contenido_base64.length} caracteres]`,
  };
}

function mapeoParaRespuesta(mapeo: ResultadoMapeo): ResultadoMapeo {
  return {
    ...mapeo,
    normalizado: mapeo.normalizado
      ? { ...mapeo.normalizado, cv: redactarCV(mapeo.normalizado.cv) }
      : null,
    payload: mapeo.payload
      ? { ...mapeo.payload, cv: redactarCV(mapeo.payload.cv) }
      : null,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      {
        success: false,
        httpStatus: 415,
        message: "El cuerpo debe ser JSON (Content-Type: application/json).",
      },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      {
        success: false,
        httpStatus: 413,
        message: "El payload supera el límite de 8 MB.",
      },
      { status: 413 },
    );
  }

  let entrada: unknown;
  try {
    entrada = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        httpStatus: 400,
        message: "El JSON de entrada no es válido.",
      },
      { status: 400 },
    );
  }

  const forzarFallo = esObjeto(entrada) && entrada.demoForceBukFailure === true;
  const mapeo = mapearLinkedInABuk(entrada);

  if (!mapeo.valido || !mapeo.payload) {
    console.warn(
      `[simulador] Payload inválido: ${Object.keys(mapeo.errores).join(", ") || "sin detalle"}`,
    );
    return NextResponse.json(
      {
        success: false,
        httpStatus: 422,
        message: "El payload de LinkedIn no cumple los campos obligatorios.",
        mapeo: mapeoParaRespuesta(mapeo),
      },
      { status: 422 },
    );
  }

  let envio: ResultadoEnvioBuk;
  try {
    envio = await enviarABuk(mapeo.payload, { forzarFallo });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error desconocido";
    return NextResponse.json(
      {
        success: false,
        httpStatus: 502,
        message: `No se pudo enviar a BUK: ${detalle}`,
        mapeo: mapeoParaRespuesta(mapeo),
      },
      { status: 502 },
    );
  }

  if (!envio.ok) {
    console.error(`[simulador] BUK no confirmó el registro: ${envio.error ?? "sin detalle"}`);
    return NextResponse.json(
      {
        success: false,
        httpStatus: 502,
        message: "BUK no confirmó el registro del postulante.",
        mapeo: mapeoParaRespuesta(mapeo),
        buk: envio,
      },
      { status: 502 },
    );
  }

  console.info(
    `[simulador] Postulante ${mapeo.payload.cargo.id} enviado a BUK en ${envio.durationMs} ms (HTTP ${envio.status}).`,
  );

  return NextResponse.json({
    success: true,
    httpStatus: 200,
    message: "Postulante registrado en BUK.",
    mapeo: mapeoParaRespuesta(mapeo),
    buk: envio,
  });
}
