# Meseret Management

A mobile-first Telegram Mini App for managing shared expenses in a residential building.

## Features

-   **Dashboard**: Overview of pool balance, collection progress, and payment status
-   **Members**: View all members and their details
-   **Contributions**: Track monthly deposits from members
-   **Expenses**: View shared expenses (water, electricity, salaries, etc.)
-   **Transactions**: Unified ledger of all money movements

## Tech Stack

-   **Vite + React + TypeScript**
-   **Tailwind CSS**
-   **shadcn/ui** components
-   **Supabase** (Postgres, read-only mode)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in `supabase/migrations/001_initial_schema.sql`
3. (Optional) Run `supabase/migrations/002_sample_data.sql` for test data

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

## Deploying to Vercel

1. Push the code to a Git repository
2. Import the project in Vercel
3. Add environment variables:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
4. Deploy!

The `vercel.json` file is already configured for SPA routing.

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ui/             # shadcn/ui components
├── hooks/              # Data fetching hooks
├── lib/                # Utilities & Supabase client
├── pages/              # Page components
└── types/              # TypeScript types

supabase/
└── migrations/         # SQL schema files
```

## Notes

-   This is a **read-only** app - all data management is done via Supabase dashboard
-   The monthly contribution amount is configurable via the `settings` table
-   Mobile-first design optimized for Telegram WebApp
