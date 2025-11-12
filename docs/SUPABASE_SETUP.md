# Supabase Storage Setup for Profile Photos

To enable profile photo uploads, you need to set up a storage bucket in your Supabase project.

## Steps to Create the Storage Bucket

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Go to **Storage** in the left sidebar
   - Click **New bucket**
   - Name: `avatars`
   - Make it **Public** (uncheck "Private bucket")
   - Click **Create bucket**

3. **Set Up Storage Policies (RLS)**

   You need to set up Row Level Security policies so users can upload their own photos:

   **Option A: Using Supabase Dashboard**
   - Go to **Storage** → **Policies** → Select `avatars` bucket
   - Click **New Policy**
   
   **Policy 1: Allow authenticated users to upload**
   - Policy name: `Users can upload their own avatars`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression:
     ```sql
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text OR
     split_part(name, '_', 1) = auth.uid()::text
     ```

   **Policy 2: Allow authenticated users to update their own avatars**
   - Policy name: `Users can update their own avatars`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression:
     ```sql
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text OR
     split_part(name, '_', 1) = auth.uid()::text
     ```
   - WITH CHECK expression:
     ```sql
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text OR
     split_part(name, '_', 1) = auth.uid()::text
     ```

   **Policy 3: Allow authenticated users to delete their own avatars**
   - Policy name: `Users can delete their own avatars`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression:
     ```sql
     bucket_id = 'avatars' AND
     (storage.foldername(name))[1] = auth.uid()::text OR
     split_part(name, '_', 1) = auth.uid()::text
     ```

   **Policy 4: Allow public read access**
   - Policy name: `Anyone can view avatars`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression:
     ```sql
     true
     ```

   **Option B: Using SQL Editor**
   
   Run this SQL in your Supabase SQL Editor:
   
   ```sql
   -- First, drop existing policies if they exist (to avoid conflicts)
   DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
   DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
   DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

   -- Policy for INSERT (upload)
   -- Files are stored as: {userId}_{timestamp}.{ext}
   CREATE POLICY "Users can upload their own avatars"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'avatars' AND
     split_part(name, '_', 1) = auth.uid()::text
   );

   -- Policy for UPDATE
   CREATE POLICY "Users can update their own avatars"
   ON storage.objects
   FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'avatars' AND
     split_part(name, '_', 1) = auth.uid()::text
   )
   WITH CHECK (
     bucket_id = 'avatars' AND
     split_part(name, '_', 1) = auth.uid()::text
   );

   -- Policy for DELETE
   CREATE POLICY "Users can delete their own avatars"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'avatars' AND
     split_part(name, '_', 1) = auth.uid()::text
   );

   -- Policy for SELECT (public read)
   CREATE POLICY "Anyone can view avatars"
   ON storage.objects
   FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

## File Structure

Files are stored in the bucket with the following structure:
```
avatars/
  └── {userId}_{timestamp}.{ext}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000_1698765432123.jpg`

## Verify Setup

1. Try uploading a profile photo in your app
2. Check the Storage bucket in Supabase dashboard - you should see the uploaded file
3. The photo should be accessible via the public URL

## Troubleshooting

- **Upload fails with "permission denied"**: Check your RLS policies are set correctly
- **Photo not displaying**: Make sure the bucket is set to **Public**
- **File too large error**: The app limits uploads to 5MB. Images are automatically resized to max 800x800px before upload.

