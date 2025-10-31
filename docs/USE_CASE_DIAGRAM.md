# EcoLink Use Case Diagram

## System Actors

### Primary Actors

1. **General User** - Regular users who buy credits
2. **Project Developer** - Users who submit carbon credit projects
3. **Verifier** - Users who verify and approve projects
4. **Buyer/Investor** - Users focused on purchasing credits
5. **Administrator** - System administrators with full access

### External Systems

- **GCash Payment Gateway**
- **Maya Payment Gateway**
- **Supabase Platform**

## Use Case Diagram (Text Format)

```
                            ┌─────────────────────────┐
                            │      EcoLink            │
                            │    Marketplace          │
                            │     Platform            │
                            └─────────────────────────┘
                                      │
    ┌─────────────────────────────────┼─────────────────────────────────┐
    │                                  │                                 │
    ▼                                  ▼                                 ▼

┌────────────┐              ┌──────────────┐                  ┌────────────┐
│  General   │              │   Project    │                  │  Admin    │
│   User     │              │  Developer   │                  │           │
└─────┬──────┘              └──────┬───────┘                  └─────┬─────┘
      │                            │                                │
      │                            │                                │
      ├─ Register Account          ├─ Submit Project                ├─ Manage Users
      ├─ Login                     ├─ Track Project Status          ├─ Approve Projects
      ├─ Browse Marketplace         ├─ View Sales Dashboard         ├─ View Analytics
      ├─ Search Credits            ├─ Manage Own Projects           ├─ Manage Database
      ├─ View Project Details      │                                ├─ View Audit Logs
      ├─ Buy Credits              │                                ├─ Configure System
      ├─ Manage Wallet             │                                │
      ├─ Top Up Wallet             │                                │
      ├─ View Certificates         │                                │
      ├─ View Receipts             │                                │
      ├─ Retire Credits            │                                │
      ├─ View Portfolio            │                                │
      └─ Update Profile            │                                │
                                   │                                │
┌──────────────┐                   │                                │
│   Verifier   │                   │                                │
└──────┬───────┘                   │                                │
       │                            │                                │
       ├─ Review Projects           │                                │
       ├─ Approve Projects          │                                │
       ├─ Reject Projects           │                                │
       ├─ Add Verification Notes    │                                │
       └─ Upload Reports            │                                │
                                   │                                │
┌──────────────┐                   │                                │
│ Buyer/      │                   │                                │
│ Investor    │                   │                                │
└──────┬───────┘                   │                                │
       │                            │                                │
       ├─ Search Credits            │                                │
       ├─ Filter by Criteria       │                                │
       ├─ Purchase Credits           │                                │
       ├─ Download Receipts         │                                │
       └─ View Purchase History     │                                │
                                   │                                │
                            ┌──────┴───────┐                       │
                            │              │                       │
                            ▼              ▼                       ▼
                    ┌─────────────┐  ┌──────────────┐    ┌──────────────┐
                    │    GCash    │  │     Maya     │    │  Supabase    │
                    │   Payment   │  │   Payment    │    │    Auth      │
                    └─────────────┘  └──────────────┘    └──────────────┘
```

## Detailed Use Cases by Actor

### General User Use Cases

1. **UC-001: Register Account**
   - User provides email, password, name
   - System creates account and profile
   - User receives confirmation

2. **UC-002: Login**
   - User enters credentials
   - System authenticates
   - User redirected to marketplace

3. **UC-003: Browse Marketplace**
   - User views available credit listings
   - User can filter by category, price, location
   - User can search by keywords

4. **UC-004: Purchase Credits**
   - User selects credit listing
   - User chooses payment method
   - System processes payment
   - Credits added to user portfolio
   - Certificate generated

5. **UC-005: Manage Wallet**
   - User views balance
   - User tops up wallet (GCash/Maya)
   - User withdraws funds
   - User views transaction history

6. **UC-006: View Certificates**
   - User views purchased certificates
   - User can download certificates
   - User views certificate details

7. **UC-007: Retire Credits**
   - User selects credits to retire
   - User provides retirement reason
   - System marks credits as retired
   - User receives confirmation

### Project Developer Use Cases

1. **UC-101: Submit Project**
   - Developer fills project form
   - Developer uploads documentation
   - System creates project (status: pending)
   - Developer receives confirmation

2. **UC-102: Track Project Status**
   - Developer views project list
   - Developer sees status (pending/approved/rejected)
   - Developer can view comments/notes

3. **UC-103: View Sales Dashboard**
   - Developer views credit sales
   - Developer sees revenue
   - Developer views analytics

### Verifier Use Cases

1. **UC-201: Review Projects**
   - Verifier views pending projects
   - Verifier examines project details
   - Verifier checks documentation

2. **UC-202: Approve Project**
   - Verifier approves project
   - System generates credits
   - Developer notified

3. **UC-203: Reject Project**
   - Verifier rejects project
   - Verifier adds rejection reason
   - Developer notified

### Administrator Use Cases

1. **UC-301: Manage Users**
   - Admin views all users
   - Admin updates user roles
   - Admin deactivates users

2. **UC-302: View Analytics**
   - Admin views platform statistics
   - Admin views user counts
   - Admin views transaction data

3. **UC-303: Manage Database**
   - Admin views database tables
   - Admin manages data
   - Admin runs queries

4. **UC-304: View Audit Logs**
   - Admin views system logs
   - Admin filters by user/action
   - Admin exports logs

### Buyer/Investor Use Cases

1. **UC-401: Search Credits**
   - Buyer searches marketplace
   - Buyer applies filters
   - Buyer saves searches

2. **UC-402: Purchase Credits**
   - Buyer selects credits
   - Buyer completes payment
   - Buyer receives certificate

3. **UC-403: View Portfolio**
   - Buyer views owned credits
   - Buyer views value
   - Buyer views history

## Use Case Relationships

### Includes (Mandatory)

- **Purchase Credits** includes **Process Payment**
- **Submit Project** includes **Validate Data**
- **Approve Project** includes **Generate Credits**

### Extends (Optional)

- **Purchase Credits** extends with **Top Up Wallet** (if insufficient funds)
- **View Marketplace** extends with **Advanced Search**
- **Manage Wallet** extends with **View Transaction History**

### Generalization

- **Top Up Wallet** (GCash)
- **Top Up Wallet** (Maya)
- Both are specializations of **Top Up Wallet**




