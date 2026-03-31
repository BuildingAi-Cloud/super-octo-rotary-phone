import { NextResponse } from "next/server"
import { getVoteById, castVote } from "../../_storage"
import { isDeadlinePassed } from "@/lib/governance"

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const body = (await req.json()) as {
      optionId: string
      voterId: string
    }

    if (!body.optionId || !body.voterId) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "optionId and voterId are required" },
        { status: 400 }
      )
    }

    const vote = await getVoteById(params.id)
    if (!vote) {
      return NextResponse.json(
        { error: "VOTE_NOT_FOUND", message: "Vote not found" },
        { status: 404 }
      )
    }

    // Check vote status
    if (vote.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "VOTE_NOT_ACTIVE", message: `Vote is ${vote.status}. Only ACTIVE votes can receive votes.` },
        { status: 409 }
      )
    }

    // Check deadline
    if (isDeadlinePassed(vote.deadline)) {
      return NextResponse.json(
        { error: "DEADLINE_PASSED", message: "Voting deadline has passed" },
        { status: 409 }
      )
    }

    // Check if option exists
    if (!vote.options?.find(o => o.id === body.optionId)) {
      return NextResponse.json(
        { error: "INVALID_OPTION", message: "Option not found" },
        { status: 400 }
      )
    }

    const cast = await castVote(params.id, body.optionId, body.voterId)

    if (!cast) {
      return NextResponse.json(
        { error: "VOTE_ALREADY_CAST", message: "You have already voted on this proposal" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Your vote has been recorded", castId: cast.id },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "CAST_VOTE_FAILED", message },
      { status: 500 }
    )
  }
}
