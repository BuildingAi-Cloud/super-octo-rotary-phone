import { NextResponse } from "next/server"
import { getVoteById } from "../../_storage"
import { getVoteResults as getVoteResultsHelper } from "@/lib/governance-store"

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

    // Only show results after vote is COMPLETED
    if (vote.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "VOTE_ACTIVE", message: "Results are only available after voting is complete" },
        { status: 403 }
      )
    }

    // For MEETING type, return agenda instead of results
    if (vote.type === "MEETING") {
      return NextResponse.json({
        voteId: vote.id,
        type: "MEETING",
        title: vote.title,
        status: vote.status,
        agenda: vote.agenda || [],
        participation: vote.participation,
        quorum: vote.quorum,
      })
    }

    // For E-VOTE type, calculate and return results
    const results = getVoteResultsHelper(vote)
    const totalVotes = results.reduce((sum, r) => sum + r.count, 0)
    const quorumReached = vote.participation >= vote.quorum

    return NextResponse.json({
      voteId: vote.id,
      type: "E-VOTE",
      title: vote.title,
      status: vote.status,
      deadline: vote.deadline,
      participation: vote.participation,
      quorum: vote.quorum,
      quorumReached,
      totalVotes,
      results,
      // DO NOT return voter information
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "FETCH_RESULTS_FAILED", message },
      { status: 500 }
    )
  }
}
