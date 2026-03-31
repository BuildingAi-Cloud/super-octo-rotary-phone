"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWebLLM, AVAILABLE_MODELS } from "@/components/ai-chat/use-webllm";
import type { ModelId } from "@/components/ai-chat/use-webllm";

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messageCount: number;
}

export default function AIChatPage() {
  const { state, sendMessage, abort, clearMessages, setModel } = useWebLLM();
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "1", title: "New Conversation", createdAt: new Date(), messageCount: 0 },
  ]);
  const [activeId] = useState("1");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Update sidebar conversation title from first user message
  useEffect(() => {
    const userMsgs = state.messages.filter((m) => m.role === "user");
    if (userMsgs.length === 1) {
      const raw = userMsgs[0].content;
      const title = raw.slice(0, 40) + (raw.length > 40 ? "…" : "");
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, title, messageCount: state.messages.length } : c))
      );
    } else if (state.messages.length > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messageCount: state.messages.length } : c))
      );
    }
  }, [state.messages, activeId]);

  const handleNewChat = useCallback(() => {
    const id = crypto.randomUUID();
    setConversations((prev) => [
      { id, title: "New Conversation", createdAt: new Date(), messageCount: 0 },
      ...prev,
    ]);
    clearMessages();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [clearMessages]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || state.isGenerating || state.isLoading) return;
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await sendMessage(text);
    },
    [input, state.isGenerating, state.isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header — matches DashboardHeader layout */}
      <header className="shrink-0 border-b border-border/30 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            <span className="font-[var(--font-bebas)] text-xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
            <span className="hidden md:block h-4 w-px bg-border" />
            <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              AI Chat
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-border flex flex-col bg-background">
          {/* Branding */}
          <div className="px-4 py-4 border-b border-border/50">
            <div className="flex items-center gap-2.5 mb-1">
              <svg
                className="w-5 h-5 text-accent shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
              <span className="font-mono text-xs font-semibold text-foreground">WebLLM Chat</span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">AI Models Running in Browser</p>
          </div>

          {/* Model selector */}
          <div className="px-4 py-3 border-b border-border/50">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1.5">
              Model
            </label>
            <select
              value={state.selectedModel}
              onChange={(e) => setModel(e.target.value as ModelId)}
              disabled={state.isLoading || state.isGenerating}
              className="w-full bg-background border border-border text-foreground font-mono text-xs px-2 py-1.5 focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* New chat */}
          <div className="px-4 py-3 border-b border-border/50">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent border border-border hover:border-accent px-3 py-2 transition-all"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`px-4 py-3 border-b border-border/20 transition-colors ${
                  conv.id === activeId ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-muted/20"
                }`}
              >
                <p className="font-mono text-xs text-foreground truncate">{conv.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {conv.messageCount} messages · {conv.createdAt.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border/50 shrink-0">
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              Runs locally in your browser.
              <br />
              No data leaves your device.
            </p>
          </div>
        </aside>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="shrink-0 border-b border-border/50 px-6 py-3 flex items-center justify-between bg-background">
            <div>
              <p className="font-mono text-xs text-foreground font-semibold">
                {activeConv?.title ?? "New Conversation"}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {state.messages.length} messages
              </p>
            </div>
            {state.messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* WebGPU warning banner */}
          {state.webgpuSupported === false && (
            <div className="shrink-0 mx-6 mt-4 border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
                ⚠ WebGPU Not Available
              </p>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mb-2">
                This AI runs entirely in your browser using WebGPU. Your current setup does not support it.
              </p>
              <ul className="font-mono text-[10px] text-muted-foreground space-y-1">
                <li>→ Use <strong>Chrome 113+</strong> or <strong>Edge 113+</strong></li>
                <li>→ On Linux: launch Chrome with <code className="bg-muted px-1">--enable-features=Vulkan</code></li>
                <li>→ Enable flag: <code className="bg-muted px-1">chrome://flags/#enable-unsafe-webgpu</code></li>
                <li>
                  → Check status:{" "}
                  <a
                    href="https://webgpureport.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-accent"
                  >
                    webgpureport.org
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Empty state */}
            {state.messages.length === 0 && !state.isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                <div className="w-16 h-16 border border-border flex items-center justify-center">
                  {state.webgpuSupported === false ? (
                    <svg
                      className="w-8 h-8 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                      />
                    </svg>
                  )}
                </div>
                <div className="max-w-md">
                  <p className="font-[var(--font-bebas)] text-3xl tracking-wider text-foreground mb-2">
                    BuildSync AI Assistant
                  </p>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                    {state.webgpuSupported === false
                      ? "WebGPU is required to run AI models in your browser. See the warning above to enable it."
                      : "Ask me anything about facility management, building operations, or our platform. Select a model from the sidebar and send your first message."}
                  </p>
                  {state.webgpuSupported === true && (
                    <p className="font-mono text-[10px] text-muted-foreground/50 mt-3 border border-dashed border-border px-3 py-2">
                      First message will download the model (~1–2 GB depending on your selection)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Model loading progress (before first message) */}
            {state.isLoading && state.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">Loading model…</span>
                    <span className="font-mono text-xs text-accent">{state.loadProgressPct}%</span>
                  </div>
                  <div className="w-full h-1 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${state.loadProgressPct}%` }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2 truncate">{state.loadProgress}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            {state.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 px-1">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                  <div
                    className={`px-4 py-3 border font-mono text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === "user"
                        ? "bg-accent/10 border-accent/30 text-foreground"
                        : msg.isError
                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : "bg-muted/20 border-border text-foreground"
                    }`}
                  >
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {state.isGenerating && !state.messages.some((m) => m.isStreaming) && (
              <div className="flex justify-start">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1 px-1">
                    AI
                  </span>
                  <div className="bg-muted/20 border border-border px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-border bg-background px-6 py-4">
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                disabled={state.isGenerating || state.webgpuSupported === false}
                placeholder={
                  state.webgpuSupported === false
                    ? "WebGPU is required — see the warning above"
                    : "Enter to send, Shift + Enter to wrap, / to search prompts, : to use commands"
                }
                rows={1}
                className="flex-1 bg-muted/10 border border-border text-foreground font-mono text-sm px-4 py-3 resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: "48px", maxHeight: "128px" }}
              />
              {state.isGenerating ? (
                <button
                  type="button"
                  onClick={abort}
                  className="shrink-0 border border-destructive text-destructive font-mono text-xs px-5 py-3 uppercase tracking-widest hover:bg-destructive hover:text-white transition-all"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || state.isLoading || state.webgpuSupported === false}
                  className="shrink-0 border border-accent bg-accent/10 text-accent font-mono text-xs px-5 py-3 uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              )}
            </form>
            <p className="font-mono text-[10px] text-muted-foreground/50 mt-2 text-center">
              Model runs in your browser. No data leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
