import { NextResponse } from "next/server"
import { listAppointments } from "../_storage"

/** GET /api/vendor/appointments?vendorId=xxx */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const vendorId = url.searchParams.get("vendorId")?.trim()

  if (!vendorId) {
    return NextResponse.json({ error: "vendorId query parameter is required" }, { status: 400 })
  }

  const appointments = await listAppointments(vendorId)
  return NextResponse.json({ appointments })
}
