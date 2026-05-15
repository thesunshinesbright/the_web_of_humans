# Deployment Guide
## Human Memory Graph — $0/month Setup

Stack: **Supabase** (DB + Auth) + **Vercel** (Frontend)
No backend server needed. Supabase handles the database and REST API automatically.

---

## Step 1 — Supabase Setup (Free Tier)

### 1.1 Create account & project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Choose a name (e.g. `human-memory-graph`)
4. Set a strong database password (save it somewhere)
5. Select the region closest to your users
6. Click **"Create new project"** — wait ~2 min

### 1.2 Run the database schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **"Run"** (or Cmd/Ctrl+Enter)
5. You should see: *"Success. No rows returned"*

### 1.3 Seed the graph with starter data

1. In SQL Editor, click **"New query"** again
2. Paste the entire contents of `supabase/seed.sql`
3. Click **"Run"**
4. You should see: *"Success. 20 rows affected"* (approx)

### 1.4 Get your API credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 2 — Local Development

```bash
# Clone / enter the project directory
cd human-memory-graph

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Edit .env and fill in your Supabase credentials:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## Step 3 — Deploy to Vercel (Free)

### Option A: Via Vercel CLI (fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# In the project root
vercel

# Follow the prompts:
# - Link to your Vercel account
# - Project name: human-memory-graph (or anything)
# - Build command: npm run build  ✓ (auto-detected)
# - Output directory: dist  ✓ (auto-detected)
# - Override settings? No

# Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key when prompted

# Deploy to production
vercel --prod
```

### Option B: Via GitHub + Vercel dashboard

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/human-memory-graph.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **"Add New Project"**
3. Import your GitHub repository
4. In the **"Environment Variables"** section, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **"Deploy"**
6. Done! You'll get a URL like `https://human-memory-graph.vercel.app`

---

## Step 4 — Configure Supabase Auth (Required)

Supabase needs to know your deployed URL for email confirmation links to work.

1. In Supabase dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://human-memory-graph.vercel.app`)
3. Add to **Redirect URLs**:
   - `https://human-memory-graph.vercel.app/**`
   - `http://localhost:5173/**` (for local dev)
4. Save

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free tier | $0/month |
| Vercel | Hobby tier | $0/month |
| **Total** | | **$0/month** |

### Supabase Free Tier Limits
- 500 MB database storage
- 5 GB bandwidth per month
- 50,000 monthly active users
- Unlimited API requests

This is more than enough to validate the MVP and reach the 50 users / 500 nodes / 2,000 edges success criteria from the README.

### When you need to upgrade
- Database > 500 MB → Supabase Pro ($25/month)
- > 100 GB bandwidth → Vercel Pro ($20/month)
- This typically means thousands of active users

---

## Custom Domain (Optional, Free)

If you have a domain:

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain
3. Follow the DNS instructions (add CNAME record at your registrar)
4. Update Supabase Auth URLs to use your new domain

---

## Troubleshooting

### "Missing Supabase env vars" error
→ Make sure `.env` file exists and has both variables filled in (no quotes around values)

### Graph is empty after seed
→ Check SQL Editor for errors. Make sure schema.sql ran before seed.sql.

### Auth emails not arriving
→ Check spam. In Supabase dashboard → Authentication → Email Templates to customize.

### "Row level security" errors
→ Make sure you ran the full `schema.sql` including the RLS policies at the bottom.

### Force graph not rendering
→ Make sure `react-force-graph-2d` is installed: `npm install react-force-graph-2d`

---

## Local HTTPS (Optional)

If you need HTTPS locally for OAuth:
```bash
npm install -g local-ssl-proxy
npm run dev &
local-ssl-proxy --source 5174 --target 5173
# Use https://localhost:5174
```

---

## Next Steps After Launch

1. **Share the URL** with friends to get the first 50 users
2. **Verify the seed data** looks good at `/graph`
3. **Test the Workshop** — create a few nodes yourself
4. **Monitor Supabase** → Table Editor to watch nodes/edges grow
5. When ready to expand, refer to `Possible_futures.md` for roadmap ideas
