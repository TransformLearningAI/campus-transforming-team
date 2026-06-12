'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TASK_CATEGORIES } from '@/lib/constants'

function ProgressBar({ value }) {
  const color = value === 100 ? '#16A34A' : value >= 50 ? '#00A8A8' : '#D97706'
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}

function TimeAgo({ date }) {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return <span>just now</span>
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>
  if (diff < 604800) return <span>{Math.floor(diff / 86400)}d ago</span>
  return <span>{d.toLocaleDateString()}</span>
}

function TaskDetail({ task, user, onClose, onUpdate }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [progress, setProgress] = useState(task.progress || 0)
  const [deliverableUrl, setDeliverableUrl] = useState(task.deliverable_url || '')
  const [savingProgress, setSavingProgress] = useState(false)
  const [showDesc, setShowDesc] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [workContent, setWorkContent] = useState(task.work_content || '')
  const [workVisible, setWorkVisible] = useState(task.work_visible || false)
  const [savingWork, setSavingWork] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimer = useRef(null)
  const commentsEnd = useRef(null)
  const isOwner = task.claimed_by === user.id
  const canSeeWork = isOwner || task.work_visible

  useEffect(() => {
    loadComments()
  }, [task.id])

  useEffect(() => {
    commentsEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  async function loadComments() {
    const { data } = await supabase
      .from('team_task_comments')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function postComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    setPosting(true)
    await supabase.from('team_task_comments').insert({
      task_id: task.id,
      member_id: user.id,
      member_name: user.name,
      content: newComment.trim(),
    })
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'commented_task',
      detail: `Commented on: ${task.title}`,
    })
    setNewComment('')
    setPosting(false)
    loadComments()
  }

  async function saveProgress() {
    setSavingProgress(true)
    const updates = { progress, deliverable_url: deliverableUrl || null }
    if (progress === 100) {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    }
    await supabase.from('team_tasks').update(updates).eq('id', task.id)
    if (progress === 100) {
      await supabase.from('team_activity').insert({
        member_id: user.id,
        member_name: user.name,
        action: 'completed_task',
        detail: `Completed: ${task.title}`,
      })
    }
    setSavingProgress(false)
    onUpdate()
  }

  async function claimTask() {
    await supabase
      .from('team_tasks')
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        status: 'in_progress',
      })
      .eq('id', task.id)
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'claimed_task',
      detail: `Claimed: ${task.title}`,
    })
    onUpdate()
  }

  // Auto-save work content after 1.5s of inactivity
  function handleWorkChange(val) {
    setWorkContent(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveWork(val, workVisible), 1500)
  }

  async function saveWork(content, visible) {
    setSavingWork(true)
    await supabase.from('team_tasks').update({
      work_content: content,
      work_visible: visible,
      work_updated_at: new Date().toISOString(),
    }).eq('id', task.id)
    setLastSaved(new Date())
    setSavingWork(false)
  }

  async function toggleVisibility() {
    const next = !workVisible
    setWorkVisible(next)
    await saveWork(workContent, next)
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: next ? 'shared_work' : 'unshared_work',
      detail: `${next ? 'Shared' : 'Hid'} work on: ${task.title}`,
    })
    onUpdate()
  }

  const priorityColors = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
  const statusColors = { open: '#3B82F6', in_progress: '#D97706', completed: '#16A34A' }
  const statusLabels = { open: 'Open', in_progress: 'In Progress', completed: 'Completed' }
  const detailTabs = [
    { id: 'details', label: 'Details' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'discussion', label: `Discussion (${comments.length})` },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ background: statusColors[task.status] || '#94A3B8' }}
              >
                {statusLabels[task.status] || task.status}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{ color: priorityColors[task.priority], borderColor: priorityColors[task.priority] }}
              >
                {task.priority}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{task.category}</span>
            </div>
            <h2 className="font-bold text-lg leading-snug" style={{ color: '#0C1F3F' }}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 shrink-0 transition-colors"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-gray-100 px-6 flex gap-1 shrink-0">
          {detailTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-[#00A8A8] text-[#0C1F3F]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* === DETAILS TAB === */}
          {activeTab === 'details' && (
            <>
              {/* Description */}
              {task.description && (
                <div>
                  <button
                    onClick={() => setShowDesc(d => !d)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2"
                  >
                    <span className="transition-transform" style={{ transform: showDesc ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
                    Description
                  </button>
                  {showDesc && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  )}
                </div>
              )}

              {/* Claimed by */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 font-medium">Assigned to:</span>
                {task.claimed && task.claimed.name ? (
                  <span className="font-medium" style={{ color: '#0C1F3F' }}>{task.claimed.name}</span>
                ) : (
                  <span className="text-gray-300 italic">Unclaimed</span>
                )}
                {task.status === 'open' && (
                  <button
                    onClick={claimTask}
                    className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: '#00A8A8' }}
                  >
                    Claim This Task
                  </button>
                )}
              </div>

              {/* Progress — only shown when task is claimed */}
              {task.status !== 'open' && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Progress</span>
                    <span className="text-sm font-bold" style={{ color: '#0C1F3F' }}>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                  {isOwner && task.status !== 'completed' && (
                    <>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={progress}
                        onChange={e => setProgress(Number(e.target.value))}
                        className="w-full accent-[#00A8A8] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-300 font-medium px-0.5">
                        <span>Just started</span>
                        <span>Halfway</span>
                        <span>Almost done</span>
                      </div>
                    </>
                  )}

                  {/* Deliverable URL */}
                  {isOwner && task.status !== 'completed' ? (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Deliverable Link
                      </label>
                      <input
                        type="url"
                        placeholder="Paste a link to your work (Google Doc, spreadsheet, etc.)"
                        value={deliverableUrl}
                        onChange={e => setDeliverableUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
                      />
                    </div>
                  ) : task.deliverable_url ? (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Deliverable</span>
                      <a
                        href={task.deliverable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium inline-flex items-center gap-1 hover:underline"
                        style={{ color: '#00A8A8' }}
                      >
                        View Deliverable &rarr;
                      </a>
                    </div>
                  ) : null}

                  {/* Save button */}
                  {isOwner && task.status !== 'completed' && (
                    <button
                      onClick={saveProgress}
                      disabled={savingProgress}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-colors"
                      style={{ background: progress === 100 ? '#16A34A' : '#00A8A8' }}
                    >
                      {savingProgress
                        ? 'Saving...'
                        : progress === 100
                          ? 'Mark as Complete'
                          : 'Save Progress'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* === WORKSPACE TAB === */}
          {activeTab === 'workspace' && (
            <>
              {task.status === 'open' ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 text-sm mb-3">Claim this task to start working on it.</p>
                  <button
                    onClick={claimTask}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                    style={{ background: '#00A8A8' }}
                  >
                    Claim This Task
                  </button>
                </div>
              ) : !canSeeWork ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400 text-xl">&#128274;</span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">This workspace is private.</p>
                  <p className="text-gray-300 text-xs mt-1">{task.claimed?.name || 'The assignee'} hasn't shared their work yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visibility toggle — owner only */}
                  {isOwner && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0C1F3F' }}>
                          {workVisible ? 'Visible to team' : 'Private — only you can see this'}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {workVisible
                            ? 'Anyone on the team can read your work and leave comments.'
                            : 'Toggle to share your work with the team when you\'re ready.'}
                        </p>
                      </div>
                      <button
                        onClick={toggleVisibility}
                        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                          workVisible ? 'bg-[#00A8A8]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            workVisible ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Non-owner viewing shared work */}
                  {!isOwner && task.work_visible && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3">
                      <span className="text-blue-500 text-sm">&#128065;</span>
                      <p className="text-xs text-blue-600 font-medium">
                        You're viewing {task.claimed?.name || 'the assignee'}'s work. Use the Discussion tab to leave feedback.
                      </p>
                    </div>
                  )}

                  {/* Status bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {isOwner ? 'Your Work' : `${task.claimed?.name || 'Assignee'}'s Work`}
                    </span>
                    <div className="flex items-center gap-2">
                      {savingWork && (
                        <span className="text-[10px] text-gray-400 animate-pulse">Saving...</span>
                      )}
                      {!savingWork && lastSaved && (
                        <span className="text-[10px] text-gray-300">
                          Saved <TimeAgo date={lastSaved} />
                        </span>
                      )}
                      {!savingWork && !lastSaved && task.work_updated_at && (
                        <span className="text-[10px] text-gray-300">
                          Last saved <TimeAgo date={task.work_updated_at} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Editor or read-only view */}
                  {isOwner ? (
                    <textarea
                      value={workContent}
                      onChange={e => handleWorkChange(e.target.value)}
                      placeholder="Start writing your work here...&#10;&#10;Use this space to draft ideas, write notes, outline deliverables, paste research — anything related to this task. Your work auto-saves as you type."
                      className="w-full min-h-[400px] px-4 py-4 rounded-xl border border-gray-200 text-sm leading-relaxed focus:outline-none focus:border-[#00A8A8] resize-y font-[inherit]"
                      style={{ background: '#FAFBFC' }}
                    />
                  ) : (
                    <div
                      className="w-full min-h-[200px] px-4 py-4 rounded-xl border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ background: '#FAFBFC', color: '#2D3748' }}
                    >
                      {workContent || <span className="text-gray-300 italic">No content yet.</span>}
                    </div>
                  )}

                  {/* Manual save button for owner */}
                  {isOwner && (
                    <button
                      onClick={() => saveWork(workContent, workVisible)}
                      disabled={savingWork}
                      className="px-5 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                      style={{ background: '#00A8A8' }}
                    >
                      {savingWork ? 'Saving...' : 'Save Now'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* === DISCUSSION TAB === */}
          {activeTab === 'discussion' && (
            <div>
              {comments.length === 0 && (
                <p className="text-sm text-gray-300 italic py-4 text-center">No comments yet. Start the conversation.</p>
              )}

              <div className="space-y-3">
                {comments.map(c => {
                  const isMe = c.member_id === user.id
                  return (
                    <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: isMe ? '#00A8A8' : '#0C1F3F' }}
                      >
                        {c.member_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#00A8A8] text-white rounded-tr-md'
                              : 'bg-gray-100 text-gray-700 rounded-tl-md'
                          }`}
                        >
                          {c.content}
                        </div>
                        <div className={`flex items-center gap-2 mt-1 text-[10px] text-gray-300 ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-medium">{c.member_name}</span>
                          <span>&middot;</span>
                          <TimeAgo date={c.created_at} />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={commentsEnd} />
              </div>
            </div>
          )}
        </div>

        {/* Comment Input — shown on discussion tab */}
        {activeTab === 'discussion' && (
          <form onSubmit={postComment} className="border-t border-gray-100 px-6 py-4 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8]"
              />
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-30 transition-opacity"
                style={{ background: '#00A8A8' }}
              >
                {posting ? '...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default function TaskBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: TASK_CATEGORIES[0],
    priority: 'medium',
    due_date: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [showAllCats, setShowAllCats] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [filter])

  async function loadTasks() {
    let q = supabase
      .from('team_tasks')
      .select('*, claimed:team_members!team_tasks_claimed_by_fkey(name)')
      .order('created_at', { ascending: false })
    if (filter === 'mine') q = q.eq('claimed_by', user.id)
    else if (filter === 'open') q = q.eq('status', 'open')
    else if (filter === 'completed') q = q.eq('status', 'completed')
    else if (filter !== 'all') q = q.eq('category', filter)
    const { data } = await q
    setTasks(data || [])
    // Refresh the selected task if it's open
    if (selectedTask) {
      const updated = (data || []).find(t => t.id === selectedTask.id)
      if (updated) setSelectedTask(updated)
    }
  }

  async function createTask(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    const { error } = await supabase.from('team_tasks').insert({
      ...newTask,
      created_by: user.id,
      due_date: newTask.due_date || null,
    })
    if (error) {
      setErr('Could not create the task. Please try again.')
      setSaving(false)
      return
    }
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'created_task',
      detail: `Created task: ${newTask.title}`,
    })
    setNewTask({
      title: '',
      description: '',
      category: TASK_CATEGORIES[0],
      priority: 'medium',
      due_date: '',
    })
    setShowNew(false)
    setSaving(false)
    loadTasks()
  }

  const priorityColors = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
  const statusColors = { open: '#3B82F6', in_progress: '#D97706', completed: '#16A34A' }
  const visibleCats = showAllCats ? TASK_CATEGORIES : TASK_CATEGORIES.slice(0, 8)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-light" style={{ color: '#0C1F3F' }}>
            Task Board
          </h1>
          <p className="text-sm text-gray-400">Claim tasks, track progress, get things done.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: '#00A8A8' }}
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'open', 'mine', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-[#0C1F3F] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {f === 'all' ? 'All' : f === 'mine' ? 'My Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        {visibleCats.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === cat ? 'bg-[#0C1F3F] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
        {TASK_CATEGORIES.length > 8 && (
          <button
            onClick={() => setShowAllCats(s => !s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            {showAllCats ? 'Show less' : `+${TASK_CATEGORIES.length - 8} more`}
          </button>
        )}
      </div>

      {/* New Task Form */}
      {showNew && (
        <form onSubmit={createTask} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <input
            type="text"
            required
            placeholder="Task title"
            value={newTask.title}
            onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#00A8A8]"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            rows={3}
            onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00A8A8] resize-none"
          />
          <div className="flex gap-3">
            <select
              value={newTask.category}
              onChange={e => setNewTask(t => ({ ...t, category: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
            >
              {TASK_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="date"
              value={newTask.due_date}
              onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none"
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
              {saving ? 'Creating...' : 'Create Task'}
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

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-sm text-gray-400 italic py-8 text-center">No tasks found.</p>}
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-[#00A8A8]/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: statusColors[task.status] || '#94A3B8' }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{ color: priorityColors[task.priority], borderColor: priorityColors[task.priority] }}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{task.category}</span>
                </div>
                <h3 className="font-bold text-sm" style={{ color: '#0C1F3F' }}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {task.claimed && task.claimed.name && (
                    <span className="text-xs" style={{ color: '#00A8A8' }}>
                      {task.claimed.name}
                    </span>
                  )}
                  {task.work_visible && task.work_content && (
                    <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                      &#128196; Work shared
                    </span>
                  )}
                  {task.progress > 0 && (
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                      <ProgressBar value={task.progress} />
                      <span className="text-[10px] text-gray-400 font-bold">{task.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-gray-300 text-sm shrink-0">&rsaquo;</span>
            </div>
          </button>
        ))}
      </div>

      {/* Task Detail Slide-over */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          user={user}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  )
}
