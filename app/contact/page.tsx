"use client"

import { useState } from "react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={handleChange}
              required
              className="w-full border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Your name"
            />
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
              onChange={handleChange}
              required
              className="w-full border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="you@company.com"
            />
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
              onChange={handleChange}
              required
              rows={5}
              className="w-full border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              placeholder="Tell us about your project and specific needs..."
            />
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