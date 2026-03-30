
import { useState, useEffect, useRef } from "react";
import { CommandDialog, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScaleIn } from "@/components/animations/ScaleIn";
import { SlideIn } from "@/components/animations/SlideIn";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = typeof window !== "undefined" ? (require("next/navigation").useRouter?.() ?? null) : null;

  // Example: static navigation data, replace with dynamic site map if needed
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Documentation", href: "/documentation" },
    { label: "API Access", href: "/api-access" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Support", href: "/support" },
    { label: "About", href: "/about" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Audit Log", href: "/audit-log" },
    { label: "Docs Search", href: "/docs" },
  ];
  const filtered = navItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <>
      <ScaleIn>
        <button
          aria-label="Open search (Ctrl+K)"
          className="ml-2 p-2 rounded hover:bg-accent/20"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="w-5 h-5" />
          <span className="sr-only">Open search (Ctrl+K)</span>
        </button>
      </ScaleIn>
      <FadeIn>
        <CommandDialog open={open} onOpenChange={setOpen} title="Site Search">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs text-muted-foreground">Search pages...</span>
            <kbd className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">Ctrl+K</kbd>
          </div>
          <CommandInput
            ref={inputRef}
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() === "" ? (
              <SlideIn direction="up">
                <div className="flex flex-col items-center py-8">
                  <span className="text-lg font-semibold text-muted-foreground mb-2">Welcome! 👋</span>
                  <span className="text-sm text-muted-foreground">Start typing to search for any page.</span>
                </div>
              </SlideIn>
            ) : null}
            <CommandEmpty>
              <SlideIn direction="up">
                <div className="flex flex-col items-center py-8">
                  <span className="text-lg font-semibold text-muted-foreground mb-2">No results found</span>
                  <span className="text-sm text-muted-foreground">Try a different keyword or check your spelling.</span>
                </div>
              </SlideIn>
            </CommandEmpty>
            {filtered.length > 0 && (
              <CommandGroup heading="Pages">
                {filtered.map(item => (
                  <SlideIn direction="up" key={item.href}>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        if (router) {
                          router.push(item.href);
                        } else {
                          window.location.href = item.href;
                        }
                      }}
                    >
                      {item.label}
                    </CommandItem>
                  </SlideIn>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </FadeIn>
    </>
  );
}
