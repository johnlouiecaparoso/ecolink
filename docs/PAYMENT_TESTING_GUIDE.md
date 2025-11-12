# Payment Testing Guide for Vercel Deployment

## Overview
You can test payments on your deployed Vercel site, but you need to configure PayMongo API keys first.

## Current Status
Your console shows: `⚠️ PayMongo keys not configured, using mock mode`
This means payments are currently mocked and not processing real transactions.

## Step 1: Get PayMongo API Keys

1. **Sign up for PayMongo** (if you haven't):
   - Go to https://paymongo.com
   - Create an account
   - Complete verification

2. **Get your API keys**:
   - Log in to PayMongo dashboard
   - Go to **Settings** → **API Keys**
   - You'll see two keys:
     - **Public Key** (starts with `pk_test_` for test mode)
     - **Secret Key** (starts with `sk_test_` for test mode)

## Step 2: Add Environment Variables to Vercel

1. **Go to your Vercel project**:
   - https://vercel.com/dashboard
   - Select your project: `ecolink-7vcb`

2. **Add Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add these two variables:

   ```
   Variable Name: VITE_PAYMONGO_PUBLIC_KEY
   Value: pk_test_your_public_key_here
   ```

   ```
   Variable Name: VITE_PAYMONGO_SECRET_KEY
   Value: sk_test_your_secret_key_here
   ```

3. **Important**: Make sure to:
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save** after adding each variable

4. **Redeploy your site**:
   - After adding environment variables, you need to redeploy
   - Go to **Deployments** tab
   - Click the **three dots** (⋯) on your latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

## Step 3: Test Payments

### Test Mode (Safe for Testing)
- Use PayMongo **test keys** (start with `pk_test_` and `sk_test_`)
- Test payments won't charge real money
- Use test card numbers from PayMongo documentation

### Production Mode (Real Money)
- Use PayMongo **live keys** (start with `pk_live_` and `sk_live_`)
- Only use when you're ready for real transactions
- Requires PayMongo account verification

## Step 4: Verify Configuration

After redeploying, check your browser console:
- ✅ Should see: `✅ PayMongo service initialized`
- ❌ Should NOT see: `⚠️ PayMongo keys not configured`

## Testing Payment Flow

1. **Go to Marketplace** on your deployed site
2. **Select a project** and click "Purchase Credits"
3. **Choose payment method** (GCash, Maya, or Card)
4. **Enter quantity** and click "Complete Purchase"
5. **You'll be redirected** to PayMongo checkout page
6. **Complete test payment** using PayMongo test credentials
7. **You'll be redirected back** to your site with payment confirmation

## Troubleshooting

### Still seeing "PayMongo keys not configured"?
- Make sure you redeployed after adding environment variables
- Check that variable names are exactly: `VITE_PAYMONGO_PUBLIC_KEY` and `VITE_PAYMONGO_SECRET_KEY`
- Verify keys are added to the correct environment (Production/Preview/Development)

### Payment redirects but doesn't complete?
- Check PayMongo dashboard for payment status
- Check browser console for errors
- Verify webhook URLs are configured in PayMongo (if using webhooks)

### Getting 401/403 errors?
- Check that your PayMongo account is verified
- Verify API keys are correct (no extra spaces)
- Make sure you're using test keys for testing, live keys for production

## Security Notes

⚠️ **Important**: 
- Never commit PayMongo secret keys to git
- Secret keys are stored in Vercel environment variables (secure)
- Public keys can be exposed in frontend code (this is normal)
- Secret keys should ideally be in backend, but for testing, Vercel env vars are acceptable

## Next Steps

Once you've configured PayMongo:
1. Test a small purchase (e.g., 1 credit)
2. Verify payment appears in PayMongo dashboard
3. Check that credits are added to user's portfolio
4. Verify certificate is generated after purchase




