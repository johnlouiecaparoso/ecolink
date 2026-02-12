# Role Applications (Developer & Verifier)

## Does the form send data to the admin panel?

**Yes.** When someone fills out the form at **/apply** (Developer or Verifier):

1. Data is saved to the **`role_applications`** table in Supabase.
2. Admins see it in **Admin Dashboard → Developer & Verifier Applications** (`/admin/role-applications`).

## Where to see applications (admin)

1. Log in as an **admin** user.
2. Open **Admin** (or go to `/admin`).
3. Click **"Developer & Verifier Applications"** (or go to `/admin/role-applications`).

You get:

- **Table:** Submitted date, Applicant name, Email, Role (Developer/Verifier), Company, Status (Pending, Under Review, Approved, Rejected).
- **Search** by name, email, or company.
- **Filter** by status.
- **View** opens a drawer with: Contact (email, company, website), Experience, Motivation, Supporting links, Admin notes, Decision reason.
- **Actions:** Mark Under Review, Reject, **Approve & Assign Role** (grants the role to the user if they have an account and can send an email).

## If the table doesn’t exist yet

If you see errors when opening the apply form or the admin Role Applications page, create the table in Supabase:

1. In Supabase Dashboard go to **SQL Editor**.
2. Open **`supabase/migrations/20260212000000_create_role_applications.sql`** in your project.
3. Copy its contents into the SQL Editor and run it.

That creates `role_applications` and the policies so:

- Anyone can submit from `/apply` (including without logging in).
- Only users with `role = 'admin'` in `profiles` can read and update applications.
