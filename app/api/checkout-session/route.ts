import { NextRequest, NextResponse } from 'next/server';

// Stripe integration is disabled for this deployment.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Stripe integration is disabled.' }, { status: 501 });
}
