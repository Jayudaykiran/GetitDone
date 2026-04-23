import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginUserByEmail, registerUser, setAuthToken } from '@/services/api'

type User = { userId?: string; email?: string; fullName?: string; uniqueUserCode?: string; jobTitle?: string; role?: string }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setToken(parsed.token)
        setUser({ userId: parsed.userId, email: parsed.email, fullName: parsed.fullName, uniqueUserCode: parsed.uniqueUserCode, jobTitle: parsed.jobTitle, role: parsed.role })
        setAuthToken(parsed.token)
      } catch {}
    }
  }, [])

  const login = async (email: string, password: string) => {
    const resp = await loginUserByEmail(email, password)
    const data = resp.data
    const t = data.token
    setToken(t)
    setAuthToken(t)
    setUser({ userId: data.userId, email: data.email, fullName: data.fullName, uniqueUserCode: data.uniqueUserCode, jobTitle: data.jobTitle, role: data.role })
    localStorage.setItem('auth', JSON.stringify({ token: t, userId: data.userId, email: data.email, fullName: data.fullName, uniqueUserCode: data.uniqueUserCode, jobTitle: data.jobTitle, role: data.role }))
  }

  const register = async (payload: any) => {
    // register returns user details (without token). We return them to the caller.
    const resp = await registerUser(payload)
    return resp.data // Return the full response data including message
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(undefined)
    localStorage.removeItem('auth')
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
