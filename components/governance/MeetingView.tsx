"use client"

import type { MeetingAgendaItem } from "@/lib/governance-store"

interface MeetingViewProps {
  agenda: MeetingAgendaItem[]
  deadline: string
  title: string
}

export default function MeetingView({ agenda, deadline, title }: MeetingViewProps) {
  const meetingDate = new Date(deadline).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="space-y-4">
      <div className="border border-blue-300 bg-blue-50 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-blue-700">
          Meeting · {meetingDate}
        </p>
      </div>

      <div>
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Agenda
        </h4>
        <ol className="space-y-2">
          {agenda
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 border-l-2 border-blue-300 pl-3 py-1"
              >
                <span className="font-mono text-[10px] text-blue-600 shrink-0">
                  {item.order}.
                </span>
                <span className="font-mono text-xs text-foreground">{item.item}</span>
              </li>
            ))}
        </ol>
      </div>
    </div>
  )
}
