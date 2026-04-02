import "server-only"

import { createHash, createVerify } from "crypto"
import fs from "fs/promises"
import path from "path"
import { getAiProvider, getDeploymentMode } from "@/lib/runtime-public"
import { getLicenseKey } from "@/lib/runtime-server"

export interface LicenseClaims {
  product: string
  customer: string
  seats: number
  expires_at: string
  capabilities: string[]
}

export interface LicenseStatus {
  mode: "saas" | "onprem" | "hybrid"
  valid: boolean
  reason: string
  readOnly: boolean
  aiEnabled: boolean
  daysRemaining: number | null
  seats: number | null
  capabilities: string[]
  customer: string | null
  product: string | null
  expiresAt: string | null
  provider: string
  source: "saas-auth" | "signed-license"
  licenseHash: string | null
}

const DEFAULT_LICENSE_STATE_PATH = "/var/lib/buildsync/license-state"
const HEARTBEAT_FILE = "heartbeat.json"

function toBase64UrlBuffer(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4)
  return Buffer.from(`${padded}${"=".repeat(padLength)}`, "base64")
}

function hashLicenseKey(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function parseLicensePayload(raw: string): LicenseClaims | null {
  try {
    const parsed = JSON.parse(raw) as Partial<LicenseClaims>
    if (!parsed || typeof parsed !== "object") return null
    if (typeof parsed.product !== "string") return null
    if (typeof parsed.customer !== "string") return null
    if (typeof parsed.expires_at !== "string") return null
    if (!Array.isArray(parsed.capabilities)) return null

    return {
      product: parsed.product,
      customer: parsed.customer,
      seats: Number(parsed.seats || 0),
      expires_at: parsed.expires_at,
      capabilities: parsed.capabilities.map((cap) => String(cap)),
    }
  } catch {
    return null
  }
}

export async function getLicensePublicKey(): Promise<string | null> {
  if (process.env.LICENSE_PUBLIC_KEY) {
    return process.env.LICENSE_PUBLIC_KEY
  }

  const candidate = process.env.LICENSE_PUBLIC_KEY_PATH || path.join(process.cwd(), "apps/on-prem-app/license_public.pem")
  try {
    return await fs.readFile(candidate, "utf8")
  } catch {
    return null
  }
}

export async function verifySignedLicense(licenseKey: string): Promise<LicenseClaims | null> {
  const publicKey = await getLicensePublicKey()
  if (!publicKey) return null

  const parts = licenseKey.split(".")
  if (parts.length !== 2) return null

  const [payloadB64, signatureB64] = parts
  const payloadBuffer = toBase64UrlBuffer(payloadB64)
  const signatureBuffer = toBase64UrlBuffer(signatureB64)

  const verifier = createVerify("RSA-SHA256")
  verifier.update(payloadB64)
  verifier.end()

  const validSignature = verifier.verify(publicKey, signatureBuffer)
  if (!validSignature) return null

  return parseLicensePayload(payloadBuffer.toString("utf8"))
}

function calculateDaysRemaining(expiresAt: string): number {
  const now = Date.now()
  const expires = new Date(expiresAt).getTime()
  return Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
}

function getStateDirectory(): string {
  return process.env.LICENSE_STATE_PATH || DEFAULT_LICENSE_STATE_PATH
}

async function ensureStateDir(): Promise<void> {
  await fs.mkdir(getStateDirectory(), { recursive: true })
}

async function readHeartbeat(): Promise<{ lastOkAt: string } | null> {
  const filePath = path.join(getStateDirectory(), HEARTBEAT_FILE)
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return JSON.parse(raw) as { lastOkAt: string }
  } catch {
    return null
  }
}

export async function updateHeartbeat(lastOkAt = new Date().toISOString()): Promise<void> {
  await ensureStateDir()
  const filePath = path.join(getStateDirectory(), HEARTBEAT_FILE)
  await fs.writeFile(filePath, JSON.stringify({ lastOkAt }, null, 2), "utf8")
}

function isHeartbeatRequired(): boolean {
  return String(process.env.LICENSE_HEARTBEAT_REQUIRED || "false").toLowerCase() === "true"
}

function heartbeatGraceDays(): number {
  const raw = Number(process.env.LICENSE_HEARTBEAT_GRACE_DAYS || 7)
  return Number.isFinite(raw) && raw > 0 ? raw : 7
}

export async function resolveLicenseStatus(overrideLicenseKey?: string): Promise<LicenseStatus> {
  const mode = getDeploymentMode()
  const provider = getAiProvider()

  if (mode !== "onprem") {
    return {
      mode,
      valid: true,
      reason: "Validated by SaaS auth and subscription provider",
      readOnly: false,
      aiEnabled: true,
      daysRemaining: null,
      seats: null,
      capabilities: [],
      customer: null,
      product: "Buildsync SaaS",
      expiresAt: null,
      provider,
      source: "saas-auth",
      licenseHash: null,
    }
  }

  const licenseKey = overrideLicenseKey || getLicenseKey()
  if (!licenseKey) {
    return {
      mode,
      valid: false,
      reason: "Missing LICENSE_KEY",
      readOnly: true,
      aiEnabled: false,
      daysRemaining: null,
      seats: null,
      capabilities: [],
      customer: null,
      product: null,
      expiresAt: null,
      provider,
      source: "signed-license",
      licenseHash: null,
    }
  }

  const claims = await verifySignedLicense(licenseKey)
  if (!claims) {
    return {
      mode,
      valid: false,
      reason: "Invalid license signature",
      readOnly: true,
      aiEnabled: false,
      daysRemaining: null,
      seats: null,
      capabilities: [],
      customer: null,
      product: null,
      expiresAt: null,
      provider,
      source: "signed-license",
      licenseHash: hashLicenseKey(licenseKey),
    }
  }

  const daysRemaining = calculateDaysRemaining(claims.expires_at)
  if (daysRemaining < 0) {
    return {
      mode,
      valid: false,
      reason: "License expired; running in read-only mode",
      readOnly: true,
      aiEnabled: false,
      daysRemaining,
      seats: claims.seats,
      capabilities: claims.capabilities,
      customer: claims.customer,
      product: claims.product,
      expiresAt: claims.expires_at,
      provider,
      source: "signed-license",
      licenseHash: hashLicenseKey(licenseKey),
    }
  }

  let heartbeatHealthy = true
  if (isHeartbeatRequired()) {
    const heartbeat = await readHeartbeat()
    if (!heartbeat) {
      heartbeatHealthy = false
    } else {
      const elapsedDays = Math.floor((Date.now() - new Date(heartbeat.lastOkAt).getTime()) / (1000 * 60 * 60 * 24))
      heartbeatHealthy = elapsedDays <= heartbeatGraceDays()
    }
  }

  if (!heartbeatHealthy) {
    return {
      mode,
      valid: true,
      reason: "Heartbeat stale; running in degraded read-only mode",
      readOnly: true,
      aiEnabled: false,
      daysRemaining,
      seats: claims.seats,
      capabilities: claims.capabilities,
      customer: claims.customer,
      product: claims.product,
      expiresAt: claims.expires_at,
      provider,
      source: "signed-license",
      licenseHash: hashLicenseKey(licenseKey),
    }
  }

  return {
    mode,
    valid: true,
    reason: "License valid",
    readOnly: false,
    aiEnabled: true,
    daysRemaining,
    seats: claims.seats,
    capabilities: claims.capabilities,
    customer: claims.customer,
    product: claims.product,
    expiresAt: claims.expires_at,
    provider,
    source: "signed-license",
    licenseHash: hashLicenseKey(licenseKey),
  }
}

export async function tryLicenseHeartbeat(): Promise<{ ok: boolean; message: string }> {
  const heartbeatUrl = process.env.LICENSE_HEARTBEAT_URL
  if (!heartbeatUrl) {
    return { ok: false, message: "LICENSE_HEARTBEAT_URL not configured" }
  }

  const licenseKey = getLicenseKey()
  if (!licenseKey) {
    return { ok: false, message: "Missing LICENSE_KEY" }
  }

  try {
    const status = await resolveLicenseStatus()
    const response = await fetch(heartbeatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseHash: status.licenseHash,
        customer: status.customer,
        product: status.product,
        checkedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return { ok: false, message: `Heartbeat failed: ${response.status}` }
    }

    await updateHeartbeat()
    return { ok: true, message: "Heartbeat successful" }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Heartbeat failed" }
  }
}

export function getLicenseHeader(status: LicenseStatus) {
  return {
    type: status.mode === "onprem" ? "Enterprise On-Prem" : "SaaS",
    version: process.env.VERSION || "2026.4.2",
    dataSovereignty: status.mode === "onprem" ? "Local-Only (No Cloud Sync)" : "Managed Cloud",
    expiry: status.expiresAt,
  }
}
