#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath))
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8")
}

function check(name, ok, details = "") {
  const prefix = ok ? "PASS" : "FAIL"
  console.log(`${prefix} ${name}${details ? ` - ${details}` : ""}`)
  return ok
}

let failed = 0

const nextConfigRaw = exists("next.config.mjs") ? read("next.config.mjs") : ""
if (!check("next.config.mjs exists", Boolean(nextConfigRaw))) failed += 1

if (nextConfigRaw) {
  const ignoreBuildErrors = /ignoreBuildErrors\s*:\s*true/.test(nextConfigRaw)
  if (!check("TypeScript build errors not ignored", !ignoreBuildErrors, ignoreBuildErrors ? "Set ignoreBuildErrors to false for release" : "")) failed += 1
}

const capConfigRaw = exists("capacitor.config.ts") ? read("capacitor.config.ts") : ""
if (!check("capacitor.config.ts exists", Boolean(capConfigRaw))) failed += 1

if (capConfigRaw) {
  const hasWebDirPublic = /webDir\s*:\s*['"]public['"]/.test(capConfigRaw)
  if (!check("Capacitor webDir reviewed", !hasWebDirPublic, hasWebDirPublic ? "webDir=public may not match production web artifact strategy" : "")) failed += 1
}

if (!check("Android project present", exists("android"))) failed += 1
if (!check("iOS project present", exists("ios"))) failed += 1

const requiredEnv = [
  "SENDGRID_API_KEY|SMTP_HOST+SMTP_PORT+SMTP_USER+SMTP_PASS",
  "MAIL_FROM",
  "AI_MODE",
  "AI_PROVIDER",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]

console.log("INFO Required production env keys:")
for (const key of requiredEnv) {
  console.log(`INFO  - ${key}`)
}

const hasSmtpHealthEndpoint = exists("app/api/system/smtp-health/route.ts")
if (!check("SMTP health endpoint present", hasSmtpHealthEndpoint)) failed += 1

const hasReleaseRunbook = exists("docs/release-readiness-checklist.md")
if (!check("Release runbook present", hasReleaseRunbook)) failed += 1

const hasMobileRunbook = exists("docs/mobile-publish-runbook.md")
if (!check("Mobile publish runbook present", hasMobileRunbook)) failed += 1

if (failed > 0) {
  console.log(`\nFAIL Release readiness check failed with ${failed} issue(s).`)
  process.exit(1)
}

console.log("\nPASS Release readiness baseline checks passed.")
