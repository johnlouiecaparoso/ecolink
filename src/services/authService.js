import { getEnv } from '@/utils/env'

const API_BASE_URL = getEnv('VITE_API_BASE_URL', { optional: true, fallback: '' })

async function post(path, body) {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json().catch(() => ({}))
}

export async function loginWithEmail({ email, password }) {
  // If API base not provided, simulate for now
  if (!API_BASE_URL) {
    await new Promise((r) => setTimeout(r, 600))
    return { user: { email } }
  }
  return post('/auth/login', { email, password })
}

export async function registerWithEmail({ name, email, password }) {
  if (!API_BASE_URL) {
    await new Promise((r) => setTimeout(r, 700))
    return { user: { name, email } }
  }
  return post('/auth/register', { name, email, password })
}
