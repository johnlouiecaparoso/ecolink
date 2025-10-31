# EcoLink Conceptual Framework

## System Purpose

EcoLink is a carbon credit marketplace platform that connects project developers, verifiers, buyers, and investors to facilitate the trading of environmental credits.

## Core Concepts

### 1. Carbon Credits

- **Definition**: Certificates representing reduction or removal of one tonne of CO2 equivalent
- **Attributes**: Vintage year, verification standard, project association
- **Lifecycle**: Generated → Listed → Purchased → Owned → Retired

### 2. Projects

- **Definition**: Environmental initiatives that generate carbon credits
- **Types**: Reforestation, renewable energy, waste management, etc.
- **Status**: Pending → Under Review → Approved → Active

### 3. Users & Roles

- **General User**: Can buy credits, manage wallet, view certificates
- **Project Developer**: Can submit projects, track status
- **Verifier**: Can review and approve projects
- **Buyer/Investor**: Focused on purchasing credits
- **Administrator**: Full system access

### 4. Marketplace

- **Definition**: Trading platform for carbon credits
- **Features**: Search, filter, purchase, listing management
- **Transactions**: Buyer ↔ Seller through platform

### 5. Wallet System

- **Definition**: Digital wallet for managing funds
- **Features**: Balance, transactions, top-up, withdrawal
- **Integration**: GCash, Maya payment gateways

## Conceptual Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECOLINK CONCEPTUAL MODEL                      │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Carbon     │
                    │   Credits    │
                    │              │
                    │ • Quantity   │
                    │ • Price      │
                    │ • Vintage    │
                    │ • Standard   │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Projects   │  │  Ownership   │  │  Retirement  │
│              │  │              │  │              │
│ • Status     │  │ • User       │  │ • Reason     │
│ • Impact     │  │ • Quantity   │  │ • Date      │
│ • Location   │  │ • Type       │  │ • Verified   │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                  │
       │                  │
       └──────────┬───────┘
                  │
                  ▼
          ┌──────────────┐
          │  Marketplace │
          │              │
          │ • Listings   │
          │ • Trading    │
          │ • Pricing    │
          └──────┬───────┘
                 │
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────────┐      ┌──────────────┐
│   Payments   │      │  Certificates│
│              │      │              │
│ • Methods    │      │ • Number     │
│ • Amount     │      │ • Credits    │
│ • Status     │      │ • Issue Date │
└──────────────┘      └──────────────┘
```

## Business Logic Flow

```
USER REGISTRATION
    │
    ├─► Create Auth Account
    │
    ├─► Create Profile
    │
    └─► Assign Default Role (general_user)
        │
        │
PROJECT SUBMISSION (Project Developer)
    │
    ├─► Submit Project Details
    │
    ├─► Status: Pending
    │
    ├─► Verifier Review
    │
    ├─► Approval/Rejection
    │
    └─► If Approved:
        │
        ├─► Generate Credits
        │
        ├─► Create Credit Listing
        │
        └─► Status: Available

CREDIT PURCHASE (Buyer)
    │
    ├─► Browse Marketplace
    │
    ├─► Select Credits
    │
    ├─► Choose Payment Method
    │
    ├─► Process Payment
    │
    ├─► Update Credit Ownership
    │
    ├─► Generate Certificate
    │
    └─► Update Wallet Balance

CREDIT RETIREMENT
    │
    ├─► User Selects Credits
    │
    ├─► Provide Retirement Reason
    │
    ├─► Mark Credits as Retired
    │
    └─► Update Records (Non-tradable)
```

## System Principles

### 1. Transparency

- All transactions are recorded
- Project details are visible
- Certificate tracking

### 2. Security

- Authentication required
- Role-based access control
- RLS policies on database
- Encrypted transactions

### 3. Verification

- Projects verified before credit generation
- Verifiers review and approve
- Standards compliance

### 4. Trust

- Verified projects only
- Transparent pricing
- Audit trail for all actions

## Domain Model Relationships

```
User (1) ────< (many) Projects
  │
  │
  ├───< (many) Credit Ownership
  │
  ├───< (1) Wallet Account
  │
  ├───< (many) Wallet Transactions
  │
  └───< (many) Certificates

Project (1) ────< (many) Project Credits
  │
  └───< (many) Credit Listings

Credit Listing (1) ────< (many) Credit Purchases
  │
  └───> (1) Project Credits

Credit Purchase (1) ────> (1) Certificate
```

## Key Business Rules

1. **Credit Generation Rule**
   - Credits generated only after project approval
   - Credits linked to specific projects
   - Quantity determined by project impact

2. **Purchase Rules**
   - User must have sufficient wallet balance OR use payment gateway
   - Credits transfer from seller to buyer
   - Transaction fee applies

3. **Retirement Rules**
   - Retired credits cannot be traded
   - Retirement is permanent
   - Certificate issued for retirement

4. **Role Rules**
   - Users can only submit projects if role = project_developer
   - Only verifiers and admins can approve projects
   - Admins have full system access

5. **Wallet Rules**
   - One wallet per user
   - Minimum withdrawal amount
   - Transaction fees for payments




