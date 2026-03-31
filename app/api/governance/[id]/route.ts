import { NextResponse } from "next/server"
import {
  deleteVoteRecord,
  getVoteById,
  updateVoteRecord,
  type VoteUpdateInput,
} from "../_storage"
import { canManageVote } from "@/lib/governance"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Vote id is required" }, { status: 400 })
  }

  const vote = await getVoteById(id)
  if (!vote) {
    return NextResponse.json({ error: "VOTE_NOT_FOUND", message: "Vote not found." }, { status: 404 })
  }

  return NextResponse.json(vote)
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Vote id is required" }, { status: 400 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>

    const role = body.role as string | undefined
    if (!canManageVote(role)) {
      return NextResponse.json(
        { error: "FORBIDDEN", message: "You do not have permission to update votes." },
        { status: 403 },
      )
    }

    const existing = await getVoteById(id)
    if (!existing) {
      return NextResponse.json({ error: "VOTE_NOT_FOUND", message: "Vote not found." }, { status: 404 })
    }

    if (existing.status === "COMPLETED") {
      return NextResponse.json(
        { error: "VOTE_IMMUTABLE", message: "Completed votes cannot be modified." },
        { status: 409 },
      )
    }

    const updates: VoteUpdateInput = {}
    if (body.title !== undefined) updates.title = body.title as string
    if (body.description !== undefined) updates.description = body.description as string
    if (body.status !== undefined) updates.status = body.status as VoteUpdateInput["status"]
    if (body.deadline !== undefined) updates.deadline = body.deadline as string
    if (body.quorum !== undefined) updates.quorum = body.quorum as number

    const performedBy = (body.performedBy as string) || ""
    const vote = await updateVoteRecord(id, updates, performedBy)

    if (!vote) {
      return NextResponse.json({ error: "UPDATE_FAILED", message: "Failed to update vote." }, { status: 500 })
    }

    return NextResponse.json(vote)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Vote id is required" }, { status: 400 })
  }

  let role: string | undefined
  let performedBy = ""
  try {
    const body = (await req.json()) as Record<string, unknown>
    role = body.role as string | undefined
    performedBy = (body.performedBy as string) || ""
  } catch {
    // Body may be empty
  }

  if (!canManageVote(role)) {
    return NextResponse.json(
      { error: "FORBIDDEN", message: "You do not have permission to delete votes." },
      { status: 403 },
    )
  }

  const deleted = await deleteVoteRecord(id, performedBy)
  if (!deleted) {
    return NextResponse.json({ error: "VOTE_NOT_FOUND", message: "Vote not found." }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
