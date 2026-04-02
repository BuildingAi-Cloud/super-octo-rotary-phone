import { NextResponse } from "next/server"
import { getLicenseHeader, resolveLicenseStatus } from "@/lib/license"

export async function GET() {
  const status = await resolveLicenseStatus()
  return NextResponse.json({ status, header: getLicenseHeader(status) })
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { licenseKey?: string }
  const status = await resolveLicenseStatus(payload.licenseKey)
  return NextResponse.json({ status, header: getLicenseHeader(status) })
}
