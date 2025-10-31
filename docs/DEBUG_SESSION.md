# 🔍 Debugging Session Persistence Issues

## Quick Debug Steps

If you're still having issues with session persistence, follow these steps:

### 1. Open Browser Console (F12)

### 2. Check localStorage

Run this in the console:

```javascript
// Check all Supabase-related keys
Object.keys(localStorage).filter(
  (k) => k.includes('supabase') || k.includes('auth') || k.startsWith('sb-'),
)

// Check for old custom key
localStorage.getItem('ecolink-supabase-auth-token')

// Check what the actual Supabase key is (extract from VITE_SUPABASE_URL)
const url = 'YOUR_SUPABASE_URL' // Replace with actual URL
const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
console.log('Supabase storage key should be:', `sb-${projectRef}-auth-token`)
```

### 3. Check Session Directly

```javascript
// Get Supabase instance
import { getSupabase } from './services/supabaseClient'

const supabase = getSupabase()
if (supabase) {
  const { data, error } = await supabase.auth.getSession()
  console.log('Session:', data.session)
  console.log('Error:', error)
  console.log('User:', data.session?.user)
}
```

### 4. Check Router Guard Logs

Look for these console messages:

- `🔍 Router guard checking: homepage from: ...`
- `✅ Public route, allowing access` (should see this for homepage)
- `📊 User store initial state:`
- `⏳ Initializing session...`
- `✅ Valid session found for user:`

### 5. Common Issues

#### Issue: "No session found" but localStorage has token

**Fix:** Clear localStorage and login again, OR check if you're using old custom key format

```javascript
// Clear all auth-related storage
Object.keys(localStorage).forEach((k) => {
  if (k.includes('supabase') || k.includes('auth') || k.startsWith('sb-')) {
    console.log('Removing:', k)
    localStorage.removeItem(k)
  }
})
// Then refresh and login again
```

#### Issue: Router guard redirecting even for homepage

**Fix:** Check if homepage is actually in public routes list

```javascript
// In router/index.js, check this line:
const publicRoutes = ['login', 'register', 'homepage']
```

#### Issue: Session expires immediately

**Fix:** Check session expiration timestamp

```javascript
const supabase = getSupabase()
const { data } = await supabase.auth.getSession()
if (data.session) {
  const expiresAt = new Date(data.session.expires_at * 1000)
  const now = new Date()
  console.log('Session expires at:', expiresAt)
  console.log('Current time:', now)
  console.log('Is expired?', expiresAt < now)
}
```

### 6. Nuclear Option: Complete Reset

```javascript
// Clear everything
localStorage.clear()
sessionStorage.clear()

// Clear service workers
if ('serviceWorker' in navigator) {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((r) => r.unregister()))
}

// Clear caches
const cacheNames = await caches.keys()
await Promise.all(cacheNames.map((n) => caches.delete(n)))

// Hard refresh
location.reload(true)
```

## Expected Console Output

After login and refresh, you should see:

1. `✅ Supabase client initialized successfully`
2. `🔍 Router guard checking: homepage from: ...`
3. `✅ Public route, allowing access` (for homepage)
4. `🔄 Fetching session...`
5. `✅ Valid session found for user: [email]`
6. `✅ User is authenticated: [email]`

If you see `❌ User not authenticated, redirecting to login` on homepage, that's a bug - homepage should not check auth.

