import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

export async function POST(request) {
  const { name, email, password, inviteCode } = await request.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
  }

  // Gate registration behind a shared team invite code. If TEAM_INVITE_CODE is
  // unset, registration stays open (so deploys don't break) — set it in the
  // Vercel env to close the portal to outsiders.
  const required = process.env.TEAM_INVITE_CODE
  if (required && (inviteCode || '').trim() !== required) {
    return NextResponse.json(
      {
        error: 'Invalid invite code. Ask your team lead for the current code.',
      },
      { status: 403 },
    )
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('team_activity').insert({
    member_id: data.id,
    member_name: name,
    action: 'joined',
    detail: `${name} joined the team`,
  })

  const { password_hash, ...safeUser } = data
  return NextResponse.json({ user: safeUser })
}
