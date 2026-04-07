"use client";

import { useEffect, useRef, useState } from "react";
import { useWebLLM, AVAILABLE_MODELS } from "./use-webllm";
import type { ModelId } from "./use-webllm";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const { state, sendMessage, abort, clearMessages, setModel } = useWebLLM();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || state.isGenerating) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value as ModelId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-[420px] bg-background border-l border-border shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
              AI Chat
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Powered by WebLLM · Runs locally in your browser
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded border border-transparent hover:border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close AI Chat"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Model selector */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/50 bg-muted/10 shrink-0">
          <label htmlFor="ai-model-select" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Model
          </label>
          <select
            id="ai-model-select"
            value={state.selectedModel}
            onChange={handleModelChange}
            disabled={state.isLoading || state.isGenerating}
            className="flex-1 bg-background border border-border text-foreground font-mono text-xs px-2 py-1 rounded-none focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {state.messages.length > 0 && (
            <button
              onClick={clearMessages}
              disabled={state.isGenerating}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>

        {/* WebGPU not supported banner */}
        {!state.webgpuSupported && (
          <div className="shrink-0 mx-5 mt-4 border border-amber-500/40 bg-amber-500/10 px-4 py-3">
            <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
              ⚠ WebGPU Not Detected
            </p>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mb-2">
              This AI runs directly in your browser using WebGPU. Your current browser or system doesn&apos;t appear to support it.
            </p>
            <ul className="font-mono text-[10px] text-muted-foreground space-y-1 list-none mb-2">
              <li>→ Use <strong>Chrome 113+</strong> or <strong>Edge 113+</strong></li>
              <li>→ On Linux: launch Chrome with <code className="bg-muted px-1">--enable-features=Vulkan</code></li>
              <li>→ Check <a href="https://webgpureport.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">webgpureport.org</a> for your browser status</li>
            </ul>
            <p className="font-mono text-[10px] text-muted-foreground/60">
              You can still try sending a message — some browsers report false negatives.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {state.messages.length === 0 && !state.isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
              <div className="w-12 h-12 rounded border border-border flex items-center justify-center text-xl">
                {state.webgpuSupported ? "🤖" : "⚠️"}
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-accent mb-1">
                  BuildSync AI Assistant
                </p>
                {state.webgpuSupported ? (
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-xs">
                    Ask me anything about facility management, building operations, or our platform.
                    The model runs entirely in your browser — no data is sent to any server.
                  </p>
                ) : (
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-xs">
                    WebGPU is required to run AI models locally. See the banner above for setup instructions.
                  </p>
                )}
              </div>
              {state.webgpuSupported && (
                <div className="text-[10px] font-mono text-muted-foreground/60 border border-dashed border-border px-3 py-2">
                  First message will download the model (~1–2 GB)
                </div>
              )}
            </div>
          )}

          {state.isLoading && state.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-muted-foreground">Loading model...</span>
                  <span className="font-mono text-[10px] text-accent">{state.loadProgressPct}%</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300 rounded-full"
                    style={{ width: `${state.loadProgressPct}%` }}
                  />
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-2 truncate" title={state.loadProgress}>
                  {state.loadProgress || "Initializing..."}
                </p>
              </div>
            </div>
          )}

          {state.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">
                {msg.role === "user" ? "You" : "AI"}
              </span>
              <div
                className={`max-w-[90%] px-4 py-3 border font-mono text-xs leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user"
                    ? "bg-accent/10 border-accent/30 text-foreground"
                    : msg.isError
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-muted/20 border-border text-foreground"
                }`}
              >
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3 bg-accent ml-1 animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator in message list when isLoading and messages exist */}
          {state.isLoading && state.messages.length > 0 && (
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1">AI</span>
              <div className="bg-muted/20 border border-border px-4 py-3 max-w-[90%]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">Loading model</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block w-1 h-1 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
                {state.loadProgressPct > 0 && (
                  <div className="mt-2 w-48 h-0.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${state.loadProgressPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border px-5 py-4 bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={state.isGenerating}
                placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full bg-muted/10 border border-border text-foreground font-mono text-xs px-3 py-2.5 resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
                style={{ height: "auto", minHeight: "40px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
            </div>
            {state.isGenerating ? (
              <button
                type="button"
                onClick={abort}
                className="shrink-0 border border-destructive text-destructive font-mono text-xs px-3 py-2.5 uppercase tracking-widest hover:bg-destructive hover:text-white transition-all"
                aria-label="Stop generation"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || state.isLoading}
                className="shrink-0 border border-accent bg-accent/10 text-accent font-mono text-xs px-3 py-2.5 uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                Send
              </button>
            )}
          </form>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-2">
            Model runs in your browser. No data leaves your device.
          </p>
        </div>
      </div>
    </>
  );
}
