# Portfolio Website (Node.js + Express)

Personal portfolio web app built with Express + EJS, styled with a retro game-inspired UI, and aligned with the lab requirements (routing, forms, middleware, AJAX, and SEO).

## Features

- Express server with EJS templating
- Dynamic routes and query filtering (`/projects?type=...`)
- AJAX contact form with server-side validation
- Protected admin route with Basic Auth middleware
- Blog listing + blog detail pages
- In-site PDF blog rendering (embedded PDF viewer)
- Resume redirect route
- SEO basics: metadata, robots.txt, and dynamic sitemap
- Request logging via Morgan
- Security headers via Helmet
- Local in-memory data flow (no SQL required)

## Tech Stack

- Node.js
- Express
- EJS
- Helmet
- Morgan
- Vanilla JS (client-side fetch/AJAX)

## Tools and Technologies Used

- Runtime: Node.js
- Backend Framework: Express.js
- Templating Engine: EJS
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Security: Helmet (HTTP security headers), Basic Auth middleware
- Logging: Morgan request logger
- Form Handling: Server-side validation + Fetch API (AJAX)
- SEO: Meta tags, Open Graph, Twitter cards, JSON-LD, `robots.txt`, dynamic `sitemap.xml`
- Assets: Static file serving for CSS, JS, and PDF documents
- Dev Tooling: Nodemon for development auto-reload

## Components Built

- Home component/page: Hero section, profile summary, featured projects, and latest blog previews
- Projects component/page: Dynamic projects listing with query-based filtering support
- Blog list component/page: All blog posts with metadata cards
- Blog detail component/page: Individual article page with embedded PDF rendering
- Resume component/route: Redirect endpoint for direct resume PDF access
- Contact component/page: Styled contact form with asynchronous submission and validation feedback
- Admin component/page: Protected route demonstrating basic authentication middleware
- API components: `/api/contact`, `/api/projects`, and `/hello` endpoints
- Shared layout components: Reusable head, header/navbar, and footer partials
- SEO components: Canonical URL handling, social meta tags, structured data, robots, sitemap

## Project Structure

- `server.js`: Express app bootstrap, middleware, and all routes
- `src/db.js`: Local project retrieval and in-memory contact message storage
- `src/data/projects.js`: Portfolio projects/publications source data
- `src/data/blogs.js`: Blog metadata and PDF links
- `src/middleware/basicAuth.js`: Basic authentication middleware for `/admin`
- `src/validation/contactValidation.js`: Contact form validation logic
- `views/`: EJS templates (`index`, `projects`, `blog`, `blog-post`, `contact`, `admin`, `not-found`)
- `public/`: Static assets (`styles.css`, `app.js`, resume PDF, blog PDF, robots.txt)

## Setup

1. Install Node.js and npm.
2. Create environment variables file.
3. Install dependencies.
4. Start the app.

```bash
cp .env.example .env
npm install
npm run dev
```

For production-style run:

```bash
npm start
```

Open the app at `http://localhost:3000`.

## Environment Variables

- `PORT`: Server port (default `3000`)
- `SITE_URL`: Canonical base URL used for SEO sitemap generation
- `ADMIN_USER`: Basic auth username for `/admin` (default `admin`)
- `ADMIN_PASS`: Basic auth password for `/admin` (default `changeme`)

## Scripts

- `npm run dev`: Start server with Nodemon
- `npm start`: Start server with Node

## Route Map

- `GET /`: Home page
- `GET /projects`: Projects page
- `GET /projects?type=Cloud`: Filter projects by type
- `GET /blog`: Blog index page
- `GET /blog/:slug`: Blog detail page (PDF embed)
- `GET /resume`: Redirects to resume PDF
- `GET /contact`: Contact page
- `POST /api/contact`: Validated AJAX contact endpoint
- `GET /api/projects`: Projects JSON endpoint
- `GET /hello?name=YourName`: Dynamic greeting endpoint
- `GET /admin`: Protected admin page (Basic Auth)
- `GET /sitemap.xml`: SEO sitemap
- `GET /robots.txt`: Robots directives

## Notes

- Contact submissions are stored in memory and reset on server restart.
- This app currently runs without SQL/PostgreSQL dependencies.

## License

MIT
