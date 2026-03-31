import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-8 px-4 md:px-12 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link href="/features">Features</Link>
          <Link href="/documentation">Documentation</Link>
          <Link href="/api-access">API Access</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/support">Support</Link>
          <Link href="/docs/ollama-docs-screenshot.png" target="_blank" rel="noopener noreferrer">Ollama Docs Screenshot</Link>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
          <span>&copy; {new Date().getFullYear()} BuildSync</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
