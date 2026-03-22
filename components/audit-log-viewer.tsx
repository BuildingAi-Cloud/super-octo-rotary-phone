"use client"

import { useEffect, useState } from "react"
import { getAuditLog, clearAuditLog, AuditEntry } from "@/lib/audit"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/signin");
      return;
    }
    setLogs(getAuditLog().slice().reverse());
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <button onClick={() => { clearAuditLog(); setLogs([]) }} className="mb-4 px-2 py-1 border rounded text-xs">Clear Log</button>
      {logs.length === 0 ? (
        <div className="text-muted-foreground">No audit log entries found.</div>
      ) : (
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
                  <td className="border px-2 py-1 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="border px-2 py-1">{log.user || "-"}</td>
                  <td className="border px-2 py-1">{log.action}</td>
                  <td className="border px-2 py-1">
                    <pre className="whitespace-pre-wrap break-all text-xs bg-muted/30 p-2 rounded max-w-xs overflow-x-auto">{typeof log.details === "object" ? JSON.stringify(log.details, null, 2) : String(log.details || "-")}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
