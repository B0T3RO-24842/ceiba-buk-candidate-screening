import {
  MAX_CV_BYTES,
  limpiarTexto,
  normalizarEmail,
  validarCamposBUK,
  validarPDF,
} from "@/lib/evaluador";
import { obtenerVacante } from "@/lib/vacantes";
import type {
  ArchivoCV,
  BukPayload,
  LinkedInNormalizado,
  ResultadoMapeo,
} from "@/types/candidato";

type JsonObject = Record<string, unknown>;

const RUTAS = {
  email: ["candidate.email", "email", "candidate.correo", "correo", "contact.email"],
  nombre: ["candidate.firstName", "firstName", "candidate.nombre", "nombre", "candidate.name"],
  primerApellido: [
    "candidate.lastName",
    "lastName",
    "candidate.apellido",
    "apellido",
    "candidate.primerApellido",
    "primerApellido",
  ],
  segundoApellido: [
    "candidate.secondLastName",
    "secondLastName",
    "candidate.segundoApellido",
    "segundoApellido",
    "candidate.apellido2",
  ],
  celular: [
    "candidate.phone",
    "phone",
    "candidate.celular",
    "celular",
    "candidate.telefono",
    "telefono",
  ],
  pais: [
    "candidate.location.country",
    "candidate.country",
    "candidate.pais",
    "pais",
    "location.country",
    "country",
  ],
  ciudad: [
    "candidate.location.city",
    "candidate.city",
    "candidate.ciudad",
    "ciudad",
    "location.city",
    "city",
  ],
  headline: ["candidate.headline", "headline"],
  profileUrl: [
    "candidate.profileUrl",
    "candidate.profile_url",
    "profileUrl",
    "candidate.linkedinUrl",
    "linkedinUrl",
  ],
  applicationId: [
    "applicationId",
    "id",
    "candidate.applicationId",
    "linkedin.applicationId",
  ],
  source: ["source", "origen", "candidate.source"],
  appliedAt: ["appliedAt", "fechaPostulacion", "fecha_postulacion", "candidate.appliedAt"],
  jobId: ["job.id", "jobId", "cargoId", "vacanteId", "job.cargoId"],
  jobTitle: ["job.title", "jobTitle", "cargo.nombre", "vacante", "job.nombre", "cargo"],
  cvBase64: [
    "candidate.cv.base64",
    "candidate.cv.contenido_base64",
    "cv.base64",
    "cv.contenido_base64",
    "cvBase64",
    "cv_base64",
    "candidate.cvBase64",
  ],
  cvFilename: [
    "candidate.cv.filename",
    "candidate.cv.fileName",
    "candidate.cv.nombre_archivo",
    "cv.filename",
    "cv.fileName",
    "cv.nombre_archivo",
    "cvNombre",
    "cvFileName",
    "candidate.cvNombre",
  ],
  cvMime: [
    "candidate.cv.mimeType",
    "candidate.cv.type",
    "candidate.cv.tipo_mime",
    "cv.mimeType",
    "cv.type",
    "cv.tipo_mime",
    "cvTipo",
    "cvMimeType",
  ],
  cvReference: [
    "candidate.cv.reference",
    "candidate.cv.referencia",
    "candidate.cv.url",
    "cv.reference",
    "cv.referencia",
    "cv.url",
    "cvReferencia",
    "cvUrl",
  ],
  cvSize: ["candidate.cv.sizeBytes", "candidate.cv.size", "cv.sizeBytes", "cv.size", "cvTamano"],
};

function esObjeto(valor: unknown): valor is JsonObject {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function leerRuta(objeto: unknown, ruta: string): unknown {
  return ruta.split(".").reduce<unknown>((actual, clave) => {
    if (!esObjeto(actual)) return undefined;
    return actual[clave];
  }, objeto);
}

function primerTexto(objeto: unknown, rutas: string[]): string {
  for (const ruta of rutas) {
    const valor = leerRuta(objeto, ruta);
    if (typeof valor === "string" && valor.trim()) return valor.trim();
    if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  }
  return "";
}

function esUrl(valor: string): boolean {
  return /^https?:\/\//i.test(valor.trim());
}

function limpiarBase64(valor: string): string {
  return valor.replace(/^data:[^;]+;base64,/i, "").replace(/\s+/g, "");
}

function construirCargo(
  jobId: string,
  jobTitle: string,
  advertencias: string[],
): { id: string; nombre: string } | null {
  if (!jobId) return null;

  const vacante = obtenerVacante(jobId);
  const nombre = jobTitle || vacante?.nombre || "";

  if (!jobTitle && vacante) {
    advertencias.push(
      `El payload no incluyó el título del cargo; se usó "${vacante.nombre}" del catálogo local.`,
    );
  }

  if (!vacante) {
    advertencias.push(
      `La vacante "${jobId}" no está en el catálogo local; se enviará tal como llega en el JSON.`,
    );
  }

  if (!nombre) return null;

  return { id: jobId, nombre };
}

function construirCV(
  entrada: unknown,
  errores: Record<string, string>,
  advertencias: string[],
): ArchivoCV | null {
  const cvDirecto = primerTexto(entrada, ["candidate.cv", "cv"]);
  const base64Crudo =
    primerTexto(entrada, RUTAS.cvBase64) || (cvDirecto && !esUrl(cvDirecto) ? cvDirecto : "");
  const referenciaCruda =
    primerTexto(entrada, RUTAS.cvReference) || (cvDirecto && esUrl(cvDirecto) ? cvDirecto : "");
  const nombreArchivo = primerTexto(entrada, RUTAS.cvFilename) || "hoja-de-vida.pdf";
  const tipoMime = (primerTexto(entrada, RUTAS.cvMime) || "application/pdf").toLowerCase();

  const tamanoDeclarado = Number(primerTexto(entrada, RUTAS.cvSize));
  if (Number.isFinite(tamanoDeclarado) && tamanoDeclarado > MAX_CV_BYTES) {
    errores.cv = "El CV supera el tamaño máximo de 5 MB.";
    return null;
  }

  if (!base64Crudo && !referenciaCruda) {
    errores.cv = "Debes incluir el CV en Base64 o una referencia PDF.";
    return null;
  }

  if (base64Crudo) {
    const base64 = limpiarBase64(base64Crudo);
    if (!base64) {
      errores.cv = "El CV en Base64 está vacío.";
      return null;
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) {
      errores.cv = "El CV en Base64 no se pudo decodificar.";
      return null;
    }

    if (buffer.length > MAX_CV_BYTES) {
      errores.cv = "El CV supera el tamaño máximo de 5 MB.";
      return null;
    }

    const validacion = validarPDF({
      name: nombreArchivo,
      type: tipoMime,
      size: buffer.length,
    });

    if (!validacion.valido) {
      errores.cv = validacion.error ?? "El CV no es un PDF válido.";
      return null;
    }

    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      errores.cv = "El archivo no tiene firma PDF válida (%PDF-).";
      return null;
    }

    return {
      nombre_archivo: nombreArchivo,
      tipo_mime: tipoMime || "application/pdf",
      tamano_bytes: buffer.length,
      contenido_base64: base64,
    };
  }

  if (!esUrl(referenciaCruda)) {
    errores.cv = "La referencia del CV debe ser una URL http(s) válida.";
    return null;
  }

  advertencias.push(
    "Se recibió una referencia de CV. El contrato BUK del MVP espera Base64; se enviará la referencia como respaldo.",
  );

  return {
    nombre_archivo: nombreArchivo,
    tipo_mime: "application/pdf",
    tamano_bytes: 0,
    referencia: referenciaCruda,
  };
}

export function mapearLinkedInABuk(entrada: unknown): ResultadoMapeo {
  const errores: Record<string, string> = {};
  const advertencias: string[] = [];

  if (!esObjeto(entrada)) {
    return {
      valido: false,
      errores: { payload: "El JSON de entrada debe ser un objeto." },
      advertencias,
      normalizado: null,
      payload: null,
    };
  }

  const email = normalizarEmail(primerTexto(entrada, RUTAS.email));
  const nombre = limpiarTexto(primerTexto(entrada, RUTAS.nombre));
  const primerApellido = limpiarTexto(primerTexto(entrada, RUTAS.primerApellido));
  const segundoApellido = limpiarTexto(primerTexto(entrada, RUTAS.segundoApellido));
  const celularCrudo = limpiarTexto(primerTexto(entrada, RUTAS.celular));
  const pais = limpiarTexto(primerTexto(entrada, RUTAS.pais));
  const ciudad = limpiarTexto(primerTexto(entrada, RUTAS.ciudad));

  const validacion = validarCamposBUK({
    email,
    nombre,
    primer_apellido: primerApellido,
    segundo_apellido: segundoApellido,
    celular: celularCrudo,
    pais,
    ciudad,
    habeasData: true,
  });

  Object.assign(errores, validacion.errores);

  const jobId = limpiarTexto(primerTexto(entrada, RUTAS.jobId));
  const jobTitle = limpiarTexto(primerTexto(entrada, RUTAS.jobTitle));
  const cargo = construirCargo(jobId, jobTitle, advertencias);

  if (!jobId) errores.cargo = "El ID de la vacante/cargo es obligatorio.";
  else if (!cargo) errores.cargo = "El nombre de la vacante/cargo es obligatorio.";

  const cv = construirCV(entrada, errores, advertencias);

  const appliedAtCrudo = primerTexto(entrada, RUTAS.appliedAt);
  let fechaPostulacion = new Date().toISOString();
  if (appliedAtCrudo) {
    const fecha = new Date(appliedAtCrudo);
    if (Number.isNaN(fecha.getTime())) {
      advertencias.push("La fecha de postulación no es válida; se usó la fecha actual.");
    } else {
      fechaPostulacion = fecha.toISOString();
    }
  }

  const profileUrl = primerTexto(entrada, RUTAS.profileUrl);
  const headline = primerTexto(entrada, RUTAS.headline);
  const applicationId = primerTexto(entrada, RUTAS.applicationId);
  const sourceRaw = primerTexto(entrada, RUTAS.source);

  const linkedin: LinkedInNormalizado["linkedin"] = {};
  if (profileUrl) linkedin.profile_url = profileUrl;
  if (headline) linkedin.headline = headline;
  if (applicationId) linkedin.application_id = applicationId;
  if (sourceRaw) linkedin.source = sourceRaw;

  if (Object.keys(errores).length > 0 || !cargo || !cv) {
    return {
      valido: false,
      errores,
      advertencias,
      normalizado: null,
      payload: null,
    };
  }

  const origen = "LinkedIn" as const;
  const referrer = "Importadores Curriculum" as const;

  const normalizado: LinkedInNormalizado = {
    email: validacion.datos.email,
    nombre: validacion.datos.nombre,
    primer_apellido: validacion.datos.primer_apellido,
    ...(validacion.datos.segundo_apellido
      ? { segundo_apellido: validacion.datos.segundo_apellido }
      : {}),
    celular: validacion.datos.celular,
    pais: validacion.datos.pais,
    ciudad: validacion.datos.ciudad,
    habeasData: true,
    cargo,
    cv,
    fecha_postulacion: fechaPostulacion,
    origen,
    referrer,
    linkedin,
  };

  const payload: BukPayload = {
    email: normalizado.email,
    nombre: normalizado.nombre,
    primer_apellido: normalizado.primer_apellido,
    ...(normalizado.segundo_apellido
      ? { segundo_apellido: normalizado.segundo_apellido }
      : {}),
    celular: normalizado.celular,
    pais: normalizado.pais,
    ciudad: normalizado.ciudad,
    habeasData: true,
    acepta_tratamiento_datos: true,
    cv: normalizado.cv,
    cargo: normalizado.cargo,
    fecha_postulacion: normalizado.fecha_postulacion,
    origen: normalizado.origen,
    referrer: normalizado.referrer,
    ...(Object.keys(linkedin).length > 0 ? { linkedin } : {}),
  };

  return {
    valido: true,
    errores: {},
    advertencias,
    normalizado,
    payload,
  };
}
