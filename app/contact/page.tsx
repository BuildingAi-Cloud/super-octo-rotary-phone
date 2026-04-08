"use client"

import { useState } from "react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const nextErrors: Record<string, string> = {}
    if (!formData.name.trim()) nextErrors.name = "Full name is required."
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }
    if (!formData.message.trim()) nextErrors.message = "Message is required."

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please fix the highlighted fields and try again.")
      return
    }

    setIsLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
      setFieldErrors({})
      setFormData({ name: "", email: "", company: "", phone: "", message: "" })
      setTimeout(() => setSubmitted(false), 4000)
    }, 1000)
  }

  return (
    <main className="relative min-h-screen bg-background">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 py-16 md:py-24 px-4 md:px-8 max-w-2xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-accent">Contact</span>
          <h1 className="font-[var(--font-bebas)] text-5xl md:text-6xl tracking-tight mt-2 mb-4">Get in Touch</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Have questions about our enterprise plan or need a custom solution?{" "}
            <br className="hidden md:block" />
            Fill out the form below and our team will reach out within 24 hours.
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
            ✓ Thank you! We've received your message and will be in touch soon.
          </div>
        )}

        {/* Contact form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {formError && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm">{formError}</div>}
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => {
                handleChange(e)
                setFieldErrors((prev) => ({ ...prev, name: "" }))
              }}
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              className={`w-full border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${fieldErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-accent focus:ring-accent"}`}
              placeholder="Your name"
            />
            {fieldErrors.name && <p id="contact-name-error" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e)
                setFieldErrors((prev) => ({ ...prev, email: "" }))
              }}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              className={`w-full border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-accent focus:ring-accent"}`}
              placeholder="you@company.com"
            />
            {fieldErrors.email && <p id="contact-email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          {/* Company field */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
              Company
            </label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Your company name"
            />
          </div>

          {/* Phone field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="(123) 456-7890"
            />
          </div>

          {/* Message field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) => {
                handleChange(e)
                setFieldErrors((prev) => ({ ...prev, message: "" }))
              }}
              required
              rows={5}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
              className={`w-full border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 resize-none ${fieldErrors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-accent focus:ring-accent"}`}
              placeholder="Tell us about your project and specific needs..."
            />
            {fieldErrors.message && <p id="contact-message-error" className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground rounded-lg px-6 py-3 font-semibold uppercase tracking-wider text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>

          {/* Alternative contact info */}
          <div className="pt-8 border-t border-border/30 text-center text-xs md:text-sm text-muted-foreground space-y-1">
            <p>Or reach out directly:</p>
            <a href="mailto:info@buildsync.com" className="text-accent hover:underline block">
              info@buildsync.com
            </a>
          </div>
        </form>
      </div>
    </main>
  )
}