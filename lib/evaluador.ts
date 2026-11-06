import type {
  CandidatoEntrada,
  DatosValidados,
  PreguntaConfig,
  RespuestaPregunta,
  RespuestasPostulante,
  ResultadoEvaluacion,
  VacanteConfig,
} from "@/types/candidato";

export const UMBRAL_COMPATIBILIDAD = 80;
export const MAX_CV_BYTES = 5 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEXTO_RE = /^[\p{L}\p{M}' .-]{2,80}$/u;
const CELULAR_RE = /^[+]?[\d\s().-]{7,25}$/;

export interface ArchivoValidable {
  name: string;
  type?: string;
  size: number;
}

export interface ResultadoValidacionCampos {
  valido: boolean;
  errores: Record<string, string>;
  datos: DatosValidados;
}

export function limpiarTexto(valor: unknown): string {
  return String(valor ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizarEmail(email: unknown): string {
  return limpiarTexto(email).toLowerCase();
}

export function normalizarCelular(celular: unknown): string {
  const texto = limpiarTexto(celular);
  const prefijo = texto.startsWith("+") ? "+" : "";
  return prefijo + texto.replace(/\D/g, "");
}

export function convertirBooleano(valor: unknown): boolean | null {
  if (valor === true || valor === 1) return true;
  if (valor === false || valor === 0) return false;

  const texto = String(valor ?? "")
    .trim()
    .toLowerCase();

  if (["true", "1", "si", "sí", "s", "on"].includes(texto)) return true;
  if (["false", "0", "no", "n", "off"].includes(texto)) return false;

  return null;
}

function respuestaVacia(respuesta: unknown): boolean {
  return (
    respuesta === undefined ||
    respuesta === null ||
    String(respuesta).trim() === ""
  );
}

export function validarCamposBUK(
  entrada: CandidatoEntrada,
): ResultadoValidacionCampos {
  const errores: Record<string, string> = {};

  const email = normalizarEmail(entrada.email);
  const nombre = limpiarTexto(entrada.nombre);
  const primerApellido = limpiarTexto(entrada.primer_apellido);
  const segundoApellido = limpiarTexto(entrada.segundo_apellido);
  const celularOriginal = limpiarTexto(entrada.celular);
  const celular = normalizarCelular(celularOriginal);
  const pais = limpiarTexto(entrada.pais);
  const ciudad = limpiarTexto(entrada.ciudad);
  const habeasData = convertirBooleano(entrada.habeasData) === true;

  if (!email) {
    errores.email = "El correo electrónico es obligatorio.";
  } else if (!EMAIL_RE.test(email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  if (!nombre) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (!TEXTO_RE.test(nombre)) {
    errores.nombre = "El nombre debe tener entre 2 y 80 caracteres válidos.";
  }

  if (!primerApellido) {
    errores.primer_apellido = "El primer apellido es obligatorio.";
  } else if (!TEXTO_RE.test(primerApellido)) {
    errores.primer_apellido =
      "El primer apellido debe tener entre 2 y 80 caracteres válidos.";
  }

  if (segundoApellido && !TEXTO_RE.test(segundoApellido)) {
    errores.segundo_apellido =
      "El segundo apellido debe tener entre 2 y 80 caracteres válidos.";
  }

  if (!celularOriginal) {
    errores.celular = "El celular es obligatorio.";
  } else if (!CELULAR_RE.test(celularOriginal)) {
    errores.celular = "El celular contiene caracteres no permitidos.";
  } else {
    const digitos = celular.replace(/\D/g, "");
    if (digitos.length < 7 || digitos.length > 15) {
      errores.celular = "El celular debe tener entre 7 y 15 dígitos.";
    }
  }

  if (!pais) {
    errores.pais = "El país es obligatorio.";
  } else if (!TEXTO_RE.test(pais)) {
    errores.pais = "Ingresa un país válido.";
  }

  if (!ciudad) {
    errores.ciudad = "La ciudad es obligatoria.";
  } else if (!TEXTO_RE.test(ciudad)) {
    errores.ciudad = "Ingresa una ciudad válida.";
  }

  if (!habeasData) {
    errores.habeasData =
      "Debes autorizar el tratamiento de datos para continuar.";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      email,
      nombre,
      primer_apellido: primerApellido,
      segundo_apellido: segundoApellido,
      celular,
      pais,
      ciudad,
      habeasData,
    },
  };
}

export function validarPDF(
  archivo: ArchivoValidable | null | undefined,
): { valido: boolean; error?: string } {
  if (!archivo) {
    return { valido: false, error: "Debes adjuntar tu hoja de vida en PDF." };
  }

  const nombre = String(archivo.name ?? "");
  const tipo = String(archivo.type ?? "").toLowerCase();
  const tamano = Number(archivo.size);

  const esPdf = tipo === "application/pdf" || /\.pdf$/i.test(nombre);
  if (!esPdf) {
    return {
      valido: false,
      error: "La hoja de vida debe estar en formato PDF.",
    };
  }

  if (!Number.isFinite(tamano) || tamano <= 0) {
    return {
      valido: false,
      error: "El archivo PDF está vacío o no es válido.",
    };
  }

  if (tamano > MAX_CV_BYTES) {
    return {
      valido: false,
      error: "El PDF supera el tamaño máximo de 5 MB.",
    };
  }

  return { valido: true };
}

export function evaluarRespuesta(
  pregunta: PreguntaConfig,
  respuesta: unknown,
): boolean {
  if (!pregunta || respuestaVacia(respuesta)) return false;

  if (pregunta.tipo === "sino") {
    const valor = convertirBooleano(respuesta);
    if (valor === null) return false;
    return valor === (pregunta.respuestaAprobatoria !== false);
  }

  if (pregunta.tipo === "numero") {
    const numero = Number(String(respuesta).replace(",", "."));
    if (!Number.isFinite(numero)) return false;
    const minimo = Number(pregunta.minimo ?? 0);
    return numero >= (Number.isFinite(minimo) ? minimo : 0);
  }

  if (pregunta.tipo === "lista") {
    const aprobatorias = Array.isArray(pregunta.opcionesAprobatorias)
      ? pregunta.opcionesAprobatorias.map((opcion) => String(opcion).trim())
      : [];
    return aprobatorias.includes(String(respuesta).trim());
  }

  return false;
}

export function evaluarPostulante(
  respuestas: RespuestasPostulante,
  configVacante: VacanteConfig,
): ResultadoEvaluacion {
  const preguntas = Array.isArray(configVacante?.preguntas)
    ? configVacante.preguntas
    : [];
  const mapaRespuestas =
    respuestas && typeof respuestas === "object" ? respuestas : {};

  let puntosObtenidos = 0;
  let totalPuntos = 0;
  const fallasObligatorias: string[] = [];

  for (const pregunta of preguntas) {
    const peso =
      Number.isFinite(Number(pregunta.peso)) && Number(pregunta.peso) > 0
        ? Number(pregunta.peso)
        : 1;

    totalPuntos += peso;

    if (evaluarRespuesta(pregunta, mapaRespuestas[pregunta.id])) {
      puntosObtenidos += peso;
    } else if (pregunta.obligatoria) {
      fallasObligatorias.push(pregunta.id);
    }
  }

  const porcentajeCalculado =
    totalPuntos > 0 ? Math.round((puntosObtenidos / totalPuntos) * 100) : 0;

  if (fallasObligatorias.length > 0) {
    return {
      esApto: false,
      porcentaje: 0,
      motivo: `Pregunta(s) obligatoria(s) no cumplida(s): ${fallasObligatorias.join(", ")}`,
    };
  }

  if (porcentajeCalculado < UMBRAL_COMPATIBILIDAD) {
    return {
      esApto: false,
      porcentaje: porcentajeCalculado,
      motivo: `Compatibilidad ${porcentajeCalculado}% inferior al umbral de ${UMBRAL_COMPATIBILIDAD}%.`,
    };
  }

  return {
    esApto: true,
    porcentaje: porcentajeCalculado,
  };
}

export function respuestasComoLista(
  respuestas: RespuestasPostulante,
  configVacante: VacanteConfig,
): RespuestaPregunta[] {
  return configVacante.preguntas.map((pregunta) => ({
    preguntaId: pregunta.id,
    valor: respuestas[pregunta.id] ?? "",
  }));
}
