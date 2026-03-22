import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export default async function DocPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'docs', `${params.slug}.md`);
  let file;
  try {
    file = await fs.readFile(filePath, 'utf8');
  } catch {
    return notFound();
  }
  const { content, data } = matter(file);
  const html = marked(content);
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{data.title || params.slug.replace(/-/g, ' ')}</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
