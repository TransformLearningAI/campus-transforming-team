'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { MARKETING_PAGES, SUGGESTION_STATUSES, ADMIN_EMAILS } from '@/lib/constants'

const OTHER = 'Other / not listed'

function statusCfg(value) {
  return SUGGESTION_STATUSES.find(s => s.value === value) || SUGGESTION_STATUSES[0]
}

export default function SuggestEdit() {
  const { user } = useAuth()
  const isAdmin =
    user.role === 'admin' || user.role === 'owner' || ADMIN_EMAILS.includes((user.email || '').toLowerCase())

  const [suggestions, setSuggestions] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    page: MARKETING_PAGES[0].label,
    page_url: MARKETING_PAGES[0].url,
    section: '',
    current_text: '',
    suggested_text: '',
    reason: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('site_suggestions')
      .select('*, author:team_members!site_suggestions_created_by_fkey(name)')
      .order('created_at', { ascending: false })
    setSuggestions(data || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function pickPage(label) {
    const match = MARKETING_PAGES.find(p => p.label === label)
    setForm(f => ({ ...f, page: label, page_url: match ? match.url : '' }))
  }

  function reset() {
    setForm({
      page: MARKETING_PAGES[0].label,
      page_url: MARKETING_PAGES[0].url,
      section: '',
      current_text: '',
      suggested_text: '',
      reason: '',
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.suggested_text.trim()) return
    setErr('')
    setSaving(true)

    const { error } = await supabase.from('site_suggestions').insert({
      page: form.page,
      page_url: form.page_url || null,
      section: form.section || null,
      current_text: form.current_text || null,
      suggested_text: form.suggested_text,
      reason: form.reason || null,
      created_by: user.id,
    })

    if (error) {
      setErr('Could not submit your suggestion. Please try again.')
      setSaving(false)
      return
    }

    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'posted_suggestion',
      detail: `Suggested an edit to ${form.page}`,
    })

    // Email notification — non-blocking.
    try {
      await fetch('/api/suggestion-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          authorName: user.name,
          authorEmail: user.email,
        }),
      })
    } catch {
      /* non-blocking */
    }

    reset()
    setShowNew(false)
    setSaving(false)
    setDone(true)
    setTimeout(() => setDone(false), 4000)
    load()
  }

  async function changeStatus(id, status) {
    await supabase.from('site_suggestions').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    load()
  }

  async function remove(id) {
    await supabase.from('site_suggestions').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>
            Suggest a Site Edit
          </h1>
          <p className="text-sm text-gray-400">
            Spot something on the marketing site to fix or improve? Tell us here — opens in a new tab so you don&rsquo;t
            lose your place.
          </p>
        </div>
        <button
          onClick={() => {
            setShowNew(v => !v)
            setErr('')
          }}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold shrink-0"
          style={{ background: '#00A8A8' }}
        >
          {showNew ? 'Close' : '+ New Suggestion'}
        </button>
      </div>

      {done && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 font-medium">
            Thanks! Your suggestion was submitted and the team has been notified.
          </p>
        </div>
      )}

      {showNew && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 mb-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Page</label>
              <select
                value={form.page}
                onChange={e => pickPage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
              >
                {MARKETING_PAGES.map(p => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
              {form.page_url && (
                <a
                  href={form.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium mt-1.5 inline-block"
                  style={{ color: '#00A8A8' }}
                >
                  Open this page in a new tab &rarr;
                </a>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Section / location <span className="text-gray-300 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.section}
                placeholder="e.g. Hero headline, footer, 3rd paragraph"
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
              />
            </div>
          </div>

          {form.page === OTHER && (
            <input
              type="url"
              value={form.page_url}
              placeholder="Page URL (optional)"
              onChange={e => setForm(f => ({ ...f, page_url: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Current text{' '}
              <span className="text-gray-300 normal-case font-normal">(optional — paste what&rsquo;s there now)</span>
            </label>
            <textarea
              rows={2}
              value={form.current_text}
              onChange={e => setForm(f => ({ ...f, current_text: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Suggested change *
            </label>
            <textarea
              required
              rows={3}
              value={form.suggested_text}
              placeholder="What should it say / look like instead?"
              onChange={e => setForm(f => ({ ...f, suggested_text: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Why <span className="text-gray-300 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.reason}
              placeholder="Context that helps whoever makes the change"
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
              style={{ background: '#00A8A8' }}
            >
              {saving ? 'Submitting...' : 'Submit Suggestion'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNew(false)
                setErr('')
              }}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Suggestions list */}
      <div className="space-y-3">
        {suggestions.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-8">
            No suggestions yet. Be the first to flag an improvement.
          </p>
        )}
        {suggestions.map(s => {
          const cfg = statusCfg(s.status)
          const canDelete = isAdmin || s.created_by === user.id
          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  {s.page_url ? (
                    <a
                      href={s.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold hover:underline"
                      style={{ color: '#0C1F3F' }}
                    >
                      {s.page} &rarr;
                    </a>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: '#0C1F3F' }}>
                      {s.page}
                    </span>
                  )}
                  {s.section && <span className="text-xs text-gray-400">· {s.section}</span>}
                </div>
                {canDelete && (
                  <button
                    onClick={() => remove(s.id)}
                    className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>

              {s.current_text && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Current</p>
                  <p className="text-sm text-gray-500 line-through whitespace-pre-wrap">{s.current_text}</p>
                </div>
              )}
              <div className="mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Suggested</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.suggested_text}</p>
              </div>
              {s.reason && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-semibold">Why:</span> {s.reason}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  {s.author?.name || 'Unknown'} ·{' '}
                  {new Date(s.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {isAdmin && (
                  <select
                    value={s.status}
                    onChange={e => changeStatus(s.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-[#00A8A8]"
                  >
                    {SUGGESTION_STATUSES.map(st => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
