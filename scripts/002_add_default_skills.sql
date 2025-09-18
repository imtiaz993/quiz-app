-- Add default skills to prevent foreign key constraint errors
INSERT INTO skills (id, name, description, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'JavaScript', 'JavaScript programming language fundamentals', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'React', 'React framework and component development', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Node.js', 'Server-side JavaScript with Node.js', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'HTML/CSS', 'Web markup and styling fundamentals', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Database', 'Database design and SQL queries', NOW())
ON CONFLICT (id) DO NOTHING;
