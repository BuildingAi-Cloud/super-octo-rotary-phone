"use client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const PAID_ROLES = ["admin", "building_manager", "building_owner"];

export default function SupportPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return <main className="p-8 text-center">Please sign in to access support.</main>;
  }

  const isPaid = PAID_ROLES.includes(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    if (!message.trim()) {
      setError("Please describe your issue before sending.");
      return;
    }
    setStatus("Support request sent! (demo only)");
    setMessage("");
  };

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      {isPaid ? (
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {error && <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-600 font-mono text-xs">{error}</div>}
          <textarea
            className={`input input-bordered w-full min-h-[120px] ${error ? "border-red-500" : ""}`}
            placeholder="Describe your issue or question..."
            value={message}
            onChange={e => {
              setMessage(e.target.value)
              if (error) setError("")
            }}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "support-message-error" : undefined}
          />
          {error && <p id="support-message-error" className="text-red-600 font-mono text-xs">{error}</p>}
          <button type="submit" className="btn btn-primary">Send</button>
          {status && <div className="text-green-600 font-mono text-xs mt-2">{status}</div>}
        </form>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>Support is a paid feature. Upgrade your subscription to access direct support.</p>
        </div>
      )}
    </main>
  );
}
