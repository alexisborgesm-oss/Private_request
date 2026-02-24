import { NextResponse } from "next/server";

export async function GET() {
  console.error("[PING] runtime hit", new Date().toISOString());
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
