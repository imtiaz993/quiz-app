-- Add skill column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS skill VARCHAR(100) NOT NULL DEFAULT 'General';

-- Create index for skill-based queries
CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions(skill);
CREATE INDEX IF NOT EXISTS idx_questions_skill_variant ON questions(skill, variant);

-- Update existing questions with skills
UPDATE questions SET skill = 'Geography' WHERE question_text LIKE '%capital%' OR question_text LIKE '%Ocean%';
UPDATE questions SET skill = 'Science' WHERE question_text LIKE '%chemical%' OR question_text LIKE '%photosynthesis%' OR question_text LIKE '%planet%' OR question_text LIKE '%boils%' OR question_text LIKE '%biodiversity%' OR question_text LIKE '%water cycle%';
UPDATE questions SET skill = 'Literature' WHERE question_text LIKE '%wrote%' OR question_text LIKE '%novel%';

-- Sample React questions for demonstration
INSERT INTO questions (question_text, question_type, variant, skill, options, correct_answer, explanation) VALUES
-- React Variant 1
('What is JSX in React?', 'mcq', 1, 'React', '{"a": "JavaScript XML", "b": "Java Syntax Extension", "c": "JSON XML", "d": "JavaScript Extension"}', 'a', 'JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript.'),
('React components must return a _____ parent element.', 'fill_blank', 1, 'React', NULL, 'single', 'React components must return a single parent element or React Fragment.'),
('Explain the concept of state in React.', 'short_answer', 1, 'React', NULL, 'State is a built-in object that stores property values that belong to a component and can change over time.', 'State allows components to be dynamic and interactive.'),

-- React Variant 2  
('Which hook is used for side effects in React?', 'mcq', 2, 'React', '{"a": "useState", "b": "useEffect", "c": "useContext", "d": "useReducer"}', 'b', 'useEffect is used to perform side effects in functional components.'),
('Props are _____ in React components.', 'fill_blank', 2, 'React', NULL, 'read-only', 'Props are read-only and help you pass data from parent to child components.'),
('What is the virtual DOM in React?', 'short_answer', 2, 'React', NULL, 'Virtual DOM is a JavaScript representation of the real DOM that React uses to optimize rendering performance.', 'Virtual DOM enables efficient updates by comparing changes before applying them to the real DOM.'),

-- React Variant 3
('What is the correct way to update state in React?', 'mcq', 3, 'React', '{"a": "this.state = newState", "b": "setState(newState)", "c": "updateState(newState)", "d": "changeState(newState)"}', 'b', 'setState() is the correct method to update state in class components.'),
('React components can be defined as _____ or classes.', 'fill_blank', 3, 'React', NULL, 'functions', 'React components can be defined as functions (functional components) or classes (class components).'),
('Describe the component lifecycle in React.', 'short_answer', 3, 'React', NULL, 'Component lifecycle includes mounting, updating, and unmounting phases with methods like componentDidMount, componentDidUpdate, and componentWillUnmount.', 'Understanding lifecycle helps manage component behavior at different stages.');
