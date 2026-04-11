
"use client";
import { useTranslation } from "react-i18next"

import { useEffect, useState } from "react"
import { amenityStore, type Booking } from "@/lib/amenity-store"
import { type User } from "@/lib/auth-context"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"
import GovernancePanel from "@/components/governance/GovernancePanel"


interface ResidentDashboardProps {
  user: User
}

type ListingCategory = "For Sale" | "Free / Giveaway" | "Services" | "Lost & Found" | "Housing Swap"

interface MarketplaceListing {
  id: number
  category: ListingCategory
  title: string
  suite: string
  posted: string
  price: string | null
  isFree: boolean
  interests: number
}

interface BuildingDeal {
  id: number
  title: string
  partner: string
  instructions: string
  expiresAt: string
  active: boolean
}

const fallbackMarketplaceListings: MarketplaceListing[] = [
  { id: 1, category: "For Sale", title: "Standing desk — adjustable height", suite: "Suite 204", posted: "1h ago", price: "$120", isFree: false, interests: 2 },
  { id: 2, category: "Free / Giveaway", title: "Moving boxes — 15 assorted sizes", suite: "Suite 110", posted: "4h ago", price: null, isFree: true, interests: 5 },
  { id: 3, category: "Services", title: "Dog walking — weekday mornings", suite: "Suite 507", posted: "Yesterday", price: "$15/walk", isFree: false, interests: 1 },
  { id: 4, category: "Lost & Found", title: "Silver key fob found near mailroom", suite: "Building Team", posted: "2d ago", price: null, isFree: false, interests: 0 },
  { id: 5, category: "For Sale", title: "Acoustic guitar — barely used", suite: "Suite 312", posted: "3d ago", price: "$85", isFree: false, interests: 3 },
  { id: 6, category: "Housing Swap", title: "1BR swap — looking for 2BR same floor", suite: "Suite 401", posted: "4d ago", price: null, isFree: false, interests: 4 },
]

const buildingDeals: BuildingDeal[] = [
  { id: 1, title: "FreshMart — 10% off grocery delivery", partner: "FreshMart", instructions: "Use code BUILDSYNC10 · Expires Apr 30", expiresAt: "Apr 30", active: true },
  { id: 2, title: "CleanCo Laundry — free first pickup", partner: "CleanCo", instructions: "Scan QR at front desk · No expiry", expiresAt: "", active: true },
  { id: 3, title: "PedalCity Bikes — $5/month discount", partner: "PedalCity Bikes", instructions: "Resident rate · Link account to redeem", expiresAt: "May 15", active: false },
  { id: 4, title: "CityGym — first month free for residents", partner: "CityGym", instructions: "Show building ID at front desk", expiresAt: "", active: true },
]

export default function ResidentDashboard({ user }: ResidentDashboardProps) {
  const { t } = useTranslation()
  const announcements = [
    { id: 1, title: t("poolMaintenanceSchedule", "Pool Maintenance Schedule"), content: t("poolClosedMsg", "The pool will be closed March 20-22 for annual maintenance."), date: t("today", "Today"), priority: "info" },
    { id: 2, title: t("fireDrillScheduled", "Fire Drill Scheduled"), content: t("fireDrillMsg", "Building-wide fire drill on March 25th at 10:00 AM."), date: t("yesterday", "Yesterday"), priority: "important" },
    { id: 3, title: t("newGymEquipment", "New Gym Equipment"), content: t("newGymMsg", "New cardio equipment has been installed in the fitness center."), date: "Mar 15", priority: "info" },
  ]

  const maintenanceRequests = [
    { id: 1, issue: "Dishwasher not draining properly", status: "in_progress", submitted: "Mar 16", eta: "Mar 19" },
    { id: 2, issue: "Bathroom exhaust fan noisy", status: "scheduled", submitted: "Mar 10", eta: "Mar 21" },
  ]

  const packages = [
    { id: 1, carrier: "Amazon", trackingEnd: "...4829", delivered: "Today 2:30 PM", status: "ready", locker: "Locker 12" },
    { id: 2, carrier: "FedEx", trackingEnd: "...7821", delivered: "Yesterday", status: "ready", locker: "Locker 5" },
  ]

  const bulletinPosts = [
    { author: "Sarah M.", unit: "Unit 503", content: "Anyone interested in forming a book club? Looking for 5-10 people.", time: "3h ago", replies: 8 },
    { author: "Mike R.", unit: "Unit 812", content: "Found a set of keys near the mailroom. Contact front desk.", time: "1d ago", replies: 2 },
  ]

  const [activeTab, setActiveTab] = useState<"home" | "amenities" | "maintenance" | "community" | "marketplace" | "governance">("home")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingAmenity, setBookingAmenity] = useState("")
  const [bookingNonce, setBookingNonce] = useState("")
  const [bookingStartedAt, setBookingStartedAt] = useState(0)
  const [bookingTrap, setBookingTrap] = useState("")
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)
  const [bookingStatus, setBookingStatus] = useState("")
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const amenities = amenityStore
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(fallbackMarketplaceListings)
  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(false)
  const [marketplaceStatus, setMarketplaceStatus] = useState("")
  const [marketplaceFilter, setMarketplaceFilter] = useState<"All" | ListingCategory>("All")
  const [showPostModal, setShowPostModal] = useState(false)
  const [isPostingListing, setIsPostingListing] = useState(false)
  const [postCategory, setPostCategory] = useState<ListingCategory>("For Sale")
  const [postTitle, setPostTitle] = useState("")
  const [postDescription, setPostDescription] = useState("")
  const [postPrice, setPostPrice] = useState("")
  const [postIsFree, setPostIsFree] = useState(false)
  const [postContact, setPostContact] = useState<"in_app" | "show_email" | "show_phone">("in_app")
  const [postError, setPostError] = useState("")

  useEffect(() => {
    let active = true

    async function loadBookings() {
      try {
        const response = await fetch(`/api/amenities/bookings?userId=${encodeURIComponent(user.id)}`, { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as { bookings?: Booking[] }
        if (!active || !Array.isArray(payload.bookings)) return
        setMyBookings(payload.bookings)
      } catch {
        // Keep current values when API is unavailable.
      }
    }

    void loadBookings()
    return () => {
      active = false
    }
  }, [user.id])

  async function startBooking(amenityId: string) {
    setBookingStatus("")
    setBookingAmenity(amenityId)
    setBookingStartedAt(Date.now())
    setBookingTrap("")

    try {
      const response = await fetch(`/api/amenities/bookings?mode=challenge&amenityId=${encodeURIComponent(amenityId)}`, { cache: "no-store" })
      if (!response.ok) {
        setBookingNonce("")
        setBookingStatus("Unable to initialize secure booking. Please retry.")
        return
      }
      const payload = (await response.json()) as { nonce?: string }
      setBookingNonce(payload.nonce || "")
    } catch {
      setBookingNonce("")
      setBookingStatus("Unable to initialize secure booking. Please retry.")
    }
  }

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault()
    if (!bookingAmenity || !bookingNonce) {
      setBookingStatus("Secure booking challenge missing. Please reopen booking form.")
      return
    }

    setIsBookingSubmitting(true)
    try {
      const response = await fetch("/api/amenities/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amenityId: bookingAmenity,
          userId: user.id,
          date: bookingDate,
          time: bookingTime,
          nonce: bookingNonce,
          submittedAt: bookingStartedAt,
          website: bookingTrap,
        }),
      })

      const payload = (await response.json()) as { error?: string; booking?: Booking }

      if (!response.ok || !payload.booking) {
        setBookingStatus(payload.error || "Booking was rejected. Please retry.")
        return
      }

      setMyBookings((prev) => [payload.booking as Booking, ...prev])
      setBookingStatus("Booking submitted successfully.")
      setBookingAmenity("")
      setBookingDate("")
      setBookingTime("")
      setBookingNonce("")
      setBookingStartedAt(0)
      setBookingTrap("")
    } catch {
      setBookingStatus("Booking submission failed. Please retry.")
    } finally {
      setIsBookingSubmitting(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadMarketplaceListings() {
      setIsMarketplaceLoading(true)
      setMarketplaceStatus("")
      try {
        const response = await fetch("/api/marketplace?limit=100", { cache: "no-store" })
        if (!response.ok) throw new Error("Unable to load marketplace listings")
        const payload = (await response.json()) as { listings?: MarketplaceListing[] }
        if (!active) return
        if (Array.isArray(payload.listings)) setMarketplaceListings(payload.listings)
      } catch {
        setMarketplaceStatus("Marketplace API unavailable. Showing local fallback listings.")
        setMarketplaceListings(fallbackMarketplaceListings)
      } finally {
        if (active) setIsMarketplaceLoading(false)
      }
    }

    void loadMarketplaceListings()
    return () => { active = false }
  }, [])

  async function submitMarketplaceListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!postTitle.trim()) { setPostError("Title is required."); return }
    if (!postDescription.trim()) { setPostError("Description is required."); return }
    if (!postIsFree && !postPrice.trim()) { setPostError("Enter a price or mark as free."); return }

    setIsPostingListing(true)
    setPostError("")

    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: postCategory,
          title: postTitle.trim(),
          description: postDescription.trim(),
          price: postIsFree ? null : postPrice.trim(),
          isFree: postIsFree,
          contactPreference: postContact,
          postedByUserId: user.id,
          postedByName: user.name,
          suite: user.unit || "Unassigned",
        }),
      })

      const payload = (await response.json()) as { error?: string; listing?: MarketplaceListing }
      if (!response.ok || !payload.listing) {
        setPostError(payload.error || "Unable to submit listing. Please try again.")
        return
      }

      setMarketplaceListings((prev) => [payload.listing as MarketplaceListing, ...prev])
      setShowPostModal(false)
      setPostTitle("")
      setPostDescription("")
      setPostPrice("")
      setPostIsFree(false)
      setPostContact("in_app")
      setPostCategory("For Sale")
      setMarketplaceStatus("Listing submitted successfully.")
    } catch {
      setPostError("Unable to submit listing. Please try again.")
    } finally {
      setIsPostingListing(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <div className="p-6 md:p-8">
          {/* Welcome section */}
          <div className="mb-6">
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
              <ScrambleText text={t("residentPortal", "RESIDENT PORTAL")} duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {t("welcomeHome", "Welcome home, {{name}}. Manage your unit, book amenities, and stay connected.", { name: user.name })}
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mb-8 border-b border-border/40">
            {[
              { id: "home", label: t("overview", "Overview") },
              { id: "amenities", label: t("amenities", "Amenities") },
              { id: "maintenance", label: t("requests", "Requests") },
              { id: "community", label: t("community", "Community") },
              { id: "marketplace", label: t("marketplace", "Marketplace") },
              { id: "governance", label: t("governance", "Governance") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? "text-accent border-b-2 border-accent -mb-px"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "home" && (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("packages", "Packages")}</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-accent">{packages.length}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{t("readyForPickup", "Ready for pickup")}</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("myBookings", "My Bookings")}</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">{myBookings.length}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{t("upcomingReservations", "Upcoming reservations")}</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("openRequests", "Open Requests")}</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">{maintenanceRequests.length}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{t("inProgress", "In progress")}</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("parking", "Parking")}</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-green-500">P2-045</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{t("yourAssignedSpot", "Your assigned spot")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Announcements */}
                <div className="lg:col-span-2 border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">{t("announcements", "ANNOUNCEMENTS")}</h2>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className={`border-l-2 pl-4 py-2 ${
                        announcement.priority === "important" ? "border-accent" : "border-border"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-xs text-foreground">{announcement.title}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">{announcement.date}</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packages */}
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">{t("myPackages", "MY PACKAGES")}</h2>
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border border-accent/30 bg-accent/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-mono text-xs text-foreground">{pkg.carrier}</p>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 font-mono text-[10px] uppercase">
                            {pkg.status}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{t("tracking", "Tracking")}: {pkg.trackingEnd}</p>
                        <p className="font-mono text-[10px] text-accent mt-2">{pkg.locker}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* My Bookings */}
              <div className="mt-6 border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">{t("myAmenityBookings", "MY AMENITY BOOKINGS")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBookings.length === 0 && (
                    <p className="font-mono text-xs text-muted-foreground">{t("noBookingsYet", "No bookings yet.")}</p>
                  )}
                  {myBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between border border-border/30 p-4">
                      <div>
                        <p className="font-mono text-xs text-foreground">{t("amenity", "Amenity")}: {booking.amenityId}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{booking.date} • {booking.time}</p>
                      </div>
                      <span className={`px-2 py-1 font-mono text-[10px] uppercase ${
                        booking.status === "approved" ? "bg-green-500/20 text-green-400" :
                        booking.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {activeTab === "amenities" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="border border-border/40 bg-card/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">{amenity.name}</h3>
                      <span className={`h-2 w-2 rounded-full ${
                        amenity.status === "available" ? "bg-green-500" :
                        amenity.status === "maintenance" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                    </div>
                    <button
                      disabled={amenity.status !== "available"}
                      className="w-full py-2 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        void startBooking(amenity.id)
                      }}
                    >
                      {amenity.status === "maintenance" ? "Unavailable" : "Book Now"}
                    </button>
                  </div>
                ))}
              </div>
              {bookingAmenity && (
                <form
                  onSubmit={submitBooking}
                  className="border border-accent/30 bg-accent/5 p-4 mb-4"
                >
                  <h4 className="font-mono text-xs mb-2">{t("bookAmenity", "Book Amenity")}</h4>
                  <input
                    type="text"
                    value={bookingTrap}
                    onChange={e => setBookingTrap(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] opacity-0 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    required
                    className="border border-border px-2 py-1 mb-2 font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    placeholder="Time slot (e.g. 7:00 PM - 10:00 PM)"
                    required
                    className="border border-border px-2 py-1 mb-2 font-mono text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isBookingSubmitting || !bookingNonce}
                    className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isBookingSubmitting ? "Submitting..." : t("submit", "Submit")}
                  </button>
                  {bookingStatus && <p className="mt-2 font-mono text-xs text-accent">{bookingStatus}</p>}
                </form>
              )}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">{t("myRequests", "MY REQUESTS")}</h2>
                
              </div>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="border border-border/40 bg-card/30 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-sm text-foreground">{request.issue}</p>
                      <span className={`px-2 py-1 font-mono text-[10px] uppercase ${
                        request.status === "in_progress" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {request.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-mono text-[10px] text-muted-foreground">{t("submitted", "Submitted")}: {request.submitted}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{t("eta", "ETA")}: {request.eta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-6">
              <div className="border border-border/40 bg-card/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">{t("bulletinBoard", "BULLETIN BOARD")}</h2>
                  
                </div>
                <div className="space-y-4">
                  {bulletinPosts.map((post, index) => (
                    <div key={index} className="border border-border/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 bg-accent/20 flex items-center justify-center font-mono text-[10px] text-accent">
                            {post.author.charAt(0)}
                          </span>
                          <p className="font-mono text-xs text-foreground">{post.author}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">• {post.unit}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground mb-3">{post.content}</p>
                      <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                        {post.replies} {t("replies", "replies")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "marketplace" && (
            <div>
              <div className="mb-6">
                <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide">MARKETPLACE</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Buy, sell, and trade with your neighbors.{" "}
                  <span className="text-accent">All listings are visible only to verified residents.</span>
                </p>
                {marketplaceStatus && (
                  <p className="mt-2 font-mono text-[10px] text-accent">{marketplaceStatus}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {(["All", "For Sale", "Free / Giveaway", "Services", "Lost & Found", "Housing Swap"] as const).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setMarketplaceFilter(chip)}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                      marketplaceFilter === chip
                        ? "border-accent text-accent"
                        : "border-border/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-border/40 bg-card/30">
                  <div className="p-5 border-b border-border/30">
                    <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">RECENT LISTINGS</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {isMarketplaceLoading && (
                      <div className="p-6">
                        <p className="font-mono text-xs text-muted-foreground">Loading marketplace listings...</p>
                      </div>
                    )}
                    {marketplaceListings
                      .filter((l) => marketplaceFilter === "All" || l.category === marketplaceFilter)
                      .map((listing) => (
                        <div key={listing.id} className="flex items-start justify-between p-5 hover:bg-accent/5 transition-colors">
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{listing.category}</span>
                            <p className="mt-1 font-mono text-[13px] text-foreground leading-snug">{listing.title}</p>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{listing.suite} · {listing.posted}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-mono text-sm text-foreground font-semibold">
                              {listing.isFree ? "Free" : listing.price ?? "—"}
                            </p>
                            {listing.interests > 0 && (
                              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{listing.interests} interested</p>
                            )}
                            <button className="mt-2 px-2 py-1 border border-accent/40 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/10 transition-colors">
                              I&apos;m Interested
                            </button>
                          </div>
                        </div>
                      ))}
                    {marketplaceListings.filter((l) => marketplaceFilter === "All" || l.category === marketplaceFilter).length === 0 && !isMarketplaceLoading && (
                      <div className="p-6">
                        <p className="font-mono text-xs text-muted-foreground">No listings in this category yet.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border/30">
                    <button
                      onClick={() => { setShowPostModal(true); setPostError("") }}
                      className="w-full py-3 bg-accent font-mono text-[10px] uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors"
                    >
                      + Post a Listing
                    </button>
                  </div>
                </div>
                <div className="border border-border/40 bg-card/30">
                  <div className="p-5 border-b border-border/30">
                    <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">BUILDING DEALS &amp; PERKS</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {buildingDeals.map((deal) => (
                      <div key={deal.id} className="flex items-start justify-between p-5">
                        <div className="flex-1 min-w-0 pr-4">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Partner Offer</span>
                          <p className="mt-1 font-mono text-[13px] text-foreground leading-snug">{deal.title}</p>
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{deal.instructions}</p>
                          {deal.expiresAt && (
                            <p className="mt-1 font-mono text-[10px] text-muted-foreground">Ends {deal.expiresAt}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {deal.active ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-accent/20 font-mono text-[10px] uppercase tracking-widest text-accent">Active</span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full bg-border/40 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Expired</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border/30">
                    <button className="w-full py-3 border border-accent/40 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/10 transition-colors">
                      Suggest a Partner →
                    </button>
                  </div>
                </div>
              </div>
              {showPostModal && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Post a listing"
                >
                  <div className="bg-background border border-border/60 w-full max-w-lg mx-4 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-[var(--font-bebas)] text-xl tracking-wide">POST A LISTING</h3>
                      <button
                        onClick={() => setShowPostModal(false)}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                        aria-label="Close modal"
                      >
                        ✕
                      </button>
                    </div>
                    <form onSubmit={submitMarketplaceListing} className="space-y-4">
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Category</span>
                        <select
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value as ListingCategory)}
                          className="mt-1 w-full border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground"
                        >
                          {(["For Sale", "Free / Giveaway", "Services", "Lost & Found", "Housing Swap"] as const).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="e.g. IKEA desk, moving boxes…"
                          className="mt-1 w-full border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50"
                          maxLength={80}
                        />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description</span>
                        <textarea
                          value={postDescription}
                          onChange={(e) => setPostDescription(e.target.value)}
                          placeholder="Condition, dimensions, pick-up details…"
                          rows={3}
                          className="mt-1 w-full border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 resize-none"
                          maxLength={400}
                        />
                      </label>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price</span>
                        <div className="mt-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={postIsFree ? "" : postPrice}
                            onChange={(e) => setPostPrice(e.target.value)}
                            disabled={postIsFree}
                            placeholder="$0.00"
                            className="flex-1 border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 disabled:opacity-40"
                          />
                          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={postIsFree}
                              onChange={(e) => setPostIsFree(e.target.checked)}
                              className="accent-accent"
                            />
                            Free
                          </label>
                        </div>
                      </div>
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Contact preference</span>
                        <select
                          value={postContact}
                          onChange={(e) => setPostContact(e.target.value as typeof postContact)}
                          className="mt-1 w-full border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground"
                        >
                          <option value="in_app">In-app message only</option>
                          <option value="show_email">Show my email</option>
                          <option value="show_phone">Show my phone</option>
                        </select>
                      </label>
                      {postError && (
                        <p className="font-mono text-[10px] text-accent">{postError}</p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isPostingListing}
                          className="flex-1 py-3 bg-accent font-mono text-[10px] uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors"
                        >
                          {isPostingListing ? "Submitting..." : "Submit Listing"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPostModal(false)}
                          className="px-6 py-3 border border-border/40 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "governance" && (
            <div>
              <GovernancePanel />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}