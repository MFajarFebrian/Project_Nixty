# Supabase Setup Guide for Project Nixty

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with your GitHub account
3. Click **"New Project"**
4. Set project name: **"nixty"**
5. Set a strong database password (save this!)
6. Choose region closest to your users
7. Click **"Create new project"**

## Step 2: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste it in the SQL Editor
4. Click **"Run"** to create all tables and indexes

## Step 3: Insert Sample Data

1. In the same SQL Editor
2. Copy the entire content from `supabase-data.sql`
3. Paste it in the SQL Editor
4. Click **"Run"** to insert sample data

## Step 4: Get Database Credentials

1. Go to **Settings** → **Database** in your Supabase dashboard
2. Copy these values:
   - **Host**: `db.your-project-ref.supabase.co`
   - **Database name**: `postgres`
   - **Username**: `postgres`
   - **Password**: (the one you set during project creation)
   - **Port**: `5432`

## Step 5: Update Environment Variables

### For Local Development (.env file):
```env
USE_SUPABASE=true
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PASSWORD=your-actual-password
```

### For Vercel Production:
Set these environment variables in your Vercel dashboard:

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
USE_SUPABASE=true
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-actual-password
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=5432
```

## Step 6: Test the Connection

### Local Testing:
1. Update your `.env` file with the correct Supabase credentials
2. Run `npm run dev`
3. Visit `http://localhost:3000/home`
4. Check if data loads correctly

### Production Testing:
1. After setting Vercel environment variables
2. Redeploy your app: `vercel --prod`
3. Visit your live URL: `https://project-nixty.vercel.app/home`
4. Check if data loads correctly

## Step 7: Verify Database Connection

You can test the database connection by visiting these API endpoints:

- **Categories**: `https://project-nixty.vercel.app/api/categories`
- **Products**: `https://project-nixty.vercel.app/api/products`
- **Announcements**: `https://project-nixty.vercel.app/api/announcements`

## Troubleshooting

### Common Issues:

1. **Connection timeout**: Check if your Supabase project is active and the host URL is correct
2. **Authentication failed**: Verify your password and username
3. **SSL errors**: Make sure SSL is enabled in your connection settings

### Database Migration from XAMPP:

If you want to migrate your existing XAMPP data:

1. Export your current MySQL data
2. Convert MySQL syntax to PostgreSQL
3. Import to Supabase using the SQL Editor

## Benefits of Using Supabase:

✅ **Cloud-hosted**: No need to expose your local XAMPP
✅ **PostgreSQL**: More robust than MySQL
✅ **Free tier**: Generous limits for development
✅ **Real-time**: Built-in real-time subscriptions
✅ **Auth**: Built-in authentication system
✅ **Storage**: File storage capabilities
✅ **API**: Auto-generated REST and GraphQL APIs

Your Vercel app will now connect to Supabase instead of your local XAMPP database!
