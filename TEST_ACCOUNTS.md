# Test Accounts for EcoLink

This document contains test account credentials for development and testing purposes.

## Available Test Accounts

### 1. Admin Account

- **Email**: `admin@ecolink.test`
- **Password**: `admin123`
- **Role**: Administrator
- **Permissions**: Full system access, user management, database management, analytics

### 2. Verifier Account

- **Email**: `verifier@ecolink.test`
- **Password**: `verifier123`
- **Role**: Verifier
- **Permissions**: Project review, approval, report uploads

### 3. General User Account

- **Email**: `user@ecolink.test`
- **Password**: `user123`
- **Role**: General User
- **Permissions**: Basic user features, wallet management, certificate viewing

## How to Use

### Method 1: Quick Login Buttons

1. Go to the login page
2. Click one of the test account buttons:
   - "Admin Test" - Fills admin credentials
   - "Verifier Test" - Fills verifier credentials
   - "User Test" - Fills general user credentials
3. Click "Sign In"

### Method 2: Manual Entry

1. Go to the login page
2. Enter the email and password manually from the list above
3. Click "Sign In"

## What Each Role Can Access

### Admin (`admin@ecolink.test`)

- ✅ Admin Panel
- ✅ User Management
- ✅ Database Management
- ✅ Analytics Dashboard
- ✅ Audit Logs
- ✅ All user features

### Verifier (`verifier@ecolink.test`)

- ✅ Verifier Panel
- ✅ Project Review
- ✅ Project Approval
- ✅ Report Uploads
- ✅ Basic user features

### General User (`user@ecolink.test`)

- ✅ Dashboard
- ✅ Marketplace
- ✅ Wallet Management
- ✅ Certificate Viewing
- ✅ Profile Management

## Notes

- These are **development-only** accounts
- They use mock sessions and don't require real Supabase authentication
- Perfect for testing role-based features and permissions
- The login form will automatically detect these test emails and use mock authentication

## Testing Different Roles

1. **Test Admin Features**: Login with admin account and verify access to admin panel, user management, etc.
2. **Test Verifier Features**: Login with verifier account and check verifier panel access
3. **Test User Features**: Login with user account and confirm standard user functionality
4. **Test Role Restrictions**: Try accessing admin features with user account (should be restricted)

## Security

⚠️ **Important**: These test accounts should only be used in development environments. Remove or disable them in production builds.
