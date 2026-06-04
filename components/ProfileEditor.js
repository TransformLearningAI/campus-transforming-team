'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { AREAS_OF_INTEREST } from '@/lib/constants'

export default function ProfileEditor() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    timezone: user.timezone || '',
    linkedin_url: user.linkedin_url || '',
    portfolio_url: user.portfolio_url || '',
    areas_of_interest: user.areas_of_interest || [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleArea(area) {
    setForm(f => ({
      ...f,
      areas_of_interest: f.areas_of_interest.includes(area)
        ? f.areas_of_interest.filter(a => a !== area)
        : [...f.areas_of_interest, area]
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('team_members').update(form).eq('id', user.id)
    await refreshUser()
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-1" style={{ color: '#0C1F3F' }}>Your Profile</h1>
      <p className="text-sm text-gray-400 mb-6">Tell the team about yourself.</p>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                   className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
            <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      placeholder="Tell the team about your background, experience, and what you're passionate about..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-vertical" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                     placeholder="City, State"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Timezone</label>
              <input type="text" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                     placeholder="e.g., Eastern, Pacific"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
              <input type="url" value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                     placeholder="https://linkedin.com/in/..."
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Portfolio / Website</label>
              <input type="url" value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
                     placeholder="https://..."
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Areas of Interest</label>
          <p className="text-xs text-gray-400 mb-4">Select all that apply — helps the team know who to pull into what.</p>
          <div className="flex flex-wrap gap-2">
            {AREAS_OF_INTEREST.map(area => (
              <button key={area} type="button" onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.areas_of_interest.includes(area)
                          ? 'bg-[#0C1F3F] text-white border-[#0C1F3F]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}>
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving}
                  className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: '#00A8A8' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <p className="text-sm text-green-600 font-medium">Saved!</p>}
        </div>
      </form>
    </div>
  )
}
