# 🔐 AUTHENTICATION ISSUES DEBUGGING GUIDE

## 🎯 **PROBLEM SUMMARY**

Users getting "User not authenticated" errors when:
1. Verifier trying to approve projects
2. Regular users trying to purchase in marketplace

**Root Cause:** Supabase session management issues and timing problems with initialization.

---

## ✅ **FIXES APPLIED**

### **1. Supabase Client Initialization**
Updated services to use getters that throw clear errors instead of returning null:
- ✅ `src/services/projectApprovalService.js`
- ✅ `src/services/realPaymentService.js`
- ✅ `src/services/creditOwnershipService.js`

### **2. PayMongo Secret Key Guards**
Added validation to prevent undefined secret key errors:
- ✅ `src/services/paymongoService.js`

---

## 🔍 **DEBUGGING STEPS**

### **Step 1: Check Session in Browser Console**

Open browser console (F12) and run:

```javascript
// Check if Supabase is initialized
console.log('Supabase:', window.__SUPABASE__ || 'Not available')

// Check userStore
import { useUserStore } from '@/store/userStore'
const store = useUserStore()
console.log('Is Authenticated:', store.isAuthenticated)
console.log('Session:', store.session)
console.log('Profile:', store.profile)
console.log('Role:', store.role)
```

### **Step 2: Check Console Logs**

Look for these initialization messages:

**Good signs:**
```
✅ Supabase client initialized successfully
✅ PayMongo service initialized
✅ User is authenticated: your@email.com
```

**Bad signs:**
```
⚠️ PayMongo keys not configured, using mock mode
⚠️ Supabase client not available
❌ User not authenticated
```

### **Step 3: Check LocalStorage**

Run in console:

```javascript
// Check Supabase session storage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key.includes('supabase') || key.includes('auth')) {
    console.log(key, ':', localStorage.getItem(key))
  }
}
```

Look for:
- `sb-<project-ref>-auth-token` - Current Supabase session
- Any old session keys

### **Step 4: Test Authentication Flow**

1. Go to `/login`
2. Login with your verifier or user account
3. Open console and run:

```javascript
const store = useUserStore()
await store.fetchSession()
console.log('After fetch:', {
  isAuthenticated: store.isAuthenticated,
  hasProfile: !!store.profile,
  role: store.role
})
```

---

## 🚨 **COMMON ISSUES**

### **Issue 1: "Supabase client not available"**

**Possible causes:**
1. `.env` file missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY
2. Dev server not restarted after adding keys
3. Keys have typos

**Fix:**
1. Check `.env` file exists and has correct keys
2. Restart dev server: `npm run dev`
3. Clear browser cache and localStorage

### **Issue 2: "User not authenticated" but logged in**

**Possible causes:**
1. Session expired
2. Session not restored on page load
3. userStore not synced with Supabase

**Fix:**
1. Logout and login again
2. Check console for session restore messages
3. Clear localStorage and refresh

### **Issue 3: Session works but still gets auth error**

**Possible causes:**
1. Race condition - Supabase not initialized yet
2. Old cached modules
3. Browser extension interfering

**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache completely
3. Try incognito mode
4. Restart dev server

---

## 🔧 **MANUAL TESTING**

### **Test 1: Verifier Panel**
```
1. Login as verifier
2. Go to /verifier
3. Click "Approve Project"
4. Check console for errors
5. Check if project updates in database
```

### **Test 2: Marketplace Purchase**
```
1. Login as regular user
2. Go to /marketplace
3. Click "Purchase" on a credit
4. Complete payment flow
5. Check console for errors
6. Verify credits added to portfolio
```

### **Test 3: PayMongo Integration**
```
1. Check console for "PayMongo service initialized"
2. Try a wallet top-up
3. Should redirect to PayMongo checkout
4. Check console for checkout session creation
```

---

## 📊 **EXPECTED CONSOLE LOGS**

### **Successful Login:**
```
✅ Supabase client initialized successfully
🔄 Fetching session...
✅ Valid session found for user: your@email.com
Fetching profile for user: <user-id>
✅ Profile loaded successfully
```

### **Successful PayMongo:**
```
✅ PayMongo service initialized
🔗 Creating PayMongo checkout session...
✅ Checkout session created: cs_test_xxxxx
```

### **Successful Approval:**
```
Loaded pending projects: [...]
Project approved: {...}
✅ Credits generated for project
```

### **Successful Purchase:**
```
🛒 Processing credit purchase: {...}
💳 Processing GCash payment via PayMongo: {...}
✅ Credit purchase completed successfully
```

---

## 🐛 **IF STILL BROKEN**

If authentication still fails after trying above:

1. **Check Database:**
   - Verify user exists in `profiles` table
   - Check `role` field is correct
   - Verify session token in Supabase dashboard

2. **Check Network:**
   - Look for failed API calls in Network tab
   - Check CORS errors
   - Verify Supabase URL is reachable

3. **Check Environment:**
   - Verify `.env` file is in root directory
   - Ensure no trailing spaces in keys
   - Confirm keys are from correct Supabase project

4. **Nuclear Option:**
   ```bash
   # Clear everything and start fresh
   rm -rf node_modules package-lock.json
   npm install
   # Clear browser cache and localStorage
   # Restart dev server
   npm run dev
   ```

---

## 📝 **PROVIDE DEBUG INFO**

If you need more help, provide:
1. Console error messages (screenshot)
2. Network tab errors (screenshot)
3. UserStore state from console
4. Your `.env` file (redact keys)
5. Browser and version

---

## ✅ **QUICK FIX CHECKLIST**

Before reporting issues, make sure:
- [ ] Dev server restarted after adding PayMongo keys
- [ ] `.env` file has both Supabase and PayMongo keys
- [ ] No console errors about missing keys
- [ ] UserStore shows authenticated: true
- [ ] Role is correct in userStore
- [ ] Hard refresh (Ctrl+Shift+R) done
- [ ] localStorage cleared if session issues
- [ ] Browser console shows "✅ PayMongo service initialized"


