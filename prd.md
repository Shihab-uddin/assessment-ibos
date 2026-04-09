

Frontend Engineer [Project  Task]
## Project: Online Assessment Platform
Deadline: 11-04-2026, 11:59 PM
UI Design Figma Link: Figma Design

## Overview
Build a simplified Online Assessment Platform with two panels: Employer Panel and
Candidate Panel. primary goal is to demonstrate frontend development skills, component
design, state management, and handling of complex UI workflows.

## Employer Panel Features
## 1. Login Page
● jwt authentication system 
● Input fields: Email & Password
● Redirect to Dashboard on successful login
- Dashboard (Online Tests List)
● Display exams in card format
● Card information:
## ○ Exam Name
## ○ Candidates
## ○ Question Sets
## ○ Exam Slots
○ “View Candidates” button
- Create Online Test (Multi-Step Form)
## Step 1: Basic Info

## ● Fields:
## ○ Title
## ○ Total Candidates
## ○ Total Slots
## ○ Question Sets
## ○ Question Type
## ○ Start Time
## ○ End Time
## ○ Duration
## Step 2: Question Sets
● Add/Edit/Delete Questions (modal)
## ● Fields:
## ○ Question Title
## ○ Types: Checkbox, Radio, Text

## Candidate Panel Features
## 1. Login Page
● jwt authentication system 
● Input fields: Email & Password
## 2. Dashboard
● Display exams as cards
● Card info:
## ○ Duration
## ○ Questions
## ○ Negative Marking
○ “Start” button
## 3. Exam Screen
● Display questions
● Timer countdown
● Auto-submit on timeout
● Manual submit option
● Behavioral tracking: tab switch detection, fullscreen exit


## Technical Requirements
## ● Framework: Next.js, React
● State Management: Zustand
● Forms: React Hook Form
● Validation: Zod
● UI / Styling: Tailwind CSS, ShadCN/UI
● API Handling: Axios

## Code Quality & Best Practices
Candidates should demonstrate:
● Clean Code: readable, consistent, maintainable
● Custom Hooks: encapsulate reusable logic
● Reusable Components: modular and composable
● Reusable Logic: DRY principles for forms, API calls, utilities
## ● Component Re-render Optimization

