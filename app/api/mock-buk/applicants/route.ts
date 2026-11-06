import { NextResponse } from "next/server";

import {
  enmascararEmail,
  registrarPostulante,
  resumenPayload,
  validarPayloadMock,
} from "@/lib/mock-buk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MAX_BODY_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const tokenEsperado = process.env.BUK_API_TOKEN?.trim();
  const autorizacion = request.headers.get("authorization") ?? "";

  if (!tokenEsperado || autorizacion !== `Bearer ${tokenEsperado}`) {
    return NextResponse.json(
      { ok: false, error: "No autorizado. Envía Authorization: Bearer <token>." },
      { status: 401 },
    );
  }

  if (request.headers.get("x-demo-force-failure") === "1") {
    return NextResponse.json(
      { ok: false, error: "Fallo simulado de BUK para la demo." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "El cuerpo supera el límite de 8 MB." },
      { status: 413 },
    );
  }

  let entrada: unknown;
  try {
    entrada = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido." },
      { status: 400 },
    );
  }

  const validacion = validarPayloadMock(entrada);
  if (!validacion.ok || !validacion.payload) {
    console.warn(
      `[mock-buk] Payload rechazado: ${Object.keys(validacion.errores).join(", ")}`,
    );
    return NextResponse.json(
      {
        ok: false,
        errores: validacion.errores,
        recibido: validacion.payload ? resumenPayload(validacion.payload) : null,
      },
      { status: 422 },
    );
  }

  const payload = validacion.payload;
  const { id, duplicado } = registrarPostulante(payload);
  const email = String(payload.email ?? "").toLowerCase();
  const cargoId = String(payload.cargo?.id ?? "");
  const cvBytes = Number(payload.cv?.tamano_bytes) || 0;
  const url = new URL(request.url);

  console.log(
    `[mock-buk] POST ${url.pathname} | ${enmascararEmail(email)} | ${cargoId} | ${String(payload.origen ?? "")}/${String(payload.referrer ?? "")} | CV ${cvBytes} B | id ${id}${duplicado ? " (actualizado)" : ""}`,
  );

  return NextResponse.json({
    ok: true,
    id,
    duplicado,
    message: duplicado
      ? "El postulante ya existía; se actualizó el registro."
      : "Postulante registrado en la vacante.",
    recibido: resumenPayload(payload),
    traza: {
      endpoint: url.pathname,
      metodo: "POST",
      autorizacion: `Bearer ***${tokenEsperado.slice(-4)}`,
      contentLength,
      recibidoEn: new Date().toISOString(),
    },
  });
}
