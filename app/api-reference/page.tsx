"use client"

import Link from "next/link"
import React from "react"
import { GlobalSearch } from "@/components/global-search"
import { ThemeToggle } from "@/components/theme-toggle"

const leftNav = [
  {
    heading: "Getting Started",
    items: [
      { label: "Overview", href: "#overview" },
      { label: "Authentication", href: "#authentication" },
      { label: "Base URL", href: "#base-url" },
      { label: "Rate Limits", href: "#rate-limits" },
    ],
  },
  {
    heading: "API Endpoints",
    items: [
      { label: "Users", href: "#users" },
      { label: "Properties", href: "#properties" },
      { label: "Work Orders", href: "#work-orders" },
      { label: "Amenities", href: "#amenities" },
      { label: "Residents", href: "#residents" },
    ],
  },
  {
    heading: "References",
    items: [
      { label: "Error Codes", href: "#error-codes" },
      { label: "Response Formats", href: "#response-formats" },
      { label: "Webhooks", href: "#webhooks" },
      { label: "SDKs & Libraries", href: "#sdks" },
    ],
  },
]

const toc = [
  { label: "Overview", href: "#overview" },
  { label: "Authentication", href: "#authentication" },
  { label: "Base URL", href: "#base-url" },
  { label: "Rate Limits", href: "#rate-limits" },
  { label: "Users", href: "#users" },
  { label: "Properties", href: "#properties" },
  { label: "Work Orders", href: "#work-orders" },
  { label: "Amenities", href: "#amenities" },
  { label: "Residents", href: "#residents" },
  { label: "Error Codes", href: "#error-codes" },
]

const apiEndpoints = [
  {
    name: "Users",
    description: "Manage user accounts, roles, and permissions.",
    methods: [
      { verb: "GET", path: "/users", description: "List all users", auth: true },
      { verb: "GET", path: "/users/:id", description: "Get user by ID", auth: true },
      { verb: "POST", path: "/users", description: "Create new user", auth: true },
      { verb: "PATCH", path: "/users/:id", description: "Update user details", auth: true },
      { verb: "DELETE", path: "/users/:id", description: "Delete user account", auth: true },
    ],
  },
  {
    name: "Properties",
    description: "Manage property portfolios, buildings, and units.",
    methods: [
      { verb: "GET", path: "/properties", description: "List all properties", auth: true },
      { verb: "GET", path: "/properties/:id", description: "Get property details", auth: true },
      { verb: "POST", path: "/properties", description: "Create new property", auth: true },
      { verb: "PATCH", path: "/properties/:id", description: "Update property", auth: true },
    ],
  },
  {
    name: "Work Orders",
    description: "Track and manage maintenance work orders.",
    methods: [
      { verb: "GET", path: "/work-orders", description: "List work orders", auth: true },
      { verb: "GET", path: "/work-orders/:id", description: "Get work order details", auth: true },
      { verb: "POST", path: "/work-orders", description: "Create new work order", auth: true },
      { verb: "PATCH", path: "/work-orders/:id", description: "Update work order status", auth: true },
    ],
  },
  {
    name: "Amenities",
    description: "Manage building amenities and booking systems.",
    methods: [
      { verb: "GET", path: "/amenities", description: "List amenities", auth: true },
      { verb: "GET", path: "/amenities/:id", description: "Get amenity details", auth: true },
      { verb: "POST", path: "/amenities", description: "Create amenity", auth: true },
      { verb: "POST", path: "/amenities/:id/bookings", description: "Create booking", auth: true },
    ],
  },
  {
    name: "Residents",
    description: "Access resident profiles and resident-facing features.",
    methods: [
      { verb: "GET", path: "/residents", description: "List residents", auth: true },
      { verb: "GET", path: "/residents/:id", description: "Get resident profile", auth: true },
      { verb: "GET", path: "/residents/:id/requests", description: "List resident requests", auth: true },
      { verb: "POST", path: "/residents/:id/requests", description: "Create service request", auth: true },
    ],
  },
]

const errorCodes = [
  { code: 400, message: "Bad Request", description: "Invalid parameters or malformed request body" },
  { code: 401, message: "Unauthorized", description: "Missing or invalid authentication token" },
  { code: 403, message: "Forbidden", description: "Authenticated but lacks required permissions" },
  { code: 404, message: "Not Found", description: "Resource does not exist" },
  { code: 429, message: "Too Many Requests", description: "Rate limit exceeded" },
  { code: 500, message: "Internal Server Error", description: "Unexpected server error" },
]

const responseExample = {
  success: `{
  "success": true,
  "data": { /* resource data */ },
  "timestamp": "2026-04-01T10:30:00Z"
}`,
  error: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  },
  "timestamp": "2026-04-01T10:30:00Z"
}`
}

export default function ApiReferencePage() {
  return (
    <main className="min-h-screen max-w-screen-2xl mx-auto px-3 md:px-6 pt-20 pb-10 grid-bg">
      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_220px] gap-8">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-xl border border-border/40 bg-card/20 p-4 space-y-5">
            <GlobalSearch />
            {leftNav.map((group) => (
              <div key={group.heading}>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{group.heading}</h2>
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <div id="overview" className="mb-8">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Developer Tools</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button className="text-xs border border-border/40 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Copy endpoint
                </button>
              </div>
            </div>
            <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight leading-none">API Reference</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">
              Complete REST API documentation for BuildSync. All endpoints are versioned, support token-based authentication, and return structured JSON responses.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs rounded-md border border-border/40 px-2 py-1 text-muted-foreground">OpenAPI 3.1</span>
              <span className="text-xs rounded-md border border-border/40 px-2 py-1 text-muted-foreground">REST API</span>
              <span className="text-xs rounded-md border border-border/40 px-2 py-1 text-muted-foreground">Versioned</span>
            </div>
          </div>

          <section id="authentication" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Authentication</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              All API requests require a Bearer token passed in the Authorization header. Generate tokens from your account settings or via the API.
            </p>
            <div className="mt-4 rounded-lg bg-background/40 border border-border/30 p-4">
              <code className="text-xs text-muted-foreground font-mono block">
                Authorization: Bearer your_api_token_here
              </code>
            </div>
          </section>

          <section id="base-url" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Base URL</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              All API requests use the following base URL. Version the API by including /v1 or /v2 in the path.
            </p>
            <div className="mt-4 rounded-lg bg-background/40 border border-border/30 p-4">
              <code className="text-xs text-accent font-mono block">
                https://api.buildsync.com/v1
              </code>
            </div>
          </section>

          <section id="rate-limits" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Rate Limits</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              BuildSync API imposes fair-use rate limits. Check response headers for current limit status.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                <h3 className="text-foreground font-medium mb-2">Standard Tier</h3>
                <p className="text-sm text-muted-foreground">1,000 requests per minute</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/40 p-4">
                <h3 className="text-foreground font-medium mb-2">Premium Tier</h3>
                <p className="text-sm text-muted-foreground">10,000 requests per minute</p>
              </div>
            </div>
          </section>

          <section id="users" className="mb-8">
            <h2 className="font-[var(--font-bebas)] text-4xl tracking-wide mb-4">Endpoints</h2>
            {apiEndpoints.map((endpoint) => (
              <article key={endpoint.name} id={endpoint.name.toLowerCase().replace(/\s+/g, "-")} className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-6">
                <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                <div className="mt-4 space-y-3">
                  {endpoint.methods.map((method) => (
                    <div key={method.path} className="rounded-lg border border-border/40 bg-background/40 p-4">
                      <div className="flex items-start gap-3 flex-wrap">
                        <span className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                          method.verb === "GET" ? "bg-blue-500/15 text-blue-400" :
                          method.verb === "POST" ? "bg-emerald-500/15 text-emerald-400" :
                          method.verb === "PATCH" ? "bg-amber-500/15 text-amber-400" :
                          method.verb === "DELETE" ? "bg-red-500/15 text-red-400" :
                          "bg-border/20 text-foreground"
                        }`}>
                          {method.verb}
                        </span>
                        <code className="text-xs font-mono text-muted-foreground flex-1">{method.path}</code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{method.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section id="error-codes" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Error Codes</h2>
            <p className="mt-2 text-sm text-muted-foreground">Standard HTTP status codes indicate request success or failure.</p>
            <div className="mt-4 space-y-2">
              {errorCodes.map((error) => (
                <div key={error.code} className="rounded-lg border border-border/40 bg-background/40 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold text-foreground">{error.code}</span>
                    <span className="text-sm font-medium text-muted-foreground">{error.message}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{error.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="response-formats" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Response Formats</h2>
            <p className="mt-2 text-sm text-muted-foreground">All responses follow a consistent JSON structure.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Success Response</h3>
                <pre className="text-xs bg-background/40 border border-border/40 rounded-lg p-3 overflow-auto text-muted-foreground font-mono">
                  {responseExample.success}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Error Response</h3>
                <pre className="text-xs bg-background/40 border border-border/40 rounded-lg p-3 overflow-auto text-muted-foreground font-mono">
                  {responseExample.error}
                </pre>
              </div>
            </div>
          </section>

          <section id="webhooks" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6 mb-8">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">Webhooks</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Subscribe to real-time events via webhooks. Configure endpoints in your dashboard to receive notifications when key events occur.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>• User created, updated, or deleted</p>
              <p>• Work order status changes</p>
              <p>• Property updates</p>
              <p>• Resident requests submitted</p>
            </div>
          </section>

          <section id="sdks" className="rounded-xl border border-border/40 bg-card/20 p-5 md:p-6">
            <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide">SDKs & Libraries</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Official SDKs simplify integration with BuildSync API across different platforms.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "JavaScript/TypeScript", repo: "buildsync-js" },
                { name: "Python", repo: "buildsync-python" },
                { name: "Node.js", repo: "buildsync-node" },
                { name: "Go", repo: "buildsync-go" },
              ].map((sdk) => (
                <Link key={sdk.repo} href="#" className="rounded-lg border border-border/40 bg-background/40 p-4 hover:border-accent/50 hover:bg-accent/5 transition-colors">
                  <h3 className="text-sm font-medium">{sdk.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">github.com/buildsync/{sdk.repo}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-8 border-t border-border/40 pt-6 text-xs text-muted-foreground">
            <Link href="/documentation" className="hover:text-foreground transition-colors">← Back to Documentation</Link>
          </div>
        </section>

        <aside className="hidden xl:block">
          <h2 className="sticky top-24 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3 bg-background/80 backdrop-blur-sm py-2 -mx-4 px-4">On this page</h2>
          <ul className="space-y-2 text-sm">
            {toc.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">{item.label}</a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  )
}
