"use client"

import { cn } from "@/lib/utils"

interface VoteResultRow {
  optionId: string
  label: string
  count: number
  percentage: number
}

interface ResultsViewProps {
  results: VoteResultRow[]
  nonBinding: boolean
  participation: number
  quorum: number
}

export default function ResultsView({ results, nonBinding, participation, quorum }: ResultsViewProps) {
  const maxCount = Math.max(...results.map((r) => r.count), 1)

  return (
    <div className="space-y-4">
      {nonBinding && (
        <div className="border border-amber-300 bg-amber-50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-700">
            Non-Binding — participation ({participation}%) did not meet quorum ({quorum}%)
          </p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.optionId}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs text-foreground">{result.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {result.count} vote{result.count !== 1 ? "s" : ""} · {result.percentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 border border-border/30">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  result.count === maxCount ? "bg-orange-500" : "bg-orange-300",
                )}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="font-mono text-[10px] text-muted-foreground">Participation</span>
        <span className="font-[var(--font-bebas)] text-lg">{participation}%</span>
      </div>
    </div>
  )
}
