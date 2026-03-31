"use client"

import { Vote } from "@/lib/governance-store"

interface MeetingViewProps {
  vote: Vote
}

export function MeetingView({ vote }: MeetingViewProps) {
  const agenda = vote.agenda || []

  if (!agenda.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No agenda items</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-xl font-bold text-blue-600">{agenda.length}</div>
          <div className="text-sm text-muted-foreground">Agenda Items</div>
        </div>
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-3xl font-bold text-blue-600">{vote.participation}%</div>
          <div className="text-sm text-muted-foreground">Participation</div>
        </div>
      </div>

      {/* Agenda List */}
      <div className="border rounded-lg divide-y">
        {agenda.map((item, idx) => (
          <div key={item.id} className="p-4 hover:bg-accent/5 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">{idx + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.item}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Info */}
      {vote.status === "COMPLETED" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            ✓ Meeting completed with {vote.participation}% participation.
          </p>
        </div>
      )}
    </div>
  )
}
