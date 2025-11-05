# Testing Instructions for Pricing Fix

## Step 1: Verify Current State

Run `sql/check-pricing-issue.sql` in Supabase and check if:
- `estimated_credits` and `credit_price` columns exist in `projects` table
- Current projects have NULL or actual values in these columns
- What prices are in `project_credits` and `credit_listings`

**If columns don't exist:** You MUST run `sql/add-all-project-fields.sql` first!

## Step 2: Test New Project Submission

1. Submit a new project as a Developer with:
   - **Credit Price:** ₱50.00 (or any custom price)
   - **Estimated Credits:** 1000

2. Check browser console - you should see:
   ```
   🔍 Creating project with data: {
     title: "Your Project Title",
     estimated_credits: 1000,
     credit_price: 50,
     ...
   }
   ```

3. In Supabase, verify the project was saved:
   ```sql
   SELECT id, title, credit_price, estimated_credits, status 
   FROM projects 
   WHERE status = 'pending' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

## Step 3: Test Project Approval

1. As Verifier, approve the project

2. Check browser console - you should see:
   ```
   🔍 Project pricing data: {
     projectId: "...",
     projectTitle: "Your Project Title",
     estimated_credits: 1000,
     credit_price: 50,
     usingCreditsAmount: 1000,
     usingBasePrice: 50,  ← Should be YOUR price, not default!
     calculatedCredits: 500,  ← Default fallback (not used)
     calculatedPrice: 15,   ← Default fallback (not used)
   }
   ```

3. In Supabase, verify marketplace listing was created:
   ```sql
   SELECT 
     cl.id,
     cl.price_per_credit,
     cl.currency,
     p.title AS project_title,
     p.credit_price AS developer_price
   FROM credit_listings cl
   LEFT JOIN project_credits pc ON pc.id = cl.project_credit_id
   LEFT JOIN projects p ON p.id = pc.project_id
   ORDER BY cl.created_at DESC 
   LIMIT 1;
   ```

4. Check marketplace - price should show **₱50.00** (or your custom price)

## Expected Results

✅ **Success:** Custom price appears in marketplace  
❌ **Failure:** Still showing ₱25.00 or default price

## Troubleshooting

**If price is still wrong:**

1. Check if columns were added - run first query from `sql/check-pricing-issue.sql`
2. Check console logs during submission - are prices being sent?
3. Check console logs during approval - is your price being read?
4. Check database - are values NULL in projects table?

**If columns don't exist:**
- You MUST run `sql/add-all-project-fields.sql` in Supabase SQL Editor first!
- This is CRITICAL - code can't save what columns don't exist!








