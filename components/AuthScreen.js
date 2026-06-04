'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = mode === 'login'
      ? await login(email, password)
      : await register(name, email, password)

    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0C1F3F 0%, #1a3a6b 100%)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: '#00A8A8' }}>
            Campus Transformation
          </p>
          <h1 className="font-serif text-3xl font-light text-white mb-2">Team Portal</h1>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'Create your team account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                     placeholder="Your full name"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                   placeholder="you@example.com"
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                   placeholder="Choose a password"
                   minLength={4}
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#00A8A8' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center mt-4">
            {mode === 'login' ? (
              <p className="text-sm text-gray-500">
                New to the team?{' '}
                <button type="button" onClick={() => { setMode('register'); setError('') }}
                        className="font-semibold" style={{ color: '#00A8A8' }}>
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }}
                        className="font-semibold" style={{ color: '#00A8A8' }}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Transform Learning &middot; Campus Transformation Division
        </p>
      </div>
    </div>
  )
}
