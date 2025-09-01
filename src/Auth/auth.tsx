"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isGuest: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  signOut: () => Promise<void>
  continueAsGuest: () => void
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAuthState()
  }, [])

  const loadAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")
      const guestMode = await AsyncStorage.getItem("isGuest")

      if (userData) {
        setUser(JSON.parse(userData))
      } else if (guestMode === "true") {
        setIsGuest(true)
      }
    } catch (error) {
      console.error("Error loading auth state:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would validate credentials with your backend
      // For demo purposes, we'll simulate authentication
      const userData = {
        id: Date.now().toString(),
        name: email.split("@")[0], // Use email prefix as name for demo
        email,
      }

      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.removeItem("isGuest")
      setUser(userData)
      setIsGuest(false)
      return true
    } catch (error) {
      console.error("Sign in error:", error)
      return false
    }
  }

  const signUp = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      // In a real app, you would create account with your backend
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        phone,
      }

      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.removeItem("isGuest")
      setUser(userData)
      setIsGuest(false)
      return true
    } catch (error) {
      console.error("Sign up error:", error)
      return false
    }
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("isGuest")
      setUser(null)
      setIsGuest(false)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const continueAsGuest = async () => {
    try {
      await AsyncStorage.setItem("isGuest", "true")
      setIsGuest(true)
    } catch (error) {
      console.error("Guest mode error:", error)
    }
  }

  const requireAuth = (): boolean => {
    return user !== null
  }

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    requireAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
