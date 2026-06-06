import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

export async function POST(request) {
  const { name, email, password } = await request.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
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
