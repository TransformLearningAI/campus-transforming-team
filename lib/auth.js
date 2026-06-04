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
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !data) return { error: 'Account not found. Check your email or register first.' }

    // Simple password check (hashed with btoa for basic obfuscation — not production-grade)
    if (data.password_hash !== btoa(password)) return { error: 'Incorrect password.' }

    setUser(data)
    localStorage.setItem('team_user', JSON.stringify(data))
    return { user: data }
  }

  async function register(name, email, password) {
    const hash = btoa(password)

    const { data, error } = await supabase
      .from('team_members')
      .insert({ name, email: email.toLowerCase(), password_hash: hash })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return { error: 'An account with this email already exists.' }
      return { error: error.message }
    }

    // Log activity
    await supabase.from('team_activity').insert({
      member_id: data.id,
      member_name: name,
      action: 'joined',
      detail: `${name} joined the team`
    })

    setUser(data)
    localStorage.setItem('team_user', JSON.stringify(data))
    return { user: data }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('team_user')
  }

  async function refreshUser() {
    if (!user) return
    const { data } = await supabase
      .from('team_members')
      .select('*')
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
