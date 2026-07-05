# Crack-CU

Crack-CU is a full-stack admission prep platform for the Entrance Exam at Chittagong University. It gives students video classes, mock tests, study resources, and notices in one place.

## Tech Stack

- Node.js and Express for the server
- PostgreSQL with Drizzle ORM for the database
- React with Vite for the client
- TypeScript across the whole stack
- Session-based authentication with a PostgreSQL session store
- Supabase for file storage

## Features

- Phone number login and signup
- Video classes organized by subject and class number
- Mock tests with instant scoring and full answer review
- Admin panel to manage courses, classes, mock tests, notices, and users
- Admin can view any student's mock test submission, question by question
- Admin can view every course a student enrolled in
- Rich text editor for course and class descriptions
- SEO setup with sitemap, robots.txt, and IndexNow support for Bing

## Project Structure

```
client/       React frontend
server/       Express backend and API routes
shared/       Shared TypeScript types and database schema
script/       Build scripts
```

## License

MIT
