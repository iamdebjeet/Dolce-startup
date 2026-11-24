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

## Reviews
Planned workflow: Google Forms -> Google Sheets -> backend import/sync -> admin approval -> public reviews page. These are DOLCE testimonials; they are not automatically Google Business Profile reviews.

## Technology plan
- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Next.js Route Handlers for APIs
- Cloudinary for image storage
- Vercel deployment considered for later

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

## Deploying (Vercel + Neon Postgres)

1. **Database:** create a free Postgres database at [neon.tech](https://neon.tech). Copy two connection strings from its dashboard: the **pooled** one (host contains `-pooler`) and the **direct** one.
2. **Push the code** to GitHub (`.env` is git-ignored and never pushed).
3. **Vercel:** at [vercel.com/new](https://vercel.com/new), import the GitHub repo (framework: Next.js; leave build settings as default — Vercel runs the `vercel-build` script, which applies database migrations, then builds).
4. **Environment variables** (Vercel → Project → Settings → Environment Variables), then redeploy:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** connection string |
   | `DIRECT_URL` | Neon **direct** connection string (used for migrations) |
   | `ADMIN_EMAIL` | the admin login email |
   | `ADMIN_PASSWORD_HASH` | output of `npm run admin:hash -- "a-strong-password"` |
   | `ADMIN_SESSION_SECRET` | 32+ random characters, e.g. `openssl rand -base64 48` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `8338027212` |
   | `ADMIN_API_TOKEN` | optional, for scripted admin access |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | optional, enables image upload |

5. Open `https://<your-project>.vercel.app/dolceadmin`, sign in, and add categories and menu items.

Use a different password and session secret in production than in local development.
