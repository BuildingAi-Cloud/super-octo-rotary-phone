import React from "react";

export default function SignIn() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-foreground text-background">
      <div className="max-w-md w-full p-8 rounded-lg shadow-lg bg-background/90 border border-foreground/10">
        <h1 className="text-3xl font-display mb-4">Sign In</h1>
        <p className="text-muted-foreground mb-6">
          Buildings.com is being built and will be live soon. Please check back for updates!
        </p>
        <div className="flex items-center justify-center">
          <span className="text-xs font-mono text-background/40">Product Launch Coming Soon</span>
        </div>
      </div>
    </main>
  );
}
