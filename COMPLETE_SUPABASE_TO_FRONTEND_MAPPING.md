# 🔄 COMPLETE SUPABASE → FRONTEND DATA FLOW
## How Every Supabase Table Reflects in Your Admin Panel

---

## 📊 **DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                           │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  profiles   │  │   projects   │  │  project_credits    │   │
│  │  (users)    │  │              │  │                     │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │credit_list.│  │credit_trans. │  │  credit_ownership   │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   wallet_   │  │   wallet_    │  │   audit_logs        │   │
│  │  accounts   │  │ transactions │  │                     │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐                            │
│  │certificates │  │   receipts   │                            │
│  └─────────────┘  └──────────────┘                            │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           │ RLS Policies Filter Data
                           │ (Only admins see ALL rows)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE QUERY LAYER                             │
│  supabase.from('table_name').select('*')                        │
│  ↓ Filters by RLS policies based on auth.uid()                  │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│                                                                 │
│  getPlatformOverview() → analyticsService.js                   │
│  getAllProjects() → projectApprovalService.js                  │
│  loadUsers() → UserManagement.vue                              │
│  searchAuditLogs() → auditService.js                           │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                   REACTIVE STATE                                │
│  stats.value.totalUsers = data                                 │
│  users.value = data                                            │
│  pendingProjects.value = data                                  │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND ADMIN PANEL                          │
│                                                                 │
│  <p>{{ stats.totalUsers }}</p>   ← Displays count             │
│  <tr v-for="user in users">      ← Renders table               │
│  <div>{{ project.title }}</div>  ← Shows project               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ **TABLE-BY-TABLE MAPPING**

### **1. `profiles` TABLE**
**What's in Supabase:**
```sql
profiles:
  - id (UUID)
  - full_name
  - email
  - role
  - kyc_level
  - company
  - location
  - bio
  - avatar_url
  - created_at
  - updated_at
```

**Where It Shows in Frontend:**

#### **Admin Dashboard Stats** (`AdminDashboard.vue:179-195`)
```javascript
// Query: Count total users
supabase.from('profiles').select('*', { count: 'exact', head: true })
↓
Stats Card: "Total Users: 42"
```

#### **User Management Page** (`UserManagement.vue:141-148`)
```javascript
// Query: Get ALL user profiles
supabase.from('profiles').select('*').order('created_at', { ascending: false })
↓
Table displays:
  Name        | Email          | Role    | KYC Level
  John Doe    | john@test.com  | admin   | 3
  Jane Smith  | jane@test.com  | user    | 1
```

**Query Execution:**
```javascript
Line 141: const supabase = getSupabase()
Line 142: supabase.from('profiles')
Line 143:   .select('*')
Line 144:   .order('created_at', { ascending: false })
Line 146: if (fetchError) throw fetchError
Line 147: users.value = data || []  ← Stored in reactive state
```

**Display:**
```vue
<tbody>
  <tr v-for="user in filteredUsers">
    <td>{{ user.full_name }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.role }}</td>
  </tr>
</tbody>
```

---

### **2. `projects` TABLE**
**What's in Supabase:**
```sql
projects:
  - id (UUID)
  - title
  - description
  - category
  - location
  - expected_impact
  - user_id (FK to profiles)
  - status (pending/approved/rejected)
  - verification_notes
  - verified_by
  - verified_at
  - created_at
```

**Where It Shows in Frontend:**

#### **Admin Dashboard Stats** (`AdminDashboard.vue:49-53, 207-208`)
```javascript
// Query 1: Count total projects
supabase.from('projects').select('*', { count: 'exact', head: true })
// Query 2: Count approved projects
supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved')
↓
Stats Card: "Active Projects: 15"
Stats Card: "Pending Projects: 3"
```

#### **Project Approval Panel** (`ProjectApprovalPanel.vue:95-104`)
```javascript
// Query: Get pending projects
projectApprovalService.getPendingProjects()
  → supabase.from('projects').select('*').eq('status', 'pending')
↓
Project Cards display:
  [Project Title] [Category] [Location] [Description]
  [✅ Approve] [❌ Reject]
```

**Complete Approval Flow:**
```javascript
// User clicks Approve
approveProject(projectId) {
  Line 111: projectApprovalService.approveProject(projectId, notes)
    ↓
  // Updates Supabase
  Line 38: supabase.from('projects').update({ 
    status: 'approved',
    verified_by: user.id,
    verified_at: now 
  }).eq('id', projectId)
    ↓
  // Generates credits
  Line 56: generateCreditsForProject(projectId)
    ↓
  // Inserts into project_credits table
  Line 103: supabase.from('project_credits').insert([{
    project_id: projectId,
    total_credits: 1000,
    available_credits: 1000,
    price_per_credit: 15.00
  }])
    ↓
  // Creates marketplace listing
  Line 121: supabase.from('credit_listings').insert([{
    project_credit_id: credits.id,
    quantity: 1000,
    price_per_credit: 15.00,
    status: 'active'
  }])
    ↓
  // Updates UI
  Line 115: pendingProjects.value.filter() ← Removes from pending list
  Line 117: successMessage.value ← Shows success notification
}
```

---

### **3. `project_credits` TABLE**
**What's in Supabase:**
```sql
project_credits:
  - id (UUID)
  - project_id (FK)
  - vintage_year
  - verification_standard
  - total_credits
  - available_credits
  - price_per_credit
  - currency
  - created_at
```

**Where It Shows in Frontend:**

#### **Admin Dashboard Stats** (`AdminDashboard.vue:154-167`)
```javascript
// Query: Sum all credits
supabase.from('project_credits').select('total_credits')
↓
Stats Card: "Total Credits: 15,000"
```

**Display Calculation:**
```javascript
Line 217: stats.value.totalCredits = creditsResult.data.reduce(
  (sum, credit) => sum + (parseInt(credit.total_credits) || 0),
  0
)
```

---

### **4. `credit_listings` TABLE**
**What's in Supabase:**
```sql
credit_listings:
  - id (UUID)
  - project_credit_id (FK)
  - seller_id (FK to profiles)
  - quantity
  - price_per_credit
  - currency
  - status (active/sold/inactive)
  - listed_at
```

**Where It Shows:**

#### **Analytics Service** (`analyticsService.js:306-308`)
```javascript
// Query active listings
supabase.from('credit_listings')
  .select('quantity, price_per_credit, currency, status')
  .eq('status', 'active')
↓
Marketplace statistics
```

---

### **5. `credit_transactions` TABLE**
**What's in Supabase:**
```sql
credit_transactions:
  - id (UUID)
  - buyer_id (FK)
  - seller_id (FK)
  - quantity
  - total_amount
  - currency
  - status (pending/completed/failed)
  - created_at
```

**Where It Shows:**

#### **Analytics Service** (`analyticsService.js:311-314`)
```javascript
// Query completed transactions
supabase.from('credit_transactions')
  .select('quantity, total_amount, currency, created_at, status')
  .eq('status', 'completed')
↓
Transaction statistics
```

---

### **6. `credit_ownership` TABLE**
**What's in Supabase:**
```sql
credit_ownership:
  - id (UUID)
  - user_id (FK)
  - project_id (FK)
  - quantity
  - ownership_type
  - transaction_id
  - created_at
```

**Where It Shows:**

#### **Analytics Service** (`analyticsService.js:59`)
```javascript
// Query total credits owned
supabase.from('credit_ownership').select('*', { count: 'exact', head: true })
↓
Credit trading statistics
```

---

### **7. `wallet_accounts` TABLE**
**What's in Supabase:**
```sql
wallet_accounts:
  - id (UUID)
  - user_id (FK)
  - current_balance
  - currency
  - created_at
  - updated_at
```

**Where It Shows:**

#### **Database Management View** (`DatabaseManagement.vue:77-96`)
```javascript
// Display in admin database viewer
Line 158: supabase.from('wallet_accounts').select('*', { count: 'exact', head: true })
↓
Database table card shows: "Rows: 42"
```

---

### **8. `audit_logs` TABLE**
**What's in Supabase:**
```sql
audit_logs:
  - id (UUID)
  - user_id (FK)
  - action
  - entity_type
  - entity_id
  - metadata (JSONB)
  - ip_address
  - user_agent
  - timestamp
```

**Where It Shows:**

#### **Audit Logs View** (`AuditLogsView.vue:146-150`)
```javascript
// Query all audit logs
searchAuditLogs({}, 500)  → calls auditService
  → supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500)
↓
Audit Logs Table:
  Timestamp  | User      | Action   | Resource | Details
  2024-01-15 | Admin     | LOGIN    | user     | Login successful
  2024-01-14 | Admin     | APPROVE  | project  | Project #123 approved
```

**Display:**
```vue
<tbody>
  <tr v-for="log in filteredLogs">
    <td>{{ formatDate(log.created_at) }}</td>
    <td>{{ log.user_name }}</td>
    <td>{{ log.action }}</td>
    <td>{{ log.resource_type }}</td>
    <td>{{ formatDetails(log.details) }}</td>
  </tr>
</tbody>
```

---

### **9. `certificates` TABLE**
**What's in Supabase:**
```sql
certificates:
  - id (UUID)
  - user_id (FK)
  - transaction_id (FK)
  - certificate_number
  - certificate_type
  - credits_purchased
  - issued_at
  - status
```

**Where It Shows:**

#### **Database Management**
```javascript
Click on "certificates" card
→ supabase.from('certificates').select('*').limit(100)
↓
Table shows all certificate data
```

---

### **10. `receipts` TABLE**
**What's in Supabase:**
```sql
receipts:
  - id (UUID)
  - transaction_id (FK)
  - user_id (FK)
  - receipt_number
  - total_amount
  - currency
  - issued_at
  - file_url
```

**Where It Shows:**

#### **Database Management**
```javascript
Click on "receipts" card
→ supabase.from('receipts').select('*').limit(100)
↓
Table shows all receipt data
```

---

## 🎯 **REAL-TIME DATA FLOW EXAMPLE**

### **Scenario: Admin Approves a Project**

```
STEP 1: Admin clicks "✅ Approve" button
↓
STEP 2: Frontend calls projectApprovalService.approveProject(projectId)
↓
STEP 3: Supabase UPDATE query executes:
   UPDATE projects 
   SET status = 'approved', verified_by = 'admin-uuid', verified_at = NOW()
   WHERE id = 'project-uuid'
↓
STEP 4: Supabase INSERT query #1:
   INSERT INTO project_credits (project_id, total_credits, ...)
   VALUES ('project-uuid', 1000, ...)
   Returns: { id: 'credit-uuid', total_credits: 1000 }
↓
STEP 5: Supabase INSERT query #2:
   INSERT INTO credit_listings (project_credit_id, quantity, ...)
   VALUES ('credit-uuid', 1000, ...)
   Returns: { id: 'listing-uuid', status: 'active' }
↓
STEP 6: Frontend reactive update:
   pendingProjects.value = pendingProjects.value.filter(p => p.id !== projectId)
   → UI automatically removes project from pending list
↓
STEP 7: Success message displayed
   successMessage.value = "Project approved and credits generated!"
↓
STEP 8: Next time dashboard loads, stats update:
   - Pending Projects: 2 (was 3)
   - Active Projects: 16 (was 15)
   - Total Credits: 16,000 (was 15,000)
```

---

## 🔍 **HOW TO VERIFY DATA IS FLOWING**

### **1. Open Browser DevTools**

```javascript
F12 → Console Tab
```

### **2. Navigate to Admin Dashboard**
```
http://localhost:5173/admin
```

### **3. Watch Console Logs**

You'll see:
```javascript
🚀 Initializing EcoLink app...
🔐 Setting up auth state listener...
📡 Fetching initial session in App.vue...
✅ Initial session fetch completed
✅ User is authenticated: admin@ecolink.test
🔍 [Analytics] Starting queries...
📊 [Analytics] Projects result: { count: 18, error: null }
📊 [Analytics] Active projects result: { count: 15, error: null }
📊 [Analytics] Users result: { count: 42, error: null }
📊 [Analytics] Transactions result: { count: 156, error: null }
Total users from platform overview: 42
Projects loaded: { total: 18, active: 15, pending: 3 }
Total credits from project_credits: 15000
```

### **4. Inspect Network Tab**

```
F12 → Network Tab → Filter: XHR
```
You'll see Supabase API calls:
```
GET /rest/v1/profiles?select=*
GET /rest/v1/projects?select=*&status=eq.pending
GET /rest/v1/project_credits?select=total_credits
```

### **5. Check Vue DevTools**

```
Vue DevTools → Pinia Tab → user store
```
See reactive state:
```javascript
session: { user: { email: 'admin@ecolink.test' } }
profile: { role: 'admin', full_name: 'Admin User' }
```

---

## 🎨 **VISUAL ADMIN PANEL BREAKDOWN**

### **AdminDashboard.vue**
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Admin Dashboard"                               │
└─────────────────────────────────────────────────────────┘

┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐
│ Total Users │ │Active Proj.  │ │Pending Proj. │ │Credits│
│     42      │ │      15      │ │      3       │ │ 15,000│
└─────────────┘ └──────────────┘ └──────────────┘ └───────┘
    ↑                ↑                 ↑              ↑
   profiles     projects          projects      project_credits
    count      WHERE status=      WHERE         SUM(total_credits)
             'approved'         status='pending'

┌─────────────────────────────────────────────────────────┐
│ Project Approval                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ "Solar Farm Project"        [✅ Approve] [❌ Reject]│ │
│ │ Location: Philippines                                │ │
│ │ Expected Impact: 500 tons CO2 reduction/year        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ "Wind Energy Project"       [✅ Approve] [❌ Reject]│ │
│ │ Location: Brazil                                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Admin Tools                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│ │ 👥 Users │  │ 🗄️  DB   │  │ 📋 Logs  │              │
│ │Management│  │Management│  │ Audit    │              │
│ └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **TROUBLESHOOTING: Why Data Might Not Show**

### **1. RLS Policy Issue**
```
Symptom: Stats show 0 users, 0 projects
Check: Console shows RLS error
Fix: Run sql/fix-admin-rls-policies.sql in Supabase
```

### **2. Authentication Issue**
```
Symptom: Redirected to login
Check: userStore.isAuthenticated === false
Fix: Ensure admin role in profiles table
```

### **3. No Data in Database**
```
Symptom: Everything works but no data shows
Check: Supabase dashboard → Table Editor
Fix: Insert test data via SQL editor
```

### **4. Network Error**
```
Symptom: Console shows fetch error
Check: F12 → Network tab → Failed requests
Fix: Check VITE_SUPABASE_URL in .env
```

---

## ✅ **SUMMARY**

| Supabase Table | Admin Panel Location | Query Method |
|----------------|---------------------|--------------|
| `profiles` | Stats Card + User Management | `.select('*', { count: 'exact' })` |
| `projects` | Stats + Approval Panel | `.select('*').eq('status', 'pending')` |
| `project_credits` | Stats Card | `.select('total_credits')` |
| `credit_listings` | Analytics | `.select('*').eq('status', 'active')` |
| `credit_transactions` | Analytics | `.select('*').eq('status', 'completed')` |
| `credit_ownership` | Analytics | `.select('*', { count: 'exact' })` |
| `wallet_accounts` | Database Viewer | `.select('*').limit(100)` |
| `wallet_transactions` | Database Viewer | `.select('*').limit(100)` |
| `audit_logs` | Audit Logs Page | `.select('*').order().limit(500)` |
| `certificates` | Database Viewer | `.select('*').limit(100)` |
| `receipts` | Database Viewer | `.select('*').limit(100)` |

**ALL DATA FLOWS:**
```
Supabase → RLS Check → Service Layer → Reactive State → Vue Template → User's Eyes
```

**Your admin panel is LIVE and showing EXACTLY what's in your Supabase database!** 🎉



