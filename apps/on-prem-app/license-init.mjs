#!/usr/bin/env node
import { createVerify } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const mode = String(process.env.APP_MODE || "").toLowerCase()
if (mode !== "on-prem" && mode !== "onprem") {
  console.log("[license-init] Non on-prem mode detected, skipping signed license validation")
  process.exit(0)
}

const licenseKey = process.env.LICENSE_KEY
if (!licenseKey) {
  console.error("[license-init] Missing LICENSE_KEY")
  process.exit(1)
}

const keyPath = process.env.LICENSE_PUBLIC_KEY_PATH || "/app/config/license_public.pem"
let publicKey
try {
  publicKey = process.env.LICENSE_PUBLIC_KEY || (await fs.readFile(keyPath, "utf8"))
} catch {
  console.error("[license-init] Missing public key (LICENSE_PUBLIC_KEY or LICENSE_PUBLIC_KEY_PATH)")
  process.exit(1)
}

const [payloadB64, signatureB64] = licenseKey.split(".")
if (!payloadB64 || !signatureB64) {
  console.error("[license-init] Invalid license format; expected payload.signature")
  process.exit(1)
}

const toBuffer = (value) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4)
  return Buffer.from(`${padded}${"=".repeat(padLength)}`, "base64")
}

const verifier = createVerify("RSA-SHA256")
verifier.update(payloadB64)
verifier.end()

if (!verifier.verify(publicKey, toBuffer(signatureB64))) {
  console.error("[license-init] License signature verification failed")
  process.exit(1)
}

let claims
try {
  claims = JSON.parse(toBuffer(payloadB64).toString("utf8"))
} catch {
  console.error("[license-init] License payload is not valid JSON")
  process.exit(1)
}

const expiry = Date.parse(claims.expires_at || "")
if (!Number.isFinite(expiry) || expiry < Date.now()) {
  console.error("[license-init] License expired")
  process.exit(1)
}

const statePath = process.env.LICENSE_STATE_PATH || "/var/lib/buildsync/license-state"
await fs.mkdir(statePath, { recursive: true })
const initRecord = {
  validatedAt: new Date().toISOString(),
  product: claims.product,
  customer: claims.customer,
  seats: claims.seats,
  expires_at: claims.expires_at,
  capabilities: claims.capabilities || [],
}
await fs.writeFile(path.join(statePath, "init-validation.json"), JSON.stringify(initRecord, null, 2), "utf8")

console.log(`[license-init] License validated for ${claims.customer}`)
process.exit(0)
