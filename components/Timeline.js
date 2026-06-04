'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'deadline', label: 'Deadline', color: '#DC2626', icon: '🔴' },
  { value: 'push', label: 'Push / Launch', color: '#8B5CF6', icon: '🚀' },
  { value: 'milestone', label: 'Milestone', color: '#00A8A8', icon: '🏁' },
  { value: 'meeting', label: 'Meeting', color: '#3B82F6', icon: '📞' },
  { value: 'outreach', label: 'Outreach', color: '#059669', icon: '🤝' },
  { value: 'client', label: 'Client / Prospect', color: '#D97706', icon: '🏛️' },
  { value: 'content', label: 'Content / Marketing', color: '#EC4899', icon: '📣' },
  { value: 'general', label: 'General', color: '#64748B', icon: '📌' },
]

function getCat(value) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
}

function relativeDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
  if (diff < -1) return `${Math.abs(diff)} days ago`
  if (diff === -1) return 'Yesterday'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 7) return `In ${diff} days`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── COMMENT THREAD ─────────────────────────────────────────────
function CommentThread({ itemId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('timeline_comments')
      .select('*, author:team_members!timeline_comments_member_id_fkey(name)')
      .eq('timeline_item_id', itemId)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }, [itemId])

  useEffect(() => { load() }, [load])

  async function post(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await supabase.from('timeline_comments').insert({
      timeline_item_id: itemId,
      member_id: user.id,
      content: text.trim(),
    })
    setText('')
    setSending(false)
    load()
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#0C1F3F] flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                {(c.author?.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold" style={{ color: '#0C1F3F' }}>{c.author?.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={post} className="flex gap-2">
        <input type="text" placeholder="Add a comment..." value={text}
               onChange={e => setText(e.target.value)}
               className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]" />
        <button type="submit" disabled={sending || !text.trim()}
                className="px-3 py-2 rounded-lg text-white text-xs font-bold shrink-0 disabled:opacity-40"
                style={{ background: '#00A8A8' }}>
          {sending ? '...' : 'Post'}
        </button>
      </form>
    </div>
  )
}

// ── TIMELINE ITEM ──────────────────────────────────────────────
function TimelineItem({ item, isLast, onUpdate }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const cat = getCat(item.category)
  const isPast = new Date(item.date) < new Date()
  const isToday = new Date(item.date).toDateString() === new Date().toDateString()

  useEffect(() => {
    supabase.from('timeline_comments').select('id', { count: 'exact', head: true })
      .eq('timeline_item_id', item.id)
      .then(({ count }) => setCommentCount(count || 0))
  }, [item.id, showComments])

  async function toggleComplete() {
    await supabase.from('timeline_items').update({ completed: !item.completed }).eq('id', item.id)
    onUpdate()
  }

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-10">
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 z-10 ${
          item.completed ? 'bg-green-500 border-green-500' : isToday ? 'border-[#00A8A8] bg-[#00A8A8]' : isPast ? 'border-gray-300 bg-gray-200' : 'border-gray-300 bg-white'
        }`}
             style={!item.completed && !isPast && !isToday ? { borderColor: cat.color } : {}}>
          {item.completed && <span className="text-white text-[8px] flex items-center justify-center h-full">✓</span>}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${isPast && !item.completed ? 'opacity-60' : ''}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{cat.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ background: cat.color }}>
                  {cat.label}
                </span>
                <span className={`text-[10px] font-bold ${isToday ? 'text-[#00A8A8]' : isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                  {relativeDate(item.date)}
                </span>
              </div>
              <h3 className={`font-bold text-sm ${item.completed ? 'line-through text-gray-400' : ''}`} style={{ color: item.completed ? undefined : '#0C1F3F' }}>
                {item.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={toggleComplete} title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-colors ${
                        item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500'
                      }`}>
                {item.completed ? '✓' : ''}
              </button>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-2">{item.description}</p>
          )}

          {/* Date + owner */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {item.owner_name && <span>• {item.owner_name}</span>}
          </div>

          {/* Comments toggle */}
          <button onClick={() => setShowComments(!showComments)}
                  className="mt-3 text-xs font-medium flex items-center gap-1.5 hover:opacity-80"
                  style={{ color: '#00A8A8' }}>
            💬 {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Add comment'}
            <span className="text-[10px]">{showComments ? '▲' : '▼'}</span>
          </button>

          {showComments && <CommentThread itemId={item.id} />}
        </div>
      </div>
    </div>
  )
}

// ── MAIN TIMELINE ──────────────────────────────────────────────
export default function Timeline() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('upcoming')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', date: '', category: 'general', owner_name: '' })

  const load = useCallback(async () => {
    let q = supabase.from('timeline_items').select('*')
    if (filter === 'upcoming') {
      q = q.gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true })
    } else if (filter === 'past') {
      q = q.lt('date', new Date().toISOString().split('T')[0]).order('date', { ascending: false })
    } else if (filter === 'all') {
      q = q.order('date', { ascending: true })
    } else {
      q = q.eq('category', filter).order('date', { ascending: true })
    }
    const { data } = await q
    setItems(data || [])
  }, [filter])

  useEffect(() => { load() }, [load])

  async function createItem(e) {
    e.preventDefault()
    await supabase.from('timeline_items').insert({
      ...form,
      created_by: user.id,
      owner_name: form.owner_name || user.name,
    })
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'added_timeline',
      detail: `Added to timeline: ${form.title}`,
    })
    setForm({ title: '', description: '', date: '', category: 'general', owner_name: '' })
    setShowNew(false)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>Timeline</h1>
          <p className="text-sm text-gray-400">Deadlines, pushes, milestones — and the conversation around each one.</p>
        </div>
        <button onClick={() => setShowNew(true)}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: '#00A8A8' }}>
          + Add to Timeline
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['upcoming', 'all', 'past'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-[#0C1F3F] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setFilter(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${filter === cat.value ? 'text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                  style={filter === cat.value ? { background: cat.color } : {}}>
            <span className="text-xs">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* New Item Form */}
      {showNew && (
        <form onSubmit={createItem} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <input type="text" required placeholder="What's happening?" value={form.title}
                 onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8]" />
          <textarea placeholder="Details, context, links (optional)" value={form.description} rows={3}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none" />
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Date *</label>
              <input type="date" required value={form.date}
                     onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                     className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Owner</label>
              <input type="text" placeholder={user.name} value={form.owner_name}
                     onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
                     className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: '#00A8A8' }}>
              Add to Timeline
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div>
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm italic">No timeline items yet. Add the first one!</p>
          </div>
        )}
        {items.map((item, i) => (
          <TimelineItem key={item.id} item={item} isLast={i === items.length - 1} onUpdate={load} />
        ))}
      </div>
    </div>
  )
}
