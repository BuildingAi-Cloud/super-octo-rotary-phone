"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { logAudit } from "@/lib/audit"

export type UserRole =
  | "facility_manager"
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
  company?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
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
}

interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
  company?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Pre-populate dummy users for all roles (MVP style, no UI button)
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    const roles: UserRole[] = [
      "facility_manager",
      "building_owner",
      "building_manager",
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
    let changed = false
    roles.forEach((role) => {
      const email = `test_${role}@example.com`
      if (!storedUsers.some((u: User) => u.email === email)) {
        storedUsers.push({
          id: crypto.randomUUID(),
          email,
          password: "12345678",
          name: `${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role,
          company: "TestCo"
        })
        changed = true
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
        setUser(JSON.parse(storedUser))
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
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("buildsync_user", JSON.stringify(userWithoutPassword))
      logAudit("signIn", { email }, email)
      return { success: true }
    }
    logAudit("signInFailed", { email }, email)
    return { success: false, error: "Invalid email or password" }
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
    
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
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
    localStorage.removeItem("buildsync_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        requestPasswordResetChallenge,
        resetPasswordWithSecondFactor,
        signOut,
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
