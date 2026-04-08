"use client"

import { useEffect, useMemo, useState } from "react"
import { type User } from "@/lib/auth-context"
import { amenityStore, type Booking } from "@/lib/amenity-store"
import { getLeaseProfileForUser } from "@/lib/lease-management-store"
import { resolveTenantPaymentVisibility, type PaymentMethod, type PaymentSchedule, type TenantLeaseProfile } from "@/lib/tenant-portal-config"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"

interface TenantDashboardProps {
  user: User
}

const fallbackLeaseInfo: TenantLeaseProfile = {
  unit: "Unassigned",
  building: "Portfolio Pending",
  buildingType: "rental_tower",
  startDate: "Not assigned",
  endDate: "Not assigned",
  monthlyRent: 0,
  status: "pending",
  paymentInstructions: "Your lease details have not been mapped to a unit yet. Contact the property team.",
  paymentContact: "Leasing office",
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  credit_card: "Credit Card",
  e_transfer: "E-Transfer",
  offline: "Offline",
}

const paymentScheduleLabel: Record<PaymentSchedule, string> = {
  monthly: "Monthly",
  biweekly: "Bi-Weekly",
  on_invoice: "On Invoice",
  custom: "Custom",
}

const serviceRequests = [
  { id: 1, type: "Maintenance", issue: "AC unit making noise", status: "scheduled", submitted: "Mar 15", scheduledDate: "Mar 20" },
  { id: 2, type: "Question", issue: "Parking permit renewal inquiry", status: "resolved", submitted: "Mar 10", resolvedDate: "Mar 11" },
]

const documents = [
  { name: "Lease Agreement", type: "PDF", date: "Jan 1, 2025", size: "2.4 MB" },
  { name: "Move-in Inspection", type: "PDF", date: "Jan 1, 2025", size: "1.1 MB" },
  { name: "Building Rules & Policies", type: "PDF", date: "Jan 1, 2025", size: "856 KB" },
  { name: "Parking Permit", type: "PDF", date: "Jan 1, 2025", size: "245 KB" },
]

const announcements = [
  { title: "Rent Payment Reminder", content: "Your next rent payment of $2,850 is due on April 1st.", date: "Today", priority: "reminder" },
  { title: "Building Maintenance", content: "Annual HVAC inspection scheduled for March 25th.", date: "Mar 14", priority: "info" },
  { title: "Resident Mixer", content: "Join the rooftop networking mixer this Friday at 6:30 PM.", date: "Mar 12", priority: "community" },
]

const communityPosts = [
  { author: "Leasing Office", tag: "Event", content: "Spring tenant social is open for RSVPs. Refreshments provided.", time: "2h ago", replies: 12 },
  { author: "Suite 318", tag: "Question", content: "Has anyone used the guest suite recently? Looking for feedback before I book.", time: "6h ago", replies: 4 },
  { author: "Building Team", tag: "Update", content: "Parcel lockers will be upgraded next week. Pickup access remains unchanged.", time: "1d ago", replies: 1 },
]

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

const marketplaceListings: MarketplaceListing[] = [
  { id: 1, category: "For Sale", title: "IKEA KALLAX shelf unit — white, 4×2", suite: "Suite 204", posted: "2h ago", price: "$45", isFree: false, interests: 3 },
  { id: 2, category: "Free / Giveaway", title: "Box of moving supplies — bubble wrap & tape rolls", suite: "Suite 512", posted: "5h ago", price: null, isFree: true, interests: 7 },
  { id: 3, category: "Services", title: "Dog walking — mornings, $20/walk", suite: "Suite 318", posted: "1d ago", price: "$20/walk", isFree: false, interests: 2 },
  { id: 4, category: "Lost & Found", title: "Found: Set of keys near elevator bank, Floor 3", suite: "Suite 301", posted: "3h ago", price: null, isFree: false, interests: 0 },
  { id: 5, category: "For Sale", title: "Standing desk — electric, adjustable height", suite: "Suite 710", posted: "2d ago", price: "$220", isFree: false, interests: 5 },
  { id: 6, category: "Housing Swap", title: "Seeking 1BR swap for June — have 2BR available", suite: "Suite 408", posted: "4d ago", price: null, isFree: false, interests: 1 },
]

const buildingDeals: BuildingDeal[] = [
  { id: 1, title: "20% off at Pressed Juicery", partner: "Pressed Juicery", instructions: "Show your resident ID at checkout. Valid in-store only.", expiresAt: "May 31, 2025", active: true },
  { id: 2, title: "Free first month — GoodLife Fitness", partner: "GoodLife Fitness", instructions: "Mention promo code BUILDSYNC at sign-up or front desk.", expiresAt: "Apr 30, 2025", active: true },
  { id: 3, title: "$10 off first FreshPrep delivery", partner: "FreshPrep", instructions: "Apply code BSYNC10 at checkout on freshprep.ca.", expiresAt: "Mar 31, 2025", active: false },
]

export function TenantDashboard({ user }: TenantDashboardProps) {
  const leaseInfo = useMemo(() => getLeaseProfileForUser(user) || fallbackLeaseInfo, [user])
  const paymentVisibility = resolveTenantPaymentVisibility(leaseInfo)
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "community", label: "Community" },
    { id: "marketplace", label: "Marketplace" },
    ...(paymentVisibility.showPaymentsTab ? [{ id: "payments", label: paymentVisibility.canManagePaymentSetup ? "Payments & Setup" : "Payments" }] : []),
    { id: "requests", label: "Requests" },
    { id: "documents", label: "Documents" },
  ] as const
  const [activeTab, setActiveTab] = useState<"overview" | "amenities" | "community" | "marketplace" | "payments" | "requests" | "documents">("overview")
  const [bookingAmenity, setBookingAmenity] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingNonce, setBookingNonce] = useState("")
  const [bookingStartedAt, setBookingStartedAt] = useState(0)
  const [bookingTrap, setBookingTrap] = useState("")
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false)
  const [bookingStatus, setBookingStatus] = useState("")
  const amenities = amenityStore
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [marketplaceFilter, setMarketplaceFilter] = useState<"All" | ListingCategory>("All")
  const [showPostModal, setShowPostModal] = useState(false)
  const [postCategory, setPostCategory] = useState<ListingCategory>("For Sale")
  const [postTitle, setPostTitle] = useState("")
  const [postDescription, setPostDescription] = useState("")
  const [postPrice, setPostPrice] = useState("")
  const [postIsFree, setPostIsFree] = useState(false)
  const [postContact, setPostContact] = useState<"in_app" | "show_email" | "show_phone">("in_app")
  const [postError, setPostError] = useState("")
  const paymentHistory = leaseInfo.paymentHistory || []
  const commercialBilling = leaseInfo.commercialBilling
  const showCommercialBilling = leaseInfo.buildingType === "commercial" || Boolean(commercialBilling)
  const paymentStatusLabel = paymentVisibility.canMakePortalPayment ? `${paymentMethodLabel[paymentVisibility.primaryPaymentMethod]} available` : "Paid directly to owner"
  const paymentActionLabel = paymentVisibility.canMakePortalPayment ? "Pay Rent" : paymentVisibility.canManagePaymentSetup ? "Payment Setup" : "Payment Instructions"
  const hasMappedLease = leaseInfo.unit !== fallbackLeaseInfo.unit

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

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <div className="p-6 md:p-8">
          {/* Welcome section */}
          <div className="mb-6">
            <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
              <ScrambleText text="TENANT PORTAL" duration={0.8} />
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Welcome, {user.name}. Manage your lease, book amenities, and stay up to date with building announcements.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mb-8 border-b border-border/40">
            {tabs.map((tab) => (
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

          {activeTab === "overview" && (
            <>
              {/* Lease summary card */}
              <div className="border border-accent/30 bg-accent/5 p-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your Unit</span>
                    <h2 className="font-[var(--font-bebas)] text-3xl tracking-wide text-accent">{leaseInfo.unit}</h2>
                    <p className="font-mono text-xs text-muted-foreground">{leaseInfo.building}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 font-mono text-[10px] uppercase tracking-widest">
                    {leaseInfo.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-accent/20">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Lease Start</span>
                    <p className="font-mono text-xs text-foreground">{leaseInfo.startDate}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Lease End</span>
                    <p className="font-mono text-xs text-foreground">{leaseInfo.endDate}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Monthly Rent</span>
                    <p className="font-mono text-xs text-foreground">${leaseInfo.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground">Payment Handling</span>
                    <p className="font-mono text-xs text-accent">{paymentVisibility.paymentSummary}</p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Billing Setup</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-accent">{paymentVisibility.canMakePortalPayment ? (leaseInfo.daysUntilDue ?? "--") : paymentVisibility.canManagePaymentSetup ? "Flex" : "Owner"}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{paymentVisibility.canMakePortalPayment ? "days" : paymentVisibility.paymentContact}</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{paymentVisibility.canMakePortalPayment ? "Amount Due" : "Payment Route"}</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">{paymentVisibility.canMakePortalPayment ? `$${leaseInfo.monthlyRent.toLocaleString()}` : paymentVisibility.canManagePaymentSetup ? "Hybrid" : "Direct"}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{paymentStatusLabel}</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Open Requests</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl">1</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Scheduled</p>
                </div>
                <div className="border border-border/40 bg-card/30 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Amenity Bookings</span>
                  <p className="mt-2 font-[var(--font-bebas)] text-3xl text-green-500">{myBookings.length}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">Upcoming reservations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements */}
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">ANNOUNCEMENTS</h2>
                  <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                      <div key={index} className={`border-l-2 pl-4 py-2 ${
                        announcement.priority === "reminder" ? "border-accent" : "border-border"
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

                {/* Quick Actions */}
                <div className="border border-border/40 bg-card/30 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">QUICK ACTIONS</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={!hasMappedLease}
                      onClick={() => setActiveTab(paymentVisibility.showPaymentsTab ? "payments" : "documents")}
                      className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-mono text-xs text-foreground">{paymentActionLabel}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {paymentVisibility.canMakePortalPayment ? "Make a payment" : paymentVisibility.canManagePaymentSetup ? "Manage commercial payment options" : "View owner payment instructions"}
                      </p>
                    </button>
                    <button onClick={() => setActiveTab("requests")} className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">New Request</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Submit issue</p>
                    </button>
                    <button className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">View Lease</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Download PDF</p>
                    </button>
                    <button onClick={() => setActiveTab("amenities")} className="p-4 border border-border/40 hover:border-accent hover:bg-accent/5 transition-colors text-left">
                      <p className="font-mono text-xs text-foreground">Book Amenity</p>
                      <p className="font-mono text-[10px] text-muted-foreground">Reserve shared spaces</p>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 border border-border/40 bg-card/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">MY AMENITY BOOKINGS</h2>
                  <button type="button" onClick={() => setActiveTab("amenities")} className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                    Manage
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBookings.length === 0 && (
                    <p className="font-mono text-xs text-muted-foreground">No bookings yet.</p>
                  )}
                  {myBookings.map((booking, index) => (
                    <div key={index} className="flex items-center justify-between border border-border/30 p-4">
                      <div>
                        <p className="font-mono text-xs text-foreground">Amenity: {amenities.find((amenity) => amenity.id === booking.amenityId)?.name ?? booking.amenityId}</p>
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

              {!hasMappedLease && (
                <div className="mt-6 border border-yellow-500/30 bg-yellow-500/5 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-3">LEASE MAPPING PENDING</h2>
                  <p className="font-mono text-xs text-foreground">Your account is active, but it is not yet linked to a specific unit in the leasing system. Once management assigns your unit email mapping, lease and payment details will appear automatically.</p>
                </div>
              )}

              {paymentVisibility.paymentMethods.length > 0 && (
                <div className="mt-6 border border-border/40 bg-card/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">PAYMENT OPTIONS</h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Primary: {paymentMethodLabel[paymentVisibility.primaryPaymentMethod]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {paymentVisibility.paymentMethods.map((method) => (
                      <span key={method} className="px-3 py-1 border border-border/40 bg-background font-mono text-[10px] uppercase tracking-widest text-foreground">
                        {paymentMethodLabel[method]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showCommercialBilling && commercialBilling && (
                <div className="mt-6 border border-border/40 bg-card/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">COMMERCIAL BILLING</h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{paymentScheduleLabel[commercialBilling.paymentSchedule]}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Invoice Terms</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.invoiceTerms}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">PO Reference</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.purchaseOrderReference || "Not required"}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Billing Ref</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.billingReference || "Not set"}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Schedule</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{paymentScheduleLabel[commercialBilling.paymentSchedule]}</p>
                    </div>
                  </div>
                  {commercialBilling.paymentScheduleNotes && (
                    <div className="mt-4 border-t border-border/20 pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Schedule Notes</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.paymentScheduleNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {!paymentVisibility.canMakePortalPayment && (
                <div className="mt-6 border border-accent/30 bg-accent/5 p-6">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-3">PAYMENT HANDLING</h2>
                  <p className="font-mono text-xs text-foreground">{paymentVisibility.paymentInstructions}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Contact: {paymentVisibility.paymentContact}</p>
                </div>
              )}
            </>
          )}

          {activeTab === "amenities" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">AMENITY BOOKING</h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reserve shared spaces and services</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{amenities.length} amenities</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="border border-border/40 bg-card/30 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">{amenity.name}</h3>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        amenity.status === "available" ? "bg-green-500" :
                        amenity.status === "maintenance" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`} />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{amenity.policy === "auto_approve" ? "Auto approval" : "Manager approval"}</p>
                    <button
                      type="button"
                      disabled={amenity.status !== "available"}
                      onClick={() => {
                        void startBooking(amenity.id)
                      }}
                      className="w-full py-2 border border-accent bg-accent/10 font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {amenity.status === "maintenance" ? "Unavailable" : "Book Now"}
                    </button>
                  </div>
                ))}
              </div>

              {bookingAmenity && (
                <form
                  onSubmit={submitBooking}
                  className="border border-accent/30 bg-accent/5 p-4"
                >
                  <h4 className="font-mono text-xs mb-2">Book Amenity</h4>
                  <input
                    type="text"
                    value={bookingTrap}
                    onChange={(event) => setBookingTrap(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] opacity-0 pointer-events-none"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_auto] gap-2 items-start">
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(event) => setBookingDate(event.target.value)}
                      required
                      className="border border-border px-2 py-2 font-mono text-xs bg-background"
                    />
                    <input
                      type="text"
                      value={bookingTime}
                      onChange={(event) => setBookingTime(event.target.value)}
                      placeholder="Time slot (e.g. 7:00 PM - 10:00 PM)"
                      required
                      className="border border-border px-2 py-2 font-mono text-xs bg-background"
                    />
                    <button type="submit" className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase tracking-widest">
                      {isBookingSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                  {bookingStatus && <p className="mt-2 font-mono text-xs text-accent">{bookingStatus}</p>}
                </form>
              )}
            </div>
          )}

          {activeTab === "community" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">BUILDING ANNOUNCEMENTS</h2>
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                    <div key={index} className={`border-l-2 pl-4 py-2 ${announcement.priority === "reminder" ? "border-accent" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-mono text-xs text-foreground">{announcement.title}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">{announcement.date}</span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground">{announcement.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">COMMUNITY BOARD</h2>
                <div className="space-y-4">
                  {communityPosts.map((post, index) => (
                    <div key={index} className="border border-border/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-mono text-xs text-foreground">{post.author}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{post.tag}</p>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="font-mono text-[11px] text-foreground/80">{post.content}</p>
                      <p className="mt-3 font-mono text-[10px] text-muted-foreground">{post.replies} replies</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && paymentVisibility.showPaymentsTab && (
            <div className="space-y-6">
              {/* Payment action card */}
              <div className="border border-accent/30 bg-accent/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{paymentVisibility.canMakePortalPayment ? "Next Payment Due" : "Payment Arrangement"}</p>
                    <p className="font-[var(--font-bebas)] text-2xl text-accent">${leaseInfo.monthlyRent.toLocaleString()}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">Due {leaseInfo.nextPayment || "TBD"} • {paymentStatusLabel}</p>
                  </div>
                  {paymentVisibility.canMakePortalPayment ? (
                    <button className="px-6 py-3 bg-accent font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors">
                      {paymentVisibility.primaryPaymentMethod === "credit_card" ? "Pay by Card" : "Open Payment"}
                    </button>
                  ) : (
                    <button className="px-6 py-3 border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent/10 transition-colors">
                      View Instructions
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-border/40 bg-card/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">PAYMENT METHODS</h2>
                  {paymentVisibility.canManagePaymentSetup && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Setup enabled</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentVisibility.paymentMethods.map((method) => (
                    <div key={method} className="border border-border/30 p-4">
                      <p className="font-mono text-xs text-foreground">{paymentMethodLabel[method]}</p>
                      <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                        {method === "credit_card" ? "Use the portal checkout for card payments." : method === "e_transfer" ? "Send funds using the approved e-transfer details for this unit." : "Coordinate offline settlement with the unit owner or accounts team."}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-border/20 pt-4">
                  <p className="font-mono text-xs text-foreground">{paymentVisibility.paymentInstructions}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Contact: {paymentVisibility.paymentContact}</p>
                </div>
              </div>

              {showCommercialBilling && commercialBilling && (
                <div className="border border-border/40 bg-card/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">INVOICING & TERMS</h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{paymentScheduleLabel[commercialBilling.paymentSchedule]}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Invoice Terms</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.invoiceTerms}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">PO Reference</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.purchaseOrderReference || "Not required"}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Billing Ref</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.billingReference || "Not set"}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Schedule</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{paymentScheduleLabel[commercialBilling.paymentSchedule]}</p>
                    </div>
                  </div>
                  {commercialBilling.paymentScheduleNotes && (
                    <div className="mt-4 border-t border-border/20 pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Payment Override Notes</p>
                      <p className="mt-1 font-mono text-xs text-foreground">{commercialBilling.paymentScheduleNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment history */}
              {paymentVisibility.canMakePortalPayment && (
              <div className="border border-border/40 bg-card/30 p-6">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">PAYMENT HISTORY</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Period</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Amount</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Date</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Method</th>
                        <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr key={index} className="border-b border-border/20">
                          <td className="py-3 font-mono text-xs text-foreground">{payment.period}</td>
                          <td className="py-3 font-mono text-xs text-foreground">${payment.amount.toLocaleString()}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{payment.date}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{paymentMethodLabel[payment.method]}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 font-mono text-[10px] uppercase ${
                              payment.status === "paid"
                                ? "bg-green-500/20 text-green-400"
                                : payment.status === "scheduled"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : payment.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-border/40 text-muted-foreground"
                            }`}>
                              {payment.status}
                            </span>
                            {payment.note && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{payment.note}</p>}
                          </td>
                        </tr>
                      ))}
                      {paymentHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 font-mono text-xs text-muted-foreground">No payment history recorded for this unit yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">SERVICE REQUESTS</h2>
                <button className="px-4 py-2 bg-accent font-mono text-[10px] uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors">
                  + New Request
                </button>
              </div>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="border border-border/40 bg-card/30 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-muted font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {request.type}
                        </span>
                        <p className="font-mono text-sm text-foreground">{request.issue}</p>
                      </div>
                      <span className={`px-2 py-1 font-mono text-[10px] uppercase ${
                        request.status === "scheduled" ? "bg-blue-500/20 text-blue-400" : 
                        request.status === "resolved" ? "bg-green-500/20 text-green-400" : 
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-mono text-[10px] text-muted-foreground">Submitted: {request.submitted}</p>
                      {request.scheduledDate && (
                        <p className="font-mono text-[10px] text-accent">Scheduled: {request.scheduledDate}</p>
                      )}
                      {request.resolvedDate && (
                        <p className="font-mono text-[10px] text-green-400">Resolved: {request.resolvedDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "marketplace" && (
            <div>
              {/* Page header */}
              <div className="mb-6">
                <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide">MARKETPLACE</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Buy, sell, and trade with your neighbors.{" "}
                  <span className="text-accent">All listings are visible only to verified residents.</span>
                </p>
              </div>

              {/* Filter chips */}
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

              {/* Two-panel layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT PANEL — Recent Listings */}
                <div className="border border-border/40 bg-card/30">
                  <div className="p-5 border-b border-border/30">
                    <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">RECENT LISTINGS</h3>
                  </div>
                  <div className="divide-y divide-border/20">
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
                    {marketplaceListings.filter((l) => marketplaceFilter === "All" || l.category === marketplaceFilter).length === 0 && (
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

                {/* RIGHT PANEL — Building Deals & Perks */}
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
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Expires {deal.expiresAt}</p>
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

              {/* Post a Listing Modal */}
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
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!postTitle.trim()) { setPostError("Title is required."); return }
                        if (!postDescription.trim()) { setPostError("Description is required."); return }
                        if (!postIsFree && !postPrice.trim()) { setPostError("Enter a price or mark as free."); return }
                        setPostError("")
                        setShowPostModal(false)
                        setPostTitle("")
                        setPostDescription("")
                        setPostPrice("")
                        setPostIsFree(false)
                        setPostContact("in_app")
                        setPostCategory("For Sale")
                      }}
                      className="space-y-4"
                    >
                      {/* Category */}
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
                      {/* Title */}
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
                        <input
                          type="text"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="e.g. IKEA desk, brown leather sofa…"
                          className="mt-1 w-full border border-border/40 bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50"
                          maxLength={80}
                        />
                      </label>
                      {/* Description */}
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
                      {/* Price / Free toggle */}
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
                      {/* Contact preference */}
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
                      {/* Error */}
                      {postError && (
                        <p className="font-mono text-[10px] text-accent">{postError}</p>
                      )}
                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-accent font-mono text-[10px] uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-colors"
                        >
                          Submit Listing
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

          {activeTab === "documents" && (
            <div className="border border-border/40 bg-card/30 p-6">
              <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">MY DOCUMENTS</h2>
              {!paymentVisibility.canMakePortalPayment && (
                <div className="mb-4 border border-accent/30 bg-accent/5 p-4">
                  <p className="font-mono text-xs text-foreground">{paymentVisibility.paymentInstructions}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Payment contact: {paymentVisibility.paymentContact}</p>
                </div>
              )}
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between border border-border/30 p-4 hover:border-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="h-10 w-10 bg-accent/10 flex items-center justify-center font-mono text-[10px] text-accent uppercase">
                        {doc.type}
                      </span>
                      <div>
                        <p className="font-mono text-xs text-foreground">{doc.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
