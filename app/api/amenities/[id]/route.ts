import { NextResponse } from "next/server"
import { deleteAmenityRecord, updateAmenityRecord, type AmenityUpdateInput } from "../_storage"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Amenity id is required" }, { status: 400 })
  }

  try {
    const updates = (await req.json()) as AmenityUpdateInput
    const amenity = await updateAmenityRecord(id, updates)

    if (!amenity) {
      return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
    }

    return NextResponse.json({ amenity })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: "Amenity id is required" }, { status: 400 })
  }

  const deleted = await deleteAmenityRecord(id)
  if (!deleted) {
    return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
