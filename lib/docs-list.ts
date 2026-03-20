import fs from 'fs';
import path from 'path';

export function getDocsList() {
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) return [];
  const files = fs.readdirSync(docsDir);
  return files.filter((f) => f.endsWith('.md')).map((f) => ({
    slug: f.replace(/\.md$/, ''),
    title: f.replace(/-/g, ' ').replace(/\.md$/, '').replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}
