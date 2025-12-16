# RealYield

A real estate investment analysis tool for evaluating rental property deals. Available as both a **desktop application** (Electron) and a **web application** (hosted on Vercel).

![RealYield](public/logo.svg)

## Features

- **Investment Analysis** — Calculate cash flow, ROI, cap rate, and cash-on-cash returns
- **Pro Forma Projections** — 10-year financial projections with customizable assumptions
- **Sensitivity Analysis** — Test how changes in rent, vacancy, or expenses affect returns
- **Loan Comparison** — Compare different financing options side-by-side
- **Deal Scoring** — Automatic scoring system to quickly evaluate deal quality
- **PDF Reports** — Export professional investment memorandums
- **Scenario Management** — Save, load, and compare multiple investment scenarios
- **Amortization Charts** — Visualize loan paydown over time

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS |
| Desktop | Electron, SQLite (better-sqlite3) |
| Web Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Charts | Recharts |
| PDF Export | jsPDF, html2canvas |

## Project Structure

```
realyield/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── context/            # React contexts (Auth, Theme)
│   ├── services/           # Data services (Supabase, dataService)
│   └── utils/              # Financial calculations, validation
├── electron/               # Electron main process
│   ├── main.cjs            # Main process entry
│   ├── preload.cjs         # Preload scripts
│   └── database.cjs        # SQLite database service
├── supabase/
│   └── migrations/         # Database schema
├── public/                 # Static assets
└── build/                  # Electron build assets
```

## Architecture

### Desktop App (Electron)
```
┌─────────────────────────────────┐
│         Electron App            │
│                                 │
│   React Frontend (Renderer)     │
│            ↓                    │
│   SQLite Database (Local)       │
└─────────────────────────────────┘
```

### Web App (Vercel + Supabase)
```
┌─────────────────────────────────┐
│     Vercel (Frontend Host)      │
│     realyield.vercel.app        │
└───────────────┬─────────────────┘
                │ HTTPS
                ▼
┌─────────────────────────────────┐
│     Supabase (Backend)          │
│  • PostgreSQL Database          │
│  • User Authentication          │
│  • Row-Level Security           │
└─────────────────────────────────┘
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/arstraus/realyield.git
cd realyield
npm install
```

### Run Web Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Run Electron Development

```bash
npm run electron:dev
```

### Build Electron App

```bash
npm run electron:build
```

Outputs to `release/` directory:
- `RealYield.app` — macOS application
- `RealYield-x.x.x-arm64.dmg` — macOS installer

---

## Web Deployment

### Services Overview

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **GitHub** | Code repository | Unlimited |
| **Supabase** | Database + Auth | 500MB DB, 50K users |
| **Vercel** | Frontend hosting | 100GB bandwidth |

### Step 1: GitHub Repository

Push your code to GitHub:

```bash
git add -A
git commit -m "Initial commit"
git push origin main
```

### Step 2: Supabase Setup

#### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Configure:
   - **Name:** `realyield`
   - **Database Password:** Generate and save securely
   - **Region:** Choose closest to your users
4. Wait for project initialization (~2 minutes)

#### 2.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:

| Key | Environment Variable |
|-----|---------------------|
| Project URL | `VITE_SUPABASE_URL` |
| anon public | `VITE_SUPABASE_ANON_KEY` |

#### 2.3 Create Database Schema

1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Paste the contents of `supabase/migrations/00001_initial_schema.sql`
4. Click **"Run"**

<details>
<summary>Schema Overview</summary>

```sql
-- scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    property_address TEXT,
    property_city TEXT,
    property_state TEXT,
    data JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (users only see their own data)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
```

</details>

#### 2.4 Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Set:
   - **Site URL:** `https://realyield.vercel.app`
   - **Redirect URLs:**
     - `https://realyield.vercel.app`
     - `http://localhost:5173`

### Step 3: Vercel Deployment

#### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select **`arstraus/realyield`**
4. Click **"Import"**

#### 3.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

#### 3.3 Add Environment Variables

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

#### 3.4 Deploy

Click **"Deploy"** — your app will be live in ~2 minutes.

---

## Google OAuth Setup (Optional)

Enable "Sign in with Google" for the web app.

### Step 1: Google Cloud Console

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create a project or select existing
3. **Configure OAuth consent screen:**
   - User type: External
   - App name: `RealYield`
   - Add your email for support contact
4. **Create OAuth client ID:**
   - Type: Web application
   - Name: `RealYield`
   - Authorized redirect URI:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
5. Copy **Client ID** and **Client Secret**

### Step 2: Enable in Supabase

1. Go to **Authentication** → **Providers** → **Google**
2. Toggle **ON**
3. Paste Client ID and Client Secret
4. Save

---

## Continuous Deployment

Once connected, Vercel automatically deploys on every push to `main`:

```bash
git add -A
git commit -m "Your changes"
git push
```

Preview deployments are created for pull requests.

---

## Environment Variables

### Web (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

### Local Development

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run electron:dev` | Run Electron in development |
| `npm run electron:build` | Build Electron app |
| `npm run server` | Start Express API server |

---

## Troubleshooting

### "Invalid API key" error
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Redeploy after changing environment variables

### Authentication not working
- Check Supabase redirect URLs include your domain
- Verify the database schema was applied

### Data not saving
- Confirm `scenarios` table exists
- Check Row Level Security policies
- View Supabase logs: **Database** → **Logs**

### Google OAuth error
- Verify Google provider is enabled in Supabase
- Check redirect URI matches exactly
- Ensure OAuth consent screen is configured

### Build failing
- Check Vercel build logs
- Try `npm run build` locally
- Ensure all dependencies are in `package.json`

---

## License

MIT

---

## Links

- **Live App:** [realyield.vercel.app](https://realyield.vercel.app)
- **Repository:** [github.com/arstraus/realyield](https://github.com/arstraus/realyield)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
