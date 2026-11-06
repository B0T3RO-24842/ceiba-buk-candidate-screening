import { NextResponse } from "next/server";

import { obtenerEndpointBuk, obtenerEntornoBuk } from "@/lib/buk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function endpointSeguro(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "configurado";
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    service: "screenflow",
    buk: {
      entorno: obtenerEntornoBuk(),
      endpoint: endpointSeguro(obtenerEndpointBuk()),
      tokenConfigurado: Boolean(process.env.BUK_API_TOKEN?.trim()),
    },
    now: new Date().toISOString(),
  });
}
