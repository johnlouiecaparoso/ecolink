# 🚀 MARKETPLACE QUICK START GUIDE
## Test Your Complete Buy System in 5 Minutes

---

## ✅ **PREREQUISITES CHECKLIST**

Before testing, ensure:

- [ ] Admin account exists with role='admin'
- [ ] At least one project in database (status='pending')
- [ ] Supabase database properly configured
- [ ] RLS policies enabled (run `sql/fix-admin-rls-policies.sql`)
- [ ] Pinia store initialized
- [ ] Vue Router working

---

## 📋 **5-MINUTE TEST PROCEDURE**

### **TEST 1: Approve a Project (2 minutes)**

```bash
# Terminal: Start dev server
npm run dev

# Browser: http://localhost:5173
```

**Steps:**

1. **Login as Admin**
   - Go to `/login`
   - Email: `admin@ecolink.test`
   - Password: `admin123`

2. **Navigate to Admin Dashboard**
   - Header → "Admin Dashboard"
   - OR directly: `/admin`

3. **Approve a Project**
   - Find project in "Project Approval" section
   - Click "✅ Approve Project" button

4. **Verify in Supabase**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT * FROM credit_listings WHERE status = 'active';
   
   -- Should show:
   -- listing_id | project_credit_id | quantity | status | price_per_credit
   -- xxxxx      | credit_xxx        | 1000     | active | 15.00
   ```

**Expected Result:** ✅ Project approved, credits generated, listing created

---

### **TEST 2: View in Marketplace (30 seconds)**

**Steps:**

1. **Open Marketplace**
   - Header → "Marketplace"
   - OR directly: `/marketplace`

2. **Look for Approved Project**
   - Should see project card
   - Shows title, location, price, credits available

**Expected Result:** ✅ Approved project visible in marketplace

---

### **TEST 3: Purchase Credits (2 minutes)**

**Steps:**

1. **Click "Purchase" Button**
   - On the project card
   - Modal opens

2. **Enter Quantity**
   - Input: `10` credits
   - Shows: Price per credit, Quantity, Total

3. **Complete Purchase**
   - Click "Complete Purchase" button
   - Wait for processing (2-3 seconds)

4. **Verify Success**
   - Alert: "🎉 Purchase Successful!"
   - Marketplace reloads
   - Quantity decreased by 10

**Expected Result:** ✅ Purchase completed, ownership recorded

---

### **TEST 4: View Portfolio (30 seconds)**

**Steps:**

1. **Navigate to Portfolio**
   - Header → User menu → "Certificates"
   - OR directly: `/credit-portfolio`

2. **Verify Credits**
   - Should see "10 credits" owned
   - Shows project details

**Expected Result:** ✅ Credits appear in portfolio

---

## 🔍 **VERIFY DATABASE CHANGES**

### **Run These Queries in Supabase SQL Editor**

```sql
-- 1. Check purchase was recorded
SELECT * FROM credit_purchases 
ORDER BY created_at DESC 
LIMIT 5;

-- Should show:
-- buyer_id | credits_amount | total_amount | status
-- user_xxx | 10            | 150.00      | completed


-- 2. Check ownership
SELECT * FROM credit_ownership 
WHERE user_id = 'your_user_id';

-- Should show:
-- user_id | project_id | quantity | ownership_type
-- user_xxx| project_xxx| 10       | purchased


-- 3. Check listing updated
SELECT * FROM credit_listings 
WHERE status = 'active';

-- Should show:
-- quantity | status
-- 990      | active  (was 1000, now 990 after 10 purchased)


-- 4. Check certificate generated
SELECT * FROM certificates 
ORDER BY issued_at DESC 
LIMIT 5;

-- Should show:
-- certificate_number | credits_purchased | status
-- ECO-2024-XXXXX     | 10               | active


-- 5. Check receipt generated
SELECT * FROM receipts 
ORDER BY issued_at DESC 
LIMIT 5;

-- Should show:
-- receipt_number | total_amount | currency
-- RCP-2024-XXXXX | 150.00      | USD
```

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Marketplace shows 0 listings**

**Check:**
```javascript
// Browser Console (F12)
getMarketplaceListings()

// Should return array of listings
// If empty: No approved projects with active listings
```

**Solution:**
1. Ensure at least one project is approved
2. Check credit_listings table has status='active'
3. Verify RLS policies allow viewing

---

### **Problem: Purchase fails**

**Check:**
```javascript
// Browser Console
// Look for error messages:
❌ "Listing not found"
❌ "Payment processing failed"
❌ "Not enough credits available"
```

**Solutions:**

| Error | Solution |
|-------|----------|
| Listing not found | Check credit_listings has record |
| Payment failed | Use 'demo' payment method for testing |
| Not enough credits | Try smaller quantity |

---

### **Problem: Credits not in portfolio**

**Check:**
```javascript
// Browser Console
creditOwnershipService.getUserCreditPortfolio(userId)

// Should return array with purchased credits
```

**Solution:**
1. Verify credit_ownership INSERT succeeded
2. Check user_id matches logged-in user
3. Refresh portfolio page

---

## 🎯 **SUCCESS CRITERIA**

Your marketplace is working correctly if:

✅ **Approved projects appear in marketplace**  
✅ **Purchase modal opens**  
✅ **Purchase completes successfully**  
✅ **Listings quantity decreases**  
✅ **Credits appear in portfolio**  
✅ **Certificate auto-generated**  
✅ **Receipt auto-generated**  
✅ **No console errors**

---

## 📊 **COMPLETE FLOW DIAGRAM**

```
Login as Admin → Go to /admin → Approve Project
    ↓
Credits Generated → Listing Created
    ↓
Go to /marketplace → See Approved Project
    ↓
Click Purchase → Modal Opens → Enter Quantity
    ↓
Click Complete Purchase → Payment Processes
    ↓
Purchase Recorded → Ownership Added
    ↓
Certificate Generated → Receipt Generated
    ↓
Go to /credit-portfolio → See Owned Credits
    ↓
Go to /certificates → See Certificate
    ↓
Go to /receipts → See Receipt
    ↓
SUCCESS! 🌱
```

---

## 🎉 **YOU'RE ALL SET!**

Your marketplace is **fully functional**:

- ✅ Projects display from Supabase
- ✅ Users can purchase credits
- ✅ Payments process (demo mode)
- ✅ Ownership records create
- ✅ Certificates auto-generate
- ✅ Receipts auto-generate
- ✅ Portfolio shows credits
- ✅ Inventory updates real-time

**The entire buy system works end-to-end!** 🚀🛒

---

## 📚 **ADDITIONAL RESOURCES**

- **Admin Panel Guide**: `COMPLETE_SUPABASE_TO_FRONTEND_MAPPING.md`
- **Marketplace Details**: `COMPLETE_MARKETPLACE_BUY_SYSTEM_GUIDE.md`
- **Visual Flow**: `MARKETPLACE_BUY_FLOW_VISUAL.md`

Questions? Check console logs (F12) for detailed debugging information!



