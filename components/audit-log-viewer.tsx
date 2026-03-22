"use client"

import { useEffect, useState } from "react"
import { getAuditLog, clearAuditLog, AuditEntry } from "@/lib/audit"

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>([])

  useEffect(() => {
    setLogs(getAuditLog())
  }, [])

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2">Audit Log</h2>
      <button onClick={() => { clearAuditLog(); setLogs([]) }} className="mb-4 px-2 py-1 border rounded text-xs">Clear Log</button>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Timestamp</th>
              <th className="border px-2 py-1">User</th>
              <th className="border px-2 py-1">Action</th>
              <th className="border px-2 py-1">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="border px-2 py-1 whitespace-nowrap">{log.timestamp}</td>
                <td className="border px-2 py-1">{log.user || "-"}</td>
                <td className="border px-2 py-1">{log.action}</td>
                <td className="border px-2 py-1">{typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
