import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "../_storage"

/** GET /api/vendor/health — Database connection audit endpoint */
export async function GET() {
  const health = await checkDatabaseHealth()

  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
