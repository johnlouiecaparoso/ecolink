# SQL Scripts Directory

This directory contains all database migration, setup, and utility SQL scripts for the EcoLink project.

## 📁 File Organization

### 🚀 Setup & Initialization
These are the main scripts to set up your database from scratch:

- **`complete-supabase-setup.sql`** - Complete database setup (recommended for new installations)
- **`database-setup.sql`** - Basic database setup
- **`quick-supabase-setup.sql`** - Quick setup script
- **`complete-database-schema.sql`** - Comprehensive database schema
- **`complete-supabase-integration.sql`** - Full Supabase integration setup

### 🔧 Migration Scripts
Scripts for migrating or updating existing databases:

- **`PROFILE_MIGRATION.sql`** - Profile system migration
- **`wallet-transactions-migration.sql`** - Wallet transactions migration
- **`safe-supabase-migration.sql`** - Safe migration approach
- **`complete-constraint-fix.sql`** - Fix database constraints

### 🛠️ Fix Scripts
Scripts to fix specific issues:

- **`fix-admin-rls-policies.sql`** - Fix admin RLS policies
- **`fix-profiles-rls-policies.sql`** - Fix profiles RLS policies
- **`fix-verifier-rls-policies.sql`** - Fix verifier RLS policies
- **`fix-credit-listings-table.sql`** - Fix credit listings table issues
- **`fix-certificates-table.sql`** - Fix certificates table
- **`FIX_PROFILES_TABLE.sql`** - Fix profiles table structure
- **`fix-authentication-rls.sql`** - Fix authentication RLS
- **`fix-rls-policies.sql`** - General RLS policy fixes
- **`comprehensive-rls-fix.sql`** - Comprehensive RLS fixes

### ➕ Add Columns/Features
Scripts to add new features or columns:

- **`add-notification-preferences-column.sql`** - Add notification preferences
- **`add-credit-fields-to-projects.sql`** - Add credit fields to projects
- **`add-project-image-fields.sql`** - Add image fields to projects

### 🧪 Test & Diagnostic Scripts
Scripts for testing and debugging:

- **`test-admin-access.sql`** - Test admin access
- **`test-accounts-*.sql`** - Test account scripts
- **`test-credit-listings-*.sql`** - Test credit listings
- **`test-role-*.sql`** - Test role access
- **`test-wallet-functionality.sql`** - Test wallet features
- **`check-*.sql`** - Diagnostic/check scripts
- **`verify-database-users.sql`** - Verify database users
- **`verify-workflow-and-cleanup.sql`** - Verify workflows

### 👥 User & Role Management
Scripts for managing users and roles:

- **`create-test-accounts-*.sql`** - Create test user accounts
- **`SUPABASE_TEST_ACCOUNTS_SETUP.sql`** - Test accounts setup
- **`set-user-role.sql`** - Set user roles
- **`update-existing-user-roles.sql`** - Update user roles
- **`create-is-admin-function-only.sql`** - Create admin function
- **`update-is-admin-function-only.sql`** - Update admin function

### 🗑️ Cleanup Scripts
Scripts for cleaning up data:

- **`cleanup-duplicate-listings.sql`** - Clean duplicate listings
- **`clear-database-data.sql`** - Clear all data (⚠️ destructive)
- **`prevent-duplicate-listings.sql`** - Prevent duplicates

### 📊 Data Population
Scripts to populate data:

- **`implement-real-marketplace-data.sql`** - Add marketplace data

### 🔍 Utility Scripts
Miscellaneous utility scripts:

- **`temporary-disable-rls.sql`** - Temporarily disable RLS (for debugging)
- **`diagnose-accounts.sql`** - Diagnose account issues
- **`debug-verifier-projects.sql`** - Debug verifier projects

## 📖 How to Use

### For New Setup:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `complete-supabase-setup.sql`
4. Run the script

### For Migrations:
1. Check the migration guide in the main project documentation
2. Run the appropriate migration script in Supabase SQL Editor
3. Verify the changes

### For Fixes:
1. Identify the issue you're experiencing
2. Find the corresponding fix script
3. Read any comments in the script for prerequisites
4. Run the script in Supabase SQL Editor

## ⚠️ Important Notes

- **Always backup your database** before running any migration or fix script
- Some scripts may have prerequisites - check script comments before running
- Test scripts are safe to run multiple times
- Cleanup scripts may be destructive - use with caution
- RLS (Row Level Security) scripts affect database permissions - test thoroughly

## 📚 Related Documentation

See the main project documentation for:
- Database setup guides
- Migration guides
- Role system documentation
- RLS policy documentation

