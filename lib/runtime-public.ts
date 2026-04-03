export type DeploymentMode = "saas" | "onprem" | "hybrid"
export type AiMode = "cloud" | "local"
export type AiProvider = "ollama" | "anthropic" | "openai"

function normalizeDeploymentMode(value?: string): DeploymentMode {
  const normalized = (value || "").toLowerCase()
  if (normalized === "on-prem" || normalized === "onprem") {
    return "onprem"
  }
  if (normalized === "hybrid" || normalized === "saas") {
    return normalized
  }
  return "saas"
}

function normalizeAiMode(value?: string): AiMode {
  return (value || "").toLowerCase() === "local" ? "local" : "cloud"
}

function normalizeAiProvider(value?: string): AiProvider {
  const normalized = (value || "").toLowerCase()
  if (normalized === "ollama" || normalized === "anthropic" || normalized === "openai") {
    return normalized
  }
  return "openai"
}

export function getDeploymentMode(): DeploymentMode {
  return normalizeDeploymentMode(
    process.env.NEXT_PUBLIC_APP_MODE ||
      process.env.APP_MODE ||
      process.env.NEXT_PUBLIC_DEPLOYMENT_MODE,
  )
}

export function getAiMode(): AiMode {
  const explicitMode = process.env.NEXT_PUBLIC_AI_MODE || process.env.AI_MODE
  if (explicitMode) {
    return normalizeAiMode(explicitMode)
  }

  const provider = getAiProvider()
  return provider === "ollama" ? "local" : "cloud"
}

export function getAiProvider(): AiProvider {
  return normalizeAiProvider(process.env.NEXT_PUBLIC_AI_PROVIDER || process.env.AI_PROVIDER)
}

export function getDefaultLlmEndpoint(): string {
  return (
    process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ||
    process.env.NEXT_PUBLIC_LLM_ENDPOINT ||
    "http://localhost:11434"
  )
}

export function isOnPremRuntime(): boolean {
  return getDeploymentMode() === "onprem"
}

export function getLocalStoragePath(): string {
  return process.env.NEXT_PUBLIC_LOCAL_STORAGE_PATH || process.env.LOCAL_STORAGE_PATH || "/data/properties"
}
