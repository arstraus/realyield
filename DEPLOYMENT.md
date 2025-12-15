# RealYield Deployment Guide

This guide walks you through deploying RealYield as a web application using GitHub, Supabase, and Vercel.

## Overview

| Service | Purpose | Cost |
|---------|---------|------|
| **GitHub** | Code repository, version control | Free |
| **Supabase** | Database (PostgreSQL) + Authentication | Free tier (500MB DB, 50K users) |
| **Vercel** | Frontend hosting + CDN | Free tier (100GB bandwidth) |

**Architecture:**
```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
│         realyield.vercel.app            │
│                                         │
│    Your React App (static files)        │
└────────────────┬────────────────────────┘
                 │ API calls (HTTPS)
                 ▼
┌─────────────────────────────────────────┐
│          Supabase (Backend)             │
│       xxx.supabase.co                   │
│                                         │
│  • PostgreSQL Database                  │
│  • User Authentication                  │
│  • Row-Level Security                   │
└─────────────────────────────────────────┘
```

---

## Prerequisites

- [x] GitHub account ([github.com](https://github.com))
- [ ] Supabase account ([supabase.com](https://supabase.com))
- [ ] Vercel account ([vercel.com](https://vercel.com))

---

## Step 1: GitHub Repository ✅

Your code is already pushed to GitHub:
**https://github.com/arstraus/realyield**

If you need to push updates in the future:
```bash
git add -A
git commit -m "Your commit message"
git push
```

---

## Step 2: Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (use GitHub for easy login)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** `realyield` (or any name you prefer)
   - **Database Password:** Generate a strong password and **save it somewhere safe**
   - **Region:** Choose the closest to your users (e.g., `East US` or `West US`)
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to initialize

### 2.2 Get Your API Keys

Once your project is ready:

1. Go to **Settings** (gear icon in sidebar) → **API**
2. You'll see two important values:

| Key | Where to Find | What It's For |
|-----|---------------|---------------|
| **Project URL** | Under "Project URL" | `VITE_SUPABASE_URL` |
| **anon public** | Under "Project API keys" | `VITE_SUPABASE_ANON_KEY` |

**Copy both of these** — you'll need them for Vercel.

Example values (yours will be different):
```
Project URL:    https://abcdefghijklmnop.supabase.co
anon public:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Create the Database Tables

1. In Supabase, go to **SQL Editor** (in the left sidebar)
2. Click **"New query"**
3. Copy and paste the entire contents of `supabase-schema.sql` (in your project root)
4. Click **"Run"** (or press Cmd+Enter)
5. You should see "Success. No rows returned" — this is correct!

<details>
<summary>📄 Quick reference: supabase-schema.sql contents</summary>

```sql
-- Creates the scenarios table with:
-- - UUID primary key
-- - User ownership (user_id)
-- - JSON data storage
-- - Timestamps
-- - Row-level security (users can only see their own data)
```

</details>

### 2.4 Enable Authentication (Optional but Recommended)

For email/password auth (already enabled by default):
1. Go to **Authentication** → **Providers**
2. Email is enabled by default ✓

For Google OAuth (optional):
1. Go to **Authentication** → **Providers** → **Google**
2. Toggle it **ON**
3. You'll need to:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth credentials
   - Add your Vercel URL to authorized redirect URIs
   - Copy Client ID and Secret back to Supabase

---

## Step 3: Vercel Deployment

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and select **`arstraus/realyield`** from your repositories
4. Click **"Import"**

### 3.2 Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Add Environment Variables

**This is critical!** Expand the "Environment Variables" section and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...your-long-key` |

⚠️ Make sure to paste the actual values from Supabase Step 2.2

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build
3. Once complete, you'll get a URL like: `https://realyield-abc123.vercel.app`

🎉 **Your app is now live!**

---

## Step 4: Configure Supabase Redirect URLs

After deploying to Vercel, you need to tell Supabase about your new URL:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: 
   ```
   https://realyield-abc123.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://realyield-abc123.vercel.app/**
   ```

This allows authentication redirects to work properly.

---

## Step 5: Custom Domain (Optional)

### Vercel Custom Domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `realyield.com`)
3. Follow the DNS configuration instructions

### Update Supabase

After adding a custom domain, update Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Add custom domain to **Redirect URLs**

---

## Troubleshooting

### "Invalid API key" error
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Make sure there are no extra spaces or quotes
- Redeploy after changing environment variables

### Authentication not working
- Verify Supabase redirect URLs include your Vercel domain
- Check browser console for specific error messages
- Ensure the SQL schema was run successfully

### Data not saving
- Verify the `scenarios` table exists in Supabase
- Check that Row Level Security policies were created
- Look at Supabase logs: **Database** → **Logs**

### Build failing on Vercel
- Check the build logs for specific errors
- Ensure all dependencies are in `package.json`
- Try building locally with `npm run build`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes (web) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (web) | Your Supabase anon/public key |

**Note:** These are only needed for web deployment. The Electron desktop app uses local SQLite storage.

---

## Continuous Deployment

Once set up, Vercel will automatically:
- Build and deploy when you push to `main`
- Create preview deployments for pull requests
- Rollback to previous versions if needed

To deploy updates:
```bash
git add -A
git commit -m "Your changes"
git push
```

Vercel will automatically detect the push and redeploy (takes ~1 minute).

---

## Cost Summary

| Service | Free Tier Limits | When You'd Need to Pay |
|---------|------------------|------------------------|
| **GitHub** | Unlimited public/private repos | Never for basic use |
| **Supabase** | 500MB database, 50K auth users, 2GB bandwidth | High traffic or storage |
| **Vercel** | 100GB bandwidth, unlimited deploys | High traffic or team features |

**For a personal project or small business, you'll likely never exceed free tiers.**

---

## Next Steps

- [ ] Complete Supabase setup (Step 2)
- [ ] Deploy to Vercel (Step 3)
- [ ] Configure redirect URLs (Step 4)
- [ ] Test the live app
- [ ] (Optional) Add custom domain (Step 5)

---

## Support

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vite Docs:** [vitejs.dev](https://vitejs.dev)


