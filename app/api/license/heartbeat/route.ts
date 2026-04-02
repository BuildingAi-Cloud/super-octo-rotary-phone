import { NextResponse } from "next/server"
import { tryLicenseHeartbeat } from "@/lib/license"

export async function POST() {
  const result = await tryLicenseHeartbeat()
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
