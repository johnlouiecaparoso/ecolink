# Role-Based Access Control System

## Overview

This document outlines the role-based access control system implemented for the EcoLink application. The system ensures that users can only access interfaces and features appropriate to their assigned role.

## User Roles

### 1. General User (`general_user`)

**Capabilities:**

- Sign up/Log in
- View credits
- Manage wallet (top-up, withdraw)
- Buy via GCash/Maya
- View certificates

**Accessible Routes:**

- `/dashboard` - Personal dashboard
- `/wallet` - Wallet management
- `/certificates` - View environmental certificates

**Default Landing:** `/dashboard`

### 2. Project Developer (`project_developer`)

**Capabilities:**

- Submit projects
- Track project status
- Credit issuance
- Sales dashboard

**Accessible Routes:**

- `/projects` - Project management
- `/sales` - Sales dashboard and analytics

**Default Landing:** `/projects`

### 3. Verifier (`verifier`)

**Capabilities:**

- Access projects for review
- Review project submissions
- Approve projects
- Upload verification reports

**Accessible Routes:**

- `/verifier` - Verification dashboard

**Default Landing:** `/verifier`

### 4. Buyer/Investor (`buyer_investor`)

**Capabilities:**

- Search projects
- Buy credits
- Download receipts

**Accessible Routes:**

- `/marketplace` - Browse available projects
- `/buy-credits` - Purchase environmental credits
- `/receipts` - View and download purchase receipts

**Default Landing:** `/marketplace`

### 5. Admin (`admin`)

**Capabilities:**

- Audit logs
- Approve users/projects
- Generate reports
- Manage users
- View analytics
- Manage database
- Manage tables

**Accessible Routes:**

- `/admin` - Admin dashboard
- `/users` - User management
- `/analytics` - System analytics
- `/database` - Database management
- `/tables` - Table management

**Default Landing:** `/admin`

## Implementation Details

### Permission System

Each role has specific permissions that control access to features and routes. Permissions are defined in `src/constants/roles.js` and include:

- **General User Permissions:** `SIGN_UP`, `VIEW_CREDITS`, `MANAGE_WALLET`, `BUY_VIA_GCASH_MAYA`, `VIEW_CERTIFICATES`
- **Project Developer Permissions:** `SUBMIT_PROJECTS`, `TRACK_STATUS`, `CREDIT_ISSUANCE`, `SALES_DASHBOARD`
- **Verifier Permissions:** `ACCESS_PROJECTS`, `REVIEW_PROJECTS`, `APPROVE_PROJECTS`, `UPLOAD_REPORTS`
- **Buyer/Investor Permissions:** `SEARCH_PROJECTS`, `BUY_CREDITS`, `DOWNLOAD_RECEIPTS`
- **Admin Permissions:** `AUDIT_LOGS`, `APPROVE_USERS`, `APPROVE_PROJECTS`, `GENERATE_REPORTS`, `MANAGE_USERS`, `VIEW_ANALYTICS`, `MANAGE_DATABASE`, `MANAGE_TABLES`, `VIEW_ADMIN_PANEL`, `MANAGE_SYSTEM_SETTINGS`

### Route Protection

Routes are protected using Vue Router guards that check:

1. User authentication status
2. User role permissions
3. Route-specific access requirements

### Navigation Filtering

The sidebar navigation automatically filters menu items based on:

1. User's role permissions
2. Role-specific access requirements

### Access Control Flow

1. User logs in and role is determined from their profile
2. Router checks if user can access the requested route
3. If access is denied, user is redirected to their default landing page
4. Sidebar shows only relevant menu items for the user's role

## Security Features

- **Route-level protection:** Each route has specific role requirements
- **Permission-based access:** Features are gated behind specific permissions
- **Automatic redirection:** Users are redirected to appropriate interfaces based on their role
- **Navigation filtering:** Users only see menu items they can access
- **Role validation:** User roles are validated on every route change

## Testing the System

To test the role-based access control:

1. **Set user role in database:** Update the `role` field in the `profiles` table
2. **Login as different roles:** Each role should see only their designated interfaces
3. **Test route access:** Try accessing routes not meant for the current role
4. **Verify navigation:** Check that sidebar shows only relevant menu items

## Files Modified

- `src/constants/roles.js` - Role definitions and permissions
- `src/router/index.js` - Route protection and role-based routing
- `src/middleware/roleGuard.js` - Route guard middleware
- `src/services/roleService.js` - Role management service
- `src/store/userStore.js` - User state management
- `src/components/layout/AppSidebar.vue` - Navigation filtering
- `src/views/CertificatesView.vue` - General user certificates view
- `src/views/SalesView.vue` - Project developer sales dashboard
- `src/views/BuyCreditsView.vue` - Buyer/investor credit purchase
- `src/views/ReceiptsView.vue` - Buyer/investor receipts view

## Default Role Assignment

New users are assigned the `general_user` role by default. Admins can change user roles through the admin panel.
