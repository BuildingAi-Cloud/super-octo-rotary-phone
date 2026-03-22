
"use client";
import { useTranslation } from "react-i18next"

import { useState } from "react"
import { amenityStore, addBooking, getBookingsForUser } from "@/lib/amenity-store"
import { type User } from "@/lib/auth-context"
import { DashboardHeader } from "./dashboard-header"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText } from "@/components/scramble-text"


interface ResidentDashboardProps {
  user: User
}

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

  const [activeTab, setActiveTab] = useState<"home" | "amenities" | "maintenance" | "community">("home")
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingAmenity, setBookingAmenity] = useState("")
  const [bookingStatus, setBookingStatus] = useState("")
  const amenities = amenityStore
  const myBookings = getBookingsForUser(user.id)

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedNoise opacity={0.02} />
      <div className="grid-bg fixed inset-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10">
        <DashboardHeader user={user} />

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
                      onClick={() => setBookingAmenity(amenity.id)}
                    >
                      {amenity.status === "maintenance" ? "Unavailable" : "Book Now"}
                    </button>
                  </div>
                ))}
              </div>
              {bookingAmenity && (
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    addBooking({
                      id: crypto.randomUUID(),
                      amenityId: bookingAmenity,
                      userId: user.id,
                      date: bookingDate,
                      time: bookingTime,
                      status: "pending"
                    })
                    setBookingStatus("Booking submitted and pending approval.")
                    setBookingAmenity("")
                    setBookingDate("")
                    setBookingTime("")
                  }}
                  className="border border-accent/30 bg-accent/5 p-4 mb-4"
                >
                  <h4 className="font-mono text-xs mb-2">{t("bookAmenity", "Book Amenity")}</h4>
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
                  <button type="submit" className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase tracking-widest">{t("submit", "Submit")}</button>
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
        </div>
      </div>
    </main>
  )
}
