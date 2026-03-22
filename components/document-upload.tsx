"use client"
import { useState } from "react"

export function DocumentUpload({ onUpload }: { onUpload?: (file: File, type: string, description: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !type) {
      setStatus("Please select a file and document type.")
      return
    }
    setStatus("Uploading...")
    // Simulate upload
    setTimeout(() => {
      setStatus("Document submitted successfully!")
      if (onUpload) onUpload(file, type, description)
      setFile(null)
      setType("")
      setDescription("")
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card/80 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="font-[var(--font-bebas)] text-2xl mb-4">Submit Documents to Building Management</h2>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Document Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          required
          className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
        >
          <option value="">Select type</option>
          <option value="lease">Lease Agreement</option>
          <option value="id">ID Proof</option>
          <option value="waiver">Waiver Form</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
          placeholder="e.g. Lease renewal 2026"
        />
      </div>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Select File</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
          required
          className="w-full border border-border bg-card/50 px-4 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200"
      >
        Submit Document
      </button>
      {status && <div className="mt-2 font-mono text-xs text-accent">{status}</div>}
    </form>
  )
}
