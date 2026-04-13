# AI-Powered Personal Finance Advisor


A full-stack web application that helps you take control of your personal finances. Track income and expenses, set savings goals, visualise spending with interactive charts, and get AI-powered budget advice — all wrapped in a dark futuristic UI.

---

## Team

| Developer | GitHub | Role |
|-----------|--------|------|
| Ahnaf Ahmed | [@Ahnaf-17](https://github.com/Ahnaf-17) | Team Lead / Frontend |
| Shakir Uddin Ahmed |  [@shakir-77](https://github.com/shakir-77)  | Backend / Database |
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
- **OpenAI API** 

---

## Prerequisites — Install These First



### Step 1 — Install Node.js and npm

Node.js is the JavaScript runtime that runs the backend. npm (Node Package Manager) comes bundled with it and is used to install all project libraries.

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the green button — it says "Recommended for most users")
3. Run the installer and click **Next** through all steps — keep all defaults
4. When done, open a terminal (**PowerShell** on Windows, **Terminal** on Mac/Linux) and verify:

```bash
node --version
npm --version
```

You should see something like `v22.x.x` and `10.x.x`. If you do, Node.js and npm are ready.

---

### Step 2 — Install Git

Git is used to download (clone) this project from GitHub.

1. Go to **https://git-scm.com/downloads**
2. Download and run the installer — keep all defaults and click **Next**
3. Verify it works:

```bash
git --version
```

You should see something like `git version 2.x.x`.

---

### Step 3 — Get MongoDB (choose one option)

MongoDB is the database that stores your transactions and goals.

#### Option A — Use the bundled portable MongoDB (easiest, no install needed)

The app will **automatically download and run a portable MongoDB** the first time you start the backend in development mode. No action needed — just proceed to Step 4.

> You will see `⚡ Using in-memory MongoDB (dev mode)` in the terminal. This works fine but **data is lost when the server stops**.

#### Option B — Install MongoDB Community (recommended for persistent data)

1. Go to **https://www.mongodb.com/try/download/community**
2. Select **Version: 8.x**, **Platform: Windows**, **Package: MSI**
3. Click **Download** and run the installer
4. Keep all defaults — make sure **"Install MongoDB as a Service"** is ticked
5. After install, MongoDB will start automatically in the background
6. Verify it's running:

```powershell
# Windows — check if MongoDB is listening on port 27017
netstat -ano | findstr ":27017"
```

You should see a line with `LISTENING`. If you do, MongoDB is running.

---

## Installation & Setup

### Step 4 — Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/Ahnaf-17/AI_powered_personal_finance_advisor.git
cd AI_powered_personal_finance_advisor
```

This downloads the project into a folder called `AI_powered_personal_finance_advisor` and navigates into it.

---

### Step 5 — Install frontend dependencies

From inside the project folder, run:

```bash
npm install
```

This reads `package.json` and downloads all the React/Vite/Tailwind libraries into a `node_modules` folder. It may take 1–2 minutes.

---

### Step 6 — Install backend dependencies

Now go into the backend folder and do the same:

```bash
cd backend
npm install
cd ..
```

This installs Express, Mongoose, JWT, and all other backend libraries.

---

### Step 7 — Configure environment variables

The backend needs a `.env` file with secret settings. One may already exist — check if `backend/.env` exists. If not, create it:

```bash
# Windows PowerShell
New-Item backend/.env
```

Open `backend/.env` in any text editor (Notepad is fine) and paste:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_advisor
JWT_SECRET=change_this_to_any_long_random_string_abc123xyz
JWT_EXPIRES_IN=7d

# Optional — only needed for real AI responses
# Leave these blank if you don't have an OpenAI key
OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

> **AI features are optional.** Without an `OPENAI_API_KEY` the app still works — it shows rule-based budget advice instead.

Save the file.

---

### Step 8 — Start MongoDB (if using Option B from Step 3)

If you installed MongoDB as a Windows Service it is already running. If not, start it manually:

```powershell
# Replace the path below with where your MongoDB binary actually is
# Default Windows install location:
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --port 27017
```

Or if you downloaded the portable binary via the app's auto-download (stored in your user cache):

```powershell
$mongod = "$env:USERPROFILE\.cache\mongodb-binaries\mongod-x64-win32-8.2.1.exe"
$dbPath = "$PWD\data\db"
New-Item -ItemType Directory -Path $dbPath -Force | Out-Null
Start-Process $mongod -ArgumentList "--dbpath `"$dbPath`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Hidden
Write-Host "MongoDB started"
```

---

### Step 9 — Seed the database with demo data (optional but recommended)

This creates a demo user with 161 realistic transactions and 5 savings goals so you can see the app working immediately.

From the **project root folder**, run:

```bash
node backend/scripts/seed.js
```

Expected output:
```
✅ Connected to MongoDB: localhost
👤 Creating demo user...
💳 Inserted 161 transactions
🎯 Inserted 5 goals

🎉 Seed complete!
   Email:    demo@finance.app
   Password: Demo1234!
```

> Run this **after** starting MongoDB (Step 8) or the script will time out.

---

### Step 10 — Run the project

You need **two terminals open at the same time**, both in the project root folder.

**Terminal 1 — Start the backend:**

```bash
cd backend
npm run dev
```

Wait until you see:
```
Server running on port 5000
✅ MongoDB connected (persistent): localhost
```

**Terminal 2 — Start the frontend (open a new terminal window/tab):**

```bash
npm run dev
```

Wait until you see:
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Now open **http://localhost:5173** in your browser.

---

## Demo Account

If you ran the seed script in Step 9, log in with:

| Field | Value |
|-------|-------|
| Email | `demo@finance.app` |
| Password | `Demo1234!` |

To seed a different account:

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
