# 🎯 BUG FOUND AND FIXED!

## The Problem

Your project submission saves custom prices correctly (`estimated_credits: 99`, `credit_price: 999.00`), but the **database trigger** ignored them and used category-based defaults instead!

### What Was Happening:

1. ✅ Developer submits project with custom price: `999.00`
2. ✅ Project saved correctly in `projects` table
3. ❌ **Database trigger** fires on approval
4. ❌ Trigger **ignores** `estimated_credits` and `credit_price`
5. ❌ Creates `project_credits` with default price from category
6. ❌ Marketplace shows **wrong price!**

## The Fix

**File:** `sql/fix-trigger-to-use-project-fields.sql`

This SQL:
1. Drops the old trigger
2. Recreates it to use `NEW.estimated_credits` and `NEW.credit_price`
3. Only falls back to category-based defaults if project values are NULL

## How To Apply

1. **Run:** `sql/fix-trigger-to-use-project-fields.sql` in Supabase SQL Editor
2. **Submit** a NEW project with custom price
3. **Approve** it
4. **Check marketplace** - should show your custom price!

---

## Why This Happened

The database trigger was created BEFORE the `estimated_credits` and `credit_price` columns existed, so it hardcoded category-based defaults. Now it checks project values first!

## Old Projects

Existing projects will still show wrong prices until you:
- Delete and re-submit them, OR
- Manually update prices in the database

**New projects will work correctly after running the SQL fix!**


















