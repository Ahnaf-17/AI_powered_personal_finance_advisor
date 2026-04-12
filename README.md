# AI-Powered Personal Finance Advisor

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

A full-stack web application that helps you take control of your personal finances. Track income and expenses, set savings goals, visualise spending with interactive charts, and get AI-powered budget advice — all wrapped in a dark futuristic UI.

---

## Team

| Developer | GitHub | Role |
|-----------|--------|------|
| Ahnaf Ahmed | [@Ahnaf-17](https://github.com/Ahnaf-17) | Team Lead / Frontend |
| Shakir Uddin Ahmed | — | Backend / Database |
| Md Monsur Hossain | [@mdmhossainn](https://github.com/mdmhossainn) | AI Integration / QA |

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time income/expense summary, 7-day spending bar chart, category pie chart, savings goals progress |
| 💳 **Transactions** | Add, view, filter and delete income and expense records by category |
| 🎯 **Savings Goals** | Create goals with target amounts and dates, track progress with animated bars |
| 🤖 **AI Advisor** | Personalised budget tips generated from your spending data |
| 💬 **AI Chatbot** | Conversational assistant for financial questions with suggestion chips |
| 🔒 **Auth** | JWT-based register/login with protected routes |
| 🌙 **Dark UI** | Glassmorphism dark theme (`#080c14` base, indigo/violet accents) |

---

## Tech Stack

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **Recharts** — PieChart, BarChart
- **React Router DOM v7**
- **Axios**

### Backend
- **Node.js 22** + **Express 4**
- **MongoDB** (persistent local) + **Mongoose 8**
- **JWT** authentication
- **bcryptjs** password hashing
- **Helmet** + **CORS** security
- **OpenAI API** (optional — falls back gracefully)

---

## Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| Git | Any | https://git-scm.com |
| MongoDB | 6+ (optional — see below) | https://www.mongodb.com/try/download/community |

> **No MongoDB installed?** No problem. The app automatically falls back to an **in-memory MongoDB** instance for development. Data will not persist across server restarts in that mode.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Ahnaf-17/AI_powered_personal_finance_advisor.git
cd AI_powered_personal_finance_advisor
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

The backend `.env` file is at `backend/.env`. Edit it with your values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_advisor
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

# Optional — AI features (leave blank to disable AI endpoints)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

> **AI features are optional.** If `OPENAI_API_KEY` is not set, the AI Advisor and Chatbot pages will show a graceful error message.

---

## Running the Project

Open **two terminals** from the project root.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
✅ MongoDB connected (persistent): localhost
```

> If MongoDB is not installed locally, you will see `⚡ Using in-memory MongoDB (dev mode)` instead — this is fine for testing.

### Terminal 2 — Frontend

```bash
npm run dev
```

Expected output:
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## Demo Account (Pre-seeded Data)

To instantly populate the database with realistic transactions and goals, run:

```bash
node backend/scripts/seed.js
```

Then log in with:

| Field | Value |
|-------|-------|
| Email | `demo@finance.app` |
| Password | `Demo1234!` |

To use a custom account:

```bash
node backend/scripts/seed.js --email you@example.com --password MyPass123! --name "Your Name"
```

---

## Project Structure

```
AI_powered_personal_finance_advisor/
├── src/                          # React frontend
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx         # Charts, summary, goals preview
│   │   ├── AddExpense.jsx        # Transaction list & add form
│   │   ├── Insights.jsx          # Savings goals management
│   │   ├── AIAdvisor.jsx         # AI budget insights
│   │   └── Chatbot.jsx           # AI chat interface
│   ├── services/
│   │   └── api.js                # Axios instance & API calls
│   └── App.jsx                   # Routes & layout
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection (persistent + fallback)
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # Express routers
│   │   └── server.js             # Express app entry point
│   ├── scripts/
│   │   └── seed.js               # Demo data seeder
│   └── .env                      # Environment variables
│
├── data/db/                      # Local MongoDB data files (git-ignored)
└── vite.config.js
```

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user (auth required) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List transactions (filterable) |
| POST | `/transactions` | Create transaction |
| PUT | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/transactions/summary` | Income/expense totals by category |
| GET | `/transactions/daily` | Daily expense totals (last N days) |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | List all goals |
| POST | `/goals` | Create goal |
| PUT | `/goals/:id` | Update goal (add funds etc.) |
| DELETE | `/goals/:id` | Delete goal |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/budget-advice` | Get AI budget insights |
| POST | `/ai/chat` | Send message to AI chatbot |

---

## Troubleshooting

**Port already in use (EADDRINUSE)**
```powershell
# Windows — kill process on port 5000
$p = (Get-NetTCPConnection -LocalPort 5000 -EA SilentlyContinue | Select -First 1).OwningProcess
if ($p) { Stop-Process -Id $p -Force }
```

**Login page keeps refreshing**  
This was caused by a 401 interceptor calling `window.location.href`. Fixed in the current codebase using React Router navigation instead.

**Data not saving between restarts**  
Ensure MongoDB is running locally on port 27017. If you see `⚡ Using in-memory MongoDB`, data is not persisted. Install MongoDB Community or use MongoDB Atlas with a connection string in `.env`.

**AI features not working**  
Add a valid `OPENAI_API_KEY` to `backend/.env`. Alternatively, use the free Groq API by uncommenting the Groq lines at the bottom of `.env`.

```

### 5. Register and log in
Once both servers are running, open `http://localhost:5173`, click **Create Account**, and start tracking your finances.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/transactions` | Get all transactions | Yes |
| POST | `/api/transactions` | Add transaction | Yes |
| GET | `/api/goals` | Get all goals | Yes |
| POST | `/api/goals` | Create goal | Yes |
| POST | `/api/ai/budget-advice` | AI budget recommendations | Yes |
| POST | `/api/ai/savings-suggestions` | AI savings tips | Yes |
| POST | `/api/ai/chat` | Chat with AI advisor | Yes |

