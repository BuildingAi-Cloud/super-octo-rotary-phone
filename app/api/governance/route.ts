import { NextResponse } from "next/server"
import { getAllVotes, createVote, CreateVoteInput } from "./_storage"
import { VoteStatus, VoteType } from "@/lib/governance-store"

function isVoteStatus(value: string): value is VoteStatus {
  return ["ACTIVE", "SCHEDULED", "COMPLETED"].includes(value)
}

function isVoteType(value: string): value is VoteType {
  return ["E-VOTE", "MEETING"].includes(value)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get("status")
    const typeParam = searchParams.get("type")

    const status = statusParam && isVoteStatus(statusParam) ? statusParam : undefined
    const type = typeParam && isVoteType(typeParam) ? typeParam : undefined

    const votes = await getAllVotes({ status, type })

    // Remove voterId from results for privacy
    const sanitized = votes.map(v => {
      const { ...rest } = v
      return rest
    })

    return NextResponse.json({ votes: sanitized })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "FETCH_VOTES_FAILED", message },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateVoteInput>

    // Validate required fields
    if (!body.type || !body.title || !body.description || !body.deadline || body.createdBy === undefined) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Missing required fields: type, title, description, deadline, createdBy" },
        { status: 400 }
      )
    }

    // Validate type
    if (!["E-VOTE", "MEETING"].includes(body.type)) {
      return NextResponse.json(
        { error: "INVALID_TYPE", message: "Type must be E-VOTE or MEETING" },
        { status: 400 }
      )
    }

    // Validate deadline is in future
    if (new Date(body.deadline) <= new Date()) {
      return NextResponse.json(
        { error: "INVALID_DEADLINE", message: "Deadline must be in the future" },
        { status: 400 }
      )
    }

    // Validate quorum
    const quorum = body.quorum || 50
    if (quorum < 1 || quorum > 100) {
      return NextResponse.json(
        { error: "INVALID_QUORUM", message: "Quorum must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Validate E-VOTE has options
    if (body.type === "E-VOTE" && (!body.options || body.options.length < 2)) {
      return NextResponse.json(
        { error: "INVALID_OPTIONS", message: "E-VOTE must have at least 2 options" },
        { status: 400 }
      )
    }

    // Validate MEETING has agenda
    if (body.type === "MEETING" && (!body.agenda || body.agenda.length < 1)) {
      return NextResponse.json(
        { error: "INVALID_AGENDA", message: "MEETING must have at least 1 agenda item" },
        { status: 400 }
      )
    }

    const vote = await createVote({
      type: body.type as "E-VOTE" | "MEETING",
      title: body.title.trim(),
      description: body.description.trim(),
      deadline: body.deadline,
      quorum,
      createdBy: body.createdBy,
      buildingId: body.buildingId,
      options: body.options,
      agenda: body.agenda,
    })

    return NextResponse.json({ vote }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "CREATE_VOTE_FAILED", message },
      { status: 500 }
    )
  }
}
