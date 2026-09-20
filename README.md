# TradeQuest

A realistic day trading **simulator** for learning. Start with **$500** virtual cash, trade simulated stocks with live-updating prices, study guides, compete on the classroom leaderboard, and get coached by an AI that teaches you to think — **never tells you what to buy**.

## Why TradeQuest?

Most paper-trading apps are either generic market simulators (Trading Game, SimTrade) or broker demos with huge default balances. TradeQuest is built for **small-account day trading education**:

- **$500 starting balance** — realistic position sizing without needing a big paper account
- **AI coach with guardrails** — analyzes your chart and portfolio but refuses trade picks
- **12 structured guides** — adapted from Markus Heitkoetter's day-trading curriculum (with attribution)
- **Classroom leaderboard** — rank by return % against other learners
- **Mobile-friendly + PWA** — trade on phone; add to home screen for a full-screen experience
- **Focused 8-stock sim** — learn depth on a small watchlist, not noise from hundreds of symbols

**Roadmap:** optional real-market data feeds for chart context (simulated execution stays for safety).

## Features

- **User accounts** — register/login; portfolio, trades, coach chat, and guide progress saved to your account
- **Simulated market** — 8 stocks with realistic price movement
- **$500 starting balance** — learn position sizing and risk (legacy $100 accounts auto-reset to $500 on login)
- **Live charts** — prices update every 2 seconds
- **12 educational guides** — adapted from Markus Heitkoetter's *Complete Guide to Day Trading* (Rockwell Trading), with attribution
- **Classroom leaderboard** — top 25 traders ranked by portfolio return %
- **AI Coach** — live LLM coach (Gemini) that sees your chart, prices, and portfolio; teaches reasoning, not trade picks
- **Installable PWA** — `manifest.json` for add-to-home-screen on mobile

## Local development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/tradequest.git
cd tradequest
npm install
```

### 2. Database (free Neon Postgres)

GitHub/Vercel hosting needs PostgreSQL (SQLite files do not persist on serverless).

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the **connection string** (must include `?sslmode=require`)
3. Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="any-long-random-string-for-dev"
GEMINI_API_KEY="your-key"   # optional — see below
```

### 3. Migrate and run

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the dev server acts up after upgrades, run `npm run dev:clean`.

### AI Coach setup

The coach uses **Google Gemini** (free tier). One API key on the server powers every user.

1. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Add `GEMINI_API_KEY` to `.env` (or Vercel env vars in production)
3. Optional: `GEMINI_MODEL=gemini-2.5-flash-lite`, `COACH_RATE_LIMIT_PER_HOUR=40`

Without a key, the coach falls back to basic scripted hints.

## Host on GitHub + Vercel (free)

TradeQuest is a full Next.js app (API routes, auth, database). **GitHub stores the code**; **Vercel runs the live site** (free tier, connects to your GitHub repo).

### Step 1 — Push to GitHub

```bash
cd tradequest
git init
git add .
git commit -m "Initial TradeQuest release"
git branch -M main
gh repo create tradequest --public --source=. --remote=origin --push
```

(Or create an empty repo on GitHub and `git remote add origin …` then `git push -u origin main`.)

**Never commit `.env`** — it is gitignored. Secrets go in Vercel only.

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. **Add New Project** → import your `tradequest` repo
3. Framework: **Next.js** (auto-detected)
4. Add **Environment Variables**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string (`postgresql://…?sslmode=require`) |
| `AUTH_SECRET` | Long random string ([generate one](https://generate-secret.vercel.app/32)) |
| `GEMINI_API_KEY` | Your Gemini key (optional but recommended) |

5. Click **Deploy**

Vercel runs `prisma migrate deploy` during build and applies your database schema automatically.

Your live URL will look like `https://tradequest.vercel.app` (or your custom domain).

### Step 3 — After deploy

- Open the Vercel URL → register an account → start trading
- Pushes to `main` auto-deploy new versions

## Tech stack

- Next.js 16 (App Router)
- React 19, Tailwind CSS 4
- Prisma + PostgreSQL (Neon)
- lightweight-charts, Lucide React

## Disclaimer

Simulated market data for **educational purposes only**. Not financial advice. Do not use this app for real trading decisions.
