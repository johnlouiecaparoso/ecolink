# Role-Based Access Control Test Guide

## Overview

This guide helps you test the new role-based access control system for EcoLink.

## User Role Access Patterns

### 1. General User (`user`)

- **Default Route**: `/dashboard`
- **Sidebar Items**: Dashboard, Wallet, Certificates
- **Access**: Can only see and access their own dashboard, wallet, and certificates

### 2. Project Developer (`project_developer`)

- **Default Route**: `/projects`
- **Sidebar Items**: Projects, Sales Dashboard
- **Access**: Can only see and access project management and sales features

### 3. Buyer/Investor (`buyer_investor`)

- **Default Route**: `/marketplace`
- **Sidebar Items**: Marketplace, Buy Credits, Receipts
- **Access**: Can only see and access marketplace, purchasing, and receipt features

### 4. Verifier (`verifier`)

- **Default Route**: `/verifier`
- **Sidebar Items**: Verifier Dashboard
- **Access**: Can only see and access verifier-specific features

### 5. Admin (`admin`)

- **Default Route**: `/admin`
- **Sidebar Items**: Admin Dashboard, Users, Analytics, Database, Tables
- **Access**: Can see and access all admin features

## Testing Steps

### Step 1: Create Test Users

1. Register new users with different roles
2. Or update existing users' roles in the database

### Step 2: Test Login Redirects

1. Login as each user type
2. Verify they're redirected to their correct default route
3. Check that the sidebar shows only their allowed items

### Step 3: Test Route Access

1. Try to access routes that should be restricted
2. Verify users are redirected to their appropriate dashboard
3. Check console for access denied warnings

### Step 4: Test Sidebar Navigation

1. Verify each user type only sees their allowed sidebar items
2. Test navigation between allowed routes
3. Confirm restricted routes don't appear in sidebar

## Database Role Updates

To test different roles, you can update user roles in Supabase:

```sql
-- Update a user to be a project developer
UPDATE profiles
SET role = 'project_developer'
WHERE id = 'user-id-here';

-- Update a user to be a buyer/investor
UPDATE profiles
SET role = 'buyer_investor'
WHERE id = 'user-id-here';

-- Update a user to be a verifier
UPDATE profiles
SET role = 'verifier'
WHERE id = 'user-id-here';

-- Update a user to be an admin
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-id-here';

-- Update a user to be a general user
UPDATE profiles
SET role = 'user'
WHERE id = 'user-id-here';
```

## Expected Behavior

### General User Login

1. Login → Redirected to `/dashboard`
2. Sidebar shows: Dashboard, Wallet, Certificates
3. Cannot access `/projects`, `/marketplace`, `/admin`, `/verifier`

### Project Developer Login

1. Login → Redirected to `/projects`
2. Sidebar shows: Projects, Sales Dashboard
3. Cannot access `/dashboard`, `/marketplace`, `/admin`, `/verifier`

### Buyer/Investor Login

1. Login → Redirected to `/marketplace`
2. Sidebar shows: Marketplace, Buy Credits, Receipts
3. Cannot access `/dashboard`, `/projects`, `/admin`, `/verifier`

### Verifier Login

1. Login → Redirected to `/verifier`
2. Sidebar shows: Verifier Dashboard
3. Cannot access other user dashboards

### Admin Login

1. Login → Redirected to `/admin`
2. Sidebar shows: Admin Dashboard, Users, Analytics, Database, Tables
3. Can access all routes (full admin access)

## Troubleshooting

### If users see wrong sidebar items:

1. Check user role in database
2. Verify role constants match database values
3. Clear browser cache and reload

### If redirects don't work:

1. Check router configuration
2. Verify role guard middleware
3. Check console for errors

### If permissions don't work:

1. Verify role permissions mapping
2. Check user store role assignment
3. Test with different user accounts
