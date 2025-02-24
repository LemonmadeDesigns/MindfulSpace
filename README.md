# MindfulSpace - Mental Health Support Platform

A comprehensive mental health support platform built with React, TypeScript, and Supabase.

## Features

- User authentication and authorization
- Support group management
- Real-time chat support
- Appointment scheduling
- Community forum
- Mood detection
- Admin dashboard

<details>
<summary>Local Development Setup</summary>

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Environment Variables

1. Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to your Supabase project dashboard
2. Click on Settings -> API
3. Copy the Project URL and anon/public key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mindful-space
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Database Connection

The application uses Supabase as its database. To maintain the connection:

1. Ensure your `.env` file contains the correct Supabase credentials
2. The connection is automatically managed by the Supabase client in `src/utils/supabase.ts`
3. Real-time features will work as long as the Supabase project is accessible

### Local Testing

To test the full functionality locally:

1. Ensure your Supabase project is running and accessible
2. Test user authentication flows
3. Verify real-time features (chat, appointments)
4. Check admin functionality by promoting a user to admin role

</details>

<details>
<summary>Deployment Guide</summary>

### Preparing for Deployment

1. Update environment variables:
   - Create production environment variables in your deployment platform
   - Ensure they match your Supabase production credentials

2. Build the project:
```bash
npm run build
```

### Deployment Platforms

#### Netlify

1. Connect your repository to Netlify
2. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

### DNS and HTTPS Configuration

#### Setting up Custom Domain

1. In Netlify dashboard:
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter your domain name
   - Follow DNS configuration instructions

2. Configure DNS Records:
   - Add an A record pointing to Netlify's load balancer
   - Add CNAME record for www subdomain
   - Wait for DNS propagation (up to 48 hours)

#### Enabling HTTPS

1. Automatic SSL/TLS:
   - Netlify provides free SSL certificates via Let's Encrypt
   - Certificates are auto-provisioned after DNS configuration
   - No manual setup required

2. Force HTTPS:
   - Go to Site settings > Domain management
   - Enable "Force HTTPS"
   - All HTTP traffic will redirect to HTTPS

3. Troubleshooting:
   - Verify DNS records are correct
   - Check for SSL certificate provisioning status
   - Ensure no conflicting DNS records exist
   - Wait for DNS propagation if recently configured

### Post-Deployment

1. Verify Supabase Connection:
   - Test authentication
   - Check real-time features
   - Verify database operations

2. Security Considerations:
   - Ensure RLS policies are properly configured
   - Verify authentication flows
   - Test admin access restrictions

3. Monitoring:
   - Monitor Supabase usage and quotas
   - Check for any CORS issues
   - Monitor real-time connections

### Production Database

The application will remain connected to your Supabase database as long as:

1. Environment variables are correctly set
2. Supabase project is active and accessible
3. RLS policies are properly configured
4. CORS settings in Supabase allow your deployment domain

### Troubleshooting

Common issues and solutions:

1. Authentication Issues:
   - Verify environment variables
   - Check CORS settings in Supabase
   - Ensure proper redirect URLs in Supabase auth settings

2. Real-time Connection Issues:
   - Verify WebSocket connections
   - Check Supabase project status
   - Confirm network access to Supabase

3. Database Access Issues:
   - Verify RLS policies
   - Check user roles and permissions
   - Confirm database connection strings

4. DNS/HTTPS Issues:
   - Confirm DNS records match Netlify's requirements
   - Wait for DNS propagation
   - Check SSL certificate status
   - Verify HTTPS is forced in Netlify settings

</details>

<details>
<summary>Admin Setup Guide</summary>

### Setting Up Admin Access

1. Register a new account through the normal registration process
2. Access your Supabase dashboard
3. Go to the SQL editor
4. Run the following query (replace YOUR_USER_ID with the actual user ID):

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

To find your user ID:
- Look in the URL after logging in, or
- Check the Supabase Authentication > Users section

### Admin Features

Once promoted to admin, you can:
- Manage users
- Monitor support groups
- Handle appointments
- Moderate forum posts
- Access admin dashboard

</details>