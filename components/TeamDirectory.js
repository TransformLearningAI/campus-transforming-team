'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeamDirectory() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('team_members')
      .select('id,name,bio,location,timezone,linkedin_url,portfolio_url,areas_of_interest,created_at')
      .order('created_at', { ascending: true })
      .then(({ data }) => setMembers(data || []))
  }, [])

  const filtered = members.filter(
    m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.areas_of_interest || []).some(a => a.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-1" style={{ color: '#0C1F3F' }}>
        Team Directory
      </h1>
      <p className="text-sm text-gray-400 mb-6">{members.length} members</p>

      <input
        type="text"
        placeholder="Search by name, location, or area of interest..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-xl border border-gray-200 text-sm mb-6 focus:outline-none focus:border-[#00A8A8]"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: '#0C1F3F' }}
              >
                {m.name
                  .split(' ')
                  .map(w => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#0C1F3F' }}>
                  {m.name}
                </p>
                {m.location && <p className="text-xs text-gray-400">{m.location}</p>}
              </div>
            </div>
            {m.bio && <p className="text-xs text-gray-500 line-clamp-3 mb-3">{m.bio}</p>}
            {(m.areas_of_interest || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {m.areas_of_interest.slice(0, 4).map(a => (
                  <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    {a}
                  </span>
                ))}
                {m.areas_of_interest.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                    +{m.areas_of_interest.length - 4}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {m.linkedin_url && (
                <a
                  href={m.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium"
                  style={{ color: '#00A8A8' }}
                >
                  LinkedIn
                </a>
              )}
              {m.portfolio_url && (
                <a
                  href={m.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium"
                  style={{ color: '#00A8A8' }}
                >
                  Portfolio
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
