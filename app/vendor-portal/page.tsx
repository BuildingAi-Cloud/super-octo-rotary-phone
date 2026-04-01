"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText } from "@/components/scramble-text";
import {
  getVendorPortalSession,
  completeVendorPortalSession,
  type VendorPortalSession,
} from "@/lib/integration-store";

function VendorPortalInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [session, setSession] = useState<VendorPortalSession | null>(null);
  const [step, setStep] = useState<"loading" | "task" | "submit" | "done" | "error">("loading");
  const [notes, setNotes] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No portal token provided. Please use the link sent by your building manager.");
      setStep("error");
      return;
    }
    const found = getVendorPortalSession(token);
    if (!found) {
      setError("Invalid or expired portal link.");
      setStep("error");
      return;
    }
    if (found.status === "expired" || new Date(found.expiresAt) < new Date()) {
      setError("This portal link has expired. Please contact the building manager for a new link.");
      setStep("error");
      return;
    }
    if (found.status === "completed") {
      setSession(found);
      setStep("done");
      return;
    }
    setSession(found);
    setStep("task");
  }, [token]);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
    }
  }

  function handleSubmit() {
    if (!notes.trim() && !photoName) {
      setError("Please add notes or upload a completion photo.");
      return;
    }
    setError("");
    completeVendorPortalSession(token, {
      notes: notes.trim() || undefined,
      photoUrl: photoName ? `/uploads/${photoName}` : undefined,
    });
    setStep("done");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
          <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight">
            <ScrambleText text="VENDOR PORTAL" duration={0.6} />
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2">
            Zero-install task completion
          </p>
        </div>

        {/* Loading */}
        {step === "loading" && (
          <div className="text-center py-12">
            <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading task details...</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="space-y-6 bg-card/30 border border-red-500/30 p-8 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-red-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-[var(--font-bebas)] text-xl tracking-wide text-red-500">Access Error</p>
              <p className="font-mono text-xs text-muted-foreground mt-2">{error}</p>
            </div>
            <Link
              href="/"
              className="inline-block px-4 py-2.5 border border-border/40 rounded-md font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* Task View */}
        {step === "task" && session && (
          <div className="space-y-6">
            <div className="bg-card/30 border border-border/40 p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Work Order</span>
                <span className="font-mono text-xs font-medium text-accent">{session.workOrderId}</span>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Task Description</p>
                <p className="font-mono text-sm">{session.task}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Vendor</p>
                  <p className="font-mono text-xs">{session.vendorName}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Expires</p>
                  <p className="font-mono text-xs">{new Date(session.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("submit")}
              className="w-full px-4 py-3 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
            >
              Mark as Complete
            </button>
          </div>
        )}

        {/* Submit View */}
        {step === "submit" && session && (
          <div className="space-y-6 bg-card/30 border border-border/40 p-6 rounded-lg">
            <div>
              <p className="font-[var(--font-bebas)] text-lg tracking-wide">Complete: {session.workOrderId}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{session.task}</p>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Completion Notes</label>
              <textarea
                rows={3}
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60 resize-none"
                placeholder="Describe the work completed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Upload Completion Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs font-mono file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-border/40 file:text-xs file:font-mono file:bg-background file:text-foreground hover:file:bg-accent/10"
              />
              {photoName && (
                <p className="font-mono text-[10px] text-green-500 mt-1">✓ {photoName}</p>
              )}
            </div>

            {error && <p className="font-mono text-xs text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
              >
                Submit Completion
              </button>
              <button
                onClick={() => { setStep("task"); setError(""); }}
                className="px-4 py-3 border border-border/40 rounded-md font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-green-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="font-[var(--font-bebas)] text-2xl tracking-wide">Task Submitted</p>
              {session && (
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  {session.workOrderId} — {session.task}
                </p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground mt-4">
                The building management team has been notified. You can close this page.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] text-muted-foreground">
            Powered by <span className="text-accent">BuildSync</span> · No account required
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VendorPortalPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</p>
      </main>
    }>
      <VendorPortalInner />
    </Suspense>
  );
}
