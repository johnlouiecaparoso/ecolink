# User Roles Setup Guide

This guide explains how to add users with different roles in your EcoLink application.

## Available User Roles

1. **General User** (`general_user`) - Default role for regular users
2. **Project Developer** (`project_developer`) - Can submit and manage projects
3. **Verifier** (`verifier`) - Can review and approve projects
4. **Buyer/Investor** (`buyer_investor`) - Can buy credits and view marketplace
5. **Admin** (`admin`) - Full system access

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create User in Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User**
4. Fill in the user details:
   - Email: `verifier@example.com`
   - Password: `your-secure-password`
   - Email Confirm: `true` (check this box)
5. Click **Create User**
6. Copy the **User ID** from the created user

### Step 2: Add User Profile

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL (replace the values):

```sql
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES (
    'USER_ID_FROM_STEP_1',  -- Replace with actual user ID
    'Verifier Name',        -- Replace with actual name
    'verifier',             -- Role: verifier, admin, project_developer, buyer_investor, or general_user
    0,                      -- KYC level
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'verifier',
    updated_at = NOW();
```

## Method 2: Using SQL Scripts

### For Verifier Users

Use the `create_verifier_user.sql` file:

1. Open the file in your text editor
2. Replace `'new-verifier-user-id'` with the actual user ID
3. Replace `'Verifier User'` with the actual name
4. Run the SQL in Supabase SQL Editor

### For Admin Users

Use the `create_admin_user.sql` file:

1. Open the file in your text editor
2. Replace `'new-admin-user-id'` with the actual user ID
3. Replace `'Admin User'` with the actual name
4. Run the SQL in Supabase SQL Editor

## Method 3: Bulk User Creation

To create multiple users at once:

```sql
-- Create multiple verifiers
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES
    ('verifier-1-id', 'John Verifier', 'verifier', 0, NOW(), NOW()),
    ('verifier-2-id', 'Jane Verifier', 'verifier', 0, NOW(), NOW()),
    ('verifier-3-id', 'Mike Verifier', 'verifier', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    role = 'verifier',
    updated_at = NOW();

-- Create multiple project developers
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES
    ('dev-1-id', 'Alice Developer', 'project_developer', 0, NOW(), NOW()),
    ('dev-2-id', 'Bob Developer', 'project_developer', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    role = 'project_developer',
    updated_at = NOW();

-- Create multiple buyers/investors
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES
    ('buyer-1-id', 'Charlie Buyer', 'buyer_investor', 0, NOW(), NOW()),
    ('buyer-2-id', 'Diana Investor', 'buyer_investor', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    role = 'buyer_investor',
    updated_at = NOW();
```

## Verification

After creating users, verify they were created correctly:

```sql
-- Check all users by role
SELECT
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.created_at DESC;

-- Check specific role
SELECT
    p.id,
    p.full_name,
    p.role,
    u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'verifier';  -- Change role as needed
```

## Role Capabilities

### General User (`general_user`)

- Access: Dashboard, Wallet, Certificates
- Capabilities: Sign up, view credits, manage wallet, buy via GCash/Maya, view certificates

### Project Developer (`project_developer`)

- Access: Projects, Sales Dashboard
- Capabilities: Submit projects, track status, credit issuance, sales dashboard

### Verifier (`verifier`)

- Access: Verifier Dashboard
- Capabilities: Access projects, review, approve, upload reports

### Buyer/Investor (`buyer_investor`)

- Access: Marketplace, Buy Credits, Receipts
- Capabilities: Search projects, buy credits, download receipts

### Admin (`admin`)

- Access: Admin Panel, Users, Analytics, Database, Tables
- Capabilities: Audit logs, approve users/projects, generate reports, manage users, view analytics

## Testing User Roles

1. **Login as different users** to test role-based access
2. **Check navigation** - each role should only see their designated menu items
3. **Test route access** - users should be redirected to their default landing page
4. **Verify permissions** - each role should only access their allowed features

## Troubleshooting

### User can't access their role-specific features

- Check if the user has a profile record in the `profiles` table
- Verify the role is set correctly in the database
- Check if the user is properly authenticated

### User sees wrong navigation items

- Clear browser cache and cookies
- Log out and log back in
- Check the role assignment in the database

### User gets redirected to wrong page

- Check the `getDefaultRouteForRole` function in the role guard
- Verify the user's role in the database
- Check the router configuration for role restrictions

