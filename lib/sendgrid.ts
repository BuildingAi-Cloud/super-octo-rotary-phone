import { createMailTransport, getMailRuntimeConfig } from "@/lib/mail-config"

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const cfg = getMailRuntimeConfig()
  if (!cfg.configured) {
    throw new Error(cfg.errors.join("; ") || "Mail transport is not configured")
  }

  const transporter = createMailTransport()

  return transporter.sendMail({
    from: from || cfg.from,
    to,
    subject,
    html,
  })
}
