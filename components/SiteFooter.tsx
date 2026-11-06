"use client";

import Link from "next/link";

import ScreenFlowLogo from "@/components/ScreenFlowLogo";

const LINKEDIN =
  "https://www.linkedin.com/in/samuel-botero-londo%C3%B1o-597b38447/";
const GITHUB =
  "https://github.com/B0T3RO-24842/ceiba-buk-candidate-screening";

export default function SiteFooter() {
  return (
    <footer className="border-t border-cream-edge bg-white/70">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <div>
            <ScreenFlowLogo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
              Sistema de tamizaje automatizado de talento que conecta LinkedIn con
              BUK: recibe postulaciones, valida los datos y registra al candidato
              con trazabilidad completa.
            </p>
            <p className="mt-4 max-w-md rounded-2xl border border-brand/30 bg-brand-soft/50 p-3 text-xs font-semibold leading-relaxed text-brand-ink">
              Proyecto académico desarrollado para CEIBA Software en el marco del
              Reto #1 SENA, aprobado por la empresa.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              Explorar
            </p>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-ink">
              <li>
                <Link href="/" className="transition hover:text-brand-dark">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/simulador" className="transition hover:text-brand-dark">
                  Demo interactiva
                </Link>
              </li>
              <li>
                <Link href="/postular" className="transition hover:text-brand-dark">
                  Formulario de postulación
                </Link>
              </li>
              <li>
                <Link
                  href="/#arquitectura"
                  className="transition hover:text-brand-dark"
                >
                  Arquitectura
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              Contacto
            </p>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-ink">
              <li>
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-brand-dark"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M4.98 3.5A2.49 2.49 0 1 0 5 8.48a2.49 2.49 0 0 0-.02-4.98ZM3 9.75h4v10.5H3V9.75Zm6.5 0h3.83v1.44h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.75v5.26h-4v-4.66c0-1.11-.02-2.54-1.63-2.54-1.63 0-1.88 1.21-1.88 2.46v4.74h-4V9.75Z" />
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-brand-dark"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.02-1.9-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-cream-edge pt-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 ScreenFlow. Proyecto de portafolio.</span>
          <span>Demo con datos ficticios · Mock BUK · No usar datos reales.</span>
        </div>
      </div>
    </footer>
  );
}
