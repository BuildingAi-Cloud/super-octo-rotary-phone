import React from "react";

// Placeholder for LinkedIn events integration
const webinars = [
  {
    title: "Smart Building Automation Webinar",
    date: "2026-04-10T16:00:00Z",
    url: "https://www.linkedin.com/events/smart-building-automation-2026/",
  },
  {
    title: "Operational Excellence in Property Management",
    date: "2026-05-02T15:00:00Z",
    url: "https://www.linkedin.com/events/operational-excellence-2026/",
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WebinarsPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-3xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Upcoming Webinars</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Join our live events to learn more about BuildSync and smart facility management.</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border/40 bg-card/30 rounded-lg">
            <thead>
              <tr>
                <th className="text-left font-mono text-xs uppercase tracking-widest p-4 bg-background/80">Title</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest p-4 bg-background/80">Date & Time</th>
                <th className="text-left font-mono text-xs uppercase tracking-widest p-4 bg-background/80">Link</th>
              </tr>
            </thead>
            <tbody>
              {webinars.map((event) => (
                <tr key={event.title} className="border-t border-border/20">
                  <td className="p-4 font-mono text-sm text-foreground/90">{event.title}</td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{formatDate(event.date)}</td>
                  <td className="p-4 font-mono text-xs">
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent-foreground transition-colors">View on LinkedIn</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
