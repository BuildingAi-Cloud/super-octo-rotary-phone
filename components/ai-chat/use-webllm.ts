"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { WebWorkerMLCEngine, InitProgressReport } from "@mlc-ai/web-llm";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  isStreaming?: boolean;
  isError?: boolean;
}

// A selection of small, fast models suitable for a demo widget
export const AVAILABLE_MODELS = [
  { id: "Llama-3.2-1B-Instruct-q4f32_1-MLC", label: "Llama 3.2 1B (Fast)" },
  { id: "Llama-3.2-3B-Instruct-q4f32_1-MLC", label: "Llama 3.2 3B (Balanced)" },
  { id: "Phi-3.5-mini-instruct-q4f16_1-MLC", label: "Phi 3.5 Mini (Efficient)" },
  { id: "gemma-2-2b-it-q4f16_1-MLC", label: "Gemma 2 2B" },
  { id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC", label: "SmolLM2 1.7B (Tiny)" },
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];

export function checkWebGPUSupport(): { supported: boolean; reason?: string } {
  if (typeof navigator === "undefined") return { supported: false, reason: "Not a browser environment" };
  if (!("gpu" in navigator)) {
    return {
      supported: false,
      reason: "WebGPU is not available in this browser. Use Chrome 113+ or Edge 113+, and on Linux make sure GPU acceleration is enabled.",
    };
  }
  return { supported: true };
}

export interface WebLLMState {
  messages: ChatMessage[];
  isLoading: boolean;
  isGenerating: boolean;
  loadProgress: string;
  loadProgressPct: number;
  selectedModel: ModelId;
  engineReady: boolean;
  error: string | null;
  webgpuSupported: boolean | null; // null = still checking
  webgpuError: string | null;
}

export function useWebLLM() {
  const engineRef = useRef<WebWorkerMLCEngine | null>(null);
  const abortRef = useRef(false);

  const [state, setState] = useState<WebLLMState>({
    messages: [],
    isLoading: false,
    isGenerating: false,
    loadProgress: "",
    loadProgressPct: 0,
    selectedModel: AVAILABLE_MODELS[0].id,
    engineReady: false,
    error: null,
    webgpuSupported: null, // detected asynchronously below
    webgpuError: null,
  });

  // Async WebGPU detection — navigator.gpu existing is not enough, we must requestAdapter()
  useEffect(() => {
    async function detectWebGPU() {
      if (typeof navigator === "undefined" || !("gpu" in navigator)) {
        setState((prev) => ({
          ...prev,
          webgpuSupported: false,
          webgpuError: "WebGPU is not available in this browser. Use Chrome 113+ or Edge 113+.",
        }));
        return;
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (!adapter) {
          setState((prev) => ({
            ...prev,
            webgpuSupported: false,
            webgpuError:
              "No compatible GPU adapter found. On Linux, try launching Chrome with --enable-features=Vulkan or enable chrome://flags/#enable-unsafe-webgpu.",
          }));
        } else {
          setState((prev) => ({ ...prev, webgpuSupported: true, webgpuError: null }));
        }
      } catch (e) {
        setState((prev) => ({
          ...prev,
          webgpuSupported: false,
          webgpuError: e instanceof Error ? e.message : String(e),
        }));
      }
    }
    detectWebGPU();
  }, []);

  const setModel = useCallback((model: ModelId) => {
    // If model changes, we need to reload the engine
    if (engineRef.current) {
      engineRef.current.unload();
      engineRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      selectedModel: model,
      engineReady: false,
      error: null,
      messages: [],
    }));
  }, []);

  const initEngine = useCallback(async (model: ModelId): Promise<WebWorkerMLCEngine | null> => {
    const { CreateWebWorkerMLCEngine } = await import("@mlc-ai/web-llm");
    const worker = new Worker(
      new URL("./webllm-worker.ts", import.meta.url),
      { type: "module" }
    );
    const engine = await CreateWebWorkerMLCEngine(worker, model, {
      initProgressCallback: (report: InitProgressReport) => {
        const pct = Math.round((report.progress ?? 0) * 100);
        setState((prev) => ({
          ...prev,
          loadProgress: report.text,
          loadProgressPct: pct,
        }));
      },
    });
    return engine;
  }, []);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || state.isGenerating) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userInput.trim(),
    };

    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg, assistantMsg],
      isGenerating: true,
      error: null,
    }));

    abortRef.current = false;

    try {
      // Load engine if not ready
      if (!engineRef.current) {
        setState((prev) => ({ ...prev, isLoading: true, loadProgress: "Initializing model...", loadProgressPct: 0 }));
        engineRef.current = await initEngine(state.selectedModel);
        setState((prev) => ({ ...prev, isLoading: false, engineReady: true, loadProgress: "", loadProgressPct: 100 }));
      }

      const engine = engineRef.current;
      if (!engine) throw new Error("Engine failed to initialize");

      // Build the messages array for context
      const contextMessages = state.messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));
      contextMessages.push({ role: "user", content: userInput.trim() });

      // Stream the response
      const stream = await engine.chat.completions.create({
        messages: contextMessages,
        stream: true,
        stream_options: { include_usage: true },
      });

      let fullContent = "";
      for await (const chunk of stream) {
        if (abortRef.current) break;
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          fullContent += delta;
          const captured = fullContent;
          setState((prev) => ({
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: captured } : m
            ),
          }));
        }
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        messages: prev.messages.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        ),
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        error: errorMsg,
        messages: prev.messages.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Error: ${errorMsg}`, isError: true, isStreaming: false }
            : m
        ),
      }));
    }
  }, [state.isGenerating, state.selectedModel, state.messages, initEngine]);

  const abort = useCallback(() => {
    abortRef.current = true;
    engineRef.current?.interruptGenerate();
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      messages: prev.messages.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m
      ),
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [], error: null }));
  }, []);

  return { state, sendMessage, abort, clearMessages, setModel };
}
