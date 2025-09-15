-- Create questions table with support for MCQ, fill-in-the-blank, and short answer
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'fill_blank', 'short_answer')),
  variant INTEGER NOT NULL CHECK (variant IN (1, 2, 3)),
  options JSONB, -- For MCQ options: {"a": "option1", "b": "option2", "c": "option3", "d": "option4"}
  correct_answer TEXT NOT NULL, -- For MCQ: "a", for fill_blank/short_answer: the correct text
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table to track user quiz sessions
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_info JSONB, -- Additional user information
  variant INTEGER NOT NULL CHECK (variant IN (1, 2, 3)),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0
);

-- Create user_answers table to store individual answers
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_variant ON questions(variant);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_email ON quiz_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt ON user_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);

-- Insert sample questions for testing
INSERT INTO questions (question_text, question_type, variant, options, correct_answer, explanation) VALUES
-- Variant 1 Questions
('What is the capital of France?', 'mcq', 1, '{"a": "London", "b": "Berlin", "c": "Paris", "d": "Madrid"}', 'c', 'Paris is the capital and largest city of France.'),
('The chemical symbol for gold is _____.', 'fill_blank', 1, NULL, 'Au', 'Au comes from the Latin word "aurum" meaning gold.'),
('Explain the concept of photosynthesis in plants.', 'short_answer', 1, NULL, 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.', 'Photosynthesis is essential for plant survival and oxygen production.'),

-- Variant 2 Questions  
('Which planet is known as the Red Planet?', 'mcq', 2, '{"a": "Venus", "b": "Mars", "c": "Jupiter", "d": "Saturn"}', 'b', 'Mars appears red due to iron oxide (rust) on its surface.'),
('Water boils at _____ degrees Celsius at sea level.', 'fill_blank', 2, NULL, '100', 'Water boils at 100°C (212°F) at standard atmospheric pressure.'),
('What is the importance of biodiversity?', 'short_answer', 2, NULL, 'Biodiversity is important for ecosystem stability, food security, medicine, and environmental resilience.', 'Biodiversity supports all life on Earth and human well-being.'),

-- Variant 3 Questions
('Who wrote the novel "1984"?', 'mcq', 3, '{"a": "Aldous Huxley", "b": "George Orwell", "c": "Ray Bradbury", "d": "H.G. Wells"}', 'b', 'George Orwell wrote "1984" as a dystopian social science fiction novel.'),
('The largest ocean on Earth is the _____ Ocean.', 'fill_blank', 3, NULL, 'Pacific', 'The Pacific Ocean covers about one-third of Earth\'s surface.'),
('Describe the water cycle.', 'short_answer', 3, NULL, 'The water cycle involves evaporation, condensation, precipitation, and collection, continuously moving water through the environment.', 'The water cycle is essential for distributing water and heat around the planet.');
