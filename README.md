# 💰 AI Money Mentor
AI Money Mentor is an intelligent financial assistant that helps users plan, manage, and optimize their finances in one place. It offers tools like Money Health Score, FIRE Planner, Tax Optimization, and investment analysis to deliver personalized, real-time financial guidance — making financial planning accessible, simple, and free for everyone.

## ✨ Features

| Tool | What it does |
|------|-------------|
| 🔥 **FIRE Path Planner** | Month-by-month roadmap to retire early. SIPs, asset allocation, insurance gaps. |
| 📊 **Money Health Score** | 5-minute quiz → wellness score across 6 financial dimensions. |
| 🎯 **Life Event Advisor** | Bonus, inheritance, marriage, new baby — AI action plan for your tax bracket. |
| 🧾 **Tax Wizard** | Upload Form 16 or input salary. Every missed deduction. Old vs new regime. |
| 💑 **Couple's Planner** | Two incomes — HRA, NPS, SIP splits, insurance, tax optimised. |
| 🔬 **MF Portfolio X-Ray** | CAMS statement → XIRR, overlap, expense drag, rebalancing plan. |
| 💬 **AI Chat Advisor** | Multi-turn conversational financial mentor. |

---

## 🚀 Setup (Windows / Mac / Linux)

### Prerequisites
- **Node.js 18+** — https://nodejs.org/
- **Anthropic API key** — https://console.anthropic.com/

### Step 1 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal or after backend finishes)
cd ../frontend
npm install
```

### Step 2 — Configure environment

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Open `backend/.env` and set:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
JWT_SECRET=any-long-random-string-here
```

### Step 3 — Initialise the database

```bash
cd backend
node db/migrate.js
```

### Step 4 — Start the servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
node --watch server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5 — Open the app
- **App:** http://localhost:5173
- **API health:** http://localhost:4000/health

---

## 🏗️ Project Structure

```
ai-money-mentor/
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env.example           # Copy to .env and add your API key
│   ├── db/
│   │   ├── index.js           # sql.js database (pure JS, no C++ build)
│   │   └── migrate.js         # Schema setup — run once
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── routes/
│   │   ├── auth.js            # Register / Login / Profile
│   │   ├── ai.js              # All AI tool endpoints (SSE streaming)
│   │   └── upload.js          # PDF parsing (Form 16, CAMS)
│   └── services/
│       └── ai.js              # Anthropic SDK + all AI prompts
│
└── frontend/
    └── src/
        ├── main.jsx           # App entry + React Router
        ├── hooks/
        │   ├── useAuth.jsx    # Auth context + JWT
        │   └── useStream.js   # SSE streaming hook
        ├── utils/api.js       # fetch helpers + SSE client
        ├── components/
        │   ├── Navbar.jsx
        │   └── UI.jsx         # Full design system
        └── pages/
            ├── Home.jsx
            ├── Auth.jsx       # Login + Register
            ├── Fire.jsx
            ├── Score.jsx
            ├── Tools.jsx      # Life Event, Tax, Couple, MF X-Ray
            ├── Chat.jsx
            └── History.jsx
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/auth/register` | `{ name, email, password }` |
| POST | `/auth/login` | `{ email, password }` |
| GET  | `/auth/me` | — (Bearer token) |
| PUT  | `/auth/profile` | `{ age, income, expenses, ... }` |

### AI Tools — Server-Sent Events (streaming)
All return `event: chunk` / `event: done` / `event: error` SSE messages.

| Method | Endpoint | Key body fields |
|--------|----------|-----------------|
| POST | `/ai/fire`   | `age, retireAge, income, expenses, savings, goals` |
| POST | `/ai/score`  | `emergency, insurance, investment, debt, tax, retirement` |
| POST | `/ai/life`   | `event, amount, income, bracket, risk` |
| POST | `/ai/tax`    | `ctc, basic, hra, lta, pf, rent, city` |
| POST | `/ai/couple` | `p1name, p1income, p1tax, p2name, p2income, p2tax, joint_goal` |
| POST | `/ai/xray`   | `portfolioText, context` |
| POST | `/ai/chat`   | `messages: [{role, content}]` |

### History (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/history` | Paginated past sessions |
| GET | `/ai/history/:id` | Full session with AI result |
| GET | `/ai/scores` | Health score history |
| GET | `/ai/fire-plans` | Saved FIRE plans |

### File Upload (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/form16` | Parse Form 16 PDF → extract salary fields |
| POST | `/upload/cams` | Parse CAMS PDF → extract fund list |

---

## 🔒 Security
- Passwords: bcrypt (12 rounds)
- Auth: JWT with configurable expiry
- Rate limiting: 60 req/min global, 15/min for AI endpoints
- Helmet.js security headers
- CORS locked to frontend URL
- Input validation on all POST endpoints

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | — | Your Claude API key |
| `JWT_SECRET` | ✅ | — | Secret string for JWT signing |
| `PORT` | | `4000` | Backend port |
| `DB_PATH` | | `./db/money_mentor.db` | SQLite file location |
| `FRONTEND_URL` | | `http://localhost:5173` | Allowed CORS origin |
| `JWT_EXPIRES_IN` | | `7d` | Token lifespan |

---

## ⚠️ Disclaimer
AI-generated financial advice is for informational purposes only. Consult a SEBI-registered investment advisor for personalised decisions.
