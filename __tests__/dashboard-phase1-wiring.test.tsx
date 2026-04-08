/** @jest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import DashboardPage from "@/app/dashboard/page"

const mockPush = jest.fn()
const mockUseAuth = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock("@/components/dashboards/facility-manager-dashboard", () => ({
  FacilityManagerDashboard: () => <div>facility-manager-dashboard</div>,
}))

jest.mock("@/components/dashboards/building-manager-dashboard", () => ({
  BuildingManagerDashboard: () => <div>building-manager-dashboard</div>,
}))

jest.mock("@/components/dashboards/building-owner-dashboard", () => ({
  BuildingOwnerDashboard: () => <div>building-owner-dashboard</div>,
}))

jest.mock("@/components/dashboards/property-manager-dashboard", () => ({
  PropertyManagerDashboard: () => <div>property-manager-dashboard</div>,
}))

jest.mock("@/components/dashboards/resident-dashboard", () => ({
  __esModule: true,
  default: () => <div>resident-dashboard</div>,
}))

jest.mock("@/components/dashboards/tenant-dashboard", () => ({
  TenantDashboard: () => <div>tenant-dashboard</div>,
}))

jest.mock("@/components/dashboards/concierge-dashboard", () => ({
  __esModule: true,
  default: () => <div>concierge-dashboard</div>,
}))

jest.mock("@/components/dashboards/staff-dashboard", () => ({
  __esModule: true,
  default: () => <div>staff-dashboard</div>,
}))

jest.mock("@/components/dashboards/security-dashboard", () => ({
  __esModule: true,
  default: () => <div>security-dashboard</div>,
}))

jest.mock("@/components/dashboards/vendor-dashboard", () => ({
  __esModule: true,
  default: () => <div>vendor-dashboard</div>,
}))

jest.mock("@/components/dashboards/admin-dashboard", () => ({
  __esModule: true,
  default: () => <div>admin-dashboard</div>,
}))

jest.mock("@/components/dashboards/guest-dashboard", () => ({
  __esModule: true,
  default: () => <div>guest-dashboard</div>,
}))

jest.mock("@/components/animated-noise", () => ({
  AnimatedNoise: () => null,
}))

describe("dashboard phase 1 wiring", () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockUseAuth.mockReset()
  })

  it("redirects unauthenticated users to signin", async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin")
    })
  })

  it("renders facility manager dashboard", () => {
    mockUseAuth.mockReturnValue({ user: { role: "facility_manager" }, isLoading: false })

    render(<DashboardPage />)

    expect(screen.queryByText("facility-manager-dashboard")).not.toBeNull()
  })

  it("renders building manager dashboard", () => {
    mockUseAuth.mockReturnValue({ user: { role: "building_manager" }, isLoading: false })

    render(<DashboardPage />)

    expect(screen.queryByText("building-manager-dashboard")).not.toBeNull()
  })

  it("renders building owner dashboard", () => {
    mockUseAuth.mockReturnValue({ user: { role: "building_owner" }, isLoading: false })

    render(<DashboardPage />)

    expect(screen.queryByText("building-owner-dashboard")).not.toBeNull()
  })
})