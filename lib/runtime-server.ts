import "server-only"

import { getAiProvider, getDeploymentMode, type AiProvider } from "@/lib/runtime-public"

export interface SupabaseServerConfig {
  url: string
  key: string
}

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const mode = getDeploymentMode()
  if (mode === "onprem") {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return null
  }

  return { url, key }
}

export function getDatabaseUrl(): string | null {
  return process.env.DB_URL || process.env.DATABASE_URL || null
}

export function getLicenseKey(): string | null {
  return process.env.LICENSE_KEY || null
}

export interface AiProviderConfig {
  provider: AiProvider
  ollamaBaseUrl: string
  anthropicApiKey: string | null
  openaiApiKey: string | null
}

export function getAiProviderConfig(): AiProviderConfig {
  return {
    provider: getAiProvider(),
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://host.docker.internal:11434",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    openaiApiKey: process.env.OPENAI_API_KEY || null,
  }
}

export function shouldUseCloudBackends(): boolean {
  return getDeploymentMode() !== "onprem"
}
