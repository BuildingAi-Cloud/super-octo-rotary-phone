import { NextResponse } from "next/server"
import { getVoteById, updateVote, softDeleteVote } from "../_storage"

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const vote = await getVoteById(params.id)
    if (!vote) {
      return NextResponse.json(
        { error: "VOTE_NOT_FOUND", message: "Vote not found" },
        { status: 404 }
      )
    }

    // Remove voter IDs from options for privacy
    const sanitized = { ...vote }
    return NextResponse.json({ vote: sanitized })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "FETCH_VOTE_FAILED", message },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const vote = await getVoteById(params.id)
    if (!vote) {
      return NextResponse.json(
        { error: "VOTE_NOT_FOUND", message: "Vote not found" },
        { status: 404 }
      )
    }

    // Cannot modify COMPLETED votes
    if (vote.status === "COMPLETED") {
      return NextResponse.json(
        { error: "VOTE_COMPLETED", message: "Cannot modify completed votes" },
        { status: 409 }
      )
    }

    const body = (await req.json()) as Partial<typeof vote>

    // Validate status if provided
    if (body.status && !["ACTIVE", "SCHEDULED", "COMPLETED"].includes(body.status)) {
      return NextResponse.json(
        { error: "INVALID_STATUS", message: "Status must be ACTIVE, SCHEDULED, or COMPLETED" },
        { status: 400 }
      )
    }

    const updated = await updateVote(params.id, {
      status: body.status,
      participation: body.participation,
      quorum: body.quorum,
    })

    if (!updated) {
      return NextResponse.json(
        { error: "UPDATE_FAILED", message: "Could not update vote" },
        { status: 500 }
      )
    }

    return NextResponse.json({ vote: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "UPDATE_VOTE_FAILED", message },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const vote = await getVoteById(params.id)
    if (!vote) {
      return NextResponse.json(
        { error: "VOTE_NOT_FOUND", message: "Vote not found" },
        { status: 404 }
      )
    }

    // Cannot delete ACTIVE votes
    if (vote.status === "ACTIVE") {
      return NextResponse.json(
        { error: "VOTE_ACTIVE", message: "Cannot delete active votes" },
        { status: 409 }
      )
    }

    const deleted = await softDeleteVote(params.id)
    if (!deleted) {
      return NextResponse.json(
        { error: "DELETE_FAILED", message: "Could not delete vote" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Vote deleted" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "DELETE_VOTE_FAILED", message },
      { status: 500 }
    )
  }
}
