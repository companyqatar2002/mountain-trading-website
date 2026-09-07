# Mountain Trading & Contracting W.L.L — Website + Portal

Public company profile site, plus a login portal with **Admin** and **Normal User**
roles. Admins upload/manage company documents and users; normal users can log
in and view/download what's shared with them.

**Stack:** React (Vite) + Tailwind — hosted free on Netlify.
**Backend:** Supabase (free tier, no card required, no time limit) — handles
login, user roles, the document database, and file storage.

---

## 0. About the images

Your real logo and photos are already in `public/assets/` — nothing to do here.
A few notes on what I used from your uploads:

- **Logo** — used exactly as you sent it, untouched.
- **Hero, About, Construction, Manpower, MEP/AC, Clients gallery** — your own photos, cropped/optimized.
- **Cleaning & Facility Services** — the file you sent for this was a broken
  design template (placeholder graphics, not a real photo), so that card
  currently uses a plain styled panel instead of a photo. Send me a real
  cleaning-crew or facility photo whenever you have one and I'll drop it in.

---

## 1. Create your free Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up free → **New project**.
2. Pick any name/region, set a database password (save it somewhere safe).
3. Once it's created, go to **Project Settings > API** and copy:
   - `Project URL`
   - `anon public` key

## 2. Load the database schema

1. In Supabase, open **SQL Editor > New query**.
2. Open `supabase/schema.sql` from this project, paste the whole thing in, and click **Run**.
   This creates the `profiles`, `documents`, and `contact_messages` tables, all
   security rules (so normal users can't touch admin-only actions), and a
   private storage bucket for documents.

## 3. Deploy the admin-create-user function

This lets an admin create new logins from the dashboard, safely (the secret
key never touches the browser).

Easiest path — no command line needed:
1. In Supabase: **Edge Functions > Create a new function** → name it `admin-create-user`.
2. Paste in the contents of `supabase/functions/admin-create-user/index.ts`.
3. Deploy.

(If you're comfortable with a terminal instead: `supabase functions deploy admin-create-user`.)

## 4. Create your first admin login

1. Supabase Dashboard → **Authentication > Users > Add user** → enter an email + password, tick **Auto Confirm User**.
2. Copy the new user's UUID (shown in the users list).
3. Back in **SQL Editor**, run (replacing the values):
   ```sql
   insert into public.profiles (id, full_name, role)
   values ('paste-uuid-here', 'Gousul Hoque Chowdhury', 'admin');
   ```
4. This is your admin login. From here on, create every other account (admin or
   normal user) from inside the portal itself — no more manual SQL needed.

## 5. Run it locally (optional, to preview before deploying)

```bash
npm install
cp .env.example .env
# edit .env with your Supabase URL + anon key
npm run dev
```

## 6. Deploy to Netlify (free)

**Easiest way — drag and drop:**
1. `npm run build` (creates a `dist` folder)
2. Go to [app.netlify.com](https://app.netlify.com) → drag the `dist` folder onto the dashboard
3. Site settings > Environment variables → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Trigger a redeploy so the variables take effect

**Better long-term way — connect to GitHub:**
1. Push this whole project to a new GitHub repo
2. Netlify → **Add new site > Import an existing project** → pick the repo
3. Build command: `npm run build`, publish directory: `dist` (already set in `netlify.toml`)
4. Add the same two environment variables as above
5. Every future push to GitHub auto-deploys — no manual re-upload

You can reuse your existing site — mountaintrading2021.netlify.app — or point
a new Netlify site at this project; either way it stays on Netlify's free plan.

---

## Free tier limits (so nothing surprises you later)

- **Netlify free:** 100GB bandwidth/month, unlimited sites — plenty for a company profile site.
- **Supabase free:** 500MB database, 1GB file storage, 50,000 monthly active users, no card required, no expiry date. The project pauses after 7 days with zero traffic — one click in the dashboard wakes it back up, no data lost.

If you ever outgrow the document storage limit, only Supabase's paid tier
($25/mo) needs upgrading — Netlify stays free either way.

---

## What admins can do
- Upload/import documents (certificates, licenses, contracts) — stored securely, not public
- Export/download any document, or delete it
- Create new logins and set each as Admin or Normal User
- Promote/demote existing users
- View messages submitted through the public contact form

## What normal users can do
- Log in to the portal
- View and download documents the admin has shared
- Cannot upload, delete, or manage other users
# mountain-trading-website
