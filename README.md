# 🚀 Janmejoy Portfolio (Next.js)

A modern, interactive portfolio built with **Next.js 14 + TypeScript + Tailwind CSS**.

## ✨ Highlights
- 🎯 Hero section with motion + typing intro
- 🧠 Skills, case studies, and project showcase
- 📬 Contact form with **Resend** email delivery
- 🔐 Secret room with passcode-based access
- 📊 GitHub activity card (commits, PRs, stars, etc.)
- 📈 Visitor tracking with Upstash Redis
- 🎨 Theme presets (`dark`, `bright`, `cyber`)

## 🛠️ Tech Stack
- ⚛️ Next.js (App Router)
- 🧩 React + TypeScript
- 🎬 Framer Motion
- 💨 Tailwind CSS
- ✉️ Resend
- 🧮 Upstash Redis

## 📁 Project Structure
```txt
src/
  app/
    api/
      contact/route.ts        # Contact form API (Resend)
      github-stats/route.ts   # GitHub GraphQL stats API
      secret/route.ts         # Secret room auth cookie API
      track/route.ts          # Visitor tracking API
    secret/
      page.tsx
      SecretRoomClient.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    Hero.tsx
    Projects.tsx
    Contact.tsx
    Navbar.tsx
    GitHubStatsCard.tsx
    ...
  lib/
    data.ts
    motion.ts
    redis.ts
```

## ⚙️ Setup
1. Clone and install:
```bash
npm install
```

2. Create `.env` with required keys:
```env
# Contact (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
CONTACT_TO_EMAIL=

# Optional webhook fallback/notifications
DISCORD_WEBHOOK_URL=
CONTACT_WEBHOOK_URL=

# Visitor tracking
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Secret room
SECRET_ROOM_PASSCODE=

# GitHub stats card
GITHUB_TOKEN=
GITHUB_USERNAME=
```

3. Run locally:
```bash
npm run dev
```

## 📜 Scripts
- `npm run dev` → start local dev server
- `npm run build` → production build
- `npm run start` → run production server
- `npm run lint` → lint project

## 🔌 API Endpoints
- `POST /api/contact` → send contact message
- `GET /api/github-stats` → GitHub stats for hero card
- `GET/POST/DELETE /api/secret` → secret room session flow
- `POST /api/track` → track visitor count

## 🚢 Deployment
Deploy on Vercel (recommended):
1. Push repository to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

## 👨‍💻 Author
- **Janmejoy Mahato**
- 📧 `janmejoymahato529@gmail.com`
- 🔗 [LinkedIn](https://linkedin.com/in/janmej0y)
- 🐙 [GitHub](https://github.com/janmej0y)
