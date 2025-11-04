# Database Migration Guide

## Required Migrations for Currency, Pricing & Delete Fixes

To fix the currency display issue (USD → PHP), pricing linking issue, and allow admin project deletions in the marketplace, run these SQL migrations **in order**:

### 1. Add Missing Project Fields
**File:** `add-all-project-fields.sql` ⭐ **CRITICAL FIRST**
- Adds `estimated_credits` column to projects table
- Adds `credit_price` column to projects table  
- Adds `project_image`, `image_name`, `image_type`, `image_size` columns
- Required so developer-submitted prices are saved!

### 2. Fix Currency to PHP
**File:** `fix-currency-to-php.sql`
- Updates existing USD records to PHP
- Changes default currency for future inserts

### 3. Fix All CASCADE Delete Constraints
**File:** `fix-all-cascade-constraints.sql` (Use this one - it covers everything!)
- Fixes `credit_purchases` → `credit_listings` constraint
- Fixes `certificates` → `credit_transactions` constraint
- Fixes `receipts` → `credit_transactions` constraint (if exists)
- Fixes `credit_transactions` → `project_credits` constraint
- Includes verification query to show all constraints

**Alternative files (if you need individual fixes):**
- `fix-credit-purchases-cascade.sql` - Just fixes credit_purchases
- `fix-certificates-cascade.sql` - Just fixes certificates

---

## How to Run Migrations

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy and paste the contents of each SQL file
5. Click "Run" (or press Ctrl+Enter)
6. Verify success messages appear

---

## What These Fixes Do

### Project Fields Fix (NEW!)
- Projects table now has `estimated_credits` and `credit_price` columns
- Developer-submitted prices are now saved and linked properly
- Project images can now be uploaded and displayed

### Currency Fix
- All marketplace listings will show PHP instead of USD
- New projects will default to PHP currency
- No more hardcoded default prices

### CASCADE Delete Fix
- Admins can now delete projects from marketplace
- All related records (credits, listings, purchases, certificates, receipts) cascade delete
- No more foreign key constraint violations

---

## Verification

After running migrations, you can verify:

1. **Pricing:** Submit a project as developer, approve as verifier - your price should appear in marketplace
2. **Currency:** Check marketplace - prices should show ₱ instead of $
3. **Delete:** Try deleting a project as admin - should work without errors

The migration scripts include verification queries to show you the status of foreign key constraints.

---

## Troubleshooting

If you get errors:

1. **Constraint already exists:** Safe to ignore - the scripts use `DROP CONSTRAINT IF EXISTS`
2. **Table doesn't exist:** Some optional tables (like receipts) may not exist yet
3. **Permission denied:** Make sure you're running as a database admin user

---

## Questions?

Contact the development team if you encounter issues running these migrations.

