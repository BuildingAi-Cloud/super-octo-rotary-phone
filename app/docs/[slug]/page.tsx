import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export default function DocPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'docs', `${params.slug}.md`);
  if (!fs.existsSync(filePath)) return notFound();
  const file = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(file);
  const html = marked(content);
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{data.title || params.slug.replace(/-/g, ' ')}</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
