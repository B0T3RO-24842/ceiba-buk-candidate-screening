import { NextResponse } from "next/server";

import { enviarABuk } from "@/lib/buk";
import {
  evaluarPostulante,
  normalizarEmail,
  respuestasComoLista,
  validarCamposBUK,
  validarPDF
} from "@/lib/evaluador";
import { obtenerVacante } from "@/lib/vacantes";
import type { BukPayload, RespuestasPostulante } from "@/types/candidato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const MENSAJE_NEUTRO = "¡Postulación recibida con éxito!";

function responderNeutro() {
  return NextResponse.json(
    { success: true, message: MENSAJE_NEUTRO },
    { status: 200 }
  );
}

function leerTexto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

function leerRespuestas(formData: FormData): RespuestasPostulante {
  const crudo = leerTexto(formData, "respuestas");
  if (!crudo) return {};

  try {
    const parsed: unknown = JSON.parse(crudo);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const respuestas: RespuestasPostulante = {};
    for (const [clave, valor] of Object.entries(parsed as Record<string, unknown>)) {
      if (
        typeof valor === "string" ||
        typeof valor === "number" ||
        typeof valor === "boolean"
      ) {
        respuestas[clave] = valor;
      }
    }
    return respuestas;
  } catch {
    return {};
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const inicio = performance.now();

  try {
    const formData = await request.formData();
    const vacante = obtenerVacante(leerTexto(formData, "cargoId"));

    if (!vacante) {
      console.warn("[postular] Vacante no encontrada o no informada.");
      return responderNeutro();
    }

    const validacion = validarCamposBUK({
      email: leerTexto(formData, "email"),
      nombre: leerTexto(formData, "nombre"),
      primer_apellido: leerTexto(formData, "primer_apellido"),
      segundo_apellido: leerTexto(formData, "segundo_apellido"),
      celular: leerTexto(formData, "celular"),
      pais: leerTexto(formData, "pais"),
      ciudad: leerTexto(formData, "ciudad"),
      habeasData: leerTexto(formData, "habeasData")
    });

    if (!validacion.valido) {
      console.warn(
        `[postular] Datos inválidos: ${Object.keys(validacion.errores).join(", ")}`
      );
      return responderNeutro();
    }

    const archivo = formData.get("cv");
    if (!(archivo instanceof File)) {
      console.warn("[postular] No se recibió una hoja de vida válida.");
      return responderNeutro();
    }

    const validacionArchivo = validarPDF({
      name: archivo.name,
      type: archivo.type,
      size: archivo.size
    });

    if (!validacionArchivo.valido) {
      console.warn(`[postular] CV inválido: ${validacionArchivo.error ?? "sin detalle"}`);
      return responderNeutro();
    }

    const respuestas = leerRespuestas(formData);
    const faltantes = vacante.preguntas.filter((pregunta) => {
      const valor = respuestas[pregunta.id];
      return valor === undefined || valor === null || String(valor).trim() === "";
    });

    if (faltantes.length > 0) {
      console.warn(
        `[postular] Preentrevista incompleta: faltan ${faltantes.length} respuesta(s).`
      );
      return responderNeutro();
    }

    const evaluacion = evaluarPostulante(respuestas, vacante);

    console.info(
      `[postular] Evaluación completada en ${(performance.now() - inicio).toFixed(2)} ms.`
    );

    if (!evaluacion.esApto) {
      console.info(`[postular] Postulante no apto. Motivo: ${evaluacion.motivo ?? "sin detalle"}`);
      return responderNeutro();
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      console.warn("[postular] El archivo no tiene firma PDF válida.");
      return responderNeutro();
    }

    const contenidoBase64 = buffer.toString("base64");
    const candidato = validacion.datos;

    const payload: BukPayload = {
      email: normalizarEmail(candidato.email),
      nombre: candidato.nombre,
      primer_apellido: candidato.primer_apellido,
      ...(candidato.segundo_apellido
        ? { segundo_apellido: candidato.segundo_apellido }
        : {}),
      celular: candidato.celular,
      pais: candidato.pais,
      ciudad: candidato.ciudad,
      habeasData: true,
      acepta_tratamiento_datos: true,
      cv: {
        nombre_archivo: archivo.name || "hoja-de-vida.pdf",
        tipo_mime: archivo.type || "application/pdf",
        tamano_bytes: archivo.size,
        contenido_base64: contenidoBase64
      },
      cargo: {
        id: vacante.id,
        nombre: vacante.nombre
      },
      respuestas: respuestasComoLista(respuestas, vacante),
      evaluacion: {
        es_apto: evaluacion.esApto,
        porcentaje: evaluacion.porcentaje,
        motivo: evaluacion.motivo
      },
      fecha_postulacion: new Date().toISOString(),
      origen: "ScreenFlow web"
    };

    const envio = await enviarABuk(payload);
    if (!envio.ok) {
      console.error(
        `[postular] No se pudo registrar en BUK: ${envio.error ?? "sin detalle"}`
      );
    } else {
      console.info(
        `[postular] Postulante enviado a BUK en ${envio.durationMs} ms (HTTP ${envio.status}).`
      );
    }
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error desconocido";
    console.error(`[postular] Error procesando la postulación: ${detalle}`);
  }

  return responderNeutro();
}
