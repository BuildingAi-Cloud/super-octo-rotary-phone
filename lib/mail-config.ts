import nodemailer from "nodemailer"

export type MailProvider = "sendgrid" | "smtp"

export interface MailRuntimeConfig {
  configured: boolean
  provider?: MailProvider
  from: string
  errors: string[]
  summary: string
}

function parseBool(value: string | undefined, fallback: boolean) {
  if (!value) return fallback
  const normalized = value.trim().toLowerCase()
  if (["1", "true", "yes", "on"].includes(normalized)) return true
  if (["0", "false", "no", "off"].includes(normalized)) return false
  return fallback
}

function parsePort(value: string | undefined) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  if (parsed <= 0 || parsed > 65535) return null
  return parsed
}

export function getMailRuntimeConfig(): MailRuntimeConfig {
  const errors: string[] = []
  const sendgridApiKey = (process.env.SENDGRID_API_KEY || "").trim()
  const from = (process.env.MAIL_FROM || "no-reply@buildings.com").trim()

  if (sendgridApiKey) {
    return {
      configured: true,
      provider: "sendgrid",
      from,
      errors,
      summary: "Configured via SENDGRID_API_KEY",
    }
  }

  const host = (process.env.SMTP_HOST || "").trim()
  const port = parsePort(process.env.SMTP_PORT)
  const user = (process.env.SMTP_USER || "").trim()
  const pass = (process.env.SMTP_PASS || "").trim()

  if (host || process.env.SMTP_PORT || user || pass) {
    if (!host) errors.push("SMTP_HOST is missing")
    if (!port) errors.push("SMTP_PORT is missing or invalid")
    if (!user) errors.push("SMTP_USER is missing")
    if (!pass) errors.push("SMTP_PASS is missing")
  }

  if (errors.length > 0) {
    return {
      configured: false,
      from,
      errors,
      summary: "SMTP partially configured",
    }
  }

  if (!host || !port || !user || !pass) {
    return {
      configured: false,
      from,
      errors: ["No mail provider configured (set SENDGRID_API_KEY or SMTP_* vars)"],
      summary: "Mail provider not configured",
    }
  }

  return {
    configured: true,
    provider: "smtp",
    from,
    errors,
    summary: "Configured via SMTP_HOST/SMTP_PORT/SMTP_USER",
  }
}

export function createMailTransport() {
  const cfg = getMailRuntimeConfig()
  if (!cfg.configured || !cfg.provider) {
    throw new Error(cfg.errors.join("; ") || "Mail provider is not configured")
  }

  if (cfg.provider === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: (process.env.SENDGRID_API_KEY || "").trim(),
      },
    })
  }

  return nodemailer.createTransport({
    host: (process.env.SMTP_HOST || "").trim(),
    port: Number(process.env.SMTP_PORT),
    secure: parseBool(process.env.SMTP_SECURE, Number(process.env.SMTP_PORT) === 465),
    auth: {
      user: (process.env.SMTP_USER || "").trim(),
      pass: (process.env.SMTP_PASS || "").trim(),
    },
  })
}
