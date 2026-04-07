"use client";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const PAID_ROLES = ["admin", "building_manager", "building_owner"];

export default function SupportPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  if (!user) {
    return <main className="p-8 text-center">Please sign in to access support.</main>;
  }

  const isPaid = PAID_ROLES.includes(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Support request sent! (demo only)");
    setMessage("");
  };

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      {isPaid ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="input input-bordered w-full min-h-[120px]"
            placeholder="Describe your issue or question..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
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
