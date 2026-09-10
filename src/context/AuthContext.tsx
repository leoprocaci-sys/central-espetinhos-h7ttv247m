import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      const rec = pb.authStore.record
      return {
        id: rec.id,
        email: (rec.email as string) || '',
        name: (rec.name as string) || (rec.email as string) || 'Usuário',
        avatar: (rec.avatar as string) || undefined,
      }
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial check
    if (pb.authStore.isValid && pb.authStore.record) {
      const rec = pb.authStore.record
      setUser({
        id: rec.id,
        email: (rec.email as string) || '',
        name: (rec.name as string) || (rec.email as string) || 'Usuário',
        avatar: (rec.avatar as string) || undefined,
      })
    } else {
      setUser(null)
    }
    setIsLoading(false)

    // Listen to changes in auth store
    const unsubscribe = pb.authStore.onChange((token, record) => {
      if (token && record) {
        setUser({
          id: record.id,
          email: (record.email as string) || '',
          name: (record.name as string) || (record.email as string) || 'Usuário',
          avatar: (record.avatar as string) || undefined,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    const authData = await pb.collection('users').authWithPassword(email.trim(), pass)
    if (authData && authData.record) {
      setUser({
        id: authData.record.id,
        email: (authData.record.email as string) || '',
        name: (authData.record.name as string) || (authData.record.email as string) || 'Usuário',
        avatar: (authData.record.avatar as string) || undefined,
      })
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: pb.authStore.token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
