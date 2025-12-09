-- Dashboard Views Migration
-- These views aggregate data on the database side to reduce frontend processing

-- 1. Dashboard Summary View - all-time totals
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT 
  COALESCE((SELECT SUM(amount) FROM contributions), 0)::numeric AS total_contributions,
  COALESCE((SELECT SUM(amount) FROM expenses), 0)::numeric AS total_expenses,
  COALESCE((SELECT SUM(amount) FROM contributions), 0) - COALESCE((SELECT SUM(amount) FROM expenses), 0) AS pool_balance,
  (SELECT COUNT(*) FROM members WHERE is_active = true)::int AS active_members_count,
  (SELECT (value->>'amount')::numeric FROM settings WHERE key = 'monthly_contribution') AS required_amount;

-- 2. Current Month Collection Progress View
CREATE OR REPLACE VIEW v_current_month_progress AS
WITH current_period AS (
  SELECT 
    EXTRACT(MONTH FROM CURRENT_DATE)::int AS month,
    EXTRACT(YEAR FROM CURRENT_DATE)::int AS year
),
required AS (
  SELECT (value->>'amount')::numeric AS amount FROM settings WHERE key = 'monthly_contribution'
),
member_payments AS (
  SELECT 
    m.id AS member_id,
    m.full_name,
    m.room_id,
    cp.month,
    cp.year,
    COALESCE(SUM(c.amount), 0) AS paid_amount,
    r.amount AS required_amount,
    CASE 
      WHEN COALESCE(SUM(c.amount), 0) >= r.amount THEN 'paid'
      WHEN COALESCE(SUM(c.amount), 0) > 0 THEN 'partial'
      ELSE 'unpaid'
    END AS status
  FROM members m
  CROSS JOIN current_period cp
  CROSS JOIN required r
  LEFT JOIN contributions c ON c.member_id = m.id 
    AND c.month = cp.month 
    AND c.year = cp.year
  WHERE m.is_active = true
  GROUP BY m.id, m.full_name, m.room_id, cp.month, cp.year, r.amount
)
SELECT 
  month,
  year,
  required_amount,
  SUM(paid_amount)::numeric AS total_collected,
  (COUNT(*) * required_amount)::numeric AS expected_total,
  COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_count,
  COUNT(*) FILTER (WHERE status = 'partial')::int AS partial_count,
  COUNT(*) FILTER (WHERE status = 'unpaid')::int AS unpaid_count
FROM member_payments
GROUP BY month, year, required_amount;

-- 3. Pending Payments View - all months with unpaid/partial members
CREATE OR REPLACE VIEW v_pending_payments AS
WITH required AS (
  SELECT (value->>'amount')::numeric AS amount FROM settings WHERE key = 'monthly_contribution'
),
contribution_periods AS (
  SELECT DISTINCT month, year FROM contributions
),
member_payments AS (
  SELECT 
    m.id AS member_id,
    m.full_name,
    m.room_id,
    cp.month,
    cp.year,
    COALESCE(SUM(c.amount), 0)::numeric AS paid_amount,
    r.amount AS required_amount,
    CASE 
      WHEN COALESCE(SUM(c.amount), 0) >= r.amount THEN 'paid'
      WHEN COALESCE(SUM(c.amount), 0) > 0 THEN 'partial'
      ELSE 'unpaid'
    END AS status
  FROM members m
  CROSS JOIN contribution_periods cp
  CROSS JOIN required r
  LEFT JOIN contributions c ON c.member_id = m.id 
    AND c.month = cp.month 
    AND c.year = cp.year
  WHERE m.is_active = true
  GROUP BY m.id, m.full_name, m.room_id, cp.month, cp.year, r.amount
)
SELECT 
  member_id,
  full_name,
  room_id,
  month,
  year,
  paid_amount,
  required_amount,
  status
FROM member_payments
WHERE status IN ('unpaid', 'partial')
ORDER BY year DESC, month DESC, room_id;

-- Grant read access to anonymous users
GRANT SELECT ON v_dashboard_summary TO anon;
GRANT SELECT ON v_current_month_progress TO anon;
GRANT SELECT ON v_pending_payments TO anon;

