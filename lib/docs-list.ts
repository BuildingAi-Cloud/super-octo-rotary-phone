import fs from 'fs/promises';
import path from 'path';

export async function getDocsList() {
  const docsDir = path.join(process.cwd(), 'docs');
  try {
    const files = await fs.readdir(docsDir);
    return files.filter((f) => f.endsWith('.md')).map((f) => ({
      slug: f.replace(/\.md$/, ''),
      title: f.replace(/-/g, ' ').replace(/\.md$/, '').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  } catch {
    return [];
  }
}
