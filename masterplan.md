# Expense App Masterplan

## 1. Project Overview
**Goal**: Build a modern, minimalist, and highly functional finance tracking application to replace a manual spreadsheet. The app focuses on speed of entry and insightful monthly reporting to aid in saving.

**Core Philosophy**: "Minimalism & Functionality First". The app should look premium but prioritize the user's time (quick entry) and clarity (clear reports).

## 2. Tech Stack
- **Framework**: Next.js 16 (if stable/available, otherwise latest stable)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Component Library**: Shadcn/UI (for a polished, accessible foundation) + Lucide React (Icons)
- **Database & Auth**: Supabase (Auth & Postgres)
- **AI/Vision**: Vercel AI SDK (or direct OpenAI/Gemini API integration) for screenshot processing.
- **PWA/Offline**: `next-pwa` for installability + `zustand` (persisted) for offline entry queue.
- **Charts**: Recharts (for reporting)
- **State Management**: React Query (TanStack Query) for server state.

## 3. Key Features & Requirements

### A. Expense Tracking (The "Better than Spreadsheet" part)
- **Fields**: 
    -   **Date**: User-selected date of the expense (editable, defaults to today). Crucial for back-dating expenses.
    -   **Expense Type**: Category selection.
    -   **Amount**: Numeric value.
    -   **Comment**: Optional text.
    -   **Credit Card/Payment Method**: Source of funds.
- **Efficiency Boosters**:
    -   **Quick Add**: One-tap access to most frequent categories.
    -   **Smart Defaults**: Remember the last used card for specific categories.
    -   **Recurring Expenses**: Ability to set up monthly fixed costs (Rent, Subscriptions).
    -   **Keyboard Support**: Full keyboard navigation.
    -   **Mobile Optimized**: Large touch targets.
    -   **Offline Mode**: Ability to add expenses without internet. They are queued and synced when online.

### B. Smart Import (AI & Learning)
- **Screenshot Import**: Drag & drop a screenshot of a bank statement (mobile or desktop).
    -   **Validated**: Works with standard bank PDF screenshots (Date, Description, Amount columns).
    -   Uses AI Vision to extract data into a reviewable table.
- **Auto-Categorization**:
    -   **History Match**: Checks if "STARBUCKS" was previously categorized as "Coffee".
    -   **Rule Engine**: "If description contains 'UBER', set category to 'Transport'".
    -   **Learning Mode**: When user manually categorizes an imported item, ask to save as a rule.
- **Review Flow**: Staging area to approve/edit imported items before saving to database.

### C. Reports & Analytics
- **Monthly Dashboard**:
    -   Total Spent vs. Monthly Income.
    -   Savings Rate indicator.
    -   "Left to Spend" progress bar.
- **Visualizations**:
    -   Spending by Category (Donut Chart).
    -   Daily Spending Trend (Bar Chart).
    -   Credit Card Usage breakdown.

### D. Configuration
- **Categories Management**: Create/Edit/Color-code categories.
- **Payment Methods**: Manage Credit Cards/Accounts.
- **Income Setting**: Set the constant monthly income value.

## 4. Data Model (Supabase)

### `profiles`
- `id` (uuid, PK, references auth.users)
- `monthly_income` (numeric)
- `currency` (text, default 'USD')

### `categories`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text)
- `icon` (text)
- `color` (text)
- `is_default` (boolean)

### `payment_methods`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `name` (text)
- `type` (text)

### `import_rules`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `keyword` (text) (e.g., "UBER", "NETFLIX")
- `category_id` (uuid, FK)
- `created_at` (timestamptz)

### `expenses`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `amount` (numeric)
- `date` (date) -- *The actual date of the expense (editable by user)*
- `category_id` (uuid, FK)
- `payment_method_id` (uuid, FK)
- `comment` (text)
- `created_at` (timestamptz) -- *System timestamp of when the record was created*

## 5. UI/UX Design Direction
- **Theme**: Dark mode by default (or system preference), high contrast for numbers.
- **Aesthetics**: Clean lines, generous whitespace, subtle glassmorphism on cards.
- **Typography**: Inter or Geist Sans for clean readability.
- **Interactions**: Instant feedback on save, optimistic UI updates.

## 6. Development Roadmap

### Phase 1: Foundation & Setup
- Initialize Next.js project with TypeScript & Tailwind.
- Setup Supabase project and connect client.
- Implement Authentication (Login/Signup).
- Setup Database Schema and RLS policies.

### Phase 2: Core Configuration
- Create "Settings" page to manage Categories and Payment Methods.
- Set Monthly Income.

### Phase 3: Expense Entry (The Engine)
- Build the main "Add Expense" form.
- Implement "Offline Queue" (Zustand + LocalStorage).
- Implement "Quick Add" widgets.
- Create the main list view (Transaction History).

### Phase 4: Smart Import (The Magic)
- Implement AI Vision integration for screenshot parsing.
- Build "Staging/Review" UI.
- Implement `import_rules` logic and "Learning" flow.

### Phase 5: Analytics (The Insight)
- Build the Dashboard.
- Implement Charts (Category breakdown, Monthly progress).

### Phase 6: Polish & Optimization
- Refine UI animations.
- Mobile responsiveness check.
- Final testing and deployment.
