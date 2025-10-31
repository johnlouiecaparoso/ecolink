# EcoLink Entity Relationship Diagram (ERD)

## Complete ERD (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM                      │
│                           EcoLink Database                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   auth.users        │
│ ────────────────    │
│ id (PK)             │◄──────────┐
│ email               │           │
│ created_at          │           │
│ updated_at          │           │
└──────────┬──────────┘           │
           │                      │
           │ 1:1                  │
           │                       │
           ▼                       │
┌─────────────────────┐           │
│   profiles          │           │
│ ────────────────    │           │
│ id (PK) ◄───────────┼───────────┘
│ full_name           │
│ email               │
│ role                │
│ company             │
│ location            │
│ bio                 │
│ kyc_level           │
│ avatar_url          │
│ phone               │
│ website             │
│ created_at          │
│ updated_at          │
└───┬─────────────────┘
    │
    │ 1:many
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
┌─────────────┐  ┌──────────────────┐
│  projects   │  │ wallet_accounts  │
│ ──────────  │  │ ───────────────  │
│ id (PK)     │  │ id (PK)          │
│ title       │  │ user_id (FK)     │◄──┐
│ description │  │ current_balance  │   │
│ category    │  │ currency         │   │
│ location    │  │ created_at       │   │
│ expected_   │  │ updated_at       │   │
│   impact    │  └────────┬─────────┘   │
│ user_id (FK)│           │             │
│ status      │           │ 1:many       │
│ verification│           │             │
│   notes     │           ▼             │
│ verified_by │  ┌──────────────────┐  │
│ verified_at │  │wallet_transactions│  │
│ created_at  │  │ ───────────────  │  │
│ updated_at  │  │ id (PK)          │  │
└──────┬──────┘  │ user_id (FK)     │  │
       │          │ account_id (FK) │──┘
       │ 1:many   │ type            │
       │          │ amount          │
       │          │ status          │
       │          │ payment_method  │
       │          │ created_at      │
       │          │ updated_at      │
       │          └─────────────────┘
       │
       ▼
┌─────────────────────┐
│  project_credits    │
│ ────────────────    │
│ id (PK)             │
│ project_id (FK)     │
│ vintage_year        │
│ verification_       │
│   standard          │
│ total_credits        │
│ available_credits    │
│ price_per_credit    │
│ currency            │
│ created_at          │
└──────┬──────────────┘
       │
       │ 1:many
       │
       ▼
┌─────────────────────┐
│ credit_listings     │
│ ────────────────    │
│ id (PK)             │
│ project_credit_id   │
│   (FK)              │
│ seller_id (FK)      │◄──┐
│ quantity            │   │
│ price_per_credit    │   │
│ currency            │   │
│ status              │   │
│ listed_at           │   │
│ created_at          │   │
└──────┬──────────────┘   │
       │                  │
       │ 1:many           │
       │                  │
       ▼                  │
┌─────────────────────┐  │
│ credit_purchases    │  │
│ ────────────────    │  │
│ id (PK)             │  │
│ listing_id (FK)     │  │
│ buyer_id (FK)       │──┘
│ seller_id (FK)      │──┐
│ credits_purchased   │  │
│ price_per_credit    │  │
│ total_amount        │  │
│ currency            │  │
│ status              │  │
│ payment_method      │  │
│ transaction_id      │  │
│ created_at          │  │
└──────┬──────────────┘  │
       │                  │
       │ 1:1              │
       │                  │
       ▼                  │
┌─────────────────────┐  │
│  certificates       │  │
│ ────────────────    │  │
│ id (PK)             │  │
│ user_id (FK)        │──┘
│ transaction_id (FK) │
│ certificate_number  │
│ certificate_type    │
│ credits_purchased   │
│ issued_at           │
│ status              │
└─────────────────────┘

┌─────────────────────┐
│ credit_ownership    │
│ ────────────────    │
│ id (PK)             │
│ user_id (FK)        │◄──┐
│ project_id (FK)     │   │
│ quantity            │   │
│ ownership_type      │   │
│ transaction_id      │   │
│ created_at          │   │
│ updated_at          │   │
└─────────────────────┘   │
                          │
                          │
┌─────────────────────┐  │
│ credit_retirements │  │
│ ────────────────    │  │
│ id (PK)             │  │
│ user_id (FK)        │──┘
│ project_id (FK)     │
│ quantity            │
│ reason              │
│ retired_at          │
└─────────────────────┘


┌─────────────────────┐
│  audit_logs         │
│ ────────────────    │
│ id (PK)             │
│ user_id (FK)        │◄──┐
│ action              │   │
│ entity_type         │   │
│ entity_id           │   │
│ metadata            │   │
│ ip_address          │   │
│ user_agent          │   │
│ timestamp           │   │
└─────────────────────┘   │
                          │
                          │
                          │
                          │ (All entities relate to profiles)
                          │
                          └───┐
                              │
                              ▼
                    ┌─────────────────┐
                    │    profiles     │
                    │  (Central Hub)  │
                    └─────────────────┘
```

## Entity Descriptions

### 1. auth.users (Supabase Auth)

- **Purpose**: User authentication managed by Supabase
- **Key Attributes**: id, email
- **Relationships**: 1:1 with profiles

### 2. profiles

- **Purpose**: User profile information
- **Key Attributes**: id, full_name, email, role, kyc_level
- **Relationships**:
  - 1:1 with auth.users
  - 1:many with projects
  - 1:1 with wallet_accounts
  - 1:many with credit_ownership
  - 1:many with credit_purchases (as buyer)
  - 1:many with credit_listings (as seller)
  - 1:many with certificates
  - 1:many with credit_retirements
  - 1:many with wallet_transactions
  - 1:many with audit_logs

### 3. projects

- **Purpose**: Environmental projects that generate credits
- **Key Attributes**: id, title, description, status, user_id
- **Relationships**:
  - many:1 with profiles (owner)
  - 1:many with project_credits
  - 1:many with credit_ownership
  - 1:many with credit_retirements

### 4. project_credits

- **Purpose**: Credits generated from approved projects
- **Key Attributes**: id, project_id, total_credits, available_credits, price_per_credit
- **Relationships**:
  - many:1 with projects
  - 1:many with credit_listings

### 5. credit_listings

- **Purpose**: Available credits for sale in marketplace
- **Key Attributes**: id, project_credit_id, seller_id, quantity, price_per_credit, status
- **Relationships**:
  - many:1 with project_credits
  - many:1 with profiles (seller)
  - 1:many with credit_purchases

### 6. credit_purchases

- **Purpose**: Records of credit purchases
- **Key Attributes**: id, listing_id, buyer_id, seller_id, credits_purchased, total_amount, status
- **Relationships**:
  - many:1 with credit_listings
  - many:1 with profiles (buyer)
  - many:1 with profiles (seller)
  - 1:1 with certificates

### 7. credit_ownership

- **Purpose**: Tracks which users own which credits
- **Key Attributes**: id, user_id, project_id, quantity, ownership_type
- **Relationships**:
  - many:1 with profiles
  - many:1 with projects

### 8. credit_retirements

- **Purpose**: Records of retired (non-tradable) credits
- **Key Attributes**: id, user_id, project_id, quantity, reason, retired_at
- **Relationships**:
  - many:1 with profiles
  - many:1 with projects

### 9. wallet_accounts

- **Purpose**: User wallet accounts for managing funds
- **Key Attributes**: id, user_id, current_balance, currency
- **Relationships**:
  - 1:1 with profiles
  - 1:many with wallet_transactions

### 10. wallet_transactions

- **Purpose**: Transaction history for wallet operations
- **Key Attributes**: id, user_id, account_id, type, amount, status, payment_method
- **Relationships**:
  - many:1 with profiles
  - many:1 with wallet_accounts

### 11. certificates

- **Purpose**: Digital certificates for purchased credits
- **Key Attributes**: id, user_id, transaction_id, certificate_number, credits_purchased
- **Relationships**:
  - many:1 with profiles
  - 1:1 with credit_purchases

### 12. audit_logs

- **Purpose**: System activity and user action logs
- **Key Attributes**: id, user_id, action, entity_type, entity_id, metadata
- **Relationships**:
  - many:1 with profiles (nullable)

## Relationship Cardinalities

| Relationship                        | Cardinality | Description                                 |
| ----------------------------------- | ----------- | ------------------------------------------- |
| profiles ↔ auth.users              | 1:1         | Each user has one profile                   |
| profiles ↔ projects                | 1:many      | User can have multiple projects             |
| profiles ↔ wallet_accounts         | 1:1         | Each user has one wallet                    |
| projects ↔ project_credits         | 1:many      | Project generates multiple credit records   |
| project_credits ↔ credit_listings  | 1:many      | Credits can be listed multiple times        |
| credit_listings ↔ credit_purchases | 1:many      | Listing can have multiple purchases         |
| profiles ↔ credit_ownership        | 1:many      | User can own credits from multiple projects |
| credit_purchases ↔ certificates    | 1:1         | Each purchase generates one certificate     |

## Key Constraints

1. **Foreign Key Constraints**:
   - All foreign keys enforce referential integrity
   - ON DELETE CASCADE for ownership and transactions
   - ON DELETE SET NULL for audit logs

2. **Unique Constraints**:
   - One wallet per user (wallet_accounts.user_id)
   - Unique certificate numbers
   - Unique email addresses

3. **Check Constraints**:
   - Wallet transaction types: deposit, withdrawal, payment, refund
   - Transaction status: pending, completed, failed, cancelled
   - Credit listing status: active, sold, cancelled, expired

4. **Default Values**:
   - Project status: 'pending'
   - User role: 'general_user'
   - Currency: 'USD' or 'PHP'
   - KYC level: 0

## Data Integrity Rules

1. **Credit Balance**:
   - `available_credits` ≤ `total_credits`
   - Cannot sell more credits than available

2. **Wallet Balance**:
   - `current_balance` must be ≥ 0
   - Transactions update balance atomically

3. **Ownership Tracking**:
   - Credits move from listing → ownership on purchase
   - Retired credits removed from ownership

4. **Transaction Consistency**:
   - Purchase must have valid listing
   - Certificate generated only after purchase completion




