A SmartLMS system built by AI for the new modern age of AI for Learning 

Near Zero Hosting Cost with modern content delivery
<img width="1536" height="657" alt="image" src="https://github.com/user-attachments/assets/5fe93ba2-8e73-4d31-a7f1-f80a1dd00409" />

# SmartLMS

A lightweight, mobile-first Learning Management System built with Next.js, Supabase (PostgreSQL + Row Level Security) and Azure Blob Storage for video delivery. Installable as a Progressive Web App.

## Features

- **Role-based portals**
  - **Admin**: manage courses, user roles and enrollments
  - **Teacher**: create and edit courses, upload videos, manage enrollments
  - **Student**: browse and enroll in courses, stream lessons
- **Supabase** authentication and PostgreSQL with Row Level Security
- **Azure Blob Storage** for course videos, authenticated with the storage account connection string / access key
- **Local demo mode**: instant demo personas with data kept in browser `localStorage` when Supabase isn't configured
- **PWA**: installable, offline fallback page, mobile bottom navigation, responsive on all pages
- Light and dark themes (follows system preference)

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase · `@azure/storage-blob` · lucide-react

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` with the variables below, then open http://localhost:3000.

### Database

Run [`supabase/schema.sql`](supabase/schema.sql) and then (optionally) [`supabase/seed.sql`](supabase/seed.sql) in the Supabase SQL editor.

### Environment variables

| Variable | Exposure | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase service role key (server only) |
| `Azure_StorageAccount_Name` | Server | Storage account name |
| `Azure_StorageAccount_Container_Name` | Server | Blob container for course videos |
| `Azure_StorageAccount_ConnectionString` | **Secret** | Storage account connection string (contains the access key) |

Never commit `.env.local`; it is gitignored.

### Azure Blob Storage

Uploads go through `POST /api/upload`, which uses the connection string and account key (Shared Key auth, no SAS). Failed uploads return an error instead of reporting success.

- Set the container's public access level to **Container** (or **Blob**) so uploaded video URLs play in the browser.
- Add your site's origin under the storage account's **Resource sharing (CORS)** settings (GET, HEAD).

## Progressive Web App

Install it from your browser's "Install app" / "Add to Home Screen" option. The service worker is only registered in production builds:

```bash
npm run build && npm start
```

## Deploying to Vercel

1. Import the GitHub repository at https://vercel.com/new (framework: Next.js).
2. Add the environment variables above (mark the secrets as *Sensitive*) for Production, Preview and Development.
3. Deploy. Every push to `main` redeploys automatically; changing environment variables requires a manual redeploy.
4. In Supabase → Authentication → URL Configuration, set the Site URL to your Vercel domain and add it to Redirect URLs.

> Vercel limits serverless request bodies to about 4.5 MB, so large videos can't be uploaded through `/api/upload` there.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint the project |
