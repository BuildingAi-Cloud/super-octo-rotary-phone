import { NextRequest, NextResponse } from 'next/server';
import { startCheckoutSession } from '../../actions/stripe';

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  try {
    const session = await startCheckoutSession(productId);
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
