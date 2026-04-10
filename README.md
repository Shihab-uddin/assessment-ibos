# Online Assessment Platform for Akij IBOS
# Md Shihab Uddin Sourav


## Features implemented ===============================================================================
- Authentication with jwt token with backend api 
- Real database implementation with apis (storing exam, questions, attempts, users)
- Form validation
- toast notification
- Online test multi step form
- Display questions one by one
- Timer countdown
- Auto-submit on timeout 
- Behavioral tracking: tab switch detection, fullscreen exit
- Pages creations:
 - Common: login page, register page
 - Employer: dashboard, create online test, create questions, exam detail view page, exam edit page for both steps
 - Candidate: dashboard, exam screen page
=======================================================================================================



## Tech Stack =========================================================================================

This framework utilizes modern, scalable technologies to ensure high performance and developmental velocities:

- **Framework:** [Next.js 16 (App Router)] + React 19
- **Typing:** [TypeScript]
- **Styling:** [Tailwind CSS v4]
- **UI Components:** [Radix/Base-UI] + shadcn ui
- **Database / ORM:** [Prisma]
- **State Management:** [Zustand] for client-side authentication and session handling
- **Form Handling:** [React Hook Form] + [Zod] for strict schema validation
- **Authentication:** Edge-compatible JWT sign/verify logic utilizing `jose` 
- **Data Fetching:** [Axios]
========================================================================================================



## Installation Guide ==================================================================================

Follow these steps to deploy a development server locally. The environment works uniformly across **both Mac and Windows**.

### 1. Clone the repository
```bash
git clone <repository-url>
cd ibos-assessment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Environment
Create a new `.env` file in the root of the project to match database requirements.
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

### 4. Initialize Database
Push the Prisma schemas directly to your mapped database.
```bash
npx prisma db push
```

### 5. Launch Application
```bash
npm run dev
```

Visit `http://localhost:3000`.
========================================================================================================

## Additional Question's Answers =======================================================================

MCP Integration:
----------------
Yes I have user Google Stitch MCP for boosting my development process. Stitch is a AI powered UI/UX design tool similar to Figma. I can give prompt and generate a multi page design in an instance. Then I have to connect the MCP for stitch (which is open source) on my code editor and I can connect my codebase into the design files.
I work on this agentic workflow for one of my client for a coaching management app. They didn't have any design to start with. I help them with a fast design prototype using the stitch AI and approved the design in a very short period. Then I quickly shifted to mvp development using the approved design. I managed the whole process single handedly and it was possible because of the agentic workflow and mcp integration. By giving them the mvp in a very short time I managed to close the deal with my client efficiently.

AI Tools for Development:
-------------------------
I used Goolgle's Antigravity with Gemini models for planning and structuring the project. I mostly use it to generate boilerplate code, auto test cases, and for custom debugging. Besides I used postman for api testing, neon cloud database, claude chat for quick debugging help and test cases.

Offline Mode:
---------------
This will be a bit tricky as it might open up some abuseive behavior from the candidates. As I am usign Zustand in this project I can use its state. The fastest answer came into mind that I will persist the answer locally. if user goes offline I will start a grace period, I will log this event and the timer will be running. I will not freeze the  timer as user can misuse this. if the grace period ends during the offline time it will save the answers locally and sync back when the connection restores.