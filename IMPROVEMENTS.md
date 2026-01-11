# RealYield Improvement Plan

## Summary

This document outlines proposed improvements for RealYield based on a comprehensive code review. Items are prioritized by impact and effort.

---

## Critical Priority (Week 1-2)

### 1. Add Unit Tests for Financial Calculations
**Files**: `src/utils/financials.js`, `src/utils/scoring.js`

- IRR computation (including negative returns, non-convergence)
- NPV calculations
- Amortization schedule accuracy
- Tax calculations
- Deal scoring thresholds

**Setup**: Add Vitest + React Testing Library

### 2. Fix Edge Cases in Calculations
**File**: `src/utils/financials.js`

- **Division by zero**: DSCR calculation (line 293) crashes if debt service is 0
- **IRR non-convergence**: Returns 0 which is ambiguous (line 65)
- **Negative metrics**: Scoring doesn't handle negative IRR/CoC
- **NaN propagation**: Non-numeric inputs spread through calculations

### 3. Input Validation Enforcement
**Files**: `src/utils/validation.js`, `src/components/InputSection.jsx`

- validation.js exists but is never imported/used
- Add validation before calculations run
- Show user-friendly error messages

### 4. Error Handling & User Feedback
**Current**: Uses `alert()` and `console.error()`
**Fix**: Implement toast notification system for:
- Save success/failure
- Load errors
- Calculation warnings

---

## High Priority (Week 2-4)

### 5. Performance: Code Splitting
**File**: `vite.config.js`
**Current bundle**: 1.46MB single chunk

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        charts: ['recharts'],
        pdf: ['jspdf', 'html2canvas'],
        supabase: ['@supabase/supabase-js']
      }
    }
  }
}
```

### 6. State Management Refactor
**File**: `src/App.jsx` (449 lines)

- Extract scenario state to ScenarioContext
- Replace prop drilling with context hooks
- Reduce from 9+ useState calls to single reducer

### 7. Remove Code Duplication
**File**: `src/App.jsx` (lines 155-205)

Same merge pattern repeated 3 times:
```javascript
if (data.property) setProperty({ ...DEFAULT_PROPERTY, ...data.property });
// ... repeated for financing, operations, taxMarket, closingCosts
```

Extract to `utils/scenarioHelpers.js`:
```javascript
export function mergeScenarioData(data, defaults) { ... }
```

### 8. Sensitivity Analysis Optimization
**File**: `src/components/SensitivityAnalysis.jsx`

- 8x8 matrix runs `generateForecast()` 64 times
- Add memoization with stable dependency arrays
- Consider Web Worker for heavy calculations

---

## Medium Priority (Week 4-6)

### 9. Missing Financial Features
**File**: `src/utils/financials.js`

| Feature | Description | Impact |
|---------|-------------|--------|
| 1031 Exchange | Tax-deferred exchange tracking | High for investors |
| Cost Segregation | Accelerated depreciation | +5-20% IRR accuracy |
| Loan Points | Closing cost component | Accuracy |
| Floating Rate | Variable rate loans | Common in commercial |
| Partial Years | Mid-year acquisition | Accuracy |

### 10. Mobile Responsiveness
**File**: `src/components/InputSection.jsx`

- Add `sm:grid-cols-1` breakpoints
- Improve table scrolling on mobile
- Touch-friendly input controls

### 11. TypeScript Migration (Start)
- Add TypeScript to new files
- Create type definitions for:
  - Scenario data shape
  - Financial calculation inputs/outputs
  - Component props

### 12. CI/CD Pipeline
Add GitHub Actions for:
- Lint check on PR
- Build verification
- Bundle size monitoring
- Deploy preview

---

## Low Priority (Future)

### 13. Additional Features
- Property comps integration (API)
- Team/syndication tracking
- Portfolio analytics
- Geographic performance analysis
- Historical accuracy tracking

### 14. Developer Experience
- Add Storybook for component development
- JSDoc comments on financial functions
- Debug mode for calculation steps

### 15. Full TypeScript Migration
- Convert existing .jsx to .tsx
- Add strict type checking

---

## Quick Wins (Can Do Anytime)

| Item | File | Effort |
|------|------|--------|
| Add loading states | Dashboard.jsx | 1 hour |
| Keyboard shortcuts | App.jsx | 2 hours |
| Better scenario naming | ScenarioManager.jsx | 1 hour |
| Form autosave | InputSection.jsx | 2 hours |
| Export to Excel | Dashboard.jsx | 3 hours |

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Bundle Size | 1.46MB | < 800KB |
| Test Coverage | 0% | 80%+ |
| Type Safety | 0% | 50%+ |
| Lighthouse Score | Unknown | 90+ |

---

## Implementation Order

```
Week 1-2: Critical (Tests, Edge Cases, Validation)
    ↓
Week 2-4: High (Performance, State, Duplication)
    ↓
Week 4-6: Medium (Features, Mobile, TypeScript start)
    ↓
Ongoing: Low priority & Quick wins
```
