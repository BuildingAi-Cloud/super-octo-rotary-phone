"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Minus, Plus, Trash2 } from "lucide-react"
import type { Vote } from "@/lib/governance-store"

const voteFormSchema = z.object({
  type: z.enum(["E-VOTE", "MEETING"]),
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  deadline: z.string().refine(
    (d) => new Date(d) > new Date(),
    "Deadline must be in the future",
  ),
  quorum: z.coerce.number().min(1).max(100).default(50),
  options: z.string().optional(),
  agenda: z.string().optional(),
})

type VoteFormValues = z.infer<typeof voteFormSchema>

interface VoteFormProps {
  userId: string
  userRole: string
  onCreated: (vote: Vote) => void
  onCancel: () => void
}

export default function VoteForm({ userId, userRole, onCreated, onCancel }: VoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["Yes", "No", "Abstain"])
  const [customOption, setCustomOption] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VoteFormValues>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: {
      type: "E-VOTE",
      quorum: 50,
      options: "Yes, No, Abstain",
    },
  })

  const voteType = watch("type")

  const toggleOption = useCallback(
    (option: string) => {
      setSelectedOptions((prev) => {
        const next = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
        setValue("options", next.join(", "))
        return next
      })
    },
    [setValue],
  )

  const addCustomOption = useCallback(() => {
    const trimmed = customOption.trim()
    if (!trimmed) return
    if (selectedOptions.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Option already exists.")
      return
    }
    setSelectedOptions((prev) => {
      const next = [...prev, trimmed]
      setValue("options", next.join(", "))
      return next
    })
    setCustomOption("")
  }, [customOption, selectedOptions, setValue])

  async function onSubmit(data: VoteFormValues) {
    setIsSubmitting(true)
    try {
      // Default to "Yes, No, Abstain" if no options provided for E-VOTE
      const options =
        data.type === "E-VOTE" && (!data.options || data.options.trim() === "")
          ? "Yes, No, Abstain"
          : data.options

      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          options,
          role: userRole,
          createdBy: userId,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { message?: string }
        toast.error(err.message || "Failed to create vote.")
        return
      }

      const vote = (await res.json()) as Vote
      toast.success(data.type === "E-VOTE" ? "Vote created successfully." : "Meeting created successfully.")
      onCreated(vote)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-orange-500/30 bg-orange-50/5 p-6">
      <h3 className="font-[var(--font-bebas)] text-lg tracking-wide text-orange-600">
        NEW {voteType === "E-VOTE" ? "VOTE" : "MEETING"}
      </h3>

      {/* Type selector */}
      <div className="flex gap-2">
        <label
          className={cn(
            "flex-1 cursor-pointer border p-3 text-center font-mono text-xs uppercase tracking-widest transition-colors",
            voteType === "E-VOTE"
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-border text-muted-foreground hover:border-orange-300",
          )}
        >
          <input type="radio" value="E-VOTE" {...register("type")} className="sr-only" />
          E-Vote
        </label>
        <label
          className={cn(
            "flex-1 cursor-pointer border p-3 text-center font-mono text-xs uppercase tracking-widest transition-colors",
            voteType === "MEETING"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-border text-muted-foreground hover:border-blue-300",
          )}
        >
          <input type="radio" value="MEETING" {...register("type")} className="sr-only" />
          Meeting
        </label>
      </div>

      {/* Title */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Title
        </label>
        <Input {...register("title")} placeholder="e.g. Budget Approval 2026" />
        {errors.title && (
          <p className="mt-1 font-mono text-[10px] text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Describe the purpose of this vote or meeting..."
          className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {errors.description && (
          <p className="mt-1 font-mono text-[10px] text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Deadline
        </label>
        <Input type="datetime-local" {...register("deadline")} />
        {errors.deadline && (
          <p className="mt-1 font-mono text-[10px] text-red-500">{errors.deadline.message}</p>
        )}
      </div>

      {/* Quorum */}
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Quorum (%)
        </label>
        <Input type="number" min={1} max={100} {...register("quorum")} />
        {errors.quorum && (
          <p className="mt-1 font-mono text-[10px] text-red-500">{errors.quorum.message}</p>
        )}
      </div>

      {/* E-VOTE: Options as clickable buttons */}
      {voteType === "E-VOTE" && (
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Vote Options
          </label>
          <input type="hidden" {...register("options")} />

          {/* Default option buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {(["Yes", "No", "Abstain"] as const).map((opt) => {
              const isActive = selectedOptions.includes(opt)
              const config = {
                Yes: { icon: Check, active: "border-green-500 bg-green-50 text-green-700", ring: "ring-green-400" },
                No: { icon: X, active: "border-red-500 bg-red-50 text-red-700", ring: "ring-red-400" },
                Abstain: { icon: Minus, active: "border-gray-500 bg-gray-100 text-gray-700", ring: "ring-gray-400" },
              }[opt]
              const Icon = config.icon
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "flex items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all",
                    isActive
                      ? cn(config.active, "ring-1", config.ring)
                      : "border-border text-muted-foreground/50 hover:border-muted-foreground/40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt}
                  {isActive && <span className="ml-1 text-[9px] font-normal normal-case opacity-60">✓ included</span>}
                </button>
              )
            })}
          </div>

          {/* Custom options */}
          {selectedOptions.filter((o) => !["Yes", "No", "Abstain"].includes(o)).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedOptions
                .filter((o) => !["Yes", "No", "Abstain"].includes(o))
                .map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className="flex items-center gap-2 border border-orange-400 bg-orange-50 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-orange-700 ring-1 ring-orange-300 transition-all"
                  >
                    {opt}
                    <Trash2 className="h-3 w-3 opacity-50 hover:opacity-100" />
                  </button>
                ))}
            </div>
          )}

          {/* Add custom option */}
          <div className="flex gap-2">
            <Input
              value={customOption}
              onChange={(e) => setCustomOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomOption()
                }
              }}
              placeholder="Add custom option…"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomOption}
              disabled={!customOption.trim()}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>

          <p className="mt-1.5 font-mono text-[9px] text-muted-foreground/70">
            Click buttons to toggle. Add custom options with the field above.
            {selectedOptions.length === 0 && (
              <span className="text-red-500 ml-1">At least one option is required.</span>
            )}
          </p>
          {errors.options && (
            <p className="mt-1 font-mono text-[10px] text-red-500">{errors.options.message}</p>
          )}
        </div>
      )}

      {/* MEETING: Agenda */}
      {voteType === "MEETING" && (
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Agenda Items (one per line)
          </label>
          <textarea
            {...register("agenda")}
            rows={4}
            placeholder={"Opening remarks\nQ1 Financial Review\nNew business\nAdjournment"}
            className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {errors.agenda && (
            <p className="mt-1 font-mono text-[10px] text-red-500">{errors.agenda.message}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
