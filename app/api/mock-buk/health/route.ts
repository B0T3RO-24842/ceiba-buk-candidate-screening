import { NextResponse } from "next/server";

import { MOCK_BUK_STARTED_AT } from "@/lib/mock-buk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    service: "mock-buk",
    mode: "in-memory",
    startedAt: MOCK_BUK_STARTED_AT,
    now: new Date().toISOString(),
  });
}
