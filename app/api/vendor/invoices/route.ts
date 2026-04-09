import { NextResponse } from "next/server"
import {
  listInvoices,
  createInvoice,
  type CreateInvoiceInput,
} from "../_storage"

/** GET /api/vendor/invoices?vendorId=xxx */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const vendorId = url.searchParams.get("vendorId")?.trim()

  if (!vendorId) {
    return NextResponse.json({ error: "vendorId query parameter is required" }, { status: 400 })
  }

  const invoices = await listInvoices(vendorId)
  return NextResponse.json({ invoices })
}

/** POST /api/vendor/invoices  body: CreateInvoiceInput */
export async function POST(request: Request) {
  let body: Partial<CreateInvoiceInput>

  try {
    body = (await request.json()) as Partial<CreateInvoiceInput>
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const vendorId = String(body.vendorId || "").trim()
  const invoiceNumber = String(body.invoiceNumber || "").trim()
  const amount = Number(body.amount)
  const serviceDate = body.serviceDate ? String(body.serviceDate).trim() : null
  const notes = String(body.notes || "").trim()
  const requestId = body.requestId ? String(body.requestId).trim() : null

  if (!vendorId) {
    return NextResponse.json({ error: "vendorId is required" }, { status: 400 })
  }

  if (!invoiceNumber || invoiceNumber.length > 60) {
    return NextResponse.json({ error: "A valid invoice number is required (max 60 chars)" }, { status: 400 })
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
  }

  if (amount > 10_000_000) {
    return NextResponse.json({ error: "Amount exceeds maximum limit" }, { status: 400 })
  }

  if (notes.length > 2000) {
    return NextResponse.json({ error: "Notes must be under 2000 characters" }, { status: 400 })
  }

  const invoice = await createInvoice({
    vendorId,
    invoiceNumber,
    amount,
    serviceDate,
    notes,
    requestId,
  })

  return NextResponse.json({ invoice }, { status: 201 })
}
