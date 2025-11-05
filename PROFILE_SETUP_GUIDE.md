# 🔧 Profile System Setup Guide

This guide will help you set up the complete profile management system that connects to Supabase for persistent data storage.

## 📋 What You Get

✅ **Persistent Profile Data**: Full name, email, company, location, bio  
✅ **Real-time Updates**: Changes save immediately to Supabase  
✅ **Data Persistence**: Profile data survives logout/login cycles  
✅ **Form Validation**: Client-side validation with error messages  
✅ **Loading States**: Professional UI with loading spinners  
✅ **Auto Profile Creation**: Profiles created automatically on signup

## 🚀 Setup Steps

### Step 1: Database Setup

1. **Open your Supabase Dashboard**
   - Go to your project's SQL Editor

2. **Run the Migration**

   ```sql
   -- Copy and paste the contents of PROFILE_MIGRATION.sql
   -- This will add all necessary columns and triggers
   ```

3. **Verify Setup**
   ```sql
   -- Check if all columns exist
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'profiles';
   ```

### Step 2: Test the System

1. **Start your development server**

   ```bash
   npm run dev
   ```

2. **Navigate to Profile Page**
   - Login to your account
   - Go to `/profile`
   - Click "Edit Profile"

3. **Test Profile Updates**
   - Fill in your information:
     - Full Name: "Your Name"
     - Email: "your.email@example.com"
     - Company: "Your Company Inc."
     - Location: "Your City, Country"
     - Bio: "Tell us about yourself..."
   - Click "Save Changes"
   - ✅ You should see "Profile updated successfully!"

4. **Test Data Persistence**
   - Logout of your account
   - Login again
   - Go to `/profile`
   - ✅ Your data should still be there!

## 🔍 How It Works

### Database Schema

```sql
profiles (
  id UUID PRIMARY KEY,           -- Links to auth.users(id)
  full_name TEXT,               -- User's full name
  email TEXT,                   -- User's email
  company TEXT,                 -- Company name
  location TEXT,                -- User's location
  bio TEXT,                     -- User's bio (max 500 chars)
  role TEXT DEFAULT 'general_user',
  kyc_level INTEGER DEFAULT 0,
  avatar_url TEXT,              -- Future: profile picture
  phone TEXT,                   -- Future: phone number
  website TEXT,                 -- Future: personal website
  created_at TIMESTAMP,
  updated_at TIMESTAMP          -- Auto-updated on changes
)
```

### Data Flow

1. **User Registration** → Auto-creates profile with basic info
2. **Profile Page Load** → Fetches data from Supabase
3. **User Edits Profile** → Validates data client-side
4. **Save Changes** → Updates Supabase database
5. **Logout/Login** → Data persists and loads automatically

### Security

- **Row Level Security (RLS)**: Users can only access their own profile
- **Authentication Required**: All operations require valid session
- **Data Validation**: Client and server-side validation

## 🎯 Key Features

### Form Validation

```javascript
// Automatic validation includes:
- Full name: minimum 2 characters
- Email: valid email format
- Website: valid URL format (if provided)
- Bio: maximum 500 characters
```

### Error Handling

- Network errors are caught and displayed
- Validation errors show field-specific messages
- Loading states prevent multiple submissions

### Real-time Updates

- Changes save immediately to database
- UI updates reflect saved data
- Success/error messages provide feedback

## 🛠️ Customization

### Adding New Fields

1. **Add to Database**

   ```sql
   ALTER TABLE profiles ADD COLUMN new_field TEXT;
   ```

2. **Update Profile Service**

   ```javascript
   // In src/services/profileService.js
   // Add field to createProfile and updateProfile functions
   ```

3. **Update Profile Component**
   ```vue
   <!-- In src/views/ProfileView.vue -->
   <!-- Add form field in template -->
   <!-- Add to data() and methods -->
   ```

### Styling Customization

All styles use CSS custom properties:

```css
--primary-color: #069e2d;
--border-color: #e5e7eb;
--error-color: #dc2626;
--success-color: #16a34a;
```

## 🐛 Troubleshooting

### Common Issues

**1. "Profile not loading"**

- Check Supabase connection
- Verify RLS policies are set
- Check browser console for errors

**2. "Save button not working"**

- Check form validation errors
- Verify user is authenticated
- Check network tab for API errors

**3. "Data not persisting"**

- Verify database migration ran successfully
- Check Supabase logs for errors
- Ensure triggers are created

### Debug Commands

```javascript
// In browser console
console.log('User store:', useUserStore())
console.log('Current session:', useUserStore().session)
console.log('Current profile:', useUserStore().profile)
```

## 📱 Mobile Responsive

The profile system is fully responsive:

- ✅ Mobile-friendly forms
- ✅ Touch-optimized buttons
- ✅ Responsive grid layout
- ✅ Accessible form labels

## 🔐 Security Notes

- All profile operations require authentication
- Users can only access their own data
- SQL injection protection via parameterized queries
- XSS protection via Vue.js templating

## 🎉 Success!

If you can edit your profile and see the data persist after logout/login, your profile system is working perfectly!

Your users can now:

- ✅ Maintain persistent profile information
- ✅ Update their details anytime
- ✅ Have their data automatically saved
- ✅ Access their information across sessions

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Supabase setup
3. Ensure all migration steps completed
4. Test with a fresh user account

The profile system is now fully integrated with Supabase and ready for production use!
