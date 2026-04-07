"use client"

import { useEffect, useMemo, useState } from "react"
import { BackButton } from "@/components/back-button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  readTenantAssignments,
  upsertTenantAssignment,
  removeTenantAssignment,
} from "@/lib/tenant-assignments"

export default function ConciergeTenantAssignmentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [tenantEmail, setTenantEmail] = useState("")
  const [unit, setUnit] = useState("")
  const [buildingId, setBuildingId] = useState("")
  const [leaseId, setLeaseId] = useState("")
  const [assignedBy, setAssignedBy] = useState("")
  const [message, setMessage] = useState("")
  const [refreshToken, setRefreshToken] = useState(0)

  const canManageAssignments = user ? ["admin", "building_manager", "concierge"].includes(user.role) : false

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [isLoading, router, user])

  const assignments = useMemo(() => {
    refreshToken
    return readTenantAssignments()
  }, [refreshToken])

  if (isLoading) {
    return (
      <main className="min-h-screen py-24 px-6 md:px-20 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm text-muted-foreground">Loading tenant assignments...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  if (!canManageAssignments) {
    return (
      <main className="min-h-screen py-24 px-6 md:px-20 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton fallbackHref="/concierge/dashboard" />
          </div>
          <h1 className="font-[var(--font-bebas)] text-4xl tracking-tight">Access Restricted</h1>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Tenant assignment management is available to Concierge, Building Manager, and Admin roles only.
          </p>
        </div>
      </main>
    )
  }

  function resetForm() {
    setTenantEmail("")
    setUnit("")
    setBuildingId("")
    setLeaseId("")
    setAssignedBy("")
  }

  function handleAssign(event: React.FormEvent) {
    event.preventDefault()

    if (!tenantEmail.trim() || !unit.trim()) {
      setMessage("Tenant email and unit are required.")
      return
    }

    upsertTenantAssignment({
      tenantEmail,
      unit,
      buildingId,
      leaseId,
      assignedBy,
    })

    setMessage("Tenant assignment saved.")
    resetForm()
    setRefreshToken((prev) => prev + 1)
  }

  function handleRemove(id: string) {
    removeTenantAssignment(id)
    setMessage("Assignment removed.")
    setRefreshToken((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen py-24 px-6 md:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton fallbackHref="/concierge/dashboard" />
        </div>

        <div className="mb-8">
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight">Tenant Assignments</h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Link tenant users to units and optional building context. Assignment is applied automatically at tenant sign-in.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="border border-border/30 bg-card/40 rounded-lg p-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Assign Tenant</h2>
            <form onSubmit={handleAssign} className="space-y-3">
              <label className="block">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Tenant Email</span>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={(event) => setTenantEmail(event.target.value)}
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                  placeholder="tenant@example.com"
                />
              </label>

              <label className="block">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Unit</span>
                <input
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                  placeholder="14B"
                />
              </label>

              <label className="block">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Building ID (Optional)</span>
                <input
                  value={buildingId}
                  onChange={(event) => setBuildingId(event.target.value)}
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                  placeholder="BLDG-001"
                />
              </label>

              <label className="block">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Lease ID (Optional)</span>
                <input
                  value={leaseId}
                  onChange={(event) => setLeaseId(event.target.value)}
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                  placeholder="LEASE-2026-014"
                />
              </label>

              <label className="block">
                <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Assigned By (Optional)</span>
                <input
                  value={assignedBy}
                  onChange={(event) => setAssignedBy(event.target.value)}
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs"
                  placeholder="Building Manager"
                />
              </label>

              <button
                type="submit"
                className="w-full px-3 py-2 border border-accent/50 text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors"
              >
                Save Assignment
              </button>
            </form>

            {message && <p className="mt-3 font-mono text-xs text-muted-foreground">{message}</p>}
          </section>

          <section className="border border-border/30 bg-card/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Assigned Tenants</h2>
              <span className="font-mono text-xs text-accent">{assignments.length} total</span>
            </div>

            {assignments.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">No tenant assignments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead className="text-muted-foreground border-b border-border/30">
                    <tr>
                      <th className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">Tenant</th>
                      <th className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">Unit</th>
                      <th className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">Building</th>
                      <th className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">Lease</th>
                      <th className="text-left py-2 pr-3 uppercase tracking-widest text-[10px]">Assigned At</th>
                      <th className="text-left py-2 uppercase tracking-widest text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-border/20 align-top">
                        <td className="py-2 pr-3 text-foreground">{assignment.tenantEmail}</td>
                        <td className="py-2 pr-3 text-foreground">{assignment.unit}</td>
                        <td className="py-2 pr-3 text-foreground">{assignment.buildingId || "-"}</td>
                        <td className="py-2 pr-3 text-foreground">{assignment.leaseId || "-"}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{new Date(assignment.assignedAt).toLocaleString()}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => handleRemove(assignment.id)}
                            className="font-mono text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </td>
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
  )
}
