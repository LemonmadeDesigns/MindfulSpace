# HOW TO GET TO YOUR ADMIN PAGE

To get to the admin page and sign up as an admin, you'll need to follow these steps:

1) First, register a new account through the regular registration process

2) Then, we need to promote your user account to admin status

Since we can't directly register as an admin (for security reasons), here's how to promote the account to admin:

1) Register a new account if you haven't already:

   - Click "Sign Up" in the navigation
   - Fill out the registration form
   - Complete the signup process

2) Once registered, you'll need to update your role to admin. You can do this by running a direct database query through Supabase. Here's how:

   - a. Go to the Supabase dashboard for your project
   - b. Navigate to the SQL Editor
   - c. Run this query (replace YOUR_USER_ID with your actual user ID):

```bash
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

To find your user ID:

   - Look in the URL after logging in, or
   - Check the Supabase Authentication > Users section

3) After updating your role to admin:

   - Log out and log back in
   - You'll see an "Admin" link in the navigation
   - Click it to access the admin dashboard at /admin

The admin dashboard gives you access to:

- User management
- Support group management
- Chat monitoring
- Appointment management