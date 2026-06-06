'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { TASK_CATEGORIES } from '@/lib/constants'

export default function TaskBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [showNew, setShowNew] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: TASK_CATEGORIES[0],
    priority: 'medium',
    due_date: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

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

  async function claimTask(taskId) {
    await supabase
      .from('team_tasks')
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        status: 'in_progress',
      })
      .eq('id', taskId)
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'claimed_task',
      detail: `Claimed a task`,
    })
    loadTasks()
  }

  async function completeTask(taskId) {
    await supabase
      .from('team_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId)
    await supabase.from('team_activity').insert({
      member_id: user.id,
      member_name: user.name,
      action: 'completed_task',
      detail: `Completed a task`,
    })
    loadTasks()
  }

  const priorityColors = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
  const statusColors = {
    open: '#3B82F6',
    in_progress: '#D97706',
    completed: '#16A34A',
  }

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
        {TASK_CATEGORIES.slice(0, 8).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === cat ? 'bg-[#0C1F3F] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
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
          <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{
                      background: statusColors[task.status] || '#94A3B8',
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      color: priorityColors[task.priority],
                      borderColor: priorityColors[task.priority],
                    }}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{task.category}</span>
                </div>
                <h3 className="font-bold text-sm" style={{ color: '#0C1F3F' }}>
                  {task.title}
                </h3>
                {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                {task.claimed && task.claimed.name && (
                  <p className="text-xs mt-2" style={{ color: '#00A8A8' }}>
                    Claimed by {task.claimed.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {task.status === 'open' && (
                  <button
                    onClick={() => claimTask(task.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: '#00A8A8' }}
                  >
                    Claim
                  </button>
                )}
                {task.status === 'in_progress' && task.claimed_by === user.id && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
