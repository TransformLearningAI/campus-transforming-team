'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('team_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        /* ignore */
      }
    }
    setLoading(false)
  }, [])

  // Credentials are verified server-side (lib/password.js + /api/auth/*) so the
  // password hash never touches the browser.
  async function login(email, password) {
    let result
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      result = await res.json()
      if (!res.ok) return { error: result.error || 'Sign in failed. Please try again.' }
    } catch {
      return { error: 'Network error. Please try again.' }
    }

    setUser(result.user)
    localStorage.setItem('team_user', JSON.stringify(result.user))
    return { user: result.user }
  }

  async function register(name, email, password, inviteCode) {
    let result
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, inviteCode }),
      })
      result = await res.json()
      if (!res.ok)
        return {
          error: result.error || 'Registration failed. Please try again.',
        }
    } catch {
      return { error: 'Network error. Please try again.' }
    }

    setUser(result.user)
    localStorage.setItem('team_user', JSON.stringify(result.user))
    return { user: result.user }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('team_user')
  }

  async function refreshUser() {
    if (!user) return
    const { data } = await supabase
      .from('team_members')
      .select(
        'id,name,email,bio,photo_url,location,timezone,linkedin_url,portfolio_url,other_links,areas_of_interest,role,onboarding_completed,created_at,updated_at',
      )
      .eq('id', user.id)
      .single()
    if (data) {
      setUser(data)
      localStorage.setItem('team_user', JSON.stringify(data))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
