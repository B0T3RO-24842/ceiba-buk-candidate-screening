"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ScreenFlowLogo from "@/components/ScreenFlowLogo";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/#arquitectura", label: "Arquitectura" },
  { href: "/postular", label: "Postular" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="ScreenFlow, ir al inicio" className="shrink-0">
          <ScreenFlowLogo variant="light" />
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {ENLACES.map((enlace) => {
            const activo =
              enlace.href === "/"
                ? pathname === "/"
                : !enlace.href.startsWith("/#") && pathname.startsWith(enlace.href);

            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activo
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}

          <Link
            href="/simulador"
            aria-current={pathname.startsWith("/simulador") ? "page" : undefined}
            className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-ink transition hover:bg-brand-light focus-visible:ring-4 focus-visible:ring-brand/40"
          >
            Probar demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
