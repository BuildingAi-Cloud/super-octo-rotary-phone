import { NextResponse } from "next/server"
import { createAmenityRecord, getAllAmenities, type AmenityCreateInput } from "./_storage"

export async function GET() {
  const amenities = await getAllAmenities()
  return NextResponse.json({ amenities })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AmenityCreateInput>
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Amenity name is required" }, { status: 400 })
    }

    const amenity = await createAmenityRecord({
      name: body.name.trim(),
      status: body.status,
      policy: body.policy,
      approver: body.approver,
      details: body.details,
      rules: body.rules,
    })

    return NextResponse.json({ amenity }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
