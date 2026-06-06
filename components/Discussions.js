'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function Discussions() {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [selected, setSelected] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyText, setReplyText] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', topic: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [replyErr, setReplyErr] = useState('')

  useEffect(() => {
    loadThreads()
  }, [])

  async function loadThreads() {
    const { data } = await supabase
      .from('team_discussions')
      .select('*, author:team_members!team_discussions_created_by_fkey(name)')
      .order('created_at', { ascending: false })
    setThreads(data || [])
  }

  async function selectThread(thread) {
    setSelected(thread)
    const { data } = await supabase
      .from('team_discussion_replies')
      .select('*, author:team_members!team_discussion_replies_member_id_fkey(name)')
      .eq('discussion_id', thread.id)
      .order('created_at', { ascending: true })
    setReplies(data || [])
  }

  async function createThread(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { data, error } = await supabase
      .from('team_discussions')
      .insert({ ...newThread, created_by: user.id })
      .select()
      .single()
    if (error) {
      setErr('Could not post the thread. Please try again.')
      setSaving(false)
      return
    }
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'posted_discussion',
      detail: `Started discussion: ${newThread.title}`,
    })
    setNewThread({ title: '', topic: '' })
    setShowNew(false)
    setSaving(false)
    loadThreads()
    if (data) selectThread(data)
  }

  async function postReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setReplyErr('')
    const { error } = await supabase.from('team_discussion_replies').insert({
      discussion_id: selected.id,
      member_id: user.id,
      content: replyText,
    })
    if (error) {
      setReplyErr('Could not post your reply. Please try again.')
      return
    }
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'posted_reply',
      detail: `Replied in: ${selected.title}`,
    })
    setReplyText('')
    selectThread(selected)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>
            Discussions
          </h1>
          <p className="text-sm text-gray-400">Talk through ideas, share updates, ask questions.</p>
        </div>
        <button
          onClick={() => {
            setShowNew(true)
            setSelected(null)
          }}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: '#00A8A8' }}
        >
          + New Thread
        </button>
      </div>

      {showNew && (
        <form onSubmit={createThread} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Thread title"
            value={newThread.title}
            onChange={e => setNewThread(t => ({ ...t, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8]"
          />
          <textarea
            placeholder="Opening message..."
            rows={3}
            value={newThread.topic}
            onChange={e => setNewThread(t => ({ ...t, topic: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
              style={{ background: '#00A8A8' }}
            >
              {saving ? 'Posting...' : 'Post'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Thread list */}
        <div className="md:col-span-1 space-y-2">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => {
                selectThread(t)
                setShowNew(false)
              }}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${selected?.id === t.id ? 'border-[#00A8A8] bg-[#00A8A8]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <p className="font-bold text-sm line-clamp-1" style={{ color: '#0C1F3F' }}>
                {t.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t.author?.name || 'Unknown'} &middot;{' '}
                {new Date(t.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </button>
          ))}
          {threads.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No discussions yet.</p>}
        </div>

        {/* Thread detail */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-lg mb-1" style={{ color: '#0C1F3F' }}>
                {selected.title}
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Started by {selected.author?.name} &middot;{' '}
                {new Date(selected.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {selected.topic && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selected.topic}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {replies.map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0C1F3F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(r.author?.name || '?')
                        .split(' ')
                        .map(w => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold" style={{ color: '#0C1F3F' }}>
                          {r.author?.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{r.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={postReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl text-white text-sm font-bold shrink-0"
                  style={{ background: '#00A8A8' }}
                >
                  Reply
                </button>
              </form>
              {replyErr && <p className="text-sm text-red-600 mt-2">{replyErr}</p>}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">Select a discussion or start a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
