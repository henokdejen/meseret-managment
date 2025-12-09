-- Meseret Management Initial Schema
-- Run this in your Supabase SQL editor

-- 1. Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  room_id text NOT NULL,
  water_bill_id text,
  water_bill_registration_name text,
  water_bill_payers text[] DEFAULT '{}',
  phone text,
  joined_at timestamp with time zone DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Settings table (for configurable values like monthly contribution)
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL
);

-- Insert default monthly contribution
INSERT INTO settings (key, value) 
VALUES ('monthly_contribution', '{"amount": 1000}')
ON CONFLICT (key) DO NOTHING;

-- 3. Contributions table (deposits by members)
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  month int NOT NULL CHECK (month >= 1 AND month <= 12),
  year int NOT NULL,
  paid_at timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Expenses table (shared expenses / withdrawals)
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('water', 'electric_shared', 'guard_salary', 'janitor_salary', 'other')),
  description text,
  amount numeric(12,2) NOT NULL,
  month int CHECK (month >= 1 AND month <= 12),
  year int,
  date date,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- 5. Water bills table (optional but useful)
CREATE TABLE IF NOT EXISTS water_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  billing_month int NOT NULL CHECK (billing_month >= 1 AND billing_month <= 12),
  billing_year int NOT NULL,
  amount numeric(12,2) NOT NULL,
  bill_id text,
  paid_from_pool boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_is_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_room_id ON members(room_id);
CREATE INDEX IF NOT EXISTS idx_contributions_member_id ON contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_month_year ON contributions(month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_month_year ON expenses(month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_water_bills_member_id ON water_bills(member_id);
CREATE INDEX IF NOT EXISTS idx_water_bills_month_year ON water_bills(billing_month, billing_year);

-- Enable Row Level Security (RLS) for read-only access
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_bills ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for anonymous users
CREATE POLICY "Allow read access to members" ON members FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to settings" ON settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to contributions" ON contributions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to expenses" ON expenses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow read access to water_bills" ON water_bills FOR SELECT TO anon USING (true);

-- Optional: Create a view for unified transactions
CREATE OR REPLACE VIEW v_transactions AS
SELECT 
  c.id::text as id,
  'contributions' as source_table,
  'deposit' as type,
  c.member_id,
  m.full_name as member_name,
  c.amount,
  'in' as direction,
  c.paid_at as created_at,
  c.month,
  c.year,
  c.notes as description
FROM contributions c
LEFT JOIN members m ON c.member_id = m.id

UNION ALL

SELECT 
  e.id::text as id,
  'expenses' as source_table,
  'withdraw' as type,
  NULL as member_id,
  NULL as member_name,
  e.amount,
  'out' as direction,
  e.created_at,
  e.month,
  e.year,
  COALESCE(e.description, e.type) as description
FROM expenses e

ORDER BY created_at DESC;

