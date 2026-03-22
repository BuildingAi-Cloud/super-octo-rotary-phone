
"use client";
import { useState } from "react";
import docsIndex from "@/docs/docs-index";

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const filtered = docsIndex.filter(doc =>
    doc.title.toLowerCase().includes(query.toLowerCase()) ||
    doc.keywords.some(k => k.includes(query.toLowerCase()))
  );
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Documentation</h1>
      <input
        type="text"
        placeholder="Search docs..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="input input-bordered w-full mb-6"
      />
      <div className="flex gap-8">
        <aside className="w-64">
          <ul>
            {filtered.map(doc => (
              <li key={doc.slug} className="mb-2">
                <a href={`#${doc.slug}`} className="text-accent hover:underline">{doc.title}</a>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex-1">
          {filtered.map(doc => (
            <article key={doc.slug} id={doc.slug} className="mb-12">
              <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doc.html }} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}