
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import docsIndex, { inlineDocs, markdownDocs } from "@/docs/docs-index";
import { BackButton } from "@/components/back-button";

export default function DocsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return docsIndex;
    return docsIndex.filter((doc) =>
      doc.title.toLowerCase().includes(normalized) ||
      doc.summary.toLowerCase().includes(normalized) ||
      doc.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)),
    );
  }, [query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <main id="top" className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
      <div className="mb-6">
        <BackButton fallbackHref="/documentation" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit border border-border/30 bg-card/20 rounded-xl p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Documentation Hub</p>
          <nav className="space-y-2">
            {Object.keys(grouped).map((group) => (
              <a key={group} href={`#group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block text-sm text-muted-foreground hover:text-accent transition-colors">
                {group}
              </a>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-border/20 space-y-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            <p>{inlineDocs.length} inline guides</p>
            <p>{markdownDocs.length} long-form articles</p>
          </div>
        </aside>

        <section className="space-y-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">Documentation</p>
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight">Easy-to-Navigate Docs</h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Start with setup guides, jump into role-specific workflows, or open detailed articles. The hub groups the docs by purpose so users can find the right material quickly.
            </p>
          </div>

          <div className="border border-border/30 bg-card/20 rounded-xl p-4">
            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Search documentation</label>
            <input
              type="text"
              placeholder="Try: onboarding, hierarchy, API, security"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-border/40 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/60"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="border border-border/30 bg-card/20 rounded-xl p-8 text-center">
              <p className="font-mono text-sm text-muted-foreground">No documentation matches that search.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <section key={group} id={`group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-wide">{group}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{items.length} articles</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((doc) => (
                    <article key={doc.slug} className="border border-border/30 bg-card/20 rounded-xl p-5 flex flex-col gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            {doc.kind === "page" ? "Article" : "Guide"}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                            {doc.kind === "page" ? "/docs" : "Hub"}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{doc.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{doc.summary}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {doc.keywords.slice(0, 3).map((keyword) => (
                          <span key={keyword} className="px-2 py-1 border border-border/30 rounded-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto">
                        {doc.kind === "page" ? (
                          <Link href={`/docs/${doc.slug}`} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                            Open article
                          </Link>
                        ) : (
                          <a href={`#article-${doc.slug}`} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                            Jump to guide
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}

          <section className="pt-4 border-t border-border/20 space-y-6">
            <div>
              <h2 className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-wide">Quick Guides</h2>
              <p className="mt-2 text-sm text-muted-foreground">Short operational references available directly from the hub.</p>
            </div>

            <div className="space-y-6">
              {inlineDocs
                .filter((doc) => filtered.some((entry) => entry.slug === doc.slug))
                .map((doc) => (
                  <article key={doc.slug} id={`article-${doc.slug}`} className="border border-border/30 bg-card/20 rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{doc.category}</p>
                        <h3 className="text-xl font-semibold text-foreground">{doc.title}</h3>
                      </div>
                      <a href="#top" className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent hover:underline">Top</a>
                    </div>
                    <div className="prose prose-sm max-w-none mt-4" dangerouslySetInnerHTML={{ __html: doc.html }} />
                  </article>
                ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}