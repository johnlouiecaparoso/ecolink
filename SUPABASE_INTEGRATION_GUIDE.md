# Supabase Integration Guide for EcoLink

This guide will help you set up and integrate Supabase with your EcoLink application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your EcoLink project cloned locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `ecolink`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this takes a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy the `env.example` file to `.env`:

   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `complete-supabase-setup.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the script
5. Wait for all the tables, policies, and functions to be created

## Step 5: Verify the Setup

1. In your Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `projects`
   - `project_credits`
   - `credit_listings`
   - `credit_transactions`
   - `credit_ownership`
   - `audit_logs`
   - `wallets`
   - `wallet_transactions`
   - `certificates`
   - `receipts`

## Step 6: Test the Integration

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:5173`
3. Try to register a new account
4. Check the Supabase dashboard to see if the user was created in the `auth.users` table
5. Check if a profile was created in the `profiles` table

## Step 7: Configure Authentication (Optional)

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your authentication settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/login`
   - **Email Templates**: Customize if needed

## Troubleshooting

### Common Issues

1. **"Supabase client not initialized" error**
   - Check that your environment variables are set correctly
   - Make sure the `.env` file is in the root directory
   - Restart your development server after adding environment variables

2. **Database connection errors**
   - Verify your Supabase URL and key are correct
   - Check that your Supabase project is active
   - Ensure the database setup script ran successfully

3. **Authentication not working**
   - Check that RLS policies are enabled
   - Verify that the `profiles` table has the correct policies
   - Make sure the trigger for creating user wallets is working

4. **Tables not found errors**
   - Run the complete database setup script again
   - Check that all tables were created successfully
   - Verify that RLS is enabled on all tables

### Debug Mode

To enable debug logging, add this to your `.env` file:

```env
VITE_DEBUG=true
```

This will show detailed logs in the browser console.

## Production Deployment

When deploying to production:

1. Update your environment variables with production Supabase credentials
2. Update the Site URL in Supabase Authentication settings
3. Configure proper redirect URLs
4. Set up email templates for production
5. Configure any additional security settings

## Database Schema Overview

### Core Tables

- **profiles**: User profiles extending auth.users
- **projects**: Carbon credit projects
- **project_credits**: Credits generated from approved projects
- **credit_listings**: Marketplace listings for credits
- **credit_transactions**: Purchase/sale transactions
- **credit_ownership**: User ownership of credits
- **wallets**: User wallet balances
- **certificates**: Carbon credit certificates
- **receipts**: Transaction receipts
- **audit_logs**: System audit trail

### Key Features

- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Automatic Triggers**: Creates wallets and credit ownership automatically
- **Audit Logging**: Tracks all user actions
- **Flexible Roles**: Supports multiple user types (admin, verifier, etc.)

## Next Steps

1. Test all authentication flows
2. Test project creation and approval
3. Test marketplace functionality
4. Test credit purchasing and retirement
5. Configure email notifications
6. Set up monitoring and analytics

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the Supabase dashboard for database errors
3. Verify all environment variables are set
4. Ensure the database setup script completed successfully
5. Check the Supabase logs in the dashboard

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or create an issue in your project repository.
