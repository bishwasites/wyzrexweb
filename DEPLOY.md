# Deploying to Vercel

This app needs three things beyond the code itself: a Postgres database, Vercel Blob storage
(for admin media uploads), and a handful of environment variables. Follow this in order — each
step depends on the one before it.

## 1. Environment variables

| Variable | Required | Where it comes from |
|---|---|---|
| `POSTGRES_URL` | Yes | Auto-added by Vercel when you attach a Postgres store to the project (step 3). You never type this one in. |
| `BLOB_READ_WRITE_TOKEN` | Yes, for admin uploads | Auto-added by Vercel when you attach a Blob store (step 4). Also auto-typed. |
| `ADMIN_EMAIL` | Yes | You choose it — the email the one admin account logs in with. |
| `ADMIN_PASSWORD_HASH` | Yes | Generated locally with `pnpm hash-password "your-password"` — see §5. |
| `SESSION_SECRET` | Yes | Generated locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Any long random hex string works; this one just signs the admin session JWT. |
| `RESEND_API_KEY` | No, but leads won't email without it | [resend.com/api-keys](https://resend.com/api-keys) — free tier is enough to start. Every contact-form submission is saved to the `leads` table regardless of whether this is set; without it, the app logs a warning and just skips the two emails. |
| `LEAD_TO_EMAIL` | No | The inbox that receives the "new lead" notification. |
| `LEAD_FROM_EMAIL` | No | Sender address. `WYZREX <onboarding@resend.dev>` works immediately with no domain setup, but Resend labels it "via resend.dev" and it can't be used for real production volume — verify a sending domain in the Resend dashboard (Domains → Add Domain) and switch this to an address on it once you're ready, e.g. `WYZREX <hello@yourdomain.com>`. |

## 2. Create the Vercel project

1. Push this repo to GitHub if you haven't already (see the earlier `git push` step — this doc
   assumes `bishwasites/wyzrexweb` is already on GitHub).
2. [vercel.com/new](https://vercel.com/new) → Import the `wyzrexweb` repository. Vercel
   auto-detects Next.js and `pnpm-lock.yaml` (so it builds with pnpm, not npm) — no build
   settings need changing.
3. Don't deploy yet — or let the first deploy fail/succeed without a working site. It won't be
   fully functional until the steps below are done, and every later env-var change triggers its
   own redeploy anyway.

## 3. Add Postgres

Project → **Storage** tab → **Create Database** → **Postgres**. Connect it to this project.
Vercel writes `POSTGRES_URL` (and a few related `POSTGRES_*` vars) into the project's
environment variables automatically — you don't type a connection string anywhere.

## 4. Add Blob storage

Project → **Storage** tab → **Create Database** → **Blob**. Connect it to this project the same
way. This writes `BLOB_READ_WRITE_TOKEN` automatically. Without it, everything on the site works
*except* uploading images from the admin panel (logo, favicon, service icons, etc.).

## 5. Generate `ADMIN_PASSWORD_HASH`

Run this locally (not on Vercel):

```bash
pnpm hash-password "the-real-admin-password"
```

It prints something like:

```
Add this to .env.local:

ADMIN_PASSWORD_HASH=\$2a\$12\$UxtsmxUGWd4DQKV6mqdzGOq4fo83Ojlqn3r0NqE8unQ0lH6WLlnJa
```

**Important:** that output has every `$` escaped as `\$` — that escaping is only for `.env.local`
files, which Next.js's dotenv loader expands `$...` references in. Vercel's dashboard does **not**
do that expansion, so paste the **unescaped** hash there instead: strip the backslashes and use
`$2a$12$UxtsmxUGWd4DQKV6mqdzGOq4fo83Ojlqn3r0NqE8unQ0lH6WLlnJa`. Pasting the escaped version with
literal backslashes in it will silently break login — `bcrypt.compare` will never match.

## 6. Set the remaining env vars

Project → **Settings** → **Environment Variables**. Add, for **Production** (and Preview if you
want admin/leads to work on preview deployments too):

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` (the unescaped hash from step 5)
- `SESSION_SECRET`
- `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` (optional, but do all three or none —
  the code checks for the API key before trying to send)

Then **Deploy** (or redeploy — Settings → Deployments → the latest one → Redeploy) so the build
picks up the new vars.

## 7. Run the migration against production Postgres

There is no build-time auto-migration (deliberately — a migration running unattended during a
Vercel build is one you can't watch or abort). Run it yourself, once, from your machine, against
the production database:

```bash
# Pull the real POSTGRES_URL (and everything else) Vercel just set, into a local file:
vercel link                                   # first time only, links this folder to the project
vercel env pull .env.production.local

# 1. drizzle-kit push — creates the bulk of the schema from db/schema.ts.
# drizzle.config.ts hardcodes `.env.local` for local-dev convenience, so `--config`
# alone would silently target your LOCAL database instead of production. Export
# POSTGRES_URL from the pulled file first — dotenv never overrides a variable
# that's already set, so this exported value wins over drizzle.config.ts's own
# .env.local load:
export POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.production.local | cut -d '=' -f2-)
pnpm dlx drizzle-kit push --config drizzle.config.ts

# 2. scripts/migrate.ts — reads process.env directly, so --env-file is enough here:
npx tsx --env-file=.env.production.local scripts/migrate.ts
```

*(PowerShell equivalent for the export line:*
`$env:POSTGRES_URL = (Select-String '^POSTGRES_URL=' .env.production.local).Line -replace '^POSTGRES_URL=', ''` *)*

Both are needed, in that order, on a brand-new database:

- `drizzle-kit push` reads `db/schema.ts` and creates every table the app's Drizzle queries
  expect (case studies, ad results, top content, client profiles, trusted brands, services, plus
  the CMS tables). It'll ask for confirmation on anything ambiguous — on an empty database there's
  nothing ambiguous, so it just creates everything.
- `scripts/migrate.ts` (`pnpm db:migrate` locally) is idempotent raw SQL that additionally adds
  the one thing `db:push` doesn't: the composite unique index on `page_sections(page_slug,
  section_key)` that the seed script's conflict-handling relies on. It's safe to run even if
  `db:push` already created the same tables — every statement is `IF NOT EXISTS`/guarded.

`drizzle-kit push` will prompt interactively in your terminal — that's expected, just confirm the
proposed changes.

## 8. Seed the database

Still using `.env.production.local`, in this order (the second script reads defaults the first
one writes):

```bash
npx tsx --env-file=.env.production.local db/seed.ts
npx tsx --env-file=.env.production.local db/seed-cms.ts
```

Both are idempotent — re-running them after content already exists leaves existing rows alone
rather than duplicating anything.

When you're done, delete the local file so a real production connection string doesn't linger on
your machine: `rm .env.production.local`.

## 9. Verify

- Visit the deployed site — homepage, About, Services, Work, Contact should all render with the
  seeded content.
- Visit `/admin/login` and sign in with `ADMIN_EMAIL` / the password you hashed in step 5.
- Confirm `/admin` is unreachable without a session (open it in an incognito window — it should
  redirect to `/admin/login`), and that `curl -i https://your-domain/api/admin/leads` (no cookie)
  returns `401 {"error":"Unauthorized"}`. This is enforced by `middleware.ts`'s matcher on
  `/admin/:path*` and `/api/admin/:path*` — verified locally against a production build before
  this doc was written.
- Submit the contact form once and confirm the row appears in Admin → Leads, and (if Resend is
  configured) that both emails arrive.

## Notes

- **Package manager:** this repo uses pnpm (`pnpm-lock.yaml`, `pnpm-workspace.yaml`). Vercel
  detects that automatically and builds with pnpm — you don't need to change anything, but if you
  ever run build commands manually, use `pnpm build`, not `npm run build` (npm's `node_modules`
  layout can differ from pnpm's and isn't what's been tested).
- **`middleware.ts` deprecation:** the build emits `The "middleware" file convention is
  deprecated. Please use "proxy" instead.` This is a warning, not an error — admin protection
  works correctly as-is (verified above) — but Next plans to remove the old convention eventually.
  Worth migrating via `npx @next/codemod@canary middleware-to-proxy .` at some point; not required
  for this deploy.
- `next.config.ts` already allows `next/image` to load from `*.public.blob.vercel-storage.com`
  (the Blob store's public URL pattern), so images uploaded via the admin panel display correctly
  with no further config.
