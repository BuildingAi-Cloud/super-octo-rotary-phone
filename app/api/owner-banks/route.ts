import { NextResponse } from "next/server"
import {
  canManageOwnerBanks,
  createOwnerBank,
  listOwnerBanks,
  type BankAccountType,
} from "./_storage"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ownerId = (searchParams.get("ownerId") || "").trim()
  const role = searchParams.get("role")

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 })
  }
  if (!canManageOwnerBanks(role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })
  }

  const result = await listOwnerBanks(ownerId)
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const ownerId = String(body.ownerId || "").trim()
    const role = String(body.role || "")
    if (!ownerId) {
      return NextResponse.json({ error: "ownerId is required" }, { status: 400 })
    }
    if (!canManageOwnerBanks(role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })
    }

    const bankName = String(body.bankName || "").trim()
    const accountHolder = String(body.accountHolder || "").trim()
    const accountType = String(body.accountType || "checking") as BankAccountType
    const routingLast4 = String(body.routingLast4 || "").replace(/\D/g, "").slice(-4)
    const accountLast4 = String(body.accountLast4 || "").replace(/\D/g, "").slice(-4)
    const nickname = String(body.nickname || "").trim() || `${bankName} (${accountLast4})`

    if (!bankName || !accountHolder || routingLast4.length !== 4 || accountLast4.length !== 4) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 })
    }

    const result = await createOwnerBank({
      ownerId,
      bankName,
      accountHolder,
      accountType,
      routingLast4,
      accountLast4,
      nickname,
    })

    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
  }
}
