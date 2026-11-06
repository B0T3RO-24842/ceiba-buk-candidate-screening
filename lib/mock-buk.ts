import { MAX_CV_BYTES, validarCamposBUK, validarPDF } from "@/lib/evaluador";

export const MOCK_BUK_STARTED_AT = new Date().toISOString();

interface CargoMock {
  id?: unknown;
  nombre?: unknown;
}

interface CVMock {
  nombre_archivo?: unknown;
  tipo_mime?: unknown;
  tamano_bytes?: unknown;
  contenido_base64?: unknown;
  referencia?: unknown;
}

export interface PayloadMock {
  email?: unknown;
  nombre?: unknown;
  primer_apellido?: unknown;
  segundo_apellido?: unknown;
  celular?: unknown;
  pais?: unknown;
  ciudad?: unknown;
  habeasData?: unknown;
  acepta_tratamiento_datos?: unknown;
  cargo?: CargoMock;
  cv?: CVMock;
  origen?: unknown;
  referrer?: unknown;
  fecha_postulacion?: unknown;
  linkedin?: unknown;
}

interface RegistroMock {
  id: string;
  payload: PayloadMock;
}

const registros = new Map<string, RegistroMock>();
let contador = 0;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function texto(valor: unknown): string {
  return String(valor ?? "").trim();
}

function esUrl(valor: string): boolean {
  return /^https?:\/\//i.test(valor.trim());
}

export function validarPayloadMock(payload: unknown): {
  ok: boolean;
  errores: Record<string, string>;
  payload: PayloadMock | null;
} {
  if (!esObjeto(payload)) {
    return {
      ok: false,
      errores: { payload: "El cuerpo debe ser un objeto JSON." },
      payload: null,
    };
  }

  const entrada = payload as PayloadMock;
  const errores: Record<string, string> = {};

  const validacion = validarCamposBUK({
    email: texto(entrada.email),
    nombre: texto(entrada.nombre),
    primer_apellido: texto(entrada.primer_apellido),
    segundo_apellido: texto(entrada.segundo_apellido),
    celular: texto(entrada.celular),
    pais: texto(entrada.pais),
    ciudad: texto(entrada.ciudad),
    habeasData: entrada.habeasData,
  });

  Object.assign(errores, validacion.errores);

  if (!esObjeto(entrada.cargo) || !texto(entrada.cargo.id) || !texto(entrada.cargo.nombre)) {
    errores.cargo = "El cargo debe incluir id y nombre.";
  }

  if (entrada.habeasData !== true) {
    errores.habeasData = "El campo habeasData debe ser true.";
  }

  if (!texto(entrada.origen)) {
    errores.origen = "El origen es obligatorio.";
  }

  const cv = entrada.cv;
  if (!esObjeto(cv)) {
    errores.cv = "El CV es obligatorio.";
  } else {
    const base64 = texto(cv.contenido_base64);
    const referencia = texto(cv.referencia);

    if (base64) {
      const buffer = Buffer.from(base64, "base64");
      const nombreArchivo = texto(cv.nombre_archivo) || "hoja-de-vida.pdf";
      const tipoMime = texto(cv.tipo_mime) || "application/pdf";
      const validacionPdf = validarPDF({
        name: nombreArchivo,
        type: tipoMime,
        size: buffer.length,
      });

      if (!validacionPdf.valido) {
        errores.cv = validacionPdf.error ?? "El CV no es válido.";
      } else if (buffer.length > MAX_CV_BYTES) {
        errores.cv = "El CV supera el límite de 5 MB.";
      } else if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        errores.cv = "El CV no tiene firma PDF válida (%PDF-).";
      }
    } else if (!referencia) {
      errores.cv = "El CV debe incluir contenido_base64 o referencia.";
    } else if (!esUrl(referencia)) {
      errores.cv = "La referencia del CV debe ser una URL http(s) válida.";
    }
  }

  return {
    ok: Object.keys(errores).length === 0,
    errores,
    payload: entrada,
  };
}

export function resumenPayload(payload: PayloadMock): Record<string, unknown> {
  const cv = payload.cv;
  const cargo = payload.cargo;
  const base64 = esObjeto(cv) ? texto(cv.contenido_base64) : "";

  return {
    email: texto(payload.email),
    nombre: texto(payload.nombre),
    primer_apellido: texto(payload.primer_apellido),
    segundo_apellido: texto(payload.segundo_apellido) || null,
    celular: texto(payload.celular),
    pais: texto(payload.pais),
    ciudad: texto(payload.ciudad),
    habeasData: payload.habeasData === true,
    acepta_tratamiento_datos: payload.acepta_tratamiento_datos ?? null,
    cargo: esObjeto(cargo)
      ? { id: texto(cargo.id), nombre: texto(cargo.nombre) }
      : null,
    origen: texto(payload.origen),
    referrer: texto(payload.referrer),
    cv: esObjeto(cv)
      ? {
          nombre_archivo: texto(cv.nombre_archivo),
          tipo_mime: texto(cv.tipo_mime),
          tamano_bytes: Number(cv.tamano_bytes) || 0,
          tiene_base64: Boolean(base64),
          base64_length: base64.length,
          referencia: texto(cv.referencia) || null,
        }
      : null,
    fecha_postulacion: payload.fecha_postulacion ?? null,
    linkedin: payload.linkedin ?? null,
  };
}

export function enmascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!usuario || !dominio) return "***";
  return `${usuario.slice(0, 1)}***@${dominio}`;
}

export function registrarPostulante(payload: PayloadMock): {
  id: string;
  duplicado: boolean;
} {
  const email = texto(payload.email).toLowerCase();
  const existente = registros.get(email);
  const id =
    existente?.id ??
    `BUK-${Date.now().toString(36).toUpperCase()}-${String(++contador).padStart(3, "0")}`;
  const duplicado = Boolean(existente);

  registros.set(email, { id, payload });

  return { id, duplicado };
}
