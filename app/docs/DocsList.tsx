"use client"
import { useState } from 'react';
import Link from 'next/link';

interface DocItem {
  slug: string;
  title: string;
}

export default function DocsList({ docs }: { docs: DocItem[] }) {
  const [search, setSearch] = useState('');
  const filtered = docs.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.slug.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      <input
        className="w-full border rounded px-3 py-2 mb-6"
        placeholder="Search documentation..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search documentation"
      />
      <ul>
        {filtered.map((doc) => (
          <li key={doc.slug} className="mb-3">
            <Link href={`/docs/${doc.slug}`}
              className="text-blue-600 hover:underline text-lg">
              {doc.title}
            </Link>
          </li>
        ))}
        {filtered.length === 0 && <li>No documentation found.</li>}
      </ul>
    </main>
  );
}