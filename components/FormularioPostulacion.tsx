"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent
} from "react";

import { validarCamposBUK, validarPDF } from "@/lib/evaluador";
import type {
  DatosValidados,
  PreguntaPublica,
  RespuestaValor,
  RespuestasPostulante,
  VacantePublica
} from "@/types/candidato";

interface DatosFormulario {
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  celular: string;
  pais: string;
  ciudad: string;
}

interface CampoFormulario {
  name: keyof DatosFormulario;
  label: string;
  type: "text" | "email" | "tel";
  autoComplete: string;
  maxLength: number;
  placeholder?: string;
  help?: string;
  required?: boolean;
  fullWidth?: boolean;
}

interface FormularioPostulacionProps {
  vacantes: VacantePublica[];
}

const DATOS_INICIALES: DatosFormulario = {
  nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  email: "",
  celular: "",
  pais: "",
  ciudad: ""
};

const CAMPOS: CampoFormulario[] = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    autoComplete: "given-name",
    maxLength: 80,
    required: true
  },
  {
    name: "primer_apellido",
    label: "Primer apellido",
    type: "text",
    autoComplete: "family-name",
    maxLength: 80,
    required: true
  },
  {
    name: "segundo_apellido",
    label: "Segundo apellido",
    type: "text",
    autoComplete: "additional-name",
    maxLength: 80
  },
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    autoComplete: "email",
    maxLength: 120,
    required: true,
    fullWidth: true
  },
  {
    name: "celular",
    label: "Celular",
    type: "tel",
    autoComplete: "tel",
    maxLength: 25,
    placeholder: "+57 300 123 4567",
    help: "Incluye el indicativo de tu país.",
    required: true
  },
  {
    name: "pais",
    label: "País",
    type: "text",
    autoComplete: "country-name",
    maxLength: 80,
    required: true
  },
  {
    name: "ciudad",
    label: "Ciudad",
    type: "text",
    autoComplete: "address-level2",
    maxLength: 80,
    required: true
  }
];

const BENEFICIOS = [
  "Proceso 100% en línea, desde cualquier dispositivo.",
  "Adjunta tu hoja de vida en PDF de hasta 5 MB.",
  "Tus datos se tratan conforme a la Ley 1581 de 2012."
];

const PASOS = [
  "Completa tus datos personales.",
  "Responde la preentrevista de la vacante.",
  "Adjunta tu CV y autoriza el tratamiento de datos."
];

function formatearBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function idControl(clave: string): string {
  if (clave === "cv") return "zona-cv";
  if (clave === "cargoId") return "cargo";
  return clave;
}

function Paso({
  numero,
  titulo,
  descripcion
}: {
  numero: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-bold text-brand">
        {numero}
      </span>
      <div>
        <h3 className="text-lg font-bold text-ink">{titulo}</h3>
        <p className="text-sm text-ink-muted">{descripcion}</p>
      </div>
    </div>
  );
}

export default function FormularioPostulacion({
  vacantes
}: FormularioPostulacionProps) {
  const [vacanteId, setVacanteId] = useState("");
  const [datos, setDatos] = useState<DatosFormulario>(DATOS_INICIALES);
  const [respuestas, setRespuestas] = useState<RespuestasPostulante>({});
  const [cv, setCv] = useState<File | null>(null);
  const [habeasData, setHabeasData] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const vacante = useMemo(
    () => vacantes.find((item) => item.id === vacanteId),
    [vacantes, vacanteId]
  );

  function limpiarError(clave: string) {
    setErrores((previos) => {
      if (!(clave in previos)) return previos;
      const copia = { ...previos };
      delete copia[clave];
      return copia;
    });
  }

  function actualizarDato(campo: keyof DatosFormulario, valor: string) {
    setDatos((previos) => ({ ...previos, [campo]: valor }));
    limpiarError(campo);
    setErrorGeneral("");
  }

  function responder(preguntaId: string, valor: RespuestaValor) {
    setRespuestas((previas) => ({ ...previas, [preguntaId]: valor }));
    limpiarError(`pregunta-${preguntaId}`);
    setErrorGeneral("");
  }

  function cambiarVacante(id: string) {
    setVacanteId(id);
    setRespuestas({});
    setErrorGeneral("");
    setErrores((previos) => {
      const copia = { ...previos };
      delete copia.cargoId;
      for (const clave of Object.keys(copia)) {
        if (clave.startsWith("pregunta-")) delete copia[clave];
      }
      return copia;
    });
  }

  function manejarArchivo(archivo: File | null | undefined) {
    if (!archivo) return;

    const revision = validarPDF(archivo);
    if (!revision.valido) {
      setCv(null);
      setErrores((previos) => ({
        ...previos,
        cv: revision.error ?? "La hoja de vida no es válida."
      }));
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
      return;
    }

    setCv(archivo);
    limpiarError("cv");
    setErrorGeneral("");
  }

  function alSeleccionarArchivo(event: ChangeEvent<HTMLInputElement>) {
    manejarArchivo(event.target.files?.[0]);
  }

  function alSoltarArchivo(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(false);
    manejarArchivo(event.dataTransfer.files?.[0]);
  }

  function alArrastrarSobre(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(true);
  }

  function alSalirArrastre(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setArrastrando(false);
  }

  function abrirSelector() {
    inputArchivoRef.current?.click();
  }

  function alPresionarZona(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirSelector();
    }
  }

  function quitarArchivo() {
    setCv(null);
    limpiarError("cv");
    if (inputArchivoRef.current) inputArchivoRef.current.value = "";
  }

  function validarFormulario(): {
    datos: DatosValidados | null;
    primerError: string | null;
  } {
    const nuevos: Record<string, string> = {};

    if (!vacante) {
      nuevos.cargoId = "Selecciona una vacante para continuar.";
    }

    const validacion = validarCamposBUK({ ...datos, habeasData });
    Object.assign(nuevos, validacion.errores);

    if (!cv) {
      nuevos.cv = "Debes adjuntar tu hoja de vida en PDF.";
    } else {
      const revision = validarPDF(cv);
      if (!revision.valido) {
        nuevos.cv = revision.error ?? "La hoja de vida no es válida.";
      }
    }

    if (vacante) {
      for (const pregunta of vacante.preguntas) {
        const valor = respuestas[pregunta.id];
        const clave = `pregunta-${pregunta.id}`;

        if (valor === undefined || valor === null || String(valor).trim() === "") {
          nuevos[clave] = "Responde esta pregunta para continuar.";
        } else if (
          pregunta.tipo === "numero" &&
          !Number.isFinite(Number(String(valor).replace(",", ".")))
        ) {
          nuevos[clave] = "Ingresa un número válido.";
        }
      }
    }

    setErrores(nuevos);
    const claves = Object.keys(nuevos);

    return {
      datos: claves.length === 0 ? validacion.datos : null,
      primerError: claves[0] ?? null
    };
  }

  function irAlError(clave: string) {
    const elemento = document.getElementById(idControl(clave));
    if (!elemento) return;
    elemento.scrollIntoView({ behavior: "smooth", block: "center" });
    if (elemento instanceof HTMLElement) {
      elemento.focus({ preventScroll: true });
    }
  }

  async function alEnviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;

    setErrorGeneral("");
    const { datos: datosValidados, primerError } = validarFormulario();

    if (!datosValidados) {
      if (primerError) irAlError(primerError);
      return;
    }

    if (!vacante || !cv) return;

    setEnviando(true);

    try {
      const formulario = new FormData();
      formulario.append("cargoId", vacante.id);

      const campos: Array<keyof DatosValidados> = [
        "email",
        "nombre",
        "primer_apellido",
        "segundo_apellido",
        "celular",
        "pais",
        "ciudad"
      ];

      for (const campo of campos) {
        const valor = datosValidados[campo];
        if (typeof valor === "string" && valor) {
          formulario.append(campo, valor);
        }
      }

      formulario.append("habeasData", "true");
      formulario.append("respuestas", JSON.stringify(respuestas));
      formulario.append("cv", cv);

      const respuesta = await fetch("/api/postular", {
        method: "POST",
        body: formulario
      });

      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }

      const resultado: unknown = await respuesta.json();
      const exitoso =
        Boolean(resultado) &&
        typeof resultado === "object" &&
        (resultado as { success?: unknown }).success === true;

      if (!exitoso) {
        throw new Error("Respuesta inválida del servidor.");
      }

      setMostrarExito(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorGeneral(
        "No pudimos completar el envío. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setMostrarExito(false);
    setVacanteId("");
    setDatos(DATOS_INICIALES);
    setRespuestas({});
    setCv(null);
    setHabeasData(false);
    setArrastrando(false);
    setErrores({});
    setErrorGeneral("");
    setEnviando(false);
    if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderControl(pregunta: PreguntaPublica) {
    const valor = respuestas[pregunta.id];
    const error = errores[`pregunta-${pregunta.id}`];

    if (pregunta.tipo === "sino") {
      return (
        <div
          className="grid max-w-xs grid-cols-2 gap-2"
          role="radiogroup"
          aria-invalid={Boolean(error)}
        >
          {[true, false].map((opcion) => {
            const activo = valor === opcion;
            return (
              <label
                key={String(opcion)}
                className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activo
                    ? "border-brand-dark bg-brand-soft text-ink"
                    : "border-cream-edge bg-white text-ink-muted hover:border-brand-dark/50"
                }`}
              >
                <input
                  type="radio"
                  name={`pregunta-${pregunta.id}`}
                  className="sr-only"
                  checked={activo}
                  onChange={() => responder(pregunta.id, opcion)}
                />
                {opcion ? "Sí" : "No"}
              </label>
            );
          })}
        </div>
      );
    }

    if (pregunta.tipo === "numero") {
      return (
        <input
          id={`pregunta-${pregunta.id}`}
          type="number"
          step="any"
          inputMode="decimal"
          className="field-control max-w-xs"
          placeholder="Escribe un valor numérico"
          value={
            typeof valor === "number" || typeof valor === "string" ? valor : ""
          }
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            const texto = event.target.value;
            responder(pregunta.id, texto === "" ? "" : Number(texto));
          }}
        />
      );
    }

    return (
      <select
        id={`pregunta-${pregunta.id}`}
        className="field-control max-w-md"
        value={typeof valor === "string" ? valor : ""}
        aria-invalid={Boolean(error)}
        onChange={(event) => responder(pregunta.id, event.target.value)}
      >
        <option value="">Selecciona una opción</option>
        {(pregunta.opciones ?? []).map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <section className="animate-fade-up lg:sticky lg:top-24">
            <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Talento CEIBA
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Postula y déjanos <em className="not-italic text-brand-dark">conocerte</em>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Completa tu preentrevista en pocos minutos. Revisamos cada postulación
              para conectar tu perfil con la vacante correcta.
            </p>

            <ul className="mt-6 space-y-3">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3 text-sm text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-ink">
                    ✓
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-3xl border border-cream-edge bg-white/70 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
                Cómo funciona
              </p>
              <ol className="mt-3 space-y-3">
                {PASOS.map((paso, indice) => (
                  <li key={paso} className="flex items-start gap-3 text-sm text-ink-muted">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-dark/30 bg-brand-soft text-[11px] font-bold text-brand-ink">
                      {indice + 1}
                    </span>
                    {paso}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="panel-card animate-fade-up overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-edge bg-cream-deep/60 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-ink">Formulario de postulación</h2>
                <p className="text-sm text-ink-muted">
                  Selecciona la vacante y responde la preentrevista.
                </p>
              </div>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-brand">
                ≈ 4 min
              </span>
            </div>

            <form onSubmit={alEnviar} noValidate className="space-y-8 px-5 py-6 sm:px-7 sm:py-8">
              <section aria-labelledby="paso-vacante" className="space-y-4">
                <Paso
                  numero="01"
                  titulo="Vacante"
                  descripcion="Elige el cargo al que deseas postularte."
                />

                <div>
                  <label className="field-label" htmlFor="cargo">
                    Cargo <span className="required-mark">*</span>
                  </label>
                  <select
                    id="cargo"
                    className="field-control"
                    value={vacanteId}
                    aria-invalid={Boolean(errores.cargoId)}
                    onChange={(event) => cambiarVacante(event.target.value)}
                  >
                    <option value="">Selecciona una vacante</option>
                    {vacantes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.cargoId && (
                    <p className="field-error" role="alert">
                      {errores.cargoId}
                    </p>
                  )}
                </div>

                {vacante ? (
                  <div className="rounded-2xl border border-brand/30 bg-brand-soft/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-ink">
                      Sobre la vacante
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {vacante.descripcion}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-cream-edge bg-cream-deep/60 p-4 text-sm text-ink-muted">
                    Selecciona una vacante para ver las preguntas de la preentrevista.
                  </div>
                )}
              </section>

              <section aria-labelledby="paso-datos" className="space-y-4">
                <Paso
                  numero="02"
                  titulo="Tus datos"
                  descripcion="Usaremos esta información para contactarte."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {CAMPOS.map((campo) => {
                    const error = errores[campo.name];

                    return (
                      <div
                        key={campo.name}
                        className={campo.fullWidth ? "sm:col-span-2" : undefined}
                      >
                        <label className="field-label" htmlFor={campo.name}>
                          {campo.label}{" "}
                          {campo.required && <span className="required-mark">*</span>}
                        </label>
                        <input
                          id={campo.name}
                          name={campo.name}
                          type={campo.type}
                          autoComplete={campo.autoComplete}
                          maxLength={campo.maxLength}
                          placeholder={campo.placeholder}
                          className="field-control"
                          value={datos[campo.name]}
                          aria-invalid={Boolean(error)}
                          onChange={(event) =>
                            actualizarDato(campo.name, event.target.value)
                          }
                        />
                        {campo.help && <p className="field-help">{campo.help}</p>}
                        {error && (
                          <p className="field-error" role="alert">
                            {error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="paso-preguntas" className="space-y-4">
                <Paso
                  numero="03"
                  titulo="Preentrevista"
                  descripcion="Responde con sinceridad todas las preguntas del cargo."
                />

                {vacante ? (
                  <div className="space-y-3">
                    {vacante.preguntas.map((pregunta, indice) => {
                      const clave = `pregunta-${pregunta.id}`;
                      const error = errores[clave];

                      return (
                        <fieldset
                          key={pregunta.id}
                          id={clave}
                          tabIndex={-1}
                          aria-invalid={Boolean(error)}
                          className={`rounded-2xl border p-4 transition sm:p-5 ${
                            error
                              ? "border-red-300 bg-red-50/60"
                              : "border-cream-edge bg-cream-deep/40"
                          }`}
                        >
                          <legend className="sr-only">{pregunta.texto}</legend>
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <p className="flex gap-2 text-[15px] font-semibold leading-snug text-ink">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-brand">
                                {indice + 1}
                              </span>
                              <span>{pregunta.texto}</span>
                            </p>
                            {pregunta.obligatoria && (
                              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink">
                                Obligatoria
                              </span>
                            )}
                          </div>
                          {renderControl(pregunta)}
                          {error && (
                            <p className="field-error" role="alert">
                              {error}
                            </p>
                          )}
                        </fieldset>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-cream-edge bg-cream-deep/60 p-4 text-sm text-ink-muted">
                    Las preguntas aparecerán cuando selecciones una vacante.
                  </div>
                )}
              </section>

              <section aria-labelledby="paso-cv" className="space-y-3">
                <Paso
                  numero="04"
                  titulo="Hoja de vida"
                  descripcion="Adjunta tu CV en formato PDF."
                />

                <label className="field-label" htmlFor="cv-input">
                  Hoja de vida en PDF <span className="required-mark">*</span>
                </label>

                {cv ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand-soft/50 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-bold text-brand">
                      PDF
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {cv.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {formatearBytes(cv.size)} · Listo para enviar
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={quitarArchivo}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream-edge bg-white text-lg leading-none text-ink-muted transition hover:border-red-300 hover:text-red-600"
                      aria-label="Quitar hoja de vida"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    id="zona-cv"
                    role="button"
                    tabIndex={0}
                    onClick={abrirSelector}
                    onKeyDown={alPresionarZona}
                    onDragOver={alArrastrarSobre}
                    onDragLeave={alSalirArrastre}
                    onDrop={alSoltarArchivo}
                    aria-invalid={Boolean(errores.cv)}
                    className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition sm:flex-row sm:text-left ${
                      arrastrando
                        ? "border-brand-dark bg-brand-soft/70"
                        : errores.cv
                          ? "border-red-300 bg-red-50/50"
                          : "border-cream-edge bg-cream-deep/50 hover:border-brand-dark/50"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-brand-dark shadow-sm">
                      PDF
                    </span>
                    <div>
                      <p className="font-semibold text-ink">
                        Arrastra tu CV aquí o haz clic para seleccionarlo
                      </p>
                      <p className="text-sm text-ink-muted">
                        Formato PDF · máximo 5 MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={inputArchivoRef}
                  id="cv-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={alSeleccionarArchivo}
                />

                {errores.cv && (
                  <p className="field-error" role="alert">
                    {errores.cv}
                  </p>
                )}
              </section>

              <section aria-labelledby="paso-legal" className="space-y-3">
                <Paso
                  numero="05"
                  titulo="Tratamiento de datos"
                  descripcion="Necesitamos tu autorización para continuar."
                />

                <div
                  className={`rounded-2xl border p-4 ${
                    errores.habeasData
                      ? "border-red-300 bg-red-50/60"
                      : "border-cream-edge bg-cream-deep/40"
                  }`}
                >
                  <label
                    className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-muted"
                    htmlFor="habeasData"
                  >
                    <input
                      id="habeasData"
                      type="checkbox"
                      checked={habeasData}
                      aria-invalid={Boolean(errores.habeasData)}
                      onChange={(event) => {
                        setHabeasData(event.target.checked);
                        limpiarError("habeasData");
                        setErrorGeneral("");
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-dark"
                    />
                    <span>
                      Autorizo a CEIBA el tratamiento de mis datos personales para
                      el proceso de selección, conforme a la{" "}
                      <strong className="text-ink">Ley 1581 de 2012</strong> y su
                      política de tratamiento de datos.
                    </span>
                  </label>
                  <p className="mt-2 pl-7 text-xs text-ink-muted">
                    Puedes ejercer tus derechos de acceso, corrección y eliminación
                    escribiendo al equipo de Talento Humano de CEIBA.
                  </p>
                  {errores.habeasData && (
                    <p className="field-error pl-7" role="alert">
                      {errores.habeasData}
                    </p>
                  )}
                </div>
              </section>

              <div className="space-y-3 border-t border-cream-edge pt-6">
                {errorGeneral && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {errorGeneral}
                  </div>
                )}

                <button type="submit" disabled={enviando} className="btn-primary w-full">
                  {enviando ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar postulación"
                  )}
                </button>

                <p className="text-center text-xs text-ink-muted">
                  Tu información es confidencial y solo la revisa el equipo de
                  Talento Humano.
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>

      {mostrarExito && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-exito"
        >
          <div className="w-full max-w-md animate-pop-in rounded-3xl bg-white p-6 text-center shadow-panel-strong sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-3xl font-black text-ink">
              ✓
            </div>
            <h2 id="titulo-exito" className="mt-5 text-2xl font-bold text-ink">
              ¡Postulación recibida con éxito!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Gracias por postularte a{" "}
              <strong className="text-ink">{vacante?.nombre}</strong>. Si tu perfil
              avanza, el equipo de Talento Humano se pondrá en contacto contigo.
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Registramos tu postulación con el correo{" "}
              <strong className="text-ink">{datos.email}</strong>.
            </p>
            <button type="button" onClick={reiniciar} className="btn-primary mt-6 w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
