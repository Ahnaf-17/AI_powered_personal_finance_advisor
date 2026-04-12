# AI-Powered Personal Finance Advisor

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb) ![License](https://img.shields.io/badge/license-MIT-blue)

A full-stack web application that helps you take control of your personal finances. Track income and expenses, set savings goals, visualise spending with charts, and get AI-powered budget advice — all in one place.

---

## Built By

| Developer | GitHub | Role |
|-----------|--------|------|
| Ahnaf Ahmed | [@Ahnaf-17](https://github.com/Ahnaf-17) | Team Lead / Frontend |
| Shakir Uddin Ahmed | — | Backend / Database |
| Md Monsur Hossain | [@mdmhossainn](https://github.com/mdmhossainn) | AI Integration / QA |

---

## Features

- **Budget Advice** – AI-generated personalised budget recommendations based on 90-day spending history
- **Savings Suggestions** – Identifies top discretionary categories and suggests savings targets
- **Financial Chatbot** – Scoped AI assistant for personal finance questions with session history
- **Transaction Management** – Add, view, filter, and categorise income and expenses
- **Goal Tracker** – Set and track financial savings goals
- **Dashboard** – Visual spending breakdown with charts (Recharts)
- **Authentication** – Secure JWT-based login and registration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI Provider | OpenAI GPT-3.5-turbo (Groq Llama3 fallback) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Security | express-rate-limit, express-validator, helmet |

---

## Project Structure

```
AI_powered_personal_finance_advisor/
├── src/                          # React frontend (Vite)
│   ├── components/               # Reusable UI components
│   │   ├── Chart.jsx
│   │   ├── ExpenseForm.jsx
│   │   └── Navbar.jsx
│   ├── pages/                    # Route-level pages
│   │   ├── Dashboard.jsx
│   │   ├── AddExpense.jsx
│   │   ├── Insights.jsx
│   │   └── Chatbot.jsx
│   ├── services/
│   │   └── api.js                # Axios API service layer
│   ├── data/
│   │   └── dummyData.js          # Sample data for development
│   └── App.jsx
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   └── Goal.js
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification
│   │   ├── controllers/
│   │   │   └── aiController.js   # AI feature handlers
│   │   └── routes/
│   │       └── ai.js             # AI routes with rate limiting
│   ├── package.json
│   └── .env.example
├── docs/                         # Project documentation
│   ├── ai-workflow-design.md
│   ├── ai-feature-requirements.md
│   ├── test-plan-draft.md
│   └── risk-register-updated.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- OpenAI API key **or** [Groq API key](https://console.groq.com) (free)
- MongoDB — **not required locally** (uses in-memory DB automatically in dev mode)

### 1. Clone the repository
```bash
git clone https://github.com/Ahnaf-17/AI_powered_personal_finance_advisor.git
cd AI_powered_personal_finance_advisor
```

### 2. Start the frontend
```bash
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### 3. Start the backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend runs at `http://localhost:5000`

> **No MongoDB needed locally** — the backend automatically starts an in-memory MongoDB instance for development. Data resets on restart. For persistent storage, set `MONGODB_URI` to a [MongoDB Atlas](https://cloud.mongodb.com) connection string.

### 4. Environment variables (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_advisor
JWT_SECRET=your_long_random_secret_here
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Optional: use Groq free tier instead of OpenAI
# AI_BASE_URL=https://api.groq.com/openai/v1
# OPENAI_MODEL=llama3-8b-8192
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

---

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Integration branch — stable, reviewed code only |
| `feature/ai-quality-lead` | Monsur's branch — AI features, models, test plan, docs |

---

## Documentation

All project documentation is in the [`docs/`](./docs/) folder:

- [`ai-workflow-design.md`](./docs/ai-workflow-design.md) – AI system architecture and prompt engineering
- [`ai-feature-requirements.md`](./docs/ai-feature-requirements.md) – 24 functional requirements, 12 user stories
- [`test-plan-draft.md`](./docs/test-plan-draft.md) – 40 test cases across 5 test areas
- [`risk-register-updated.md`](./docs/risk-register-updated.md) – Risk register v1.2 (10 risks)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.