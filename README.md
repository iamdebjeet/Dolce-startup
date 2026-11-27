# DOLCE — Website starter

This is the initial project scaffold based on the requirements discussed so far. It is a starting point, not a completed production website.

## Brand direction
- Name: DOLCE
- Positioning: Italian-inspired dessert and café brand in India
- Suggested tagline: “A Little Taste of Italy”
- Visual direction: cream, deep burgundy, muted olive and antique gold; elegant serif-led typography
- Signature product: Tiramisu
- Menu starts empty. Admin will add categories and food items.

## Public site
`/` is a single page: Hero, Our Story, Motive/Mission/Vision, Tiramisu Trio, **Menu**, Italy meets India, How to Order, Café, Gallery, Reviews, FAQ, Contact. `/about`, `/menu`, `/reviews` and `/contact` redirect to their sections.

- Page copy, signature items, sample reviews and FAQ live in `src/content/home.ts`.
- **Menu & WhatsApp ordering:** the Menu section shows the categories and items managed in `/dolceadmin` (live, per request). Customers add serving options to a basket (kept in their browser), add an optional name/note, and tap **Send order on WhatsApp**. That opens WhatsApp with the full order pre-written to DOLCE’s number; the customer taps Send. (Websites can’t send WhatsApp messages on a customer’s behalf.)
- **WhatsApp number:** `NEXT_PUBLIC_WHATSAPP_NUMBER`, defaulting to `8338027212` in `src/lib/site.ts`. 10-digit numbers get `+91` added.

## Admin portal
- `/dolceadmin` — sign in with the single admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`)
- Create, edit, deactivate and delete categories (deletion is blocked while items use the category)
- Add, edit, mark unavailable and delete menu items, with image upload to Cloudinary or a pasted URL
- Manage multiple serving options and prices per item; individual options can be marked unavailable
- Approve, hide or delete customer reviews before they appear publicly
- View contact inquiries and mark them new / read / resolved

Sessions are HMAC-signed, `HttpOnly`, `SameSite=Strict` cookies that expire after 12 hours. Passwords are stored only as scrypt hashes.

## Menu data model
- `Category`: admin-managed categories such as Desserts, Soups, Starters and Beverages.
- `MenuItem`: food name, description, category, temperature, spice index (0–3), image URL, availability and display order.
- `ServingOption`: multiple labels and prices per item, e.g. Half ₹80 / Full ₹120 or 1 Pc / 2 Pcs.

Temperature enum: `HOT`, `NORMAL`, `CHILLED`.

Image storage is planned for Cloudinary. The database stores the image URL and Cloudinary public ID.

## Reviews (Google Form → website)
Responses to the DOLCE Google Form sync to the site automatically via an Apps Script attached to the form (`scripts/google-form-sync.gs`), which posts them to `POST /api/reviews/import` (auth: `Bearer FORM_WEBHOOK_SECRET`).

- **Average rating** (hero + Reviews section) is computed from **every** response's 1–5 rating.
- **Featured reviews** are chosen in `/dolceadmin → Reviews → Feature`. Only responses whose customer answered "Yes" to *"May we feature your feedback…?"* and wrote a review can be featured; "No, keep it private" responses count toward the average but their text is never shown (enforced server-side). If a customer later changes to private, their review is unfeatured on the next sync.
- **Privacy:** the script sends only name, product, rating, review and the permission answer — never age, gender or the "recommend" score. The site stores the first name only ("A DOLCE customer" when anonymous).

**Setup (once):** set `FORM_WEBHOOK_SECRET` in Netlify (24+ random characters) and deploy. Then open the form → ⋮ → **Apps Script**, paste `scripts/google-form-sync.gs`, add Script Properties `SITE_URL` (e.g. `https://dolcecafe.netlify.app`) and `SECRET` (same value as `FORM_WEBHOOK_SECRET`), and run `setup` once. It imports existing responses and turns on automatic sync. Re-running is safe; responses are never duplicated.

These are DOLCE testimonials; they are not Google Business Profile reviews.

## Technology plan
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Next.js Route Handlers for APIs
- Cloudinary for image storage
- Netlify (site + API) and Neon (PostgreSQL) for hosting, both on free plans

## Getting started
1. Install Node.js 20.19.6 or a compatible supported version.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```
5. Create the first database migration:
   ```bash
   npm run db:migrate -- --name init
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## API

Every endpoint uses JSON (except image upload, which is multipart). Public reads and submissions need no auth. Admin endpoints accept **either** the session cookie set by `/api/admin/login` (used by the admin portal) **or** `Authorization: Bearer <ADMIN_API_TOKEN>` (for scripts). Errors are returned as `{ "error": "message" }`. Prices are returned as numbers.

Public form submissions are rate limited per IP: contact 5 per 10 min, reviews 3 per 10 min, login 5 per 15 min. The limiter is in-memory and per server instance.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | List active categories |
| POST | `/api/categories` | Admin | Create category (`name`, optional `slug`, `description`, `sortOrder`, `isActive`) |
| PATCH, DELETE | `/api/categories/:id` | Admin | Update or delete category; deletion is rejected while menu items reference it |
| GET | `/api/menu` | Public | List available items with category and available serving options |
| GET | `/api/menu/:id` | Public | One available item |
| POST | `/api/menu` | Admin | Create item (`name`, `description`, `categoryId`; optional `temperature`, `spiceIndex`, `imageUrl`, `imagePublicId`, `sortOrder`, `isAvailable`, `servingOptions: [{label, price, isAvailable?}]`) |
| PATCH, DELETE | `/api/menu/:id` | Admin | Update/delete item; send `servingOptions` to replace the options list. Replaced or deleted Cloudinary images are removed. |
| POST | `/api/contact` | Public | Submit inquiry (`name`, valid `email`, `message`, optional `phone`) |
| GET | `/api/reviews` | Public | List approved reviews |
| POST | `/api/reviews` | Public | Submit review (`name`, `text`, `rating` from 1 to 5); new reviews await approval |
| POST | `/api/admin/login` | Public | `{ email, password }` → sets the session cookie |
| POST | `/api/admin/logout` | Public | Clears the session cookie |
| GET | `/api/admin/session` | Public | `{ authenticated: boolean }` |
| GET | `/api/admin/categories` | Admin | All categories (including inactive) with `itemCount` |
| GET | `/api/admin/menu` | Admin | All items, including unavailable items and options |
| POST | `/api/admin/upload` | Admin | Multipart `file` (JPEG/PNG/WebP/AVIF, ≤ 5 MB) → `{ imageUrl, imagePublicId }` |
| GET | `/api/admin/reviews` | Admin | List all reviews |
| PATCH, DELETE | `/api/admin/reviews/:id` | Admin | Set `{ "isApproved": true|false }` or delete review |
| GET | `/api/admin/inquiries` | Admin | List inquiries, newest first; optional `?status=NEW|READ|RESOLVED` (`GET /api/contact` is an older alias) |
| PATCH, DELETE | `/api/admin/inquiries/:id` | Admin | Set `{ "status": "NEW"|"READ"|"RESOLVED" }` or delete |

## Database setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a reachable PostgreSQL database. For a quick local one:
   `docker run -d --name dolce-pg -e POSTGRES_PASSWORD=dolce -e POSTGRES_DB=dolce -p 5432:5432 postgres:16-alpine`
2. Set up the admin login in `.env`:
   - `ADMIN_EMAIL`: the admin's email
   - `ADMIN_PASSWORD_HASH`: the output of `npm run admin:hash -- "your-password"`
   - `ADMIN_SESSION_SECRET`: 32+ random characters (`openssl rand -base64 48`)
   - optionally `ADMIN_API_TOKEN` for scripted access, and the `CLOUDINARY_*` keys for image upload
3. Run `npm install` and `npm run db:generate`.
4. Apply the checked-in schema migration with `npm run db:migrate` during development, or `npm run db:deploy` in a deployment environment.
5. Start the app with `npm run dev`, then sign in at http://localhost:3000/dolceadmin.

Not yet included: the Google Sheets review import. Keep every value in `.env` server-side, and never commit `.env`.

## Deploying (Netlify + Neon Postgres, both free)

The website and the API are one Next.js app, so one Netlify site serves both. The database is Neon.

1. **Database (Neon):** create a project at [neon.tech](https://neon.tech) in **AWS US East 2 (Ohio)**, the same region as Netlify's free-plan functions. From **Connect**, copy two connection strings: pooling **on** (host contains `-pooler`) and pooling **off**.
2. **Site (Netlify):** at [app.netlify.com](https://app.netlify.com) → **Add new project → Import an existing project → GitHub**, pick this repo. Build settings come from `netlify.toml` (build: `npm run build:deploy`, which applies migrations; publish: `.next`; Node 22).
3. **Environment variables** (Project configuration → Environment variables), then deploy:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon connection string, pooling **on** |
   | `DIRECT_URL` | Neon connection string, pooling **off** (used for migrations) |
   | `ADMIN_EMAIL` | the admin login email |
   | `ADMIN_PASSWORD_HASH` | output of `npm run admin:hash -- "a-strong-password"` |
   | `ADMIN_SESSION_SECRET` | 32+ random characters, e.g. `openssl rand -base64 48` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `8338027212` |
   | `FORM_WEBHOOK_SECRET` | 24+ random characters; same value as `SECRET` in the Google Form Apps Script |
   | `ADMIN_API_TOKEN` | optional, for scripted admin access |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | optional, enables image upload |

4. Open `https://<your-site>.netlify.app/dolceadmin`, sign in, and add categories and menu items.

**Free-plan budget:** 300 credits/month. A production deploy costs 15 credits, so batch your changes (roughly 15 deploys a month leaves plenty for traffic). Traffic is cheap: 10,000 requests ≈ 2 credits, 1 GB bandwidth = 20 credits. If credits run out the site pauses until the next monthly cycle; you're never charged on the Free plan.

Use a different password and session secret in production than in local development.
