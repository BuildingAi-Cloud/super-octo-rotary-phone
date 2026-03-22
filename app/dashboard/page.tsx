"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { FacilityManagerDashboard } from "@/components/dashboards/facility-manager-dashboard"
import { BuildingOwnerDashboard } from "@/components/dashboards/building-owner-dashboard"
import { PropertyManagerDashboard } from "@/components/dashboards/property-manager-dashboard"
import ResidentDashboard from "@/components/dashboards/resident-dashboard"
import { TenantDashboard } from "@/components/dashboards/tenant-dashboard"
// Add stubs for other roles
// import ConciergeDashboard from "@/components/dashboards/concierge-dashboard"
// import StaffDashboard from "@/components/dashboards/staff-dashboard"
// import SecurityDashboard from "@/components/dashboards/security-dashboard"
// import VendorDashboard from "@/components/dashboards/vendor-dashboard"
// import AdminDashboard from "@/components/dashboards/admin-dashboard"
import { AnimatedNoise } from "@/components/animated-noise"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <AnimatedNoise opacity={0.03} />
        <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
        <div className="relative z-10">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  // Render dashboard based on user role
  switch (user.role) {
    case "facility_manager":
      return <FacilityManagerDashboard user={user} />
    case "building_owner":
      return <BuildingOwnerDashboard user={user} />
    case "property_manager":
      return <PropertyManagerDashboard user={user} />
    case "resident":
      return <ResidentDashboard user={user} />
    case "tenant":
      return <TenantDashboard user={user} />
    // Uncomment and implement these as needed
    // case "concierge":
    //   return <ConciergeDashboard user={user} />
    // case "staff":
    //   return <StaffDashboard user={user} />
    // case "security":
    //   return <SecurityDashboard user={user} />
    // case "vendor":
    //   return <VendorDashboard user={user} />
    // case "admin":
    //   return <AdminDashboard user={user} />
    default:
      return (
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="text-muted-foreground">This platform does not yet support your user type. Please contact support or try again later.</p>
          </div>
        </main>
      );
  }
}
