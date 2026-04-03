
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { SearchIcon, XIcon, ArrowRight } from "lucide-react"
import { ScaleIn } from "@/components/animations/ScaleIn"
import docsIndex from "@/docs/docs-index"

const NAV_ITEMS = [
  { label: "Home", href: "/", description: "Landing page", category: "Navigation", keywords: ["home", "hero", "landing"] },
  { label: "Features", href: "/features", description: "Product capabilities", category: "Navigation", keywords: ["features", "modules"] },
  { label: "Documentation", href: "/documentation", description: "Guides and product docs", category: "Docs", keywords: ["docs", "help", "guides"] },
  { label: "Docs Hub", href: "/docs", description: "Central hub for guides, articles, and quick references", category: "Docs", keywords: ["docs", "guides", "articles", "hub"] },
  { label: "API Reference", href: "/api-reference", description: "API endpoints and specs", category: "Docs", keywords: ["api", "reference", "endpoints"] },
  { label: "API Access", href: "/api-access", description: "Manage API products and keys", category: "Developer", keywords: ["api", "keys", "integration"] },
  { label: "Privacy Policy", href: "/privacy-policy", description: "Privacy and policy details", category: "Legal", keywords: ["privacy", "policy", "compliance"] },
  { label: "Support", href: "/support", description: "Get support", category: "Help", keywords: ["support", "help", "contact"] },
  { label: "About", href: "/about", description: "About BuildSync", category: "Company", keywords: ["about", "company"] },
  { label: "Dashboard", href: "/dashboard", description: "Main operations dashboard", category: "App", keywords: ["dashboard", "kpi", "overview"] },
  { label: "Settings", href: "/settings", description: "Personal and system settings", category: "App", keywords: ["settings", "preferences"] },
  { label: "Audit Log", href: "/audit-log", description: "Security and governance logs", category: "App", keywords: ["audit", "log", "security"] },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const shortcutHint = isMac ? "⌘K" : "Ctrl+K"

  const docItems = useMemo(() => {
    return docsIndex.map((doc) => ({
      label: doc.title,
      href: doc.kind === "page" ? `/docs/${doc.slug}` : `/docs#article-${doc.slug}`,
      description: doc.summary,
      category: doc.kind === "page" ? "Documentation Articles" : "Documentation Guides",
      keywords: doc.keywords,
    }))
  }, [])

  const searchItems = useMemo(() => {
    const seen = new Set<string>()
    return [...NAV_ITEMS, ...docItems].filter((item) => {
      const key = `${item.label}:${item.href}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [docItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const scored = searchItems
      .map((item) => {
        const label = item.label.toLowerCase()
        const desc = item.description.toLowerCase()
        const keywords = item.keywords.join(" ").toLowerCase()

        let score = 0
        if (label === q) score += 120
        if (label.startsWith(q)) score += 80
        if (label.includes(q)) score += 50
        if (keywords.includes(q)) score += 30
        if (desc.includes(q)) score += 20

        return { item, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)

    return scored.map((entry) => entry.item)
  }, [query, searchItems])

  // Group filtered results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof searchItems> = {}
    filtered.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filtered])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    if (!open) {
      setQuery("")
    }
  }, [open])

  const handleNavigate = (href: string) => {
    setOpen(false)
    if (typeof window !== "undefined") {
      window.location.assign(href)
    }
  }

  return (
    <>
      <ScaleIn>
        <button
          aria-label={`Open search (${shortcutHint})`}
          aria-expanded={open}
          className="ml-2 inline-flex items-center gap-2 rounded-md border border-border/40 px-2.5 py-1.5 hover:border-accent/40 hover:bg-accent/10 transition-colors"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="w-4 h-4" />
          <span className="hidden md:inline text-xs text-muted-foreground">Search</span>
          <kbd className="hidden md:inline rounded border border-border/40 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{shortcutHint}</kbd>
          <span className="sr-only">{`Open search (${shortcutHint})`}</span>
        </button>
      </ScaleIn>

      {open && (
        <>
          {/* Blurred backdrop — page shows through, blurred + dimmed */}
          <div
            className="fixed inset-0 z-[99] backdrop-blur-md bg-background/60 animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Search panel — sits above backdrop, fully crisp */}
          <div className="fixed inset-x-0 top-0 z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-w-3xl mx-auto px-4 pt-8">
              {/* Input box */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background shadow-2xl px-5 py-4">
                <SearchIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, docs, features..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline rounded border border-border/50 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground flex-shrink-0">Esc</kbd>
                )}
              </div>

              {/* Results panel */}
              <div className="mt-2 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
                {/* Empty state */}
                {query.trim() === "" && (
                  <div className="p-5 space-y-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Popular pages</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchItems.slice(0, 8).map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => handleNavigate(item.href)}
                          className="text-left rounded-lg px-3 py-3 hover:bg-accent/8 transition-colors group"
                        >
                          <p className="text-sm font-medium group-hover:text-accent">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-3">
                      Press <kbd className="inline rounded bg-muted px-1.5 py-0.5 font-mono">{shortcutHint}</kbd> or <kbd className="inline rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to close
                    </p>
                  </div>
                )}

                {/* Search results grouped */}
                {query.trim() !== "" && filtered.length > 0 && (
                  <div className="p-3 space-y-4">
                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category}>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-1">{category}</p>
                        {items.map((item) => (
                          <button
                            key={item.href}
                            type="button"
                            onClick={() => handleNavigate(item.href)}
                            className="w-full text-left rounded-lg px-3 py-3 hover:bg-accent/8 transition-colors group flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium group-hover:text-accent">{item.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {query.trim() !== "" && filtered.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <p className="text-sm font-medium text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-muted-foreground mt-1">Try: dashboard, documentation, api, features</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
