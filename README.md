# Personal Agents

Personal Agents is a full-stack web application that transforms the way you collaborate with AI. Instead of your standard browser AI chatbots, this platform lets you video call with intelligent AI agents, bringing them into your meetings as real-time assistants. Experience a new era of immersive, face-to-face interaction with AI, where humans and AI work side by side to brainstorm, solve problems, and get things done.

## Features

- **AI-Powered Meetings**: Schedule, join, and manage real-time video meetings with AI agents as participants.
- **Agent Creation**: Create, customize, and manage AI agents with unique instructions and voices to join your meetings.
- **Meeting Summaries**: Receive AI-generated summaries and transcripts after each meeting.
- **Real-Time Collaboration**: Video, chat, and AI interaction during meetings.
- **Authentication**: Secure login and user management (Google, GitHub, or anonymous access).
- **Customizable UI**: Light/dark mode, theme provider, and modular UI components.
- **Database Integration**: Uses Drizzle ORM for type-safe database access.
- **API Routes**: RESTful API endpoints for meetings, agents, and user features.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ESLint](https://eslint.org/) (linting)
- [Bun](https://bun.sh/) (optional, for fast JS runtime)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended) or Bun
- npm, yarn, pnpm, or bun (for package management)
- A database (e.g., SQLite, PostgreSQL) configured via Drizzle ORM
- API keys as required (see `.env`)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/michaeleii/personal-agents.git
   cd personal-agents
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in the required API keys and database connection strings.

4. **Run database migrations:**

   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun run dev
   ```

6. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Meetings Dashboard**: Organize and manage your meetings with AI agents from the main dashboard.
- **Join Meetings**: Start or join real-time video meetings with your selected AI agent.
- **Agent Management**: Create and configure AI agents to participate in meetings, each with custom instructions and voices.
- **AI Summaries**: After meetings, view AI-generated summaries and transcripts.
- **Authentication**: Log in to access your meetings, agents, and personalized features.

## Folder Structure

```
src/
  app/
    (auth)/           # Authentication pages and logic
    (dashboard)/      # Dashboard UI and hooks
    agents/           # Agent pages, components, and hooks
    meetings/         # Meeting pages, components, and hooks
    api/              # API routes (REST endpoints)
    globals.css       # Global styles (Tailwind CSS)
    layout.tsx        # App layout
  components/         # Reusable UI components
  db/                 # Database schema and access (Drizzle)
  hooks/              # Custom React hooks
  lib/                # Utility libraries (auth, stream, etc.)
public/               # Static assets (images, favicon, etc.)
```

## Environment Variables

Refer to the `.env.example` file for the required environment variables.
