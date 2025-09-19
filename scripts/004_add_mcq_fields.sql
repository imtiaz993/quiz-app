-- Add MCQ-specific fields to quiz_attempts table
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS mcq_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_mcqs INTEGER DEFAULT 0;

-- Update existing records to calculate MCQ scores
UPDATE quiz_attempts 
SET 
  mcq_score = (
    SELECT COUNT(*) 
    FROM user_answers qa 
    JOIN questions q ON qa.question_id = q.id 
    WHERE qa.attempt_id = quiz_attempts.id 
      AND q.question_type = 'mcq' 
      AND qa.is_correct = true
  ),
  total_mcqs = (
    SELECT COUNT(*) 
    FROM user_answers qa 
    JOIN questions q ON qa.question_id = q.id 
    WHERE qa.attempt_id = quiz_attempts.id 
      AND q.question_type = 'mcq'
  )
WHERE completed_at IS NOT NULL;
