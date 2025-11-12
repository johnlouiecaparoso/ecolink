# Quick Start: Fix Pricing Issue

## Run These SQL Queries in Supabase (in this order):

### 1️⃣ Add Project Fields
**File:** `sql/add-all-project-fields.sql`

This adds the columns needed to store developer-submitted prices:
- `estimated_credits`
- `credit_price`
- `project_image` fields

✅ **Run this FIRST** - without it, prices won't be saved!

### 2️⃣ Verify Database State
**File:** `sql/check-pricing-issue.sql`

Checks if everything is set up correctly. Run after step 1 to verify.

---

## After Running SQL:

1. **Submit a new project** as Developer with custom price
2. **Approve it** as Verifier  
3. **Check marketplace** - should show your custom price!

See `sql/TESTING-INSTRUCTIONS.md` for detailed testing steps.

---

## Need Help?

Check browser console for:
- `🔍 Creating project with data:` - during submission
- `🔍 Project pricing data:` - during approval

These will show if prices are being saved/read correctly.
















