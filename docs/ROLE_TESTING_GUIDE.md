# 🧪 Role-Based Feature Testing Guide

## 🎯 Goal: Verify all roles can access their features correctly

---

## 👑 **ADMIN Role Testing**

### **Test Account**

- Email: `admin@ecolink.test` (dev only) OR real admin account
- Password: `admin123` (dev only)

### **Expected Navigation**

- [ ] "Admin Dashboard" link appears in header
- [ ] "Verifier Panel" link does NOT appear (admin uses admin panel)
- [ ] Can access `/admin` route
- [ ] Can access `/admin/users` route
- [ ] Can access `/admin/database` route
- [ ] Can access `/admin/audit-logs` route

### **Test Features**

1. **Admin Dashboard** (`/admin`)
   - [ ] Dashboard loads without errors
   - [ ] Shows user statistics
   - [ ] Shows project statistics
   - [ ] Shows transaction statistics

2. **User Management** (`/admin/users`)
   - [ ] Can view all users
   - [ ] Can see user roles
   - [ ] Can edit user roles (if implemented)
   - [ ] Data comes from Supabase (not fake)

3. **Database Management** (`/admin/database`)
   - [ ] Can view tables
   - [ ] Can view table structure
   - [ ] Can query data

4. **Audit Logs** (`/admin/audit-logs`)
   - [ ] Can view audit logs
   - [ ] Logs show real user actions
   - [ ] Data comes from Supabase

### **Console Checks**

- [ ] No "access denied" errors
- [ ] No "route not found" errors
- [ ] No role check failures

---

## ✅ **VERIFIER Role Testing**

### **Test Account**

- Email: `verifier@ecolink.test` (dev only) OR real verifier account
- Password: `verifier123` (dev only)

### **Expected Navigation**

- [ ] "Verifier Panel" link appears in header
- [ ] "Admin Dashboard" link does NOT appear
- [ ] Can access `/verifier` route
- [ ] Cannot access `/admin` route (should redirect)

### **Test Features**

1. **Verifier Panel** (`/verifier`)
   - [ ] Panel loads without errors
   - [ ] Shows pending projects
   - [ ] Can view project details
   - [ ] Can approve projects
   - [ ] Can reject projects
   - [ ] Can add verification notes

2. **General User Features**
   - [ ] Can access marketplace
   - [ ] Can access wallet
   - [ ] Can access profile
   - [ ] Can view certificates

### **Console Checks**

- [ ] No "verifier access denied" errors
- [ ] No role mismatch errors
- [ ] Profile loads correctly with verifier role

---

## 💼 **PROJECT DEVELOPER Role Testing**

### **Test Account**

- Email: `developer@ecolink.test` (dev only) OR real developer account
- Password: `developer123` (dev only)

### **Expected Navigation**

- [ ] "Submit Project" link appears in header
- [ ] "Admin Dashboard" link does NOT appear
- [ ] "Verifier Panel" link does NOT appear
- [ ] Can access `/submit-project` route

### **Test Features**

1. **Submit Project** (`/submit-project`)
   - [ ] Form loads without errors
   - [ ] Can submit new project
   - [ ] Project saved to Supabase
   - [ ] Can view own projects
   - [ ] Can edit own projects

2. **General User Features**
   - [ ] Can access marketplace
   - [ ] Can purchase credits
   - [ ] Can access wallet
   - [ ] Can view portfolio

### **Console Checks**

- [ ] No "developer access denied" errors
- [ ] Project submission works
- [ ] Data saves correctly

---

## 👤 **GENERAL USER Role Testing**

### **Test Account**

- Email: `user@ecolink.test` (dev only) OR real user account
- Password: `user123` (dev only)

### **Expected Navigation**

- [ ] "Submit Project" link does NOT appear
- [ ] "Admin Dashboard" link does NOT appear
- [ ] "Verifier Panel" link does NOT appear
- [ ] Standard user links appear

### **Test Features**

1. **Marketplace** (`/marketplace`)
   - [ ] Can browse listings
   - [ ] Can search/filter
   - [ ] Can view listing details
   - [ ] Can purchase credits (simulated)

2. **Wallet** (`/wallet`)
   - [ ] Can view balance
   - [ ] Can view transaction history
   - [ ] Balance updates correctly

3. **Profile** (`/profile`)
   - [ ] Can view profile
   - [ ] Can edit profile
   - [ ] Changes persist
   - [ ] Notification settings work

4. **Certificates** (`/certificates`)
   - [ ] Can view own certificates
   - [ ] Certificates load from database

5. **Restricted Access**
   - [ ] Cannot access `/admin` (redirects)
   - [ ] Cannot access `/verifier` (redirects)
   - [ ] Cannot access `/submit-project` (redirects if not developer)

### **Console Checks**

- [ ] No permission errors
- [ ] Navigation works correctly
- [ ] All user features accessible

---

## 🔄 **Navigation Testing**

### **Test Navigation Link Visibility**

1. **As Admin**:
   - [ ] Home ✓
   - [ ] Marketplace ✓
   - [ ] Retire ✓
   - [ ] Buy Credits ✓
   - [ ] Admin Dashboard ✓
   - [ ] No Verifier Panel
   - [ ] No Submit Project

2. **As Verifier**:
   - [ ] Home ✓
   - [ ] Marketplace ✓
   - [ ] Retire ✓
   - [ ] Buy Credits ✓
   - [ ] Verifier Panel ✓
   - [ ] No Admin Dashboard
   - [ ] No Submit Project

3. **As Developer**:
   - [ ] Home ✓
   - [ ] Marketplace ✓
   - [ ] Retire ✓
   - [ ] Buy Credits ✓
   - [ ] Submit Project ✓
   - [ ] No Admin Dashboard
   - [ ] No Verifier Panel

4. **As User**:
   - [ ] Home ✓
   - [ ] Marketplace ✓
   - [ ] Retire ✓
   - [ ] Buy Credits ✓
   - [ ] No Admin Dashboard
   - [ ] No Verifier Panel
   - [ ] No Submit Project

---

## ✅ **Testing Complete When:**

- [x] All roles can access their features
- [x] Navigation links show/hide correctly
- [x] Route guards work correctly
- [x] No access denied errors for valid users
- [x] Access denied for invalid routes
- [x] Profile loads with correct role
- [x] All features work with real data

---

## 🐛 **Common Issues**

### **Issue: Links disappear after login**

**Check**:

- Profile role is loaded correctly
- `userStore.role` is set after profile fetch
- Navigation computed property is reactive

### **Issue: Access denied for valid role**

**Check**:

- Role value matches ROLES constants exactly
- Profile was fetched before route guard
- Role is normalized (lowercase)

### **Issue: Route redirects incorrectly**

**Check**:

- `getRoleDefaultRoute` returns correct route
- Router guards check role correctly
- Profile is loaded before guard checks

---

_Systematically test each role to ensure production readiness!_

