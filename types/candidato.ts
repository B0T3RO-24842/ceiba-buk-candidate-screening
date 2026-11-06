export type TipoPregunta = "sino" | "numero" | "lista";

export type RespuestaValor = string | number | boolean;

export type RespuestasPostulante = Record<string, RespuestaValor>;

export interface RespuestaPregunta {
  preguntaId: string;
  valor: RespuestaValor;
}

export interface PreguntaConfig {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  obligatoria: boolean;
  peso: number;
  respuestaAprobatoria?: boolean;
  minimo?: number;
  opciones?: string[];
  opcionesAprobatorias?: string[];
}

export interface VacanteConfig {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: PreguntaConfig[];
}

export interface PreguntaPublica {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  obligatoria: boolean;
  opciones?: string[];
}

export interface VacantePublica {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: PreguntaPublica[];
}

export interface CandidatoDTO {
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  celular: string;
  pais: string;
  ciudad: string;
  habeasData: boolean;
}

export interface DatosValidados {
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  celular: string;
  pais: string;
  ciudad: string;
  habeasData: boolean;
}

export type CandidatoEntrada = Omit<Partial<DatosValidados>, "habeasData"> & {
  habeasData?: unknown;
};

export interface ResultadoEvaluacion {
  esApto: boolean;
  porcentaje: number;
  motivo?: string;
}

export interface ArchivoCV {
  nombre_archivo: string;
  tipo_mime: string;
  tamano_bytes: number;
  contenido_base64?: string;
  referencia?: string;
}

export interface BukPayload {
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  celular: string;
  pais: string;
  ciudad: string;
  habeasData: true;
  acepta_tratamiento_datos?: boolean;
  cv: ArchivoCV;
  cargo: {
    id: string;
    nombre: string;
  };
  respuestas?: RespuestaPregunta[];
  evaluacion?: {
    es_apto: boolean;
    porcentaje: number;
    motivo?: string;
  };
  fecha_postulacion: string;
  origen: string;
  referrer?: string;
  linkedin?: {
    profile_url?: string;
    headline?: string;
    application_id?: string;
    source?: string;
  };
}

export interface LinkedInLocationInput {
  [key: string]: unknown;
  country?: string;
  city?: string;
  pais?: string;
  ciudad?: string;
}

export interface LinkedInCVInput {
  [key: string]: unknown;
  filename?: string;
  fileName?: string;
  nombre_archivo?: string;
  mimeType?: string;
  type?: string;
  tipo_mime?: string;
  base64?: string;
  contenido_base64?: string;
  reference?: string;
  referencia?: string;
  url?: string;
  sizeBytes?: number;
  size?: number;
}

export interface LinkedInCandidateInput {
  [key: string]: unknown;
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  nombre?: string;
  apellido?: string;
  segundoApellido?: string;
  email?: string;
  correo?: string;
  phone?: string;
  celular?: string;
  telefono?: string;
  headline?: string;
  profileUrl?: string;
  linkedinUrl?: string;
  location?: LinkedInLocationInput;
  pais?: string;
  ciudad?: string;
  cv?: LinkedInCVInput | string;
}

export interface LinkedInJobInput {
  [key: string]: unknown;
  id?: string;
  title?: string;
  cargoId?: string;
  cargo?: string;
  nombre?: string;
}

export interface LinkedInApplicationInput {
  [key: string]: unknown;
  event?: string;
  source?: string;
  origen?: string;
  appliedAt?: string;
  fechaPostulacion?: string;
  candidate?: LinkedInCandidateInput;
  job?: LinkedInJobInput;
}

export interface LinkedInNormalizado {
  email: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido?: string;
  celular: string;
  pais: string;
  ciudad: string;
  habeasData: true;
  cargo: {
    id: string;
    nombre: string;
  };
  cv: ArchivoCV;
  fecha_postulacion: string;
  origen: "LinkedIn";
  referrer: "Importadores Curriculum";
  linkedin: {
    profile_url?: string;
    headline?: string;
    application_id?: string;
    source?: string;
  };
}

export interface ResultadoMapeo {
  valido: boolean;
  errores: Record<string, string>;
  advertencias: string[];
  normalizado: LinkedInNormalizado | null;
  payload: BukPayload | null;
}
