import { NextResponse } from "next/server"
import { createMailTransport, getMailRuntimeConfig } from "@/lib/mail-config"

export const runtime = "nodejs"

export async function GET() {
  const cfg = getMailRuntimeConfig()
  if (!cfg.configured || !cfg.provider) {
    return NextResponse.json(
      {
        configured: false,
        provider: null,
        reachable: false,
        summary: cfg.summary,
        errors: cfg.errors,
      },
      { status: 503 },
    )
  }

  const startedAt = Date.now()
  try {
    const transporter = createMailTransport()
    await transporter.verify()
    return NextResponse.json({
      configured: true,
      provider: cfg.provider,
      reachable: true,
      summary: cfg.summary,
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        provider: cfg.provider,
        reachable: false,
        summary: cfg.summary,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : "SMTP verify failed",
      },
      { status: 502 },
    )
  }
}
