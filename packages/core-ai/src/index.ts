export type AiMode = "cloud" | "local";

export function resolveAiMode(value?: string): AiMode {
  return value === "local" ? "local" : "cloud";
}

export function isLocalAiMode(value?: string): boolean {
  return resolveAiMode(value) === "local";
}
