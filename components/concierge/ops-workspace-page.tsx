"use client";

import React, { useMemo, useState } from "react";
import { BackButton } from "@/components/back-button";

export interface OpsFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface OpsRecord {
  id: string;
  createdAt: string;
  values: Record<string, string>;
}

interface OpsWorkspacePageProps {
  title: string;
  subtitle: string;
  storageKey: string;
  fields: OpsFieldConfig[];
  initialRecords?: Array<Record<string, string>>;
}

function loadRecords(storageKey: string, initialRecords?: Array<Record<string, string>>): OpsRecord[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as OpsRecord[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Ignore invalid local data and seed defaults.
    }
  }

  const seeded = (initialRecords || []).map((record) => ({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    values: record,
  }));

  localStorage.setItem(storageKey, JSON.stringify(seeded));
  return seeded;
}

export function OpsWorkspacePage({ title, subtitle, storageKey, fields, initialRecords }: OpsWorkspacePageProps) {
  const [records, setRecords] = useState<OpsRecord[]>(() => loadRecords(storageKey, initialRecords));
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {} as Record<string, string>),
  );
  const [message, setMessage] = useState<string>("");

  const requiredKeys = useMemo(() => fields.filter((field) => field.required).map((field) => field.key), [fields]);

  const persist = (next: OpsRecord[]) => {
    setRecords(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  const resetDraft = () => {
    setDraft(fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {} as Record<string, string>));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const missing = requiredKeys.find((key) => !draft[key]?.trim());
    if (missing) {
      const field = fields.find((entry) => entry.key === missing);
      setMessage(`${field?.label || "Required field"} is required.`);
      return;
    }

    const next: OpsRecord[] = [
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        values: Object.fromEntries(
          Object.entries(draft).map(([key, value]) => [key, value.trim()]),
        ),
      },
      ...records,
    ];

    persist(next);
    resetDraft();
    setMessage("Record added.");
  };

  return (
    <main className="min-h-screen py-24 px-6 md:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton fallbackHref="/concierge/dashboard" />
        </div>

        <div className="mb-8">
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight">{title}</h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">{subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="border border-border/30 bg-card/40 rounded-lg p-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Add Record</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{field.label}</span>
                  <input
                    value={draft[field.key] || ""}
                    onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                    placeholder={field.placeholder || ""}
                  />
                </label>
              ))}

              <button
                type="submit"
                className="w-full px-3 py-2 border border-accent/50 text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors"
              >
                Save
              </button>
            </form>

            {message && <p className="mt-3 font-mono text-xs text-muted-foreground">{message}</p>}
          </section>

          <section className="border border-border/30 bg-card/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Operational Records</h2>
              <span className="font-mono text-xs text-accent">{records.length} total</span>
            </div>

            {records.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">No records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead className="text-muted-foreground border-b border-border/30">
                    <tr>
                      {fields.map((field) => (
                        <th key={field.key} className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">{field.label}</th>
                      ))}
                      <th className="text-left py-2 uppercase tracking-widest text-[10px]">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-border/20 align-top">
                        {fields.map((field) => (
                          <td key={field.key} className="py-2 pr-3 text-foreground">{record.values[field.key] || "-"}</td>
                        ))}
                        <td className="py-2 text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
