import { sendEmail } from "@/lib/sendgrid";

export async function sendOtpEmail({ to, otp, sendgridApiKey }: { to: string; otp: string; sendgridApiKey: string }) {
  const subject = "Your OTP Code";
  const html = `<p>Your one-time password (OTP) is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`;
  return sendEmail({ to, subject, html, sendgridApiKey });
}
