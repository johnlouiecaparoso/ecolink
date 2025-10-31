# EcoLink Data Flow Diagram (DFD)

## Level 0: Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXTERNAL ENTITIES                       │
│                                                                  │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐             │
│  │   User    │    │ Project   │    │  Buyer    │             │
│  │           │    │ Developer  │    │ /Investor │             │
│  └─────┬─────┘    └─────┬─────┘    └─────┬─────┘             │
│        │                 │                 │                   │
│        │   User Data     │  Project Data   │  Purchase Data    │
│        │   Profile Data  │  Status Updates │  Transaction Data │
│        │   Auth Requests │  Credit Data    │  Payment Data     │
│        │                 │                 │                   │
│        └─────────┬───────┴─────────┬───────┘                   │
│                  │                 │                           │
│                  ▼                 ▼                           │
│        ┌─────────────────────────────────────┐              │
│        │      EcoLink Marketplace System       │              │
│        │                                       │              │
│        │  ┌──────────────┐  ┌──────────────┐ │              │
│        │  │  Frontend    │  │  Services    │ │              │
│        │  │  (Vue.js)    │  │  Layer      │ │              │
│        │  └──────────────┘  └──────────────┘ │              │
│        │                                       │              │
│        │           Data Requests               │              │
│        │           Data Responses              │              │
│        └───────────────┬───────────────────────┘              │
│                        │                                      │
│                        │                                      │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         │
    ┌────────────────────┴────────────────────┐
    │                                         │
    ▼                                         ▼
┌──────────────┐                    ┌──────────────┐
│   Supabase   │                    │   Payment    │
│   Database   │                    │   Gateways   │
│   (Backend)  │                    │  (GCash/Maya)│
└──────────────┘                    └──────────────┘
```

## Level 1: System Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EcoLink System                                   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   1.0 User Management                              │ │
│  │  ┌──────────┐                                                    │ │
│  │  │  User    │───User Credentials───┐                             │ │
│  │  │ Requests │                      │                             │ │
│  │  └──────────┘                      │                             │ │
│  │                                    ▼                             │ │
│  │                            ┌─────────────┐                      │ │
│  │                            │ Authenticate│                      │ │
│  │                            │   User      │                      │ │
│  │                            └──────┬──────┘                      │ │
│  │                                   │                             │ │
│  │                                   │ Session Data                │ │
│  │                                   ▼                             │ │
│  │                            ┌─────────────┐                      │ │
│  │                            │ Fetch       │                      │ │
│  │                            │ Profile     │                      │ │
│  │                            └──────┬──────┘                      │ │
│  │                                   │                             │ │
│  │                                   │ Profile Data                │ │
│  │                                   ▼                             │ │
│  │                            ┌─────────────┐                      │ │
│  │                            │ D1: User    │                      │ │
│  │                            │ Profiles    │                      │ │
│  │                            └─────────────┘                      │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   2.0 Project Management                         │ │
│  │                                                                   │ │
│  │  ┌──────────┐                                                   │ │
│  │  │Project   │───Project Data───┐                                │ │
│  │  │Developer │                  │                                │ │
│  │  └──────────┘                  │                                │ │
│  │                                 ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ Validate &  │                         │ │
│  │                         │ Store       │                         │ │
│  │                         │ Project     │                         │ │
│  │                         └──────┬──────┘                         │ │
│  │                                │                                │ │
│  │                                │ Project Data                   │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ D2: Projects│                         │ │
│  │                         └─────────────┘                         │ │
│  │                                                                   │ │
│  │                                │                                │ │
│  │                                │ Status Updates                  │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ Admin/      │                         │ │
│  │                         │ Verifier    │                         │ │
│  │                         │ Review      │                         │ │
│  │                         └──────┬──────┘                         │ │
│  │                                │                                │ │
│  │                                │ Approval/Rejection              │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ Update      │                         │ │
│  │                         │ Status     │                         │ │
│  │                         └─────────────┘                         │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   3.0 Marketplace Operations                     │ │
│  │                                                                   │ │
│  │  ┌──────────┐                                                   │ │
│  │  │  Buyer   │───Search Query───┐                                 │ │
│  │  │          │                  │                                 │ │
│  │  │          │───Purchase Req───┤                                 │ │
│  │  └──────────┘                  │                                 │ │
│  │                                 │                                 │ │
│  │                                 ▼                                 │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ Search &    │                         │ │
│  │                         │ Filter      │                         │ │
│  │                         │ Listings    │                         │ │
│  │                         └──────┬──────┘                         │ │
│  │                                │                                │ │
│  │                                │ Listing Data                    │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ D3: Credit │                         │ │
│  │                         │ Listings   │                         │ │
│  │                         └─────────────┘                         │ │
│  │                                                                   │ │
│  │                                │                                │ │
│  │                                │ Purchase Request                │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ Process     │                         │ │
│  │                         │ Purchase    │                         │ │
│  │                         └──────┬──────┘                         │ │
│  │                                │                                │ │
│  │                                │ Payment Data                   │ │
│  │                                ▼                                │ │
│  │                         ┌─────────────┐                         │ │
│  │                         │ 4.0 Payment │                         │ │
│  │                         │ Processing  │                         │ │
│  │                         └─────────────┘                         │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   4.0 Payment Processing                         │ │
│  │                                                                   │ │
│  │  Purchase Data ────► Process Payment                             │ │
│  │                            │                                     │ │
│  │                            │ Payment Request                     │ │
│  │                            ▼                                     │ │
│  │                    ┌─────────────┐                               │ │
│  │                    │ External    │                               │ │
│  │                    │ Payment API │                               │ │
│  │                    └──────┬──────┘                               │ │
│  │                           │                                      │ │
│  │                           │ Confirmation                          │ │
│  │                           ▼                                      │ │
│  │                    ┌─────────────┐                               │ │
│  │                    │ Update       │                               │ │
│  │                    │ Wallet &     │                               │ │
│  │                    │ Ownership    │                               │ │
│  │                    └──────┬───────┘                               │ │
│  │                           │                                      │ │
│  │                           │ Transaction Data                     │ │
│  │                           ▼                                      │ │
│  │                    ┌─────────────┐                               │ │
│  │                    │ D4: Wallet  │                               │ │
│  │                    │ Transactions│                               │ │
│  │                    └─────────────┘                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   5.0 Credit Management                           │ │
│  │                                                                   │ │
│  │  Purchase Confirmation ────► Generate Credits                    │ │
│  │                                    │                              │ │
│  │                                    │ Credit Data                  │ │
│  │                                    ▼                              │ │
│  │                            ┌─────────────┐                        │ │
│  │                            │ D5: Credit │                        │ │
│  │                            │ Ownership  │                        │ │
│  │                            └─────────────┘                        │ │
│  │                                                                   │ │
│  │                                    │                              │ │
│  │                                    │ Certificate Data              │ │
│  │                                    ▼                              │ │
│  │                            ┌─────────────┐                        │ │
│  │                            │ D6:         │                        │ │
│  │                            │ Certificates│                        │ │
│  │                            └─────────────┘                        │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   6.0 Analytics & Reporting                       │ │
│  │                                                                   │ │
│  │  Admin ────Analytics Request───► Generate Reports                 │ │
│  │              │                                                  │ │
│  │              │ Query Data                                        │ │
│  │              │                                                   │ │
│  │              ├──► D1: Profiles                                    │ │
│  │              ├──► D2: Projects                                    │ │
│  │              ├──► D3: Listings                                    │ │
│  │              ├──► D4: Transactions                                │ │
│  │              └──► D5: Ownership                                   │ │
│  │                                                                   │ │
│  │              │ Aggregated Data                                    │ │
│  │              ▼                                                   │ │
│  │          ┌─────────────┐                                         │ │
│  │          │ Display     │                                         │ │
│  │          │ Analytics   │                                         │ │
│  │          └─────────────┘                                         │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

Data Stores (D):
D1: User Profiles
D2: Projects
D3: Credit Listings
D4: Wallet Transactions
D5: Credit Ownership
D6: Certificates
D7: Audit Logs
```

## Data Flow Definitions

### Data Flows

1. **User Credentials** → Authentication request (email, password)
2. **Session Data** → JWT token, user ID, expiry
3. **Profile Data** → User information (name, role, email, etc.)
4. **Project Data** → Project details (title, description, category, etc.)
5. **Credit Data** → Credit information (quantity, price, project association)
6. **Payment Data** → Payment details (amount, method, reference)
7. **Transaction Data** → Transaction record (type, amount, status)
8. **Search Query** → Filter criteria (category, price range, location)
9. **Listing Data** → Available credit listings from marketplace

### Data Store Contents

**D1: User Profiles**

- User ID, name, email, role, KYC level, wallet balance

**D2: Projects**

- Project ID, title, description, status, owner, verification info

**D3: Credit Listings**

- Listing ID, project credits ID, seller, quantity, price, status

**D4: Wallet Transactions**

- Transaction ID, user ID, type, amount, status, payment method

**D5: Credit Ownership**

- Ownership ID, user ID, project ID, quantity, ownership type

**D6: Certificates**

- Certificate ID, user ID, transaction ID, credits, issued date

## Process Descriptions

### Process 1.0: User Management

- Handles authentication, registration, profile management
- Input: User credentials, profile updates
- Output: Session tokens, profile data
- Data Stores: D1 (Profiles)

### Process 2.0: Project Management

- Handles project submission, approval workflow
- Input: Project data, approval decisions
- Output: Project status, credit generation
- Data Stores: D2 (Projects)

### Process 3.0: Marketplace Operations

- Handles credit listings, search, purchase requests
- Input: Search queries, purchase requests
- Output: Listing results, purchase confirmations
- Data Stores: D3 (Credit Listings)

### Process 4.0: Payment Processing

- Handles payment transactions
- Input: Payment requests
- Output: Transaction records, confirmations
- Data Stores: D4 (Wallet Transactions)

### Process 5.0: Credit Management

- Handles credit ownership, certificate generation
- Input: Purchase confirmations
- Output: Ownership records, certificates
- Data Stores: D5 (Credit Ownership), D6 (Certificates)

### Process 6.0: Analytics & Reporting

- Generates platform statistics and reports
- Input: Analytics requests
- Output: Aggregated statistics
- Data Stores: All (D1-D6)




