"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { BackButton } from "@/components/back-button"

interface NotificationItem {
  id: string
  title: string
  detail: string
  time: string
  read: boolean
  type: "work-order" | "security" | "system"
}

function seedNotifications(): NotificationItem[] {
  return [
    {
      id: "N-1001",
      title: "New Work Order Assigned",
      detail: "WO-204 has been assigned and requires attention today.",
      time: "2m ago",
      read: false,
      type: "work-order",
    },
    {
      id: "N-1002",
      title: "Access Control Alert",
      detail: "Failed access attempt detected at Service Entrance.",
      time: "18m ago",
      read: false,
      type: "security",
    },
    {
      id: "N-1003",
      title: "System Update Complete",
      detail: "Background sync completed successfully.",
      time: "1h ago",
      read: true,
      type: "system",
    },
  ]
}

export default function NotificationsPage() {
  const { user, isLoading } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])

  useEffect(() => {
    if (!user) return
    const key = `buildsync_notifications_${user.id}`
    const stored = JSON.parse(localStorage.getItem(key) || "[]")

    if (!Array.isArray(stored) || stored.length === 0) {
      const seeded = seedNotifications()
      localStorage.setItem(key, JSON.stringify(seeded))
      setItems(seeded)
      return
    }

    setItems(stored)
  }, [user])

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items])

  const persist = (next: NotificationItem[]) => {
    if (!user) return
    localStorage.setItem(`buildsync_notifications_${user.id}`, JSON.stringify(next))
    setItems(next)
  }

  const markAsRead = (id: string) => {
    const next = items.map((item) => (item.id === id ? { ...item, read: true } : item))
    persist(next)
  }

  const markAllRead = () => {
    const next = items.map((item) => ({ ...item, read: true }))
    persist(next)
  }

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading notifications...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to view notifications.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-8 pt-24">
      <div className="mb-8">
        <BackButton fallbackHref="/dashboard" />
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Notifications</h1>
          <p className="font-mono text-xs text-muted-foreground mt-3">
            {unreadCount} unread • {items.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors self-start sm:self-auto"
        >
          Mark All Read
        </button>
      </div>

      <section className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={`border rounded-lg p-5 md:p-6 transition-all duration-200 ${item.read ? "border-border/30 bg-card/20 hover:bg-card/40" : "border-accent/50 bg-accent/10 hover:bg-accent/15"}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="font-mono text-sm font-medium text-foreground">{item.title}</h2>
                <p className="font-mono text-xs text-muted-foreground mt-2.5">{item.detail}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-3 uppercase tracking-wide">{item.time} • {item.type}</p>
              </div>
              {!item.read && (
                <button
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest border border-accent/50 text-accent rounded-md hover:bg-accent/20 transition-colors self-start whitespace-nowrap"
                >
                  Mark Read
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
