import fs from 'fs';
import path from 'path';
import { useState } from 'react';
import Link from 'next/link';

// Helper to get all markdown files in /docs
function getDocsList() {
	const docsDir = path.join(process.cwd(), 'docs');
	const files = fs.readdirSync(docsDir);
	return files.filter((f) => f.endsWith('.md')).map((f) => ({
		slug: f.replace(/\.md$/, ''),
		title: f.replace(/-/g, ' ').replace(/\.md$/, '').replace(/\b\w/g, (c) => c.toUpperCase()),
	}));
}

export default function DocsPage() {
	const [search, setSearch] = useState('');
	const docs = getDocsList();
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