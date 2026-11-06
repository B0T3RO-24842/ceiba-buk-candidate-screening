import Link from "next/link";

import ScreenFlowLogo from "@/components/ScreenFlowLogo";

const PASOS = [
  {
    numero: "01",
    titulo: "Llega la postulación",
    detalle:
      "LinkedIn envía un evento con los datos del candidato y su hoja de vida.",
  },
  {
    numero: "02",
    titulo: "ScreenFlow valida",
    detalle:
      "Normaliza nombres, correo, celular y ubicación; revisa el PDF y los campos obligatorios.",
  },
  {
    numero: "03",
    titulo: "Se transforma",
    detalle:
      "El evento se mapea al contrato exacto de BUK, forzando origen y referrer.",
  },
  {
    numero: "04",
    titulo: "BUK registra",
    detalle:
      "El postulante queda en la vacante correcta con trazabilidad de cada envío.",
  },
];

const BENEFICIOS = [
  {
    titulo: "Menos trabajo manual",
    detalle:
      "El equipo de talento deja de copiar datos entre LinkedIn y BUK. Cada postulación llega validada y lista para revisar.",
    icono: "↺",
  },
  {
    titulo: "Datos confiables",
    detalle:
      "Validación de campos, correo único, firma PDF y límite de 5 MB antes de tocar BUK. Lo inválido se rechaza con un error claro.",
    icono: "✓",
  },
  {
    titulo: "Trazabilidad completa",
    detalle:
      "Cada envío devuelve estado HTTP, duración, endpoint, ID de BUK y el mapeo aplicado. Nada ocurre a ciegas.",
    icono: "◎",
  },
];

const VALIDACIONES = [
  "Correo válido y único",
  "Nombre y apellidos",
  "Celular normalizado",
  "País y ciudad",
  "CV en PDF (máx. 5 MB)",
  "Cargo con id y nombre",
  "Origen LinkedIn forzado",
  "Autorización de datos",
];

const NOTAS_PRODUCCION = [
  {
    titulo: "BUK real vs. Mock BUK",
    detalle:
      "La demo usa un Mock BUK interno. Para conectar BUK real solo se cambia BUK_API_URL y el token; el contrato de salida ya está mapeado.",
  },
  {
    titulo: "Sin credenciales de la empresa",
    detalle:
      "CEIBA no entregó accesos a su instancia de BUK durante el reto. Por eso la demo es explícitamente ficticia y no procesa datos reales.",
  },
  {
    titulo: "Límite de Vercel",
    detalle:
      "El plan gratuito limita el cuerpo de la petición a ~4,5 MB. Para CV grandes se recomienda enviar una URL de referencia en lugar de Base64.",
  },
  {
    titulo: "Almacenamiento en memoria",
    detalle:
      "El mock guarda registros en memoria y se reinicia con cada instancia serverless. La persistencia definitiva la aporta BUK.",
  },
];

function FlujoDemo() {
  return (
    <div className="panel-card relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
          Flujo de una postulación
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
          Demo activa
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-cream-edge bg-white p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0a66c2] text-sm font-black text-white">
            in
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">LinkedIn</p>
            <p className="truncate text-xs text-ink-muted">
              Nueva postulación · Ana Pérez
            </p>
          </div>
          <span className="ml-auto text-xs font-semibold text-ink-muted">JSON</span>
        </div>

        <div className="flex justify-center text-brand-dark" aria-hidden="true">
          ↓
        </div>

        <div className="rounded-2xl bg-ink p-4 text-white shadow-panel">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-xs font-black text-ink">
              SF
            </span>
            <p className="text-sm font-bold">ScreenFlow</p>
            <span className="ml-auto text-[11px] font-semibold text-white/50">
              middleware
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-white/75">
            <li>✓ Campos obligatorios completos</li>
            <li>✓ Correo válido y único</li>
            <li>✓ CV PDF verificado</li>
          </ul>
        </div>

        <div className="flex justify-center text-brand-dark" aria-hidden="true">
          ↓
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-cream-edge bg-white p-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-black text-brand-ink">
            B
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">BUK · Postulantes</p>
            <p className="truncate text-xs text-ink-muted">
              Registrado en DEV-JAVA-SR
            </p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            HTTP 200
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-cream-edge bg-cream-deep/60 p-2.5">
          <p className="text-lg font-black text-ink">1</p>
          <p className="text-[11px] font-semibold text-ink-muted">
            postulación procesada
          </p>
        </div>
        <div className="rounded-xl border border-cream-edge bg-cream-deep/60 p-2.5">
          <p className="text-lg font-black text-ink">0</p>
          <p className="text-[11px] font-semibold text-ink-muted">
            copias manuales
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-ink">
              Proyecto académico · Reto #1 SENA
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              De LinkedIn a BUK,
              <br />
              <span className="text-brand-dark">sin trabajo manual.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              <strong className="text-ink">ScreenFlow</strong> recibe las
              postulaciones de LinkedIn, valida los datos del candidato y las
              registra en BUK de forma automática, trazable y segura.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/simulador" className="btn-primary">
                Probar la demo
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#arquitectura"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream-edge bg-white px-6 py-3.5 text-base font-bold text-ink transition hover:border-brand-dark/50 hover:bg-cream-deep"
              >
                Ver arquitectura
              </Link>
            </div>

            <p className="mt-5 text-sm text-ink-muted">
              Demo con datos ficticios · Mock BUK · No requiere registro.
            </p>
          </div>

          <div className="animate-fade-up lg:pl-4">
            <FlujoDemo />
          </div>
        </div>
      </section>

      <section className="border-y border-cream-edge bg-white/60">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              Contexto
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Desarrollado para <strong>CEIBA Software</strong> en el marco del
              Reto #1 SENA y aprobado por la empresa.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              Alcance
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Middleware de integración. No modifica el core de BUK ni usa la API
              real de LinkedIn.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              Estado
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              Demo funcional desplegada. Lista para conectar una instancia real de
              BUK cambiando la URL y el token.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
            El problema
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            El talento llega rápido. El proceso no.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Copiar postulaciones de LinkedIn a BUK consume tiempo, genera errores y
            pierde candidatos. ScreenFlow automatiza ese puente con reglas claras y
            evidencia de cada envío.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BENEFICIOS.map((beneficio) => (
            <article key={beneficio.titulo} className="panel-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-lg font-black text-brand-ink">
                {beneficio.icono}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{beneficio.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {beneficio.detalle}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16 text-white lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Cómo funciona
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Cuatro pasos. Cero fricción.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                El flujo completo ocurre en milisegundos y devuelve una respuesta
                clara en cada etapa.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {VALIDACIONES.map((validacion) => (
                  <span
                    key={validacion}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                  >
                    {validacion}
                  </span>
                ))}
              </div>
            </div>

            <ol className="grid gap-3 sm:grid-cols-2">
              {PASOS.map((paso) => (
                <li
                  key={paso.numero}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <span className="text-xs font-black tracking-[0.18em] text-brand">
                    {paso.numero}
                  </span>
                  <h3 className="mt-2 text-base font-bold">{paso.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {paso.detalle}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="arquitectura"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
              Arquitectura
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              Simple por fuera. Riguroso por dentro.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Un único despliegue en Vercel con Next.js App Router. La interfaz
              consume una API interna que mapea, valida y envía a BUK. El mock
              interno permite demostrar el flujo sin credenciales de la empresa.
            </p>

            <div className="mt-6 rounded-2xl bg-ink p-5 font-mono text-xs leading-relaxed text-white/85">
              <p className="text-white/40">
                # flujo de datos
              </p>
              <p className="mt-2">JSON LinkedIn</p>
              <p className="text-brand">└─→ POST /api/simulador</p>
              <p className="text-white/60 pl-4">├─ mapearLinkedInABuk()</p>
              <p className="text-white/60 pl-4">├─ validarCamposBUK()</p>
              <p className="text-white/60 pl-4">└─ enviarABuk()</p>
              <p className="text-brand pl-4">└─→ Mock BUK / BUK</p>
              <p className="mt-2 text-white/60">
                respuesta: mapeo + estado HTTP + traza
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Vercel"].map(
                (tecnologia) => (
                  <span
                    key={tecnologia}
                    className="rounded-full border border-cream-edge bg-white px-3 py-1 text-xs font-semibold text-ink-muted"
                  >
                    {tecnologia}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="panel-card p-6">
            <h3 className="text-lg font-bold text-ink">
              Notas de producción
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Decisiones y límites del proyecto, sin letra pequeña.
            </p>

            <div className="mt-4 divide-y divide-cream-edge">
              {NOTAS_PRODUCCION.map((nota) => (
                <details key={nota.titulo} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
                    {nota.titulo}
                    <span className="text-brand-dark transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {nota.detalle}
                  </p>
                </details>
              ))}
            </div>

            <Link
              href="/simulador"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-ink"
            >
              Ver el flujo en vivo
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-cream-edge bg-white/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
                Caso académico
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Un reto real, resuelto de punta a punta.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
                ScreenFlow nace del Reto #1 SENA propuesto por CEIBA Software:
                conectar las postulaciones de LinkedIn con BUK sin intervención
                manual. El proyecto fue desarrollado como ejercicio académico,
                presentado a la empresa y aprobado por esta.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Esta vitrina es una demostración de portafolio. No representa una
                integración en producción ni un acceso oficial a los sistemas de
                CEIBA.
              </p>
            </div>

            <div className="panel-card p-6">
              <div className="flex items-center gap-3">
                <ScreenFlowLogo />
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-cream-edge pb-3">
                  <dt className="font-semibold text-ink-muted">Rol</dt>
                  <dd className="text-right font-semibold text-ink">
                    Diseño y desarrollo full-stack
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-cream-edge pb-3">
                  <dt className="font-semibold text-ink-muted">Reto</dt>
                  <dd className="text-right font-semibold text-ink">
                    Integración LinkedIn → BUK
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-cream-edge pb-3">
                  <dt className="font-semibold text-ink-muted">Empresa</dt>
                  <dd className="text-right font-semibold text-ink">
                    CEIBA Software
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-ink-muted">Estado</dt>
                  <dd className="text-right font-semibold text-emerald-800">
                    Aprobado por la empresa
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-3xl bg-ink px-6 py-12 text-center text-white shadow-panel-strong sm:px-10">
          <span className="inline-flex rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Demo interactiva
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Mira cómo una postulación llega a BUK en segundos.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/65">
            Prueba el caso exitoso, un campo faltante, un CV inválido o una caída de
            BUK. Sin instalar nada.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-ink transition hover:bg-brand-light"
            >
              Abrir el simulador
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/postular"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
            >
              Ver formulario de postulación
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
