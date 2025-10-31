# EcoLink Sequence Diagrams

These Mermaid sequence diagrams reflect the actual flows implemented in `src/router/index.js`, `src/components/auth/LoginForm.vue`, and services under `src/services/`.

## 1) User Login Flow (Email/Password)

```mermaid
sequenceDiagram
autonumber
actor U as User
participant V as Vue Component (LoginForm)
participant S as Auth Service (authService.js)
participant ST as Pinia Store (userStore)
participant SB as Supabase Auth
participant DB as DB (profiles)

U->>V: Enter email + password, click Login
V->>S: loginWithEmail(email, password)
S->>SB: auth.signInWithPassword()
SB-->>S: { session, user }
S-->>V: { session }
V->>ST: store.session = session
V->>ST: fetchUserProfile()
ST->>DB: SELECT * FROM profiles WHERE id = auth.uid()
DB-->>ST: profile { role }
ST-->>V: profile loaded
V->>Router: redirect to getRoleDefaultRoute(role)
Router-->>U: Navigate to role dashboard
```

## 2) Page Refresh Session Restore

```mermaid
sequenceDiagram
autonumber
participant B as Browser
participant R as Router Guard
participant ST as Pinia Store (userStore)
participant SB as Supabase Auth
participant DB as DB (profiles)

B->>R: Navigation (after refresh)
R->>ST: if (!session) fetchSession()
ST->>SB: auth.getSession()
alt Session exists
  SB-->>ST: { session }
  ST->>DB: getProfile(userId)
  DB-->>ST: profile { role }
  R-->>B: allow/redirect based on role
else No session yet
  R->>SB: auth.getSession() (direct fallback)
  SB-->>R: { session? }
  alt Found
    R->>ST: restore session; fetchUserProfile()
    ST->>DB: SELECT profile
    DB-->>ST: profile
    R-->>B: continue
  else Not found
    R-->>B: redirect to /login (with returnTo)
  end
end
```

## 3) Credit Purchase Flow

```mermaid
sequenceDiagram
autonumber
actor Buyer
participant MV as Marketplace View
participant MS as Marketplace Service
participant PS as Payment Service
participant SB as Supabase (DB)

Buyer->>MV: Click "Buy" on listing
MV->>MS: purchaseCredits({ listingId, amount, method })
MS->>PS: processPayment(method, amount)
alt Payment success
  PS-->>MS: confirmation
  MS->>SB: Insert credit_purchases
  MS->>SB: Update credit_ownership + decrement available_credits
  MS->>SB: Insert certificate
  MS-->>MV: success + receipt/certificate ids
  MV-->>Buyer: Show success + navigate to receipts/certificates
else Payment failed
  PS-->>MS: error
  MS-->>MV: show error
  MV-->>Buyer: Display failure message
end
```

## 4) Project Submission and Approval

```mermaid
sequenceDiagram
autonumber
actor Dev as Project Developer
participant PV as SubmitProjectView
participant PR as Project Service
participant SB as Supabase (DB)
actor Ver as Verifier/Admin
participant AV as Admin Dashboard

Dev->>PV: Submit project form
PV->>PR: createProject(data)
PR->>SB: INSERT INTO projects (status='pending')
SB-->>PR: project id
PR-->>PV: success
PV-->>Dev: Show pending status

Ver->>AV: Open pending list
AV->>SB: SELECT projects WHERE status='pending'
SB-->>AV: list
Ver->>AV: Approve project
AV->>SB: UPDATE projects SET status='approved'
AV->>SB: INSERT project_credits
SB-->>AV: ok
AV-->>Ver: Marked approved
```



