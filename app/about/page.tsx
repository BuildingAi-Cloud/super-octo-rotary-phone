import React from "react";
import fs from "fs";
import path from "path";
import Markdown from "react-markdown";

export default async function AboutPage() {
  // Read the markdown file at build time
  const filePath = path.join(process.cwd(), "app/about/page.md");
  const content = fs.readFileSync(filePath, "utf8");
  return (
    <main className="prose mx-auto p-8">
      <h1>About BuildSync</h1>
      <Markdown>{content}</Markdown>
    </main>
  );
}
