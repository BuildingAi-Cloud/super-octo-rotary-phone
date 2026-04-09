import { NextResponse } from "next/server"
import {
  listServiceRequests,
  updateRequestStatus,
  type RequestStatus,
} from "../_storage"

const VALID_STATUSES: RequestStatus[] = ["new", "in_progress", "completed"]

/** GET /api/vendor/requests?vendorId=xxx */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const vendorId = url.searchParams.get("vendorId")?.trim()

  if (!vendorId) {
    return NextResponse.json({ error: "vendorId query parameter is required" }, { status: 400 })
  }

  const requests = await listServiceRequests(vendorId)
  return NextResponse.json({ requests })
}

/** PATCH /api/vendor/requests  body: { requestId, status } */
export async function PATCH(request: Request) {
  let body: { requestId?: string; status?: string }

  try {
    body = (await request.json()) as { requestId?: string; status?: string }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const requestId = String(body.requestId || "").trim()
  const status = String(body.status || "").trim()

  if (!requestId) {
    return NextResponse.json({ error: "requestId is required" }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status as RequestStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    )
  }

  const updated = await updateRequestStatus(requestId, status as RequestStatus)
  if (!updated) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  return NextResponse.json({ request: updated })
}
