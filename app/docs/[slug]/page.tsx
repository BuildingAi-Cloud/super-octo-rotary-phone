import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";
import { marked } from "marked";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { markdownDocs } from "@/docs/docs-index";

type DocPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return markdownDocs.map((doc) => ({ slug: doc.slug }));
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "docs", `${slug}.md`);
  const currentDocIndex = markdownDocs.findIndex((doc) => doc.slug === slug);
  const currentDoc = markdownDocs[currentDocIndex];

  if (!currentDoc) {
    return notFound();
  }

  let file;
  try {
    file = await fs.readFile(filePath, "utf8");
  } catch {
    return notFound();
  }

  const { content, data } = matter(file);
  const html = await marked.parse(content);
  const previousDoc = currentDocIndex > 0 ? markdownDocs[currentDocIndex - 1] : null;
  const nextDoc = currentDocIndex < markdownDocs.length - 1 ? markdownDocs[currentDocIndex + 1] : null;

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
      <div className="mb-6">
        <BackButton fallbackHref="/docs" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 h-fit border border-border/30 bg-card/20 rounded-xl p-4 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Documentation</p>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide">Browse Guides</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Move between related setup, operations, and reference articles without leaving the docs flow.
            </p>
          </div>

          <nav className="space-y-2">
            {markdownDocs.map((doc) => {
              const isActive = doc.slug === slug;
              return (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className={`block rounded-lg border px-3 py-3 transition-colors ${
                    isActive
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border/20 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                  }`}
                >
                  <p className="text-sm font-medium">{doc.title}</p>
                  <p className="mt-1 text-xs leading-relaxed opacity-80">{doc.summary}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="border border-border/30 bg-card/20 rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              <Link href="/docs" className="hover:text-accent transition-colors">
                Docs Hub
              </Link>
              <span>/</span>
              <span>{currentDoc.category}</span>
            </div>

            <header className="mt-5 border-b border-border/20 pb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-3">{currentDoc.category}</p>
              <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
                {data.title || currentDoc.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
                {currentDoc.summary}
              </p>
            </header>

            <article className="prose prose-sm md:prose-base max-w-none mt-8" dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="border border-border/30 bg-card/20 rounded-xl p-5 min-h-[140px] flex flex-col justify-between">
              {previousDoc ? (
                <>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Previous</p>
                    <p className="text-lg font-semibold">{previousDoc.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{previousDoc.summary}</p>
                  </div>
                  <Link href={`/docs/${previousDoc.slug}`} className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                    Open previous article
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Previous</p>
                    <p className="text-lg font-semibold">Documentation hub</p>
                    <p className="mt-2 text-sm text-muted-foreground">Return to the hub to browse all guides and quick operational references.</p>
                  </div>
                  <Link href="/docs" className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                    Open docs hub
                  </Link>
                </>
              )}
            </div>

            <div className="border border-border/30 bg-card/20 rounded-xl p-5 min-h-[140px] flex flex-col justify-between">
              {nextDoc ? (
                <>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Next</p>
                    <p className="text-lg font-semibold">{nextDoc.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{nextDoc.summary}</p>
                  </div>
                  <Link href={`/docs/${nextDoc.slug}`} className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                    Open next article
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Next</p>
                    <p className="text-lg font-semibold">Documentation hub</p>
                    <p className="mt-2 text-sm text-muted-foreground">You have reached the end of the long-form guide sequence.</p>
                  </div>
                  <Link href="/docs" className="mt-4 inline-flex items-center text-sm text-accent hover:underline">
                    Browse all documentation
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
