"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "facility_manager" | "building_owner" | "property_manager" | "resident" | "tenant"

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

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("buildsync_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Demo authentication - in production, this would call an API
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    const foundUser = storedUsers.find((u: User & { password: string }) => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("buildsync_user", JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    
    return { success: false, error: "Invalid email or password" }
  }

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    const storedUsers = JSON.parse(localStorage.getItem("buildsync_users") || "[]")
    
    // Check if user already exists
    if (storedUsers.some((u: User) => u.email === data.email)) {
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
    
    return { success: true }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("buildsync_user")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
    property_manager: "Property Manager",
    resident: "Resident",
    tenant: "Tenant",
  }
  return names[role]
}
