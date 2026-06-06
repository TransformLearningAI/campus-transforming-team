// Server-only password hashing. Uses Node's built-in scrypt — no external deps.
// Format: scrypt$<saltHex>$<hashHex>
// Legacy accounts were stored as btoa(password) (base64). verifyPassword still
// accepts those so existing members can sign in; login.route.js transparently
// re-hashes them with scrypt on the next successful login.
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEYLEN = 64

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEYLEN).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function isLegacyHash(stored) {
  return !!stored && !stored.startsWith('scrypt$')
}

export function verifyPassword(password, stored) {
  if (!stored) return false

  if (stored.startsWith('scrypt$')) {
    const [, salt, hashHex] = stored.split('$')
    if (!salt || !hashHex) return false
    const expected = Buffer.from(hashHex, 'hex')
    const actual = scryptSync(password, salt, expected.length)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  }

  // Legacy: btoa(password) === base64(password)
  try {
    return Buffer.from(stored, 'base64').toString('utf8') === password
  } catch {
    return false
  }
}
