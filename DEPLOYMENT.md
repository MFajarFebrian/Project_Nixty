# Vercel Deployment Instructions

This guide will help you deploy the Nixty project to Vercel.

## Prerequisites

1. A GitHub/GitLab/Bitbucket repository with your code
2. A Vercel account (https://vercel.com)
3. Your Supabase project credentials

## Step 1: Push Code to Git Repository

Make sure all your code is pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository
4. Select "Nuxt.js" as the framework (Vercel should detect this automatically)
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 3: Configure Environment Variables

After deployment, go to your Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add all variables from `.env.production` file:

### Required Variables:

**Application Settings:**
- `USE_SUPABASE` = `true`
- `NODE_ENV` = `production`
- `NUXT_PUBLIC_BASE_URL` = `https://your-app-name.vercel.app` (replace with your actual domain)

**Supabase Configuration:**
- `SUPABASE_URL` = `https://buafxvcghfeoquyprmcb.supabase.co`
- `SUPABASE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI`
- `NUXT_PUBLIC_SUPABASE_URL` = `https://buafxvcghfeoquyprmcb.supabase.co`
- `NUXT_PUBLIC_SUPABASE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI`

**Database Configuration:**
- `SUPABASE_DB_HOST` = `aws-0-ap-southeast-1.pooler.supabase.com`
- `SUPABASE_DB_USER` = `postgres.buafxvcghfeoquyprmcb`
- `SUPABASE_DB_PASSWORD` = `xD5U0KxWnyFSZoEr`
- `SUPABASE_DB_NAME` = `postgres`
- `SUPABASE_DB_PORT` = `6543`
- `DATABASE_URL` = `postgresql://postgres.buafxvcghfeoquyprmcb:xD5U0KxWnyFSZoEr@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

**Payment Gateway:**
- `NUXT_MIDTRANS_SERVER_KEY` = `SB-Mid-server-0-XiKyaD4PwMJvSRl7JZbZDp`
- `NUXT_PUBLIC_MIDTRANS_CLIENT_KEY` = `SB-Mid-client-XZVBXJmESkGTZlFP`
- `NUXT_PUBLIC_MIDTRANS_IS_PRODUCTION` = `true`

**Email Configuration:**
- `MAIL_HOST` = `smtp.gmail.com`
- `MAIL_PORT` = `587`
- `MAIL_USER` = `nixtydemo@gmail.com`
- `MAIL_PASS` = `hoxu nmuc xahz xbej`

**Optional:**
- `GEMINI_API_KEY` = (your Gemini API key if needed)

## Step 4: Redeploy

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for the deployment to complete

## Step 5: Test the Deployment

1. Visit your Vercel URL
2. Test authentication functionality
3. Test database connections
4. Verify all features work correctly

## Troubleshooting

### 401 Unauthorized Errors:
- Check that all Supabase environment variables are correctly set
- Ensure your Supabase project is accessible
- Verify database connection string is correct

### Build Errors:
- Check the build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

### Database Connection Issues:
- Confirm Supabase database credentials
- Check if your Supabase project allows connections from Vercel
- Verify the connection string format

## Custom Domain (Optional)

To use a custom domain:
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Update `NUXT_PUBLIC_BASE_URL` environment variable

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase project settings
3. Ensure all environment variables are correctly configured
