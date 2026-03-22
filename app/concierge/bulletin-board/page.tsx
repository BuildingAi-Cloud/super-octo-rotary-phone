export default function ConciergeBulletinBoardPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight mb-8">Bulletin Board</h1>
      <div className="bg-card/80 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        <p className="font-mono text-sm text-muted-foreground">No posts yet. This is where community posts, events, and notices will appear.</p>
      </div>
    </main>
  );
}