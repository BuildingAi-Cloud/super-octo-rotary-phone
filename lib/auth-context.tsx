"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { logAudit } from "@/lib/audit"
import { getTenantAssignmentByEmail } from "@/lib/tenant-assignments"

export type UserRole =
  | "facility_manager"
  | "building_manager"
  | "building_owner"
  | "building_manager"
  | "property_manager"
  | "resident"
  | "tenant"
  | "concierge"
  | "staff"
  | "security"
  | "vendor"
  | "admin"
  | "guest"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  accessRoles?: UserRole[]
  company?: string
  buildingId?: string
  unit?: string
}

interface AuthContextType {
  user: User | null
  availableRoles: UserRole[]
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  requestPasswordResetChallenge: (
    email: string,
    method: "mfa_code" | "rsa_token",
  ) => Promise<{ success: boolean; error?: string; devCode?: string; devRsaToken?: string }>
  resetPasswordWithSecondFactor: (
    email: string,
    newPassword: string,
    factor: { method: "mfa_code" | "rsa_token"; mfaCode?: string; rsaToken?: string },
  ) => Promise<{ success: boolean; error?: string }>
  requestPasswordResetMfa: (email: string) => Promise<{ success: boolean; error?: string; devCode?: string }>
  resetPasswordWithMfa: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  requestPasswordResetChallenge: (
    email: string,
    method: "mfa_code" | "rsa_token",
  ) => Promise<{ success: boolean; error?: string; devCode?: string; devRsaToken?: string }>
  resetPasswordWithSecondFactor: (
    email: string,
    newPassword: string,
    payload: { method: "mfa_code" | "rsa_token"; mfaCode?: string; rsaToken?: string },
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  switchRole: (nextRole: UserRole) => void
}

interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MFA_RESET_STORE_KEY = "buildsync_mfa_password_reset"

const VALID_ROLES: UserRole[] = [
  "facility_manager",
  "building_manager",
  "building_owner",
  "property_manager",
  "resident",
  "tenant",
  "concierge",
  "staff",
  "security",
  "vendor",
  "admin",
  "guest",
]

// Every signed-in user always gets one active role plus an optional set of
// alternative access roles that can be switched to from the header.
function normalizeAccessRoles(userLike: Partial<User> | null | undefined): UserRole[] {
  const merged = [userLike?.role, ...(Array.isArray(userLike?.accessRoles) ? userLike.accessRoles : [])]
  return [...new Set(merged.filter((role): role is UserRole => Boolean(role) && VALID_ROLES.includes(role as UserRole)))]
}

// Stored auth payloads are normalized before use so role switching works even
// for older user records that were saved before multi-access support existed.
function sanitizeUser(userLike: User): User {
  return {
    ...userLike,
    accessRoles: normalizeAccessRoles(userLike),
  }
}

function applyTenantAssignment(userLike: User): User {
  if (userLike.role !== "tenant") {
    return userLike
  }

  const assignment = getTenantAssignmentByEmail(userLike.email)
  if (!assignment) {
    return userLike
  }

  return {
    ...userLike,
    unit: assignment.unit,
    buildingId: assignment.buildingId || userLike.buildingId,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])

  // Pre-populate dummy users for all roles (MVP style, no UI button)
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    const roles: UserRole[] = [...VALID_ROLES]
    let changed = false
    roles.forEach((role) => {
      const email = `test_${role}@example.com`
      const existingIndex = storedUsers.findIndex((u: User) => u.email === email)
      const defaultAccessRoles =
        role === "building_manager"
          ? ["building_manager", "property_manager"]
          : role === "building_owner"
            ? ["building_owner", "building_manager"]
            : role === "admin"
              ? ["admin", "building_owner", "building_manager"]
              : [role]

      if (existingIndex === -1) {
        // Seed demo accounts with representative multi-role access so the role
        // switcher can be tested without extra setup.
        storedUsers.push({
          id: crypto.randomUUID(),
          email,
          password: "12345678",
          rsaResetToken: `RSA-${role.toUpperCase()}-2026`,
          name: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role,
          accessRoles: defaultAccessRoles,
          company: "TestCo"
        })
        changed = true
      } else {
        const existingUser = storedUsers[existingIndex]
        const normalizedRoles = normalizeAccessRoles({ ...existingUser, role: existingUser.role, accessRoles: defaultAccessRoles })
        if (JSON.stringify(existingUser.accessRoles || []) !== JSON.stringify(normalizedRoles)) {
          storedUsers[existingIndex] = {
            ...existingUser,
            accessRoles: normalizedRoles,
          }
          changed = true
        }
        if (!existingUser.rsaResetToken) {
          storedUsers[existingIndex] = {
            ...storedUsers[existingIndex],
            rsaResetToken: `RSA-${role.toUpperCase()}-2026`,
          }
          changed = true
        }
      }
    })
    if (changed) {
      localStorage.setItem("buildsync_users", JSON.stringify(storedUsers))
    }
  }, [])

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("buildsync_user")

      if (storedUser) {
        // Rehydrate the active session and rebuild the list of switchable roles
        // from the same stored user object.
        const parsedUser = applyTenantAssignment(sanitizeUser(JSON.parse(storedUser)))
        setUser(parsedUser)
        setAvailableRoles(parsedUser.accessRoles || [parsedUser.role])
        localStorage.setItem("buildsync_user", JSON.stringify(parsedUser))
      }
    } catch {
      localStorage.removeItem("buildsync_user")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Demo authentication - in production, this would call an API
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    const foundUser = storedUsers.find((u: User & { password: string }) => u.email === email && u.password === password)
    
    if (foundUser) {
      // Sign-in writes the active role and the full access set so downstream UI
      // can decide whether to render a role switcher.
      const userWithoutPassword = applyTenantAssignment(sanitizeUser({ ...foundUser }))
      delete (userWithoutPassword as { password?: string }).password
      setUser(userWithoutPassword)
      setAvailableRoles(userWithoutPassword.accessRoles || [userWithoutPassword.role])
      localStorage.setItem("buildsync_user", JSON.stringify(userWithoutPassword))
      logAudit("signIn", { email }, email)
      return { success: true }
    }
    logAudit("signInFailed", { email }, email)
    return { success: false, error: "Invalid email or password" }
  }

  const requestPasswordResetChallenge = async (
    email: string,
    method: "mfa_code" | "rsa_token",
  ): Promise<{ success: boolean; error?: string; devCode?: string; devRsaToken?: string }> => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      return { success: false, error: "Email is required" }
    }

    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]") as Array<User & { password: string; rsaResetToken?: string }>
    const foundUser = storedUsers.find((entry) => entry.email.toLowerCase() === normalizedEmail)

    if (!foundUser) {
      logAudit("passwordResetRequestFailed", { email: normalizedEmail, reason: "user_not_found", method }, normalizedEmail)
      return { success: false, error: "No account found for this email" }
    }

    if (method === "rsa_token") {
      logAudit("passwordResetRsaRequested", { email: normalizedEmail }, normalizedEmail)
      return { success: true, devRsaToken: foundUser.rsaResetToken }
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const payload = {
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }

    localStorage.setItem(MFA_RESET_STORE_KEY, JSON.stringify(payload))
    logAudit("passwordResetMfaRequested", { email: normalizedEmail }, normalizedEmail)
    return { success: true, devCode: code }
  }

  const requestPasswordResetMfa = async (email: string): Promise<{ success: boolean; error?: string; devCode?: string }> => {
    const result = await requestPasswordResetChallenge(email, "mfa_code")
    return { success: result.success, error: result.error, devCode: result.devCode }
  }

  const resetPasswordWithSecondFactor = async (
    email: string,
    newPassword: string,
    factor: { method: "mfa_code" | "rsa_token"; mfaCode?: string; rsaToken?: string },
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase()
    const nextPassword = newPassword.trim()

    if (!normalizedEmail || !nextPassword) {
      return { success: false, error: "Email and new password are required" }
    }

    if (nextPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" }
    }

    if (factor.method === "mfa_code") {
      const normalizedCode = (factor.mfaCode || "").trim()
      if (!normalizedCode) {
        return { success: false, error: "MFA verification code is required" }
      }

      const rawChallenge = localStorage.getItem(MFA_RESET_STORE_KEY)
      if (!rawChallenge) {
        return { success: false, error: "No active verification challenge. Request a new code." }
      }

      let challenge: { email: string; code: string; expiresAt: number } | null = null
      try {
        challenge = JSON.parse(rawChallenge) as { email: string; code: string; expiresAt: number }
      } catch {
        localStorage.removeItem(MFA_RESET_STORE_KEY)
        return { success: false, error: "Invalid verification state. Request a new code." }
      }

      if (!challenge || challenge.email !== normalizedEmail) {
        return { success: false, error: "Verification challenge does not match this email." }
      }

      if (challenge.expiresAt < Date.now()) {
        localStorage.removeItem(MFA_RESET_STORE_KEY)
        return { success: false, error: "Verification code expired. Request a new code." }
      }

      if (challenge.code !== normalizedCode) {
        return { success: false, error: "Invalid verification code" }
      }

      localStorage.removeItem(MFA_RESET_STORE_KEY)
    }

    if (factor.method === "rsa_token") {
      const normalizedRsaToken = (factor.rsaToken || "").trim()
      if (!normalizedRsaToken) {
        return { success: false, error: "RSA token is required" }
      }

      const storedUsersForRsa = JSON.parse(localStorage.getItem("buildsync_users") || "[]") as Array<User & { password: string; rsaResetToken?: string }>
      const foundUser = storedUsersForRsa.find((entry) => entry.email.toLowerCase() === normalizedEmail)
      if (!foundUser || !foundUser.rsaResetToken) {
        return { success: false, error: "RSA token is not configured for this account" }
      }

      if (foundUser.rsaResetToken !== normalizedRsaToken) {
        return { success: false, error: "Invalid RSA token" }
      }
    }

    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]") as Array<User & { password: string; rsaResetToken?: string }>
    const updatedUsers = storedUsers.map((entry) =>
      entry.email.toLowerCase() === normalizedEmail ? { ...entry, password: nextPassword } : entry,
    )

    localStorage.setItem("buildsync_users", JSON.stringify(updatedUsers))
    logAudit(
      factor.method === "mfa_code" ? "passwordResetMfaCompleted" : "passwordResetRsaCompleted",
      { email: normalizedEmail },
      normalizedEmail,
    )
    return { success: true }
  }

  const resetPasswordWithMfa = async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    return resetPasswordWithSecondFactor(email, newPassword, { method: "mfa_code", mfaCode: code })
  }

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    
    // Check if user already exists
    if (storedUsers.some((u: User) => u.email === data.email)) {
      logAudit("signUpFailed", { email: data.email }, data.email)
      return { success: false, error: "An account with this email already exists" }
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      company: data.company,
    }
    
    storedUsers.push(newUser)
    localStorage.setItem("buildsync_users", JSON.stringify(storedUsers))
    
    const userWithoutPassword = sanitizeUser({ ...newUser, accessRoles: [newUser.role] })
    delete (userWithoutPassword as { password?: string }).password
    setUser(userWithoutPassword)
    setAvailableRoles(userWithoutPassword.accessRoles || [userWithoutPassword.role])
    localStorage.setItem("buildsync_user", JSON.stringify(userWithoutPassword))
    logAudit("signUp", { email: data.email, role: data.role }, data.email)
    
    return { success: true }
  }

  const requestPasswordResetChallenge = async (
    email: string,
    method: "mfa_code" | "rsa_token",
  ): Promise<{ success: boolean; error?: string; devCode?: string; devRsaToken?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    const foundUser = storedUsers.find((u: User & { password: string }) => u.email === email)
    if (!foundUser) {
      return { success: false, error: "Account not found" }
    }

    if (method === "mfa_code") {
      return { success: true, devCode: "123456" }
    }

    return { success: true, devRsaToken: "654321" }
  }

  const resetPasswordWithSecondFactor = async (
    email: string,
    newPassword: string,
    payload: { method: "mfa_code" | "rsa_token"; mfaCode?: string; rsaToken?: string },
  ): Promise<{ success: boolean; error?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]") as Array<User & { password: string }>
    const index = storedUsers.findIndex((u) => u.email === email)
    if (index === -1) {
      return { success: false, error: "Account not found" }
    }

    if (payload.method === "mfa_code" && (!payload.mfaCode || payload.mfaCode.length < 6)) {
      return { success: false, error: "Invalid verification code" }
    }

    if (payload.method === "rsa_token" && (!payload.rsaToken || payload.rsaToken.length < 6)) {
      return { success: false, error: "Invalid RSA token" }
    }

    storedUsers[index] = { ...storedUsers[index], password: newPassword }
    localStorage.setItem("buildsync_users", JSON.stringify(storedUsers))
    return { success: true }
  }

  const signOut = () => {
    logAudit("signOut", {}, user?.email || null)
    setUser(null)
    setAvailableRoles([])
    localStorage.removeItem("buildsync_user")
  }

  const switchRole = (nextRole: UserRole) => {
    if (!user) return

    // Role switching never changes identity; it only swaps the active role
    // inside the existing session if that role is explicitly allowed.
    const allowedRoles = normalizeAccessRoles(user)
    if (!allowedRoles.includes(nextRole) || user.role === nextRole) return

    const nextUser = applyTenantAssignment(sanitizeUser({ ...user, role: nextRole }))
    setUser(nextUser)
    setAvailableRoles(nextUser.accessRoles || [nextUser.role])
    localStorage.setItem("buildsync_user", JSON.stringify(nextUser))
    logAudit("roleSwitch", { email: user.email, fromRole: user.role, toRole: nextRole }, user.email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        availableRoles,
        isLoading,
        signIn,
        requestPasswordResetChallenge,
        resetPasswordWithSecondFactor,
        requestPasswordResetMfa,
        resetPasswordWithMfa,
        signUp,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    facility_manager: "Facility Manager",
    building_manager: "Building Manager",
    building_owner: "Building Owner",
    building_manager: "Building Manager",
    property_manager: "Property Manager",
    resident: "Resident",
    tenant: "Tenant",
    concierge: "Concierge",
    staff: "Staff",
    security: "Security",
    vendor: "Vendor",
    admin: "Admin",
    guest: "Guest",
  }
  return names[role]
}
