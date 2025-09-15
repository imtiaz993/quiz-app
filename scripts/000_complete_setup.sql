-- Complete database setup for quiz application
-- This script combines all necessary tables and data

-- Create skills table first
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table with skill support
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'fill_blank', 'short_answer')),
  variant INTEGER NOT NULL CHECK (variant IN (1, 2, 3)),
  options JSONB, -- For MCQ options: ["option1", "option2", "option3", "option4"]
  correct_answer TEXT NOT NULL, -- For MCQ: index or text, for others: the correct text
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
CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_questions_variant ON questions(variant);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_skill_variant ON questions(skill_id, variant);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_email ON quiz_attempts(user_email);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt ON user_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);

-- Insert skills
INSERT INTO skills (name, description) VALUES
('JavaScript & ES6', '50 questions covering JavaScript fundamentals and ES6+ features'),
('React', '50 questions covering React concepts, hooks, and best practices'),
('Next.js 14', '25 questions covering Next.js 14 App Router and features'),
('TypeScript', '25 questions covering TypeScript types, interfaces, and advanced features'),
('Redux', '20 questions covering Redux state management and Redux Toolkit'),
('CSS & Tailwind', '20 questions covering CSS fundamentals and Tailwind utility classes'),
('Git & Workflow', '10 questions covering Git commands and development workflow')
ON CONFLICT (name) DO NOTHING;

-- Insert sample questions for testing (simplified version)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- JavaScript & ES6 Questions
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Which of the following is not a JavaScript data type?', 'mcq', '["Boolean", "Undefined", "Float", "Symbol"]', 'Float', 'JavaScript has Boolean, Undefined, and Symbol as data types, but not Float. Numbers are just "number" type.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What does the Array.prototype.map() method return?', 'mcq', '["A modified original array", "A new array", "An object", "Undefined"]', 'A new array', 'map() always returns a new array without modifying the original.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'The _______ keyword is used to import functions or components from another file in ES6.', 'fill_blank', '[]', 'import', 'The import keyword is used for ES6 module imports.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What is the difference between == and === in JavaScript?', 'short_answer', '[]', '== performs type coercion before comparison, === compares both value and type without coercion', '== allows type conversion, === requires exact match of type and value.', 1),

-- React Questions
((SELECT id FROM skills WHERE name = 'React'), 'What is React primarily used for?', 'mcq', '["Backend APIs", "Database management", "Building user interfaces", "Server configuration"]', 'Building user interfaces', 'React is a JavaScript library for building user interfaces.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'JSX is a syntax extension of:', 'mcq', '["HTML", "JavaScript", "XML", "CSS"]', 'JavaScript', 'JSX is a syntax extension of JavaScript that looks like HTML.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'In React, data flows in a _______ direction.', 'fill_blank', '[]', 'unidirectional', 'React follows unidirectional data flow from parent to child.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'What are controlled and uncontrolled components in React?', 'short_answer', '[]', 'Controlled components have their state managed by React, uncontrolled components manage their own state via DOM', 'Controlled components are managed by React state, uncontrolled use refs.', 1),

-- Next.js 14 Questions
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'What is the default type of component in Next.js 14 App Router?', 'mcq', '["Client component", "Server component", "Static component", "Dynamic component"]', 'Server component', 'Server components are the default in Next.js 14 App Router.', 1),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'Which folder is required for the App Router in Next.js 14?', 'mcq', '["/pages", "/routes", "/app", "/src"]', '/app', 'The app directory is required for App Router in Next.js 14.', 1),

-- TypeScript Questions
((SELECT id FROM skills WHERE name = 'TypeScript'), 'What does TypeScript add on top of JavaScript?', 'mcq', '["Runtime type checking", "Static type checking", "Faster execution", "Direct database access"]', 'Static type checking', 'TypeScript adds static type checking at compile time.', 1),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'TypeScript is developed and maintained by _______.', 'fill_blank', '[]', 'Microsoft', 'TypeScript is developed by Microsoft.', 1),

-- Redux Questions
((SELECT id FROM skills WHERE name = 'Redux'), 'In Redux, the state is:', 'mcq', '["Mutable", "Immutable", "Both mutable and immutable", "None of the above"]', 'Immutable', 'Redux state should always be immutable for predictable updates.', 1),
((SELECT id FROM skills WHERE name = 'Redux'), 'In Redux, actions must always have a ______ property.', 'fill_blank', '[]', 'type', 'Every Redux action must have a type property.', 1),

-- CSS & Tailwind Questions
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Which CSS property is used to change the stacking order of elements?', 'mcq', '["position", "display", "z-index", "float"]', 'z-index', 'z-index controls the stacking order of positioned elements.', 1),
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'In CSS Grid, the property used to define rows is ______.', 'fill_blank', '[]', 'grid-template-rows', 'grid-template-rows defines the size of grid rows.', 1),

-- Git & Workflow Questions
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'Which command is used to create a new branch in Git?', 'mcq', '["git checkout -b branch-name", "git branch checkout branch-name", "git create branch branch-name", "git switch branch branch-name"]', 'git checkout -b branch-name', 'git checkout -b creates and switches to a new branch.', 1),
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'The command git ______ is used to upload commits to a remote repository.', 'fill_blank', '[]', 'push', 'git push uploads local commits to remote repository.', 1);

-- Add variant 2 and 3 questions (similar structure)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- Variant 2 samples
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Which keyword is used to declare a block-scoped variable?', 'mcq', '["var", "let", "const", "Both b & c"]', 'Both b & c', 'Both let and const create block-scoped variables, unlike var which is function-scoped.', 2),
((SELECT id FROM skills WHERE name = 'React'), 'Which of the following is used to manage state in functional components?', 'mcq', '["useEffect", "useState", "useMemo", "useCallback"]', 'useState', 'useState hook is used to manage state in functional components.', 2),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'How do you mark a component as a client component in Next.js 14?', 'mcq', '["export const client = true;", "use client directive at the top", "Adding client: true in package.json", "Wrapping it in <ClientOnly>"]', 'use client directive at the top', 'Use "use client" directive at the top of the file.', 2),

-- Variant 3 samples
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What is the output of: console.log(typeof NaN);', 'mcq', '["undefined", "NaN", "number", "object"]', 'number', 'NaN (Not a Number) is actually of type "number" in JavaScript.', 3),
((SELECT id FROM skills WHERE name = 'React'), 'Which lifecycle method is called after the component mounts in a class component?', 'mcq', '["componentDidMount", "componentWillMount", "componentDidUpdate", "componentWillUnmount"]', 'componentDidMount', 'componentDidMount is called after the component is mounted to the DOM.', 3),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'Which keyword is used to define a custom type in TypeScript?', 'mcq', '["type", "typedef", "struct", "alias"]', 'type', 'The type keyword is used to create type aliases in TypeScript.', 3);
