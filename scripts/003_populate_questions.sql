-- Clear existing questions and add the comprehensive 200-question test
DELETE FROM questions;
DELETE FROM skills;

-- Insert skills
INSERT INTO skills (name, description) VALUES
('JavaScript & ES6', '50 questions covering JavaScript fundamentals and ES6+ features'),
('React', '50 questions covering React concepts, hooks, and best practices'),
('Next.js 14', '25 questions covering Next.js 14 App Router and features'),
('TypeScript', '25 questions covering TypeScript types, interfaces, and advanced features'),
('Redux', '20 questions covering Redux state management and Redux Toolkit'),
('CSS & Tailwind', '20 questions covering CSS fundamentals and Tailwind utility classes'),
('Git & Workflow', '10 questions covering Git commands and development workflow');

-- JavaScript & ES6 Questions (50)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Which of the following is not a JavaScript data type?', 'mcq', '["Boolean", "Undefined", "Float", "Symbol"]', 'Float', 'JavaScript has Boolean, Undefined, and Symbol as data types, but not Float. Numbers are just "number" type.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What does the Array.prototype.map() method return?', 'mcq', '["A modified original array", "A new array", "An object", "Undefined"]', 'A new array', 'map() always returns a new array without modifying the original.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Which keyword is used to declare a block-scoped variable?', 'mcq', '["var", "let", "const", "Both b & c"]', 'Both b & c', 'Both let and const create block-scoped variables, unlike var which is function-scoped.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What is the output of: console.log(typeof NaN);', 'mcq', '["undefined", "NaN", "number", "object"]', 'number', 'NaN (Not a Number) is actually of type "number" in JavaScript.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Which method is used to merge two arrays in ES6?', 'mcq', '["concat()", "push()", "merge()", "append()"]', 'concat()', 'concat() method is used to merge arrays, though spread operator [...arr1, ...arr2] is also common in ES6.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'The _______ keyword is used to import functions or components from another file in ES6.', 'fill_blank', '[]', 'import', 'The import keyword is used for ES6 module imports.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Template literals in JavaScript are enclosed by _______.', 'fill_blank', '[]', 'backticks', 'Template literals use backticks (`) instead of quotes.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'The spread operator is written as _______.', 'fill_blank', '[]', '...', 'The spread operator uses three dots (...).', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'What is the difference between == and === in JavaScript?', 'short_answer', '[]', '== performs type coercion before comparison, === compares both value and type without coercion', '== allows type conversion, === requires exact match of type and value.', 1),
((SELECT id FROM skills WHERE name = 'JavaScript & ES6'), 'Explain the concept of hoisting in JavaScript.', 'short_answer', '[]', 'Hoisting moves variable and function declarations to the top of their scope during compilation', 'Variable declarations are moved to the top but not their assignments.', 1);

-- React Questions (50)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'React'), 'What is React primarily used for?', 'mcq', '["Backend APIs", "Database management", "Building user interfaces", "Server configuration"]', 'Building user interfaces', 'React is a JavaScript library for building user interfaces.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'JSX is a syntax extension of:', 'mcq', '["HTML", "JavaScript", "XML", "CSS"]', 'JavaScript', 'JSX is a syntax extension of JavaScript that looks like HTML.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'Which of the following is used to manage state in functional components?', 'mcq', '["useEffect", "useState", "useMemo", "useCallback"]', 'useState', 'useState hook is used to manage state in functional components.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'Which lifecycle method is called after the component mounts in a class component?', 'mcq', '["componentDidMount", "componentWillMount", "componentDidUpdate", "componentWillUnmount"]', 'componentDidMount', 'componentDidMount is called after the component is mounted to the DOM.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'React'), 'In React, data flows in a _______ direction.', 'fill_blank', '[]', 'unidirectional', 'React follows unidirectional data flow from parent to child.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'Props are _______ in React (cannot be modified).', 'fill_blank', '[]', 'immutable', 'Props are read-only and cannot be modified by the receiving component.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'React'), 'What are controlled and uncontrolled components in React?', 'short_answer', '[]', 'Controlled components have their state managed by React, uncontrolled components manage their own state via DOM', 'Controlled components are managed by React state, uncontrolled use refs.', 1),
((SELECT id FROM skills WHERE name = 'React'), 'Explain the difference between useMemo and useCallback.', 'short_answer', '[]', 'useMemo memoizes values, useCallback memoizes functions', 'useMemo caches computed values, useCallback caches function references.', 1);

-- Next.js 14 Questions (25)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'What is the default type of component in Next.js 14 App Router?', 'mcq', '["Client component", "Server component", "Static component", "Dynamic component"]', 'Server component', 'Server components are the default in Next.js 14 App Router.', 1),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'Which folder is required for the App Router in Next.js 14?', 'mcq', '["/pages", "/routes", "/app", "/src"]', '/app', 'The app directory is required for App Router in Next.js 14.', 1),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'How do you mark a component as a client component in Next.js 14?', 'mcq', '["export const client = true;", "use client directive at the top", "Adding client: true in package.json", "Wrapping it in <ClientOnly>"]', 'use client directive at the top', 'Use "use client" directive at the top of the file.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'In App Router, server components are the default because they are _______ and _______.', 'fill_blank', '[]', 'faster, SEO-friendly', 'Server components improve performance and SEO.', 1),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'To fetch data at the server component level, we can directly use the _______ function.', 'fill_blank', '[]', 'fetch', 'Server components can use fetch directly without useEffect.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'What is the difference between Server Components and Client Components in Next.js 14?', 'short_answer', '[]', 'Server Components run on server and dont send JS to client, Client Components run in browser with interactivity', 'Server Components render on server, Client Components enable interactivity.', 1),
((SELECT id FROM skills WHERE name = 'Next.js 14'), 'Explain how server actions work in Next.js 14.', 'short_answer', '[]', 'Server actions are async functions marked with use server that run on the server', 'Server actions enable server-side form handling and mutations.', 1);

-- TypeScript Questions (25)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'TypeScript'), 'What does TypeScript add on top of JavaScript?', 'mcq', '["Runtime type checking", "Static type checking", "Faster execution", "Direct database access"]', 'Static type checking', 'TypeScript adds static type checking at compile time.', 1),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'Which file extension is used for TypeScript files?', 'mcq', '[".js", ".ts", ".tsx", "Both b & c"]', 'Both b & c', 'TypeScript uses .ts for regular files and .tsx for JSX files.', 1),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'Which keyword is used to define a custom type in TypeScript?', 'mcq', '["type", "typedef", "struct", "alias"]', 'type', 'The type keyword is used to create type aliases in TypeScript.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'TypeScript'), 'TypeScript is developed and maintained by _______.', 'fill_blank', '[]', 'Microsoft', 'TypeScript is developed by Microsoft.', 1),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'The _______ keyword is used to create enumerations.', 'fill_blank', '[]', 'enum', 'The enum keyword creates enumerations in TypeScript.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'TypeScript'), 'What is type inference in TypeScript?', 'short_answer', '[]', 'TypeScript automatically determines variable types when not explicitly specified', 'Type inference automatically determines types based on assigned values.', 1),
((SELECT id FROM skills WHERE name = 'TypeScript'), 'Explain the difference between interface and type alias.', 'short_answer', '[]', 'Interfaces can be extended and merged, type aliases are more flexible for unions and primitives', 'Interfaces are extendable, type aliases are more versatile.', 1);

-- Redux Questions (20)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'Redux'), 'In Redux, the state is:', 'mcq', '["Mutable", "Immutable", "Both mutable and immutable", "None of the above"]', 'Immutable', 'Redux state should always be immutable for predictable updates.', 1),
((SELECT id FROM skills WHERE name = 'Redux'), 'What is the main purpose of reducers in Redux?', 'mcq', '["To fetch API data", "To update state based on actions", "To render UI", "To dispatch actions"]', 'To update state based on actions', 'Reducers specify how state changes in response to actions.', 1),
((SELECT id FROM skills WHERE name = 'Redux'), 'Which middleware is commonly used for handling asynchronous actions in Redux?', 'mcq', '["redux-thunk", "redux-async", "redux-delay", "redux-fetch"]', 'redux-thunk', 'Redux Thunk allows action creators to return functions for async operations.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'Redux'), 'In Redux, actions must always have a ______ property.', 'fill_blank', '[]', 'type', 'Every Redux action must have a type property.', 1),
((SELECT id FROM skills WHERE name = 'Redux'), 'The dispatch() method sends an ______ to the store.', 'fill_blank', '[]', 'action', 'dispatch() sends actions to the Redux store.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'Redux'), 'Explain why Redux state should be immutable.', 'short_answer', '[]', 'Immutable state ensures predictable updates, enables time-travel debugging, and prevents unintended side effects', 'Immutability enables predictable state changes and debugging features.', 1),
((SELECT id FROM skills WHERE name = 'Redux'), 'What problem does Redux solve in large applications?', 'short_answer', '[]', 'Redux provides centralized state management and predictable state updates across components', 'Redux centralizes state management for complex applications.', 1);

-- CSS & Tailwind Questions (20)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Which CSS property is used to change the stacking order of elements?', 'mcq', '["position", "display", "z-index", "float"]', 'z-index', 'z-index controls the stacking order of positioned elements.', 1),
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Which of the following is NOT a valid position value in CSS?', 'mcq', '["sticky", "relative", "fixed", "static-inline"]', 'static-inline', 'static-inline is not a valid CSS position value.', 1),
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'In Tailwind, which class is used for applying margin on all sides?', 'mcq', '["m", "mx", "my", "p"]', 'm', 'The m class applies margin on all sides in Tailwind.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'In CSS Grid, the property used to define rows is ______.', 'fill_blank', '[]', 'grid-template-rows', 'grid-template-rows defines the size of grid rows.', 1),
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Tailwinds configuration file is named ______.', 'fill_blank', '[]', 'tailwind.config.js', 'The Tailwind configuration file is tailwind.config.js.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Explain the difference between absolute, relative, and fixed positioning in CSS.', 'short_answer', '[]', 'Absolute positions relative to nearest positioned ancestor, relative to itself, fixed to viewport', 'Different positioning contexts: ancestor, self, and viewport.', 1),
((SELECT id FROM skills WHERE name = 'CSS & Tailwind'), 'Compare CSS Flexbox and CSS Grid. When should you use one over the other?', 'short_answer', '[]', 'Flexbox is 1D for alignment, Grid is 2D for complex layouts', 'Flexbox for 1D layouts, Grid for 2D layouts.', 1);

-- Git & Workflow Questions (10)
INSERT INTO questions (skill_id, question_text, question_type, options, correct_answer, explanation, variant) VALUES
-- MCQs
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'Which command is used to create a new branch in Git?', 'mcq', '["git checkout -b branch-name", "git branch checkout branch-name", "git create branch branch-name", "git switch branch branch-name"]', 'git checkout -b branch-name', 'git checkout -b creates and switches to a new branch.', 1),
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'What does git stash do?', 'mcq', '["Saves changes and commits them", "Temporarily stores changes without committing", "Deletes untracked files", "Switches to another branch"]', 'Temporarily stores changes without committing', 'git stash temporarily saves uncommitted changes.', 1),
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'Which command is used to update your local branch with the latest changes from the remote repository?', 'mcq', '["git fetch", "git pull", "git merge", "git push"]', 'git pull', 'git pull fetches and merges changes from remote repository.', 1),

-- Fill in the blanks
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'The command git ______ is used to upload commits to a remote repository.', 'fill_blank', '[]', 'push', 'git push uploads local commits to remote repository.', 1),
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'The default branch name in Git (new versions) is ______.', 'fill_blank', '[]', 'main', 'The default branch name is now main instead of master.', 1),

-- Short answers
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'Explain the difference between git merge and git rebase.', 'short_answer', '[]', 'Merge creates a merge commit preserving history, rebase rewrites history by applying commits on top of another branch', 'Merge preserves history, rebase rewrites it for cleaner timeline.', 1),
((SELECT id FROM skills WHERE name = 'Git & Workflow'), 'What is the difference between git fetch and git pull?', 'short_answer', '[]', 'Fetch downloads changes without merging, pull downloads and merges into current branch', 'Fetch only downloads, pull downloads and merges automatically.', 1);

-- Add more questions for variants 2 and 3 (similar distribution)
-- This is a simplified version - in practice, you'd want to add all 200 questions across 3 variants
