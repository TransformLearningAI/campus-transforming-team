import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { verifyPassword, isLegacyHash, hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase.from('team_members').select('*').eq('email', email.toLowerCase()).single()

  // Generic message — don't reveal whether the account exists.
  if (error || !data) {
    return NextResponse.json({ error: 'Account not found. Check your email or register first.' }, { status: 401 })
  }

  if (!verifyPassword(password, data.password_hash)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  // Transparently upgrade legacy base64 hashes to scrypt.
  if (isLegacyHash(data.password_hash)) {
    await supabase
      .from('team_members')
      .update({ password_hash: hashPassword(password) })
      .eq('id', data.id)
  }

  const { password_hash, ...safeUser } = data
  return NextResponse.json({ user: safeUser })
}
