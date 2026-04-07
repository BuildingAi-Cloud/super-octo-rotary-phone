import { NextResponse } from "next/server"
import { castVoteRecord } from "../../_storage"
import { canCastVote } from "@/lib/governance"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Vote id is required" }, { status: 400 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>

    const role = body.role as string | undefined
    if (!canCastVote(role)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to cast votes." },
        { status: 403 },
      )
    }

    const optionId = body.optionId as string
    if (!optionId) {
      return NextResponse.json(
        { error: "INVALID_OPTION", message: "optionId is required." },
        { status: 400 },
      )
    }

    const voterId = body.voterId as string
    if (!voterId) {
      return NextResponse.json(
        { error: "INVALID_VOTER", message: "voterId is required." },
        { status: 400 },
      )
    }

    const result = await castVoteRecord({
      voteId: id,
      optionId,
      voterId,
    })

    if (result.error === "VOTE_NOT_FOUND") {
      return NextResponse.json(
        { error: "VOTE_NOT_FOUND", message: "Vote not found." },
        { status: 404 },
      )
    }

    if (result.error === "VOTE_ALREADY_CAST") {
      return NextResponse.json(
        { error: "VOTE_ALREADY_CAST", message: "You have already voted." },
        { status: 409 },
      )
    }

    if (result.error === "VOTE_CLOSED") {
      return NextResponse.json(
        { error: "VOTE_CLOSED", message: "This vote has been closed." },
        { status: 409 },
      )
    }

    if (result.error === "VOTE_EXPIRED") {
      return NextResponse.json(
        { error: "VOTE_EXPIRED", message: "The voting deadline has passed." },
        { status: 409 },
      )
    }

    if (result.error === "NOT_AN_EVOTE") {
      return NextResponse.json(
        { error: "NOT_AN_EVOTE", message: "You can only cast votes on E-VOTE type." },
        { status: 400 },
      )
    }

    if (result.error === "INVALID_OPTION") {
      return NextResponse.json(
        { error: "INVALID_OPTION", message: "The selected option is not valid for this vote." },
        { status: 400 },
      )
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error, message: "Failed to cast vote." },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, cast: result.cast }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "Invalid request body." },
      { status: 400 },
    )
  }
}
