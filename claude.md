# RealYield

Real estate investment analysis platform for evaluating rental property deals through comprehensive financial modeling.

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS
- **Desktop**: Electron 39 with SQLite (better-sqlite3)
- **Web Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **PDF Export**: jsPDF + html2canvas
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/       # React components (Dashboard, InputSection, etc.)
├── context/          # AuthContext, ThemeContext
├── services/         # dataService.js (unified API), supabase.js
├── utils/            # financials.js, scoring.js, constants.js, validation.js
├── App.jsx           # Main orchestrator with state management
└── main.jsx          # Entry point

electron/
├── main.cjs          # Electron main process + IPC handlers
├── database.cjs      # SQLite database service
└── preload.cjs       # Context bridge for renderer

supabase/
└── migrations/       # PostgreSQL schema + RLS policies
```

## Development Commands

```bash
npm run dev           # Vite dev server (localhost:5173)
npm run electron:dev  # Electron with hot reload
npm run build         # Production build
npm run electron:build # Build Electron .app/.dmg
npm run lint          # ESLint check
```

## Architecture

**Dual deployment model:**
- **Desktop (Electron)**: Local SQLite database, file-based import/export
- **Web (Vercel)**: Supabase PostgreSQL with Row-Level Security, email + Google OAuth

The `dataService.js` provides a unified API that detects environment and routes to appropriate backend (Electron IPC, Supabase, or localStorage fallback).

## Key Files

- [financials.js](src/utils/financials.js) - Core financial calculations (IRR, NPV, amortization, forecasting)
- [scoring.js](src/utils/scoring.js) - Deal scoring algorithm (A-F grades)
- [App.jsx](src/App.jsx) - Main state management and tab navigation
- [Dashboard.jsx](src/components/Dashboard.jsx) - Primary analysis view with metrics
- [InputSection.jsx](src/components/InputSection.jsx) - Property/financing input forms
- [dataService.js](src/services/dataService.js) - Unified storage abstraction

## Data Model

Scenarios are stored as JSON with these sections:
- `property`: purchasePrice, rehabCosts, afterRepairValue, landValuePercent, buildingSize
- `financing`: downPaymentPercent, interestRate, loanTermYears
- `operations`: inputMode (commercial/simple), rent, expenses, vacancy, growth rates
- `taxMarket`: tax rates, depreciation, exit cap rate, hold period
- `closingCosts`: title insurance, escrow, lender fees, etc.

## Coding Conventions

- Functional React components with hooks
- Tailwind utility classes (no separate CSS files)
- PascalCase for components, camelCase for utilities
- Context API for auth/theme (no Redux)
- Pure functions in utils/ for calculations
- IPC handlers return Promises (Electron)

## Environment Variables

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

No test framework currently configured. Candidates: Vitest for unit tests, React Testing Library for components.
