# EcoLink System Architecture

## Overview

EcoLink is a carbon credit marketplace platform built with Vue.js frontend and Supabase backend.

## Technology Stack

### Frontend Layer

- **Framework**: Vue.js 3.5.18 (Composition API)
- **Router**: Vue Router 4.5.1
- **State Management**: Pinia 3.0.3
- **Build Tool**: Vite 7.0.6
- **UI Components**: Custom component library
- **Charts**: Chart.js 4.5.0 + Vue-ChartJS

### Backend Layer

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Supabase REST API + PostgREST

### Payment Integration

- **GCash**: Payment gateway integration
- **Maya**: Payment gateway integration
- **Transaction Processing**: Custom payment service

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    WEB BROWSER                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │   Vue.js     │  │ Vue Router   │  │      Pinia        │   │  │
│  │  │   App        │  │  (SPA)       │  │   State Store    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │              COMPONENT LAYER                            │   │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐  │   │  │
│  │  │  │  Admin   │  │  User    │  │  Auth    │  │  UI   │  │   │  │
│  │  │  │ Components│  │ Components│ │Components│  │Components│  │   │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └───────┘  │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │              SERVICE LAYER                             │   │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │  │
│  │  │  │ Auth        │  │ Project     │  │ Marketplace │   │   │  │
│  │  │  │ Service     │  │ Service     │  │ Service     │   │   │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │  │
│  │  │  │ Payment     │  │ Wallet      │  │ Analytics   │   │   │  │
│  │  │  │ Service     │  │ Service     │  │ Service     │   │   │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/REST API
                                    │ WebSocket (Realtime)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND LAYER                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    AUTHENTICATION                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │   JWT    │  │ Sessions │  │  Users   │  │  Roles   │    │  │
│  │  │  Tokens  │  │ Storage  │  │  Auth    │  │  (RLS)   │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    DATABASE (PostgreSQL)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │  profiles    │  │  projects    │  │project_credits│      │  │
│  │  │  (users)     │  │              │  │              │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │credit_listings│ │credit_ownership│ │wallet_accounts│     │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │wallet_trans. │  │ certificates │  │ audit_logs   │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ROW LEVEL SECURITY (RLS)                          │  │
│  │  • Admin policies (view all data)                              │  │
│  │  • User policies (view own data)                               │  │
│  │  • Role-based access control                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    STORAGE                                    │  │
│  │  • Image uploads (project images, avatars)                   │  │
│  │  • Document storage                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Payment API
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │    GCash     │  │    Maya      │                                 │
│  │  Payment API │  │  Payment API │                                 │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Layer Architecture

### Presentation Layer

- **Views**: Vue components representing pages
- **Components**: Reusable UI components
- **Layout**: Header, Sidebar, Page layouts

### Application Layer

- **Services**: Business logic layer
- **Middleware**: Route guards, role checks
- **Stores**: Global state management (Pinia)

### Data Layer

- **Supabase Client**: Database connection
- **API Services**: Data fetching/updating
- **Caching**: Session/localStorage management

### Security Layer

- **Authentication**: Supabase Auth
- **Authorization**: RLS policies + role guards
- **Session Management**: Token-based authentication

## Key Services

1. **Authentication Service** (`authService.js`)
   - User login/logout
   - Session management
   - Profile creation

2. **Project Service** (`projectService.js`)
   - Project CRUD operations
   - Status management
   - Project approval workflow

3. **Marketplace Service** (`marketplaceService.js`)
   - Credit listings
   - Search and filtering
   - Purchase transactions

4. **Payment Service** (`paymentService.js`)
   - GCash/Maya integration
   - Transaction processing
   - Receipt generation

5. **Wallet Service** (`walletService.js`)
   - Balance management
   - Transaction history
   - Top-up/withdraw

6. **Analytics Service** (`analyticsService.js`)
   - Platform statistics
   - User analytics
   - Revenue tracking

7. **Admin Service** (`adminService.js`)
   - User management
   - System configuration
   - Database operations

## Data Flow

1. **User Request** → Vue Component
2. **Component** → Service Layer
3. **Service** → Supabase Client
4. **Supabase** → PostgreSQL Database
5. **Database** → RLS Policy Check
6. **Results** → Service Layer
7. **Service** → Pinia Store
8. **Store** → Component Update
9. **Component** → UI Render

## Security Architecture

```
User Request
    ↓
Router Guard (checks authentication)
    ↓
Role Guard (checks permissions)
    ↓
Component (renders based on role)
    ↓
Service Call
    ↓
Supabase Client (with JWT token)
    ↓
Database Query
    ↓
RLS Policy Check (server-side)
    ↓
Result Returned (filtered by RLS)
```




