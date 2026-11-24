# DOLCE — Website starter

This is the initial project scaffold based on the requirements discussed so far. It is a starting point, not a completed production website.

## Brand direction
- Name: DOLCE
- Positioning: Italian-inspired dessert and café brand in India
- Suggested tagline: “A Little Taste of Italy”
- Visual direction: cream, deep burgundy, muted olive and antique gold; elegant serif-led typography
- Signature product: Tiramisu
- Menu starts empty. Admin will add categories and food items.

## Planned public pages
- `/` — Home
- `/about` — About Us
- `/menu` — Menu
- `/reviews` — Reviews & Ratings
- `/contact` — Contact Us

## Planned admin portal
- `/dolceadmin` — Admin entry point (currently a placeholder only)
- One common admin account
- Admin can create, edit, deactivate and delete categories (with safe deletion rules)
- Admin can add, view, edit, make unavailable and delete menu items
- Admin can manage multiple serving options and prices per food item
- Admin can curate customer reviews before they appear publicly

**Security note:** the admin route is not protected yet. Do not deploy this placeholder as an operational admin portal. Authentication, server-side authorization, password hashing and session handling must be implemented before enabling admin mutations.

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

Every endpoint uses JSON. Public reads/submissions do not need a token. Admin endpoints require `Authorization: Bearer <ADMIN_API_TOKEN>`; set a long random `ADMIN_API_TOKEN` in `.env` before using them. The admin web page itself is still a placeholder and does not provide a login UI.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | List active categories |
| POST | `/api/categories` | Admin | Create category (`name`, optional `slug`, `description`, `sortOrder`, `isActive`) |
| PATCH, DELETE | `/api/categories/:id` | Admin | Update or delete category; deletion is rejected while menu items reference it |
| GET | `/api/menu` | Public | List available items with category and serving options |
| POST | `/api/menu` | Admin | Create item (`name`, `description`, `categoryId`; optional `temperature`, `spiceIndex`, `imageUrl`, `imagePublicId`, `sortOrder`, `isAvailable`, `servingOptions: [{label, price}]`) |
| PATCH, DELETE | `/api/menu/:id` | Admin | Update/delete item; send `servingOptions` to replace the options list |
| POST | `/api/contact` | Public | Submit inquiry (`name`, valid `email`, `message`, optional `phone`) |
| GET | `/api/contact` | Admin | List inquiries, newest first |
| GET | `/api/reviews` | Public | List approved reviews |
| POST | `/api/reviews` | Public | Submit review (`name`, `text`, `rating` from 1 to 5); new reviews await approval |
| GET | `/api/admin/reviews` | Admin | List all reviews |
| PATCH, DELETE | `/api/admin/reviews/:id` | Admin | Set `{ "isApproved": true|false }` or delete review |

## Database setup

1. Copy `.env.example` to `.env`, then set `DATABASE_URL` to a reachable PostgreSQL database and replace `ADMIN_API_TOKEN` with a long random secret.
2. Run `npm install` and `npm run db:generate`.
3. Apply the checked-in schema migration with `npm run db:migrate` during development, or `npm run db:deploy` in a deployment environment.
4. Start the app with `npm run dev`.

This scaffold does not include admin login/session UI, Cloudinary upload, rate limiting, or the Google Sheets import. Protect the token as a server secret; do not place it in browser code or commit `.env`.
