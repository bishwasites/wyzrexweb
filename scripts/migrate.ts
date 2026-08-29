// Standalone, idempotent migration for the admin-panel foundation tables
// (meta_ads, top_contents, projects). Every other table in this app is
// managed via `pnpm db:push` (drizzle-kit, driven by db/schema.ts) — this
// script exists alongside that for environments where running drizzle-kit's
// interactive push isn't an option (e.g. a plain deploy hook). The column
// shapes here are kept in lockstep with the Drizzle definitions in
// db/schema.ts; if you add a column to one, add it to the other.
//
// Run with: pnpm db:migrate
// (env vars are loaded via `tsx --env-file=.env.local`, see package.json)
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,

  `DO $$ BEGIN
     CREATE TYPE content_platform AS ENUM ('instagram', 'tiktok', 'facebook', 'youtube');
   EXCEPTION WHEN duplicate_object THEN NULL;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS meta_ads (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     client_name varchar(200) NOT NULL,
     campaign_name varchar(200) NOT NULL,
     result_headline varchar(120) NOT NULL,
     result_sub varchar(200),
     image_url text NOT NULL,
     sort_order integer NOT NULL DEFAULT 0,
     created_at timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS top_contents (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     client_name varchar(200) NOT NULL,
     platform content_platform NOT NULL DEFAULT 'instagram',
     caption text,
     video_url text,
     thumb_url text,
     embed_url text,
     sort_order integer NOT NULL DEFAULT 0,
     created_at timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE TABLE IF NOT EXISTS projects (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     client_name varchar(200) NOT NULL,
     brief text,
     logo_url text,
     cover_url text,
     instagram_url text,
     facebook_url text,
     tiktok_url text,
     youtube_url text,
     website_url text,
     sort_order integer NOT NULL DEFAULT 0,
     created_at timestamp NOT NULL DEFAULT now()
   );`,

  // --- Site-wide CMS -------------------------------------------------------
  // `site_settings` used to be a key/value store. Move it aside (data intact)
  // so the name can be reused for the columnar singleton the CMS expects. The
  // guard makes this a no-op once the rename has already happened.
  `DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'site_settings' AND column_name = 'key'
     ) AND NOT EXISTS (
       SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings_kv'
     ) THEN
       ALTER TABLE site_settings RENAME TO site_settings_kv;
     END IF;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS site_settings (
     id integer PRIMARY KEY DEFAULT 1,
     logo_light_url text,
     logo_dark_url text,
     favicon_url text,
     site_title varchar(200),
     meta_description text,
     og_image_url text,
     primary_color varchar(20),
     phone varchar(60),
     email varchar(200),
     address text,
     whatsapp varchar(60),
     google_maps_embed text,
     CONSTRAINT site_settings_singleton CHECK (id = 1)
   );`,

  `CREATE TABLE IF NOT EXISTS nav_items (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     label varchar(120) NOT NULL,
     href varchar(300) NOT NULL,
     sort_order integer NOT NULL DEFAULT 0,
     is_external boolean NOT NULL DEFAULT false,
     is_visible boolean NOT NULL DEFAULT true
   );`,

  `CREATE TABLE IF NOT EXISTS socials (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     platform varchar(60) NOT NULL,
     url text NOT NULL,
     sort_order integer NOT NULL DEFAULT 0,
     is_visible boolean NOT NULL DEFAULT true
   );`,

  `CREATE TABLE IF NOT EXISTS footer_columns (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     title varchar(120) NOT NULL,
     sort_order integer NOT NULL DEFAULT 0
   );`,

  `CREATE TABLE IF NOT EXISTS footer_links (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     column_id uuid NOT NULL REFERENCES footer_columns(id) ON DELETE CASCADE,
     label varchar(120) NOT NULL,
     href varchar(300) NOT NULL,
     sort_order integer NOT NULL DEFAULT 0
   );`,

  `CREATE TABLE IF NOT EXISTS page_sections (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     page_slug varchar(60) NOT NULL,
     section_key varchar(80) NOT NULL,
     eyebrow varchar(160),
     heading text,
     subheading text,
     body text,
     cta_label varchar(120),
     cta_href varchar(300),
     image_url text,
     is_visible boolean NOT NULL DEFAULT true,
     sort_order integer NOT NULL DEFAULT 0
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS page_sections_page_key_idx
     ON page_sections (page_slug, section_key);`,

  `CREATE TABLE IF NOT EXISTS stats (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     value varchar(40) NOT NULL,
     suffix varchar(20),
     label varchar(160) NOT NULL,
     sort_order integer NOT NULL DEFAULT 0
   );`,

  `CREATE TABLE IF NOT EXISTS clients (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name varchar(200) NOT NULL,
     logo_url text,
     sort_order integer NOT NULL DEFAULT 0,
     is_visible boolean NOT NULL DEFAULT true
   );`,

  `CREATE TABLE IF NOT EXISTS testimonials (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name varchar(160) NOT NULL,
     role varchar(160),
     company varchar(160),
     quote text NOT NULL,
     avatar_url text,
     sort_order integer NOT NULL DEFAULT 0,
     is_visible boolean NOT NULL DEFAULT true
   );`,

  `CREATE TABLE IF NOT EXISTS team (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name varchar(160) NOT NULL,
     role varchar(160),
     bio text,
     photo_url text,
     sort_order integer NOT NULL DEFAULT 0,
     is_visible boolean NOT NULL DEFAULT true
   );`,

  `CREATE TABLE IF NOT EXISTS leads (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name varchar(200) NOT NULL,
     email varchar(200) NOT NULL,
     phone varchar(60),
     service varchar(160),
     message text,
     source_page varchar(120),
     created_at timestamp NOT NULL DEFAULT now(),
     is_read boolean NOT NULL DEFAULT false
   );`,

  // Bring the pre-existing `services` table up to the CMS shape without
  // losing rows: add the new columns, carry display_order across, then retire
  // it. `slug` becomes optional since the CMS doesn't require one.
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;`,
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;`,
  `DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'services' AND column_name = 'display_order'
     ) THEN
       UPDATE services SET sort_order = display_order;
       ALTER TABLE services DROP COLUMN display_order;
     END IF;
   END $$;`,
  `ALTER TABLE services ALTER COLUMN slug DROP NOT NULL;`,
];

async function migrate() {
  const client = await pool.connect();
  try {
    for (const statement of STATEMENTS) {
      await client.query(statement);
    }
    console.log("[migrate] schema is up to date (admin foundation + site-wide CMS).");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("[migrate] failed:", error);
  process.exit(1);
});
