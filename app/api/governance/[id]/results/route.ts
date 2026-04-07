import { NextResponse } from "next/server"
import { getVoteResults } from "../../_storage"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Vote id is required" }, { status: 400 })
  }

  const data = await getVoteResults(id)
  if (!data) {
    return NextResponse.json(
      { error: "RESULTS_UNAVAILABLE", message: "Results are only available for completed votes." },
      { status: 404 },
    )
  }

  return NextResponse.json(data)
}
