-- Sample Data for Testing (Optional)
-- You can run this to populate your database with test data

-- Sample members
INSERT INTO members (full_name, room_id, phone, water_bill_id, is_active) VALUES
  ('Abebe Kebede', '101', '+251911123456', 'WB-101', true),
  ('Tigist Haile', '102', '+251912234567', 'WB-102', true),
  ('Dawit Tesfaye', '103', '+251913345678', 'WB-103', true),
  ('Meron Alemu', '104', '+251914456789', 'WB-104', true),
  ('Solomon Bekele', '201', '+251915567890', 'WB-201', true),
  ('Hanna Girma', '202', '+251916678901', 'WB-202', true),
  ('Yonas Tadesse', '203', '+251917789012', 'WB-203', true),
  ('Sara Mulugeta', '204', '+251918890123', 'WB-204', true),
  ('Bereket Worku', '301', '+251919901234', 'WB-301', true),
  ('Frehiwot Dereje', '302', '+251920012345', 'WB-302', true),
  ('Henok Ayele', '303', '+251921123456', 'WB-303', true),
  ('Lidya Birhanu', '304', '+251922234567', 'WB-304', true),
  ('Nahom Mekonnen', '401', '+251923345678', 'WB-401', true),
  ('Bethlehem Asefa', '402', '+251924456789', 'WB-402', true),
  ('Kidus Lemma', '403', '+251925567890', 'WB-403', true),
  ('Ruth Wolde', '404', '+251926678901', 'WB-404', true)
ON CONFLICT DO NOTHING;

-- Sample contributions for current month (adjust month/year as needed)
-- Using December 2024 as example
INSERT INTO contributions (member_id, amount, month, year, notes)
SELECT 
  m.id,
  1000,
  12,
  2024,
  'Monthly contribution'
FROM members m
WHERE m.room_id IN ('101', '102', '103', '104', '201', '202', '203', '301', '302')
AND m.is_active = true
ON CONFLICT DO NOTHING;

-- Partial payment example
INSERT INTO contributions (member_id, amount, month, year, notes)
SELECT 
  m.id,
  500,
  12,
  2024,
  'Partial payment'
FROM members m
WHERE m.room_id = '204'
AND m.is_active = true
ON CONFLICT DO NOTHING;

-- Sample expenses for current month
INSERT INTO expenses (type, description, amount, month, year) VALUES
  ('guard_salary', 'December guard salary', 3000, 12, 2024),
  ('janitor_salary', 'December janitor salary', 2000, 12, 2024),
  ('electric_shared', 'Common area electricity', 1500, 12, 2024),
  ('water', 'Water bills for all units', 2400, 12, 2024),
  ('other', 'Building maintenance', 800, 12, 2024)
ON CONFLICT DO NOTHING;

-- Sample contributions for previous month (November 2024)
INSERT INTO contributions (member_id, amount, month, year, notes)
SELECT 
  m.id,
  1000,
  11,
  2024,
  'Monthly contribution'
FROM members m
WHERE m.is_active = true
ON CONFLICT DO NOTHING;

-- Sample expenses for previous month
INSERT INTO expenses (type, description, amount, month, year) VALUES
  ('guard_salary', 'November guard salary', 3000, 11, 2024),
  ('janitor_salary', 'November janitor salary', 2000, 11, 2024),
  ('electric_shared', 'Common area electricity', 1400, 11, 2024),
  ('water', 'Water bills for all units', 2200, 11, 2024)
ON CONFLICT DO NOTHING;

