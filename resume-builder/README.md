# ResumeAI — Career Intelligence Platform

An AI-powered resume builder that synthesizes all your career materials into a single ATS-optimized resume, and generates tailored cover letters and responses for any job opportunity.

## Features

- **Multi-source ingestion** — Upload PDFs, DOCX, TXT files (resumes, recommendation letters, work samples) and add LinkedIn/portfolio URLs
- **AI document analysis** — GPT-4o extracts and consolidates every experience, skill, and achievement
- **ATS-optimized resume** — Generates a scored, keyword-rich resume with ATS feedback
- **Tailored cover letters** — Paste a job description or email and get a personalized cover letter in seconds
- **Email responses** — Generate well-crafted professional email responses
- **Application tracker** — Track status of all your job applications

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: Tailwind CSS v4 + custom shadcn-style components
- **Auth & Database**: Supabase (Auth, PostgreSQL, Storage)
- **AI**: OpenAI GPT-4o via `openai` SDK
- **Document Parsing**: pdf-parse, mammoth
- **URL Scraping**: cheerio

## Setup

### 1. Clone and install

```bash
cd resume-builder
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase-schema.sql` in the Supabase SQL editor
3. Copy your project URL, anon key, and service role key

### 3. Set up OpenAI

1. Get an API key from [platform.openai.com](https://platform.openai.com)

### 4. Configure environment

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign up** for a free account
2. Go to **Profile** and upload your career documents (resumes, recommendation letters, work samples) and add LinkedIn/portfolio URLs
3. Click **Analyze all documents** to let AI extract your career information
4. Go to **Resume Builder** and click **Generate resume** — you'll get an ATS-optimized resume with a score and improvement tips
5. Go to **Applications**, create a new entry by pasting a job description or email, then click **Generate cover letter** or **Generate response**

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Auth
│   ├── signup/
│   ├── dashboard/            # Main dashboard
│   ├── profile/              # Document upload & management
│   ├── resume/               # ATS resume generation
│   ├── applications/         # Cover letters & responses
│   └── api/
│       ├── upload/           # File upload to Supabase Storage
│       ├── parse-document/   # PDF/DOCX text extraction
│       ├── scrape-url/       # URL content extraction
│       ├── generate-resume/  # GPT-4o resume synthesis
│       └── generate-cover-letter/  # Cover letter & email generation
├── components/
│   ├── ui/                   # Button, Card, Input, etc.
│   ├── upload/               # Drag-and-drop uploader
│   ├── resume/               # Resume preview
│   └── layout/               # Sidebar, Header
├── lib/
│   ├── supabase/             # Client, server, middleware
│   ├── openai/               # Prompts
│   └── parsers/              # Document parsing utilities
└── types/                    # TypeScript types
```

## Security

- Row Level Security (RLS) enforced on all Supabase tables — users can only access their own data
- Files uploaded to private user folders in Supabase Storage
- No PHI/PII sent to external services beyond what the user explicitly uploads
- All API keys stored in environment variables, never exposed to the client
