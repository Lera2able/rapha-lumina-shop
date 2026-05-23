# Rapha Lumina

*Wear Your Purpose* — South African spiritual wellness and educator apparel.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments:** Paystack (ZAR)
- **Email:** Resend (transactional)
- **Routing:** React Router v7
- **Hosting:** Cloudflare Pages (frontend), Supabase (backend)

## Getting started locally

### 1. Install dependencies

```bash
pnpm install
```

(Or `npm install` if you prefer.)

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the Supabase anon key and Paystack public key. **Never commit the `.env` file.** Get the Supabase anon key from:

> Supabase Dashboard → Project Settings → API → "anon public"

### 3. Run the dev server

```bash
pnpm dev
```

Open <http://localhost:5173>.

## Deploying to Cloudflare Pages

1. Push this repository to GitHub.
2. Log into the [Cloudflare dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create application → Pages → Connect to Git.
3. Select this repository.
4. Configure the build:
   - **Framework preset:** Vite
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
5. Add environment variables under "Settings → Environment variables → Production":
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYSTACK_PUBLIC_KEY`
6. Save and deploy.

Every push to `main` will auto-deploy. Preview deployments are created for every pull request.

## Custom domain

In Cloudflare Pages → your project → Custom domains → add `raphalumina.com` and `www.raphalumina.com`. Update DNS to point to Cloudflare.

## Project structure

```
src/
  components/      Shared React components
    ui/            shadcn/ui primitives
    admin/         Admin-only components
    layouts/       Header, footer, page shells
    product/       Product cards, gallery
  contexts/        Auth, Cart contexts
  db/              Supabase client
  hooks/           Custom React hooks
  lib/             Utility functions
    product.ts     Product data normalisation (important - read the comment)
    utils.ts       cn, formatPrice, shipping calcs
  pages/           Route components
    admin/         Admin dashboard pages
  types/           TypeScript types
public/            Static assets (favicons, images, robots.txt)
supabase/          Database migrations and edge functions
```

## A note on data normalisation

`src/lib/product.ts` exports `normaliseProduct()` and `normaliseProducts()`. **Every place that fetches products from Supabase must run the result through one of these.** Otherwise you'll get crashes on:

- Products with `null` sizes (calling `.length` on null)
- Products with `null` additional_images (calling `.map` on null)
- Price calculations that need numbers (Supabase returns numeric columns as strings)

This isn't optional. The TypeScript types assume normalisation has happened.

## Backend

The Supabase project is `vousucfboetqtppjywlg` (eu-west-1).

Edge functions deployed:

- `create_paystack_checkout` — server-side validated checkout
- `paystack_webhook` — signed webhook for payment confirmation
- `send_email` — transactional email via Resend
- `send_stock_notifications` — restock notifications
- `send-contact-email` — contact form notifications

Edge function source is in `supabase/functions/` but the deployed versions are the source of truth (they're updated via Supabase MCP). Sync from production before editing.

## License

Proprietary. © 2026 Rapha Lumina.
