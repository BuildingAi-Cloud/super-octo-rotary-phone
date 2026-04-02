"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getDeploymentMode } from "@/lib/runtime-public"

interface CommandCenterChromeProps {
  title: string
}

const FLOW_POINTS = [42, 40, 46, 52, 48, 55, 61, 58, 66]

function buildPath(points: number[]): string {
  if (points.length === 0) return ""
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${index * 34} ${90 - point}`)
    .join(" ")
}

export function CommandCenterChrome({ title }: CommandCenterChromeProps) {
  const [ghostOpen, setGhostOpen] = useState(false)
  const [query, setQuery] = useState("")
  const mode = getDeploymentMode()

  const sovereigntyText =
    mode === "onprem"
      ? "Processed locally on enterprise node. No property documents transmitted to cloud."
      : mode === "hybrid"
      ? "Hybrid mode active. Local document protocol remains sovereignty-scoped."
      : "SaaS mode active. Platform data is processed in managed cloud infrastructure."

  const flowPath = useMemo(() => buildPath(FLOW_POINTS), [])

  return (
    <section className="relative mb-6 md:mb-8 rounded-2xl border border-white/20 bg-black text-white overflow-hidden">
      <motion.div
        key={mode}
        initial={{ opacity: 0.35 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            mode === "onprem"
              ? "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.08), transparent 45%), linear-gradient(160deg, #070707 0%, #101010 55%, #060606 100%)"
              : mode === "hybrid"
              ? "radial-gradient(circle at 15% 40%, rgba(255,255,255,0.16), transparent 52%), radial-gradient(circle at 85% 35%, rgba(255,255,255,0.1), transparent 48%), linear-gradient(155deg, #040404 0%, #121212 60%, #090909 100%)"
              : "radial-gradient(circle at 18% 35%, rgba(255,255,255,0.12), transparent 52%), radial-gradient(circle at 82% 20%, rgba(255,255,255,0.06), transparent 44%), linear-gradient(150deg, #080808 0%, #151515 58%, #0a0a0a 100%)",
        }}
      />

      <div className="relative px-4 md:px-6 lg:px-8 py-5 md:py-7 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/60">Tier 1 · The Pulse</p>
            <h2 className="font-[var(--font-bebas)] text-3xl md:text-5xl tracking-tight leading-none mt-1">{title}</h2>
          </div>

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/35 bg-white/5 text-[10px] font-mono uppercase tracking-widest"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-70" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Secure
            </button>
            <div className="absolute right-0 mt-2 w-72 border border-white/30 bg-black/95 p-3 text-[10px] font-mono text-white/80 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {sovereigntyText}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {[
            { label: "NOI", value: "$2.84M", delta: "+4.2% q/q" },
            { label: "Occupancy", value: "96.1%", delta: "Predicted 94.8% in 30 days" },
            { label: "Critical Alerts", value: "3", delta: "2 require protocol escalation" },
          ].map((stat) => (
            <article key={stat.label} className="border border-white/25 bg-white/10 backdrop-blur-md p-4 md:p-5 rounded-xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">{stat.label}</p>
              <p className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight mt-1">{stat.value}</p>
              <p className="font-mono text-[10px] mt-2 text-white/70">{stat.delta}</p>
            </article>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 md:gap-5">
          <article className="border border-white/20 rounded-xl p-4 md:p-5 bg-white/5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/65 mb-3">Tier 2 · The Flow</p>
            <div className="h-28 md:h-32">
              <svg viewBox="0 0 280 96" className="w-full h-full">
                <path d={flowPath} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" />
                <motion.circle
                  r="3.8"
                  fill="rgba(255,255,255,1)"
                  animate={{ cx: [0, 272], cy: [50, 24] }}
                  transition={{ duration: 4.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              </svg>
            </div>
            <p className="font-mono text-[10px] text-white/72 mt-2">Predicted vacancy pressure is increasing in the northern cluster. Data indicates pre-emptive renewal protocol should start this week.</p>
          </article>

          <article className="border border-white rounded-xl p-4 md:p-5 bg-black">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/65 mb-2">Predictive Action Card</p>
            <p className="font-mono text-xs leading-relaxed text-white/90">
              Detected a 12% rise in local utility costs. A budget adjustment draft is prepared for Q3 forecast.
            </p>
            <div className="flex gap-2 mt-4">
              <button type="button" className="px-3 py-1.5 border border-white text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                Review
              </button>
              <button type="button" className="px-3 py-1.5 border border-white/35 text-[10px] font-mono uppercase tracking-widest text-white/75 hover:border-white hover:text-white transition-colors">
                Ignore
              </button>
            </div>
          </article>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60 mb-2">Tier 3 · The Deep Dive</p>
          <p className="font-mono text-[10px] text-white/65">Operational tabs and property-level datasets continue below with AI shortcuts and high-contrast controls.</p>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 inset-x-0 z-50 flex justify-center">
        <div className="pointer-events-auto">
          <AnimatePresence initial={false}>
            {ghostOpen ? (
              <motion.div
                key="ghost-open"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-[92vw] max-w-2xl border border-white/35 bg-black/95 backdrop-blur-xl p-3 rounded-xl"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ask The Architect: synthesize risk protocol for Tower B"
                    rows={1}
                    className="flex-1 bg-transparent border border-white/25 rounded-md px-3 py-2 text-xs font-mono text-white placeholder:text-white/45 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 border border-white text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setGhostOpen(false)}
                    className="px-3 py-2 border border-white/25 text-[10px] font-mono uppercase tracking-widest text-white/70"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-2 font-mono text-[10px] text-white/60">The response can expand here as a temporary data widget with direct review actions.</p>
              </motion.div>
            ) : (
              <motion.button
                key="ghost-closed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                type="button"
                onClick={() => setGhostOpen(true)}
                className="h-12 w-52 rounded-full border border-white/30 bg-white/10 backdrop-blur-xl shadow-[0_0_24px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/85">Command K</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
