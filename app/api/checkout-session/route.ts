import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { productId?: string; interval?: 'monthly' | 'yearly'; units?: number };
    const productId = (body.productId || '').trim();
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // This deployment uses demo checkout flow unless Stripe backend is installed/configured.
    return NextResponse.json({ error: 'Stripe checkout is disabled for this deployment. Use demo checkout flow.' }, { status: 501 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
