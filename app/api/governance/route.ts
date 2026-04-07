import { NextResponse } from "next/server"
import {
  createVoteRecord,
  getAllVotes,
  type VoteCreateInput,
} from "./_storage"
import { canCreateVote, parseVoteOptions, parseMeetingAgenda } from "@/lib/governance"

export async function GET() {
  const votes = await getAllVotes()
  return NextResponse.json(votes)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>

    const role = body.role as string | undefined
    if (!canCreateVote(role)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to create votes." },
        { status: 403 },
      )
    }

    const type = body.type as string
    if (type !== "E-VOTE" && type !== "MEETING") {
      return NextResponse.json(
        { error: "INVALID_TYPE", message: "Type must be E-VOTE or MEETING." },
        { status: 400 },
      )
    }

    const title = (body.title as string || "").trim()
    if (!title || title.length < 3) {
      return NextResponse.json(
        { error: "INVALID_TITLE", message: "Title must be at least 3 characters." },
        { status: 400 },
      )
    }

    const description = (body.description as string || "").trim()
    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "INVALID_DESCRIPTION", message: "Description must be at least 10 characters." },
        { status: 400 },
      )
    }

    const deadline = body.deadline as string
    if (!deadline || new Date(deadline).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "INVALID_DEADLINE", message: "Deadline must be in the future." },
        { status: 400 },
      )
    }

    const quorum = typeof body.quorum === "number" ? body.quorum : 50
    if (quorum < 1 || quorum > 100) {
      return NextResponse.json(
        { error: "INVALID_QUORUM", message: "Quorum must be between 1 and 100." },
        { status: 400 },
      )
    }

    const input: VoteCreateInput = {
      type: type as VoteCreateInput["type"],
      title,
      description,
      deadline,
      quorum,
      createdBy: (body.createdBy as string) || "",
      buildingId: (body.buildingId as string) || undefined,
    }

    if (type === "E-VOTE") {
      const options = parseVoteOptions(body.options as string)
      if (options.length < 2) {
        return NextResponse.json(
          { error: "INVALID_OPTIONS", message: "E-VOTE requires at least 2 options (comma-separated)." },
          { status: 400 },
        )
      }
      input.options = options
    }

    if (type === "MEETING") {
      const agenda = parseMeetingAgenda(body.agenda as string)
      if (agenda.length === 0) {
        return NextResponse.json(
          { error: "INVALID_AGENDA", message: "MEETING requires at least one agenda item." },
          { status: 400 },
        )
      }
      input.agenda = agenda
    }

    const vote = await createVoteRecord(input)
    return NextResponse.json(vote, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "Invalid request body." },
      { status: 400 },
    )
  }
}
