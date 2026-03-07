# Crack-CU - Chittagong University Admission Prep Platform

## Overview
Crack-CU is a mobile-responsive ed-tech platform for Chittagong University admission preparation. The tagline is "Don't Just Study, Crack It!". Brand colors: primary red (#eb202a), success green (#059669).

## Recent Changes
- Feb 2026: Initial build - full-stack app with auth, courses, mock tests, classes, resources, notices, contact, admin dashboard
- Feb 2026: Added ImageUploader component (URL + file upload via object storage) across all admin image fields
- Feb 2026: Mock test visual question editor with per-question image upload and ID assigning
- Feb 2026: Bangladesh timezone (Asia/Dhaka) for mock scheduling and display
- Feb 2026: Student dashboard shows mock test names instead of IDs in submission history
- Feb 2026: Premium student golden crown on profile avatar + golden vibe styling on dashboard
- Feb 2026: Admin mock submissions panel with table (serial, username, name, WhatsApp, subject-wise marks, total, net, pass/fail) with search and pass/fail filter
- Feb 2026: Mock test exam page with timer, grading engine, and result display
- Feb 2026: Email notifications on registration, mock submission, and contact form (via crackcu.info@gmail.com)
- Feb 2026: Fixed paid content access - backend checks + frontend premium gates on courses, classes, resources, mock tests
- Feb 2026: Added isSecondTimer field to users for 2nd timer penalty (-3 on net marks)
- Feb 2026: Admin can edit HSC/SSC year and toggle 1st/2nd timer status per user
- Feb 2026: Congratulation email sent when admin marks user as premium
- Feb 2026: Student profile edit (all fields except WhatsApp which requires admin)
- Feb 2026: Courses & classes thumbnail ratio changed to 16:9 (aspect-video)
- Mar 2026: Hero banner fixed 16:9 aspect ratio with object-contain (full image visible on all devices), title made optional, tagline always one line
- Feb 2026: Persistent timer rules - admin sets 1st/2nd timer by year, auto-applies to existing and future users via siteSettings
- Feb 2026: Pagination and "Load More" implemented for Classes page (6 items per page)
- Feb 2026: SEO optimization - dynamic page titles/meta via useSEO hook, OG/Twitter cards, JSON-LD structured data, robots.txt, sitemap.xml, image lazy loading
- Mar 2026: Mock test resume/restart - auto-save answers + remaining time every 30s; unsubmitted drafts shown on mock tests page; Resume/Start Fresh prompt on re-entering exam; Re-exam button on result page; multiple attempts all saved; dashboard groups by mock test with multi-attempt preview dialog (1st, 2nd labels, latest first)
- Mar 2026: Course Content System - each course is a container for its own classes, resources, and mock tests. courseId column added to classes, resources, mockTests. Course detail page at /courses/:id with tabbed content sections. Admin can assign content to courses. Standalone content (no courseId) still appears on general pages. Enrolled students access course content, non-enrolled see locked state.
- Feb 2026: Full migration to Supabase - database (SUPABASE_DATABASE_URL) and file storage (Supabase Storage bucket)
- Database schema: 11 tables via Drizzle ORM + PostgreSQL (Supabase)
- File storage: Supabase Storage (configurable bucket via SUPABASE_BUCKET env var)
- Session-based auth with bcrypt password hashing

## Architecture
- **Frontend**: React + Vite, wouter routing, TanStack Query v5, shadcn/ui, Tailwind CSS, framer-motion
- **Backend**: Express.js, Drizzle ORM, PostgreSQL, express-session with connect-pg-simple
- **Auth**: Custom auth, username auto-generated: [HSC Group Letter][HSC Year Last 2 Digits][HSC Roll]
- **Roles**: student, mentor, moderator, admin
- **Email**: Nodemailer with Gmail SMTP (crackcu.info@gmail.com)
- **Database**: Supabase PostgreSQL (via SUPABASE_DATABASE_URL, falls back to DATABASE_URL)
- **File Storage**: Supabase Storage (bucket configurable via SUPABASE_BUCKET, defaults to "Uploads")

## Key Files
- `shared/schema.ts` - All data models, insert schemas, types
- `server/routes.ts` - All API routes (public, auth, admin, mock submission)
- `server/storage.ts` - DatabaseStorage class with all CRUD methods
- `server/auth.ts` - Session setup with pg-simple store
- `client/src/App.tsx` - Main app with lazy-loaded routes
- `client/src/hooks/use-auth.tsx` - Auth context/provider
- `client/src/components/header.tsx` - Responsive header with nav
- `client/src/components/footer.tsx` - Footer with social links
- `client/src/components/image-uploader.tsx` - Reusable image uploader (URL + file upload)
- `client/src/pages/mock-exam.tsx` - Mock test exam page with timer and grading
- `client/src/pages/course-detail.tsx` - Course detail page with tabbed content sections

## Pages
- Home (hero carousel, 5 content sections)
- Courses (/courses) - list page with enrollment buttons
- Course Detail (/courses/:id) - course info + tabbed content (classes, resources, mocks) with enrollment gating
- Mock Tests, Classes, Resources, Notices (list pages with filters, only shows standalone content)
- Mock Exam (/mock-tests/:id) - Full exam interface with timer, navigation, submission
- Contact (form + team profiles)
- Auth (login/register with HSC/SSC info)
- Dashboard (student profile, submissions, enrollments)
- Admin (tabbed panel: users, courses, mock tests, classes, resources, notices, banners, team)

## Course Content System
- Classes, Resources, and MockTests have an optional `courseId` column
- All content (with or without courseId) appears on general Classes/Resources/Mock Tests pages
- Content with `courseId` shows a blue "Course" badge; access is gated — only enrolled students can use it, non-enrolled see "Enroll to Access" linking to the course
- Content without `courseId` (null) is standalone with normal access rules (free/signin/paid)
- Admin can assign content to a course via a dropdown when creating/editing
- Course detail page (/courses/:id) shows tabbed sections for classes, resources, and mock tests
- Enrolled students can access course content; non-enrolled see locked state with "Enroll to Access"

## User Preferences
- Mobile-first design priority
- Bangladesh education context (boards, HSC/SSC groups)
- All times displayed in Bangladesh Standard Time (BST, UTC+6)
- SMTP: crackcu.info@gmail.com / app password stored in env vars
- Mock test marking: EngP(+2/-0.5), EngO(+1/-0.25), English pass=13 on EngP+EngO total, AS(+2/-0.5,pass10), PS(+2/-0.5,pass10), overall pass 40, -3 penalty for second-timers
- All image fields support both URL input and file upload

## Database Tables
users, heroBanners, courses, mockTests, mockSubmissions, classes, resources, notices, teamMembers, enrollments, siteSettings

## Mock Test Grading Rules
- EngP: +2 correct, -0.5 wrong
- EngO: +1 correct, -0.25 wrong
- English pass mark: 13 (applied to EngP+EngO combined total, NOT individually)
- AS: +2 correct, -0.5 wrong, pass mark 10
- PS: +2 correct, -0.5 wrong, pass mark 10
- Overall pass mark: 40 (net marks)
- 2nd timer penalty: -3 from total
- Unanswered questions: no marks deducted
