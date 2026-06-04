'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth'
import Dashboard from '@/components/Dashboard'
import AuthScreen from '@/components/AuthScreen'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  if (!user) return <AuthScreen />
  return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
