# Acadevia — Gamified Learning Platform

Engaging, modular learning with real-time progression, badges, and leaderboards. Built with a Next.js 14 frontend and a TypeScript/Express backend powered by Prisma and Socket.IO.

## ✨ Features

- Authentication and profiles (NextAuth on the frontend; JWT/Passport on the backend)
- Interactive lessons, quizzes, and dynamic feedback
- Badges, achievements, and leaderboards
- Real-time progress and collaboration via WebSockets
- Modular course design and dashboard analytics
- Mobile‑responsive UI with Tailwind + MUI
- Payment, notifications, and messaging integrations (Razorpay, Twilio)

## 🧱 Tech Stack

- Frontend: Next.js 14, TypeScript, TailwindCSS, MUI, NextAuth, React Query, Redux Toolkit, Chart.js, Framer Motion, Lucide Icons, Socket.IO client
- Backend: Node.js, Express, TypeScript, Prisma, Passport JWT, Redis, Socket.IO, Razorpay, Twilio, AWS SDK
- Database: Prisma ORM (Postgres/MySQL — set via DATABASE_URL)
- Tooling: ESLint, Jest (backend), Tailwind plugins, Prettier (inferred)

## 🗂️ Monorepo Structure

```
Acadevia-3/
├─ frontend/                  # Next.js 14 app (primary UI)
│  ├─ src/                    # Routes, components, features
│  ├─ public/                 # Static assets
│  ├─ next.config.js
│  ├─ tailwind.config.js
│  ├─ package.json
│  └─ ... (tsconfig, postcss, etc.)
├─ backend/                   # Express + TS API
│  ├─ src/
│  │  ├─ app.ts               # Express app
│  │  ├─ server.ts            # Bootstraps server & sockets
│  │  ├─ routes/              # API routes
│  │  ├─ controllers/         # Controllers
│  │  ├─ services/            # Business logic
│  │  ├─ sockets/             # Socket.IO events
│  │  ├─ middlewares/         # Auth, validation, etc.
│  │  ├─ validations/         # Joi/Zod schemas
│  │  └─ utils/               # Helpers
│  ├─ prisma/                 # Prisma schema & seed
│  ├─ tsconfig.json
│  ├─ package.json
│  └─ Dockerfile              # Placeholder; extend as needed
└─ README.md
```

## 🚀 Getting Started

Prerequisites:
- Node.js 18+ (recommend LTS)
- npm or yarn
- Database (Postgres/MySQL/SQLite via Prisma’s DATABASE_URL)
- Redis (optional)

### 1) Backend setup

```bash
cd backend
cp .env.example .env   # create and fill if example is empty
npm install

# Prisma
npm run generate
npm run migrate        # or: npx prisma migrate dev
# optional: seed
npm run seed

# Dev server
npm run dev
```

Common backend env:
- DATABASE_URL=
- JWT_SECRET=
- REDIS_URL=
- RAZORPAY_KEY_ID= / RAZORPAY_KEY_SECRET=
- TWILIO_ACCOUNT_SID= / TWILIO_AUTH_TOKEN= / TWILIO_PHONE_NUMBER=
- AWS_ACCESS_KEY_ID= / AWS_SECRET_ACCESS_KEY= / AWS_REGION=
- PORT=4000
- CORS_ORIGIN=http://localhost:3000

### 2) Frontend setup

Open a second terminal:

```bash
cd frontend
cp .env.local.example .env.local   # create and fill if example is empty
npm install
npm run dev
```

Common frontend env:
- NEXT_PUBLIC_API_URL=http://localhost:4000
- NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
- NEXTAUTH_URL=http://localhost:3000
- NEXTAUTH_SECRET=your_long_random_string
- NEXT_PUBLIC_RAZORPAY_KEY_ID=

Open http://localhost:3000 to view the app.

## 🧪 Scripts

Frontend (from frontend/):
- dev: next dev
- build: next build
- start: next start
- lint: next lint

Backend (from backend/):
- dev: nodemon src/server.ts
- build: tsc
- start: node dist/server.js
- migrate: npx prisma migrate dev
- generate: npx prisma generate
- seed: ts-node prisma/seed.ts
- test: jest

## 🔌 API & Sockets

- REST API: Express routes under `backend/src/routes` with controllers under `backend/src/controllers`
- Auth: JWT with Passport (backend); NextAuth (frontend)
- Real‑time: Socket.IO under `backend/src/sockets` with a Socket.IO client in the frontend
- Validation: Joi/Zod under `backend/src/validations`

> For a detailed API reference, we can add Swagger/OpenAPI in a follow-up.

## 🧰 Development Notes

- Code Style: ESLint + Tailwind plugin (frontend); Prettier (inferred)
- Database: Use Prisma Studio for local inspection: `npx prisma studio`
- Testing: Backend uses Jest (`npm test`)
- Docker: Backend Dockerfile/docker-compose present as stubs — extend for production.

## 📦 Deployment

- Frontend: Vercel or any Node host (Next.js 14)
- Backend: Any Node host or Docker
- Database/Redis: Use managed providers (Neon/Planetscale/Supabase; Upstash/Redis Cloud)

## 🔐 Security

- Don’t commit `.env` files or secrets
- Configure `CORS_ORIGIN` to your frontend in production
- Use HTTPS and secure cookies for NextAuth

## 🤝 Contributing

1) Fork the repo
2) Create a feature branch: `git checkout -b feature/awesome`
3) Commit: `git commit -m "feat: add awesome"`
4) Push: `git push origin feature/awesome`
5) Open a PR

## 📝 License

MIT

## 🗺️ Roadmap

- [ ] Instructor dashboards and content authoring
- [ ] Gamified learning paths and seasonal events
- [ ] Notifications center (in-app + email/SMS)
- [ ] Role-based access control
