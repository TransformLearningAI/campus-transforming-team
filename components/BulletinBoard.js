'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const PRIORITY_CONFIG = {
  urgent: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'URGENT', icon: '🔴' },
  important: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'IMPORTANT', icon: '🟡' },
  info: { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: 'INFO', icon: '🔵' },
  celebration: { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', label: 'CELEBRATION', icon: '🎉' },
}

export default function BulletinBoard({ compact = false }) {
  const { user } = useAuth()
  const [bulletins, setBulletins] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', priority: 'info', pinned: false })
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('team_bulletins')
      .select('*, author:team_members!team_bulletins_created_by_fkey(name)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(compact ? 5 : 50)
    setBulletins(data || [])
  }, [compact])

  useEffect(() => { load() }, [load])

  async function post(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSending(true)

    // Save bulletin
    const { data: bulletin } = await supabase.from('team_bulletins').insert({
      title: form.title,
      content: form.content,
      priority: form.priority,
      pinned: form.pinned,
      created_by: user.id,
    }).select().single()

    // Log activity
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'posted_bulletin',
      detail: `Posted bulletin: ${form.title}`,
    })

    // Send email notification to all team members
    try {
      await fetch('/api/bulletin-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          priority: form.priority,
          authorName: user.name,
        }),
      })
    } catch { /* non-blocking */ }

    setForm({ title: '', content: '', priority: 'info', pinned: false })
    setShowNew(false)
    setSending(false)
    load()
  }

  async function deleteBulletin(id) {
    await supabase.from('team_bulletins').delete().eq('id', id)
    load()
  }

  const p = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.info

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-sm" style={{ color: '#0C1F3F' }}>Bulletin Board</h2>
            <p className="text-xs text-gray-400">Announcements and updates for the whole team. Everyone gets notified.</p>
          </div>
          <button onClick={() => setShowNew(true)}
                  className="px-3 py-2 rounded-xl text-white text-xs font-bold"
                  style={{ background: '#00A8A8' }}>
            + Post Bulletin
          </button>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#0C1F3F' }}>
            📢 Bulletin Board
          </h2>
          <button onClick={() => setShowNew(true)}
                  className="text-xs font-bold" style={{ color: '#00A8A8' }}>
            + Post
          </button>
        </div>
      )}

      {/* New Bulletin Form */}
      {showNew && (
        <form onSubmit={post} className="border-2 rounded-xl p-5 mb-4 space-y-3" style={{ borderColor: '#00A8A8', background: '#F0FDFD' }}>
          <input type="text" required placeholder="Bulletin title — what does the team need to know?"
                 value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8] bg-white" />
          <textarea placeholder="Details (optional)" rows={3} value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none bg-white" />
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-1.5">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, priority: key }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          form.priority === key ? 'text-white' : 'bg-white text-gray-500'
                        }`}
                        style={form.priority === key ? { background: cfg.color, borderColor: cfg.color } : { borderColor: '#E2E8F0' }}>
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                     className="rounded" />
              Pin to top
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={sending}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                    style={{ background: '#00A8A8' }}>
              {sending ? 'Posting & Notifying...' : 'Post & Notify Team'}
            </button>
            <button type="button" onClick={() => setShowNew(false)}
                    className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200">Cancel</button>
          </div>
          <p className="text-[10px] text-gray-400">Everyone on the team will receive an email notification.</p>
        </form>
      )}

      {/* Bulletins List */}
      <div className="space-y-3">
        {bulletins.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">No bulletins yet.</p>
        )}
        {bulletins.map(b => {
          const cfg = p(b.priority)
          return (
            <div key={b.id} className="rounded-xl border p-4" style={{ background: cfg.bg, borderColor: cfg.border }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {b.pinned && <span className="text-xs">📌</span>}
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                          style={{ background: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm" style={{ color: '#0C1F3F' }}>{b.title}</h3>
                  {b.content && <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">{b.content}</p>}
                  <p className="text-xs text-gray-400 mt-2">— {b.author?.name || 'Unknown'}</p>
                </div>
                {b.created_by === user.id && (
                  <button onClick={() => deleteBulletin(b.id)} className="text-xs text-gray-400 hover:text-red-500 shrink-0" title="Delete">
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
