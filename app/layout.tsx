import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

function obtenerUrlSitio(): string {
  const explicita = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicita) return explicita.replace(/\/+$/, "");

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (host) {
    return `https://${host.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(obtenerUrlSitio()),
  title: {
    default: "ScreenFlow · CEIBA BUK Candidate Screening",
    template: "%s · ScreenFlow"
  },
  description:
    "Sistema de tamizaje automatizado de talento que conecta LinkedIn con BUK. Proyecto académico desarrollado para CEIBA Software en el marco del Reto #1 SENA.",
  applicationName: "ScreenFlow",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "ScreenFlow",
    title: "ScreenFlow · CEIBA BUK Candidate Screening",
    description:
      "Conecta LinkedIn con BUK: recibe postulaciones, valida los datos y registra al candidato con trazabilidad completa."
  },
  twitter: {
    card: "summary_large_image",
    title: "ScreenFlow · CEIBA BUK Candidate Screening",
    description:
      "Conecta LinkedIn con BUK: recibe postulaciones, valida los datos y registra al candidato con trazabilidad completa."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
