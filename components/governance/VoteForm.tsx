"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const voteFormSchema = z.object({
  type: z.enum(["E-VOTE", "MEETING"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  deadline: z.string().refine(d => new Date(d) > new Date(), "Deadline must be in the future"),
  quorum: z.coerce.number().min(1).max(100).default(50),
  agenda: z.string().optional(),
})

type VoteFormData = z.infer<typeof voteFormSchema>

interface VoteFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function VoteForm({ userId, onSuccess, onCancel }: VoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteType, setVoteType] = useState<"E-VOTE" | "MEETING">("E-VOTE")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VoteFormData>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: {
      type: "E-VOTE",
      quorum: 50,
    },
  })

  const handleTypeChange = (value: string) => {
    if (value === "E-VOTE" || value === "MEETING") {
      setVoteType(value)
      setValue("type", value, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: VoteFormData) => {
    setIsSubmitting(true)
    try {
      // For E-VOTE, use fixed options: Yes, Abstain, No
      const options = data.type === "E-VOTE"
        ? [
            { id: crypto.randomUUID(), label: "Yes", count: 0 },
            { id: crypto.randomUUID(), label: "Abstain", count: 0 },
            { id: crypto.randomUUID(), label: "No", count: 0 },
          ]
        : undefined

      const agenda = data.type === "MEETING" && data.agenda
        ? data.agenda
            .split("\n")
            .map((item, idx) => ({
              id: crypto.randomUUID(),
              order: idx,
              item: item.trim(),
            }))
            .filter(a => a.item)
        : undefined

      if (data.type === "MEETING" && (!agenda || agenda.length < 1)) {
        toast.error("MEETING needs at least 1 agenda item (one per line)")
        return
      }

      const response = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          title: data.title,
          description: data.description,
          deadline: data.deadline,
          quorum: data.quorum,
          createdBy: userId,
          options,
          agenda,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || "Failed to create vote")
        return
      }

      toast.success("Vote created successfully")
      reset()
      onSuccess?.()
    } catch {
      toast.error("Error creating vote")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-700">Create New Vote</CardTitle>
        <CardDescription>Proposal or meeting agenda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Vote Type */}
          <div>
            <Label htmlFor="type" className="mb-2 block">
              Voting Type
            </Label>
            <Select value={voteType} onValueChange={handleTypeChange}>
              <SelectTrigger id="type" {...register("type")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="E-VOTE">Electronic Vote (Proposal)</SelectItem>
                <SelectItem value="MEETING">Meeting (Agenda)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-2 block">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Approve building renovation budget"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Provide context and details..."
              rows={3}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <Label htmlFor="deadline" className="mb-2 block">
              Voting Deadline
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              {...register("deadline")}
              className={errors.deadline ? "border-destructive" : ""}
            />
            {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline.message}</p>}
          </div>

          {/* Quorum */}
          <div>
            <Label htmlFor="quorum" className="mb-2 block">
              Quorum (%)
            </Label>
            <Input
              id="quorum"
              type="number"
              min="1"
              max="100"
              placeholder="50"
              {...register("quorum")}
            />
          </div>

          {/* E-VOTE Options - Fixed */}
          {voteType === "E-VOTE" && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <Label className="mb-2 block font-semibold">Voting Options</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-green-500 bg-white text-green-700 font-medium cursor-default"
                >
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                  Yes
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-yellow-500 bg-white text-yellow-700 font-medium cursor-default"
                >
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                  Abstain
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-red-500 bg-white text-red-700 font-medium cursor-default"
                >
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  No
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Fixed voting options for all E-VOTE proposals</p>
            </div>
          )}

          {/* MEETING Agenda */}
          {voteType === "MEETING" && (
            <div>
              <Label htmlFor="agenda" className="mb-2 block">
                Agenda Items
              </Label>
              <Textarea
                id="agenda"
                placeholder="One item per line, e.g.&#10;Opening remarks&#10;Budget review&#10;Q&A"
                rows={4}
                {...register("agenda")}
              />
              <p className="text-xs text-muted-foreground mt-1">One item per line</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onCancel?.()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create Vote"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
