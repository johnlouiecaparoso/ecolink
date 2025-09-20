# Database Management Interface

## 🗄️ Overview

The Database Management interface provides a user-friendly way to manage your Supabase database tables and schemas. It's designed to match the dashboard design and provides visual feedback for all database operations.

## 🚀 Features

### ✅ What You Can Do:

- **View Tables**: See all your database tables with their types
- **View Table Data**: Browse the first 50 rows of any table
- **View Table Schema**: See column definitions, data types, and constraints
- **Generate SQL Scripts**: Get ready-to-run SQL commands for Supabase
- **Copy to Clipboard**: Automatically copy SQL commands for easy pasting

### ⚠️ Limitations:

- **No Direct Execution**: Due to Supabase security, SQL commands must be run in the Supabase SQL Editor
- **Read-Only Operations**: Table viewing and schema inspection only
- **Manual Setup Required**: Database creation requires manual SQL execution

## 📋 How to Use

### 1. Access the Interface

- Navigate to `/database` in your app
- Or click "Database" in the sidebar navigation

### 2. View Your Tables

- The interface automatically loads all your database tables
- Click on any table card to select it
- Use "View Data" to see table contents
- Use "Schema" to see table structure

### 3. Create New Tables

- Click "Create [Table Name]" buttons in Quick Actions
- The SQL command will be copied to your clipboard
- Paste and run the SQL in your Supabase SQL Editor

### 4. Run Complete Setup

- Click "Run Complete Setup" for all tables, RLS, and indexes
- This generates a complete SQL script
- Copy and run the entire script in Supabase SQL Editor

### 5. Drop Tables

- Click "Drop" on any table card
- Confirm the action
- Copy the generated DROP SQL and run it in Supabase

## 🗂️ Available Tables

The interface supports these table types:

### Core Tables (Sprint 1-2)

- **profiles** - User profiles and roles
- **projects** - Environmental projects
- **wallet_accounts** - User wallet balances
- **wallet_transactions** - Transaction history

### Future Sprints

- **verifications** - Project verification records (Sprint 3)
- **listings** - Marketplace listings (Sprint 4)
- **orders** - Marketplace orders (Sprint 4)
- **audit_logs** - System audit trail (Sprint 5)

## 🔧 SQL Editor Setup

### 1. Access Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Create a new query

### 2. Run Generated Scripts

1. Copy SQL from the Database Management interface
2. Paste into Supabase SQL Editor
3. Click "Run" to execute
4. Refresh the Database Management interface to see changes

## 🛡️ Security Notes

- **Row Level Security (RLS)**: All tables have RLS enabled
- **User Permissions**: Only authenticated users can access the interface
- **Admin Functions**: Some operations may require admin privileges
- **Data Protection**: All operations respect Supabase security policies

## 🐛 Troubleshooting

### Tables Not Showing

- Check if you're logged in
- Verify Supabase connection
- Refresh the page

### SQL Errors

- Check table dependencies (foreign keys)
- Ensure proper permissions
- Verify table names and column names

### Clipboard Issues

- Ensure your browser supports clipboard API
- Check for browser permissions
- Use manual copy/paste as fallback

## 📱 Mobile Support

The interface is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) mode

## 🔄 Updates

The interface automatically refreshes table information when you:

- Create new tables
- Drop existing tables
- Click the "Refresh Tables" button

---

**Need Help?** Check the browser console for detailed error messages and debugging information.
