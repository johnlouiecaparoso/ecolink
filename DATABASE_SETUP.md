# Database Setup Guide

## Current Status: Database Disabled ✅

The application is currently configured to use **sample data** instead of database calls to prevent errors.

## How to Enable Database

### Option 1: Enable Database (Requires Supabase Setup)

1. **Set up your Supabase database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `database-setup.sql` file

2. **Enable database in the application:**
   ```javascript
   // In src/config/database.js
   export const USE_DATABASE = true // Change from false to true
   ```

### Option 2: Keep Using Sample Data (Current Setup)

The application will continue to work with sample data. No database setup required.

## What the Database Errors Mean

The errors you saw were:

- **400/404 errors**: Missing database tables
- **`audit_logs` table missing**: Audit logging fails
- **`credit_listings` table missing**: Marketplace data fails
- **`credit_certificates` table missing**: Certificates fail

## Current Behavior

With `USE_DATABASE = false`:

- ✅ **Marketplace**: Shows sample carbon credit listings
- ✅ **Certificates**: Shows sample certificates
- ✅ **Wallet**: Shows sample balance
- ✅ **Analytics**: Shows sample data
- ✅ **No Database Errors**: All services use sample data

## Benefits of Sample Data Mode

- **No Setup Required**: Works immediately
- **No Database Errors**: Clean console
- **Full Functionality**: All features work with demo data
- **Easy Testing**: Perfect for development and demos

## When to Enable Database

Enable database when you want to:

- Store real user data
- Persist transactions
- Track real analytics
- Deploy to production

## Database Schema

If you enable the database, it will create these tables:

- `profiles` - User profiles
- `projects` - Carbon credit projects
- `credit_listings` - Marketplace listings
- `credit_certificates` - User certificates
- `audit_logs` - User action logs
- `wallet_accounts` - User wallet balances

## Quick Toggle

```javascript
// Disable database (current)
export const USE_DATABASE = false

// Enable database (requires setup)
export const USE_DATABASE = true
```
