# CRM Enrichment Tool

AI-powered CRM data enrichment with behavioral clustering, qualitative research integration, and social media insights.

## Features

- **CRM Upload**: Upload CSV/Excel files up to 100k rows
- **Behavioral Clustering**: AI-powered customer segmentation using Claude
- **Column Detection**: Automatic detection of CRM data fields
- **Interactive Refinement**: Merge, split, and refine customer clusters
- **Social Enrichment**: Integrate social media insights (ForumScout)
- **Persona Generation**: Generate detailed customer personas
- **Export**: Export to Synthetic Users Lab format

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Database**: Vercel Postgres + Drizzle ORM
- **Auth**: NextAuth.js v5 (Google OAuth)
- **Storage**: Vercel Blob
- **AI**: Groq Llama 3.1 8B (Clustering) + Claude (Advanced reasoning)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Language**: TypeScript

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
cd crm-enrichment-tool
npm install
\`\`\`

### 2. Environment Variables

Create a \`.env.local\` file with the following:

\`\`\`env
# Database (Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Auth (NextAuth)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI Models
ANTHROPIC_API_KEY=
GROQ_API_KEY=

# Social APIs (Optional)
FORUMSCOUT_API_KEY=

# Encryption (for API keys)
ENCRYPTION_KEY=your-32-character-secret-key-he
\`\`\`

### 3. Setup Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the connection strings to your \`.env.local\`

### 4. Setup Vercel Blob

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new Blob storage
3. Copy the read/write token to your \`.env.local\`

### 5. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
6. Copy Client ID and Secret to your \`.env.local\`

### 6. Get AI API Keys

**Groq API Key (for clustering - fast & cheap):**
1. Go to [Groq Console](https://console.groq.com/)
2. Create an account and generate an API key
3. Copy to \`GROQ_API_KEY\` in your \`.env.local\`

**Anthropic API Key (optional - for advanced reasoning):**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy to \`ANTHROPIC_API_KEY\` in your \`.env.local\`

### 7. Generate NextAuth Secret

\`\`\`bash
openssl rand -base64 32
\`\`\`

Copy the output to \`NEXTAUTH_SECRET\` in \`.env.local\`

### 8. Push Database Schema

\`\`\`bash
npm run db:push
\`\`\`

### 9. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Database Commands

\`\`\`bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
\`\`\`

## Project Structure

\`\`\`
crm-enrichment-tool/
├── app/
│   ├── (auth)/              # Auth pages (signin, error)
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── crm-enrichment/  # CRM enrichment features
│   └── api/                 # API routes
│       ├── auth/            # NextAuth routes
│       └── crm/             # CRM endpoints
├── components/
│   ├── auth/                # Auth components
│   ├── crm-enrichment/      # CRM-specific components
│   ├── layout/              # Layout components (Sidebar, Header)
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── db/                  # Database (Drizzle schema, client)
│   ├── crm/                 # CRM logic (parser, detector, chunker)
│   ├── claude/              # Claude AI integration
│   └── storage/             # Vercel Blob + encryption
└── types/                   # TypeScript types
\`\`\`

## Sprint 1 Status ✅

**Completed:**
- ✅ Project setup (Next.js, Drizzle, NextAuth, shadcn/ui)
- ✅ Auth flow (Google OAuth)
- ✅ Dashboard layout with sidebar
- ✅ CRM file parser (CSV/Excel)
- ✅ Column detection algorithm
- ✅ Upload API endpoint
- ✅ Clustering with Claude
- ✅ Interactive clustering interface
- ✅ Project wizard

**Next Steps (Sprint 2):**
- [ ] Qualitative research upload
- [ ] ForumScout social enrichment
- [ ] Persona generation
- [ ] Export to Synthetic Lab

## Deployment to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Deploy to production
vercel --prod

# Push database schema to production
vercel env pull .env.production.local
npm run db:push
\`\`\`

## License

Private project
