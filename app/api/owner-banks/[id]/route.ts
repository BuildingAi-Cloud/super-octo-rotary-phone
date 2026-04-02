import { NextResponse } from "next/server"
import {
  canManageOwnerBanks,
  updateOwnerBank,
  type BankAccountStatus,
  type BankAccountType,
} from "../_storage"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "bank id is required" }, { status: 400 })
  }

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

    const result = await updateOwnerBank({
      ownerId,
      bankId: id,
      bankName: body.bankName !== undefined ? String(body.bankName || "").trim() : undefined,
      accountHolder: body.accountHolder !== undefined ? String(body.accountHolder || "").trim() : undefined,
      accountType: body.accountType !== undefined ? (String(body.accountType) as BankAccountType) : undefined,
      routingLast4: body.routingLast4 !== undefined ? String(body.routingLast4 || "").replace(/\D/g, "").slice(-4) : undefined,
      accountLast4: body.accountLast4 !== undefined ? String(body.accountLast4 || "").replace(/\D/g, "").slice(-4) : undefined,
      nickname: body.nickname !== undefined ? String(body.nickname || "").trim() : undefined,
      status: body.status !== undefined ? (String(body.status) as BankAccountStatus) : undefined,
      isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
    })

    if (!result.bank) {
      return NextResponse.json({ error: "BANK_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 })
  }
}
