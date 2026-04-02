"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { logAudit } from "@/lib/audit"

export type UserRole =
  | "facility_manager"
  | "building_manager"
  | "building_owner"
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
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
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
        const parsedUser = sanitizeUser(JSON.parse(storedUser))
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
      const userWithoutPassword = sanitizeUser({ ...foundUser })
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

    const nextUser = sanitizeUser({ ...user, role: nextRole })
    setUser(nextUser)
    setAvailableRoles(nextUser.accessRoles || [nextUser.role])
    localStorage.setItem("buildsync_user", JSON.stringify(nextUser))
    logAudit("roleSwitch", { email: user.email, fromRole: user.role, toRole: nextRole }, user.email)
  }

  return (
    <AuthContext.Provider value={{ user, availableRoles, isLoading, signIn, signUp, signOut, switchRole }}>
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
