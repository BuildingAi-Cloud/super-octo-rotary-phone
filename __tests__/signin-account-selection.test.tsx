/** @jest-environment jsdom */

import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import SignInPage from "@/app/signin/page"

const mockPush = jest.fn()
const mockUseAuth = jest.fn()
const mockSignIn = jest.fn()
const mockSwitchRole = jest.fn()
const mockRequestPasswordResetChallenge = jest.fn()
const mockResetPasswordWithSecondFactor = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockUseAuth(),
  getRoleDisplayName: (role: string) => role.replaceAll("_", " "),
}))

jest.mock("@/components/animated-noise", () => ({
  AnimatedNoise: () => null,
}))

jest.mock("@/components/scramble-text", () => ({
  ScrambleText: ({ text }: { text: string }) => <>{text}</>,
  ScrambleTextOnHover: ({ text }: { text: string }) => <>{text}</>,
}))

jest.mock("@/components/bitmap-chevron", () => ({
  BitmapChevron: () => null,
}))

describe("signin account selection", () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockUseAuth.mockReset()
    mockSignIn.mockReset()
    mockSwitchRole.mockReset()
    mockRequestPasswordResetChallenge.mockReset()
    mockResetPasswordWithSecondFactor.mockReset()
    localStorage.clear()

    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      requestPasswordResetChallenge: mockRequestPasswordResetChallenge,
      resetPasswordWithSecondFactor: mockResetPasswordWithSecondFactor,
      switchRole: mockSwitchRole,
      availableRoles: ["admin", "building_manager"],
      user: null,
      isLoading: false,
    })
  })

  it("shows account selection step after successful multi-role signin", async () => {
    mockSignIn.mockImplementation(async () => {
      localStorage.setItem(
        "buildsync_user",
        JSON.stringify({
          role: "admin",
          accessRoles: ["admin", "building_manager"],
        }),
      )
      return { success: true }
    })

    render(<SignInPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test_all_access@example.com" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.queryByText("Select Account")).not.toBeNull()
    })

    expect(mockPush).not.toHaveBeenCalledWith("/dashboard")

    fireEvent.change(screen.getByLabelText("Account Role"), { target: { value: "building_manager" } })
    fireEvent.click(screen.getByRole("button", { name: "Continue to Dashboard" }))

    expect(mockSwitchRole).toHaveBeenCalledWith("building_manager")
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })

  it("shows account selection step for single-role signin before dashboard", async () => {
    mockSignIn.mockImplementation(async () => {
      localStorage.setItem(
        "buildsync_user",
        JSON.stringify({
          role: "admin",
          accessRoles: ["admin"],
        }),
      )
      return { success: true }
    })

    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      requestPasswordResetChallenge: mockRequestPasswordResetChallenge,
      resetPasswordWithSecondFactor: mockResetPasswordWithSecondFactor,
      switchRole: mockSwitchRole,
      availableRoles: ["admin"],
      user: null,
      isLoading: false,
    })

    render(<SignInPage />)

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "admin@example.com" } })
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "12345678" } })
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }))

    await waitFor(() => {
      expect(screen.queryByText("Select Account")).not.toBeNull()
    })

    expect(mockPush).not.toHaveBeenCalledWith("/dashboard")

    fireEvent.click(screen.getByRole("button", { name: "Continue to Dashboard" }))

    expect(mockSwitchRole).toHaveBeenCalledWith("admin")
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })
})
