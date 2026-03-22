import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/send-otp';

// In-memory OTP store for demo (replace with Redis or DB in prod)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(request: Request) {
  const { email, sendgridApiKey } = await request.json();
  if (!email || !sendgridApiKey) {
    return NextResponse.json({ error: 'Missing email or API key' }, { status: 400 });
  }
  const otp = generateOtp();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
  await sendOtpEmail({ to: email, otp, sendgridApiKey });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const { email, otp } = await request.json();
  const entry = otpStore.get(email);
  if (!entry || entry.otp !== otp || entry.expires < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }
  otpStore.delete(email);
  return NextResponse.json({ success: true });
}
