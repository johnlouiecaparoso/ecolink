# Wallet Functionality Test Checklist

## Prerequisites

1. **Database Setup**: Run `wallet_tables_setup.sql` in Supabase SQL Editor
2. **Dev Server**: Start with `npm run dev`
3. **User Authentication**: Login to your account

## Test Steps

### 1. Basic Wallet Operations

- [ ] Navigate to `/wallet` page
- [ ] Check initial balance displays (should show ₱0.00)
- [ ] Click "Top Up" button
- [ ] Fill in amount (e.g., ₱100) and select payment method
- [ ] Submit top-up request
- [ ] Wait 2 seconds for simulated processing
- [ ] Verify balance updates to ₱100.00

### 2. Withdrawal Testing

- [ ] Click "Withdraw" button
- [ ] Try withdrawing ₱50
- [ ] Wait 3 seconds for simulated processing
- [ ] Verify balance updates to ₱50.00

### 3. Transaction History

- [ ] Check transaction history shows both operations
- [ ] Verify transaction statuses (pending → completed)
- [ ] Check transaction amounts and descriptions

### 4. Dashboard Integration

- [ ] Navigate to `/dashboard`
- [ ] Check wallet balance in stats cards
- [ ] Verify balance matches wallet page

### 5. Error Handling

- [ ] Try withdrawing more than available balance
- [ ] Check if proper error message appears
- [ ] Try top-up with invalid amount (negative or too large)
- [ ] Check if validation errors appear

## Expected Results

- Wallet balance should display correctly
- Top-up should work with simulated 2-second delay
- Withdrawal should work with simulated 3-second delay
- Transaction history should show all operations
- Dashboard should show real wallet balance
- Error handling should prevent invalid operations

## Debugging

If issues occur, check:

1. Browser console for error messages
2. Supabase logs for database errors
3. Network tab for failed API calls
4. Verify wallet tables exist in Supabase

## Common Issues

1. **"Wallet not found"** - Run the database setup script
2. **"User not authenticated"** - Check if user is logged in
3. **Balance not updating** - Check console for transaction errors
4. **Transactions not showing** - Verify transaction creation in database
