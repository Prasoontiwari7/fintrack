# FinTrack - Personal Finance Management Application (MERN)

FinTrack is a premium personal finance tracking application. It features a complete Node.js/Express/MongoDB backend integrated seamlessly with a responsive React/Vite/Tailwind frontend. Users can register, log in, define a monthly budget, log transactions (income/expenses), and view real-time graphical trends and analytics on their dashboard.

---

## Folder Structure

```
fintrack/
│
├── frontend/                 # Frontend React Application
│   ├── src/
│   │   ├── api/              # Axios Instance & API Calls
│   │   ├── components/       # Pages and Layout Components
│   │   ├── assets/           # Static Assets
│   │   ├── App.jsx           # Main App Logic (Auth State Router)
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── backend/                  # Backend Node/Express Application
│   ├── src/
│   │   ├── config/           # DB Connection Setup
│   │   ├── controllers/      # MVC Controllers (Auth, Transaction, Dashboard, User)
│   │   ├── middleware/       # Auth guard, error handlers, validator
│   │   ├── models/           # Mongoose Schemas (User, Transaction)
│   │   ├── routes/           # REST Route Handlers
│   │   ├── app.js            # App configuration (helmet, cors, limiter, etc.)
│   │   └── server.js         # Entry file & DB startup
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── README.md                 # Main Documentation
└── .gitignore                # Global git ignore configurations
```

---

## Requirements

- **Node.js** (v16+)
- **NPM** (v8+)
- **MongoDB** (Running instance locally on `mongodb://127.0.0.1:27017` or remote URI)

---

## Installation & Setup

Follow these simple steps to get both services up and running:

### 1. Database Setup
Ensure that MongoDB is running locally or you have a valid MongoDB connection string.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
4. Verify/update configuration variables in `.env`:
   - `PORT`: Port the server runs on (default: `5000`)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key used to sign JSON Web Tokens
   - `JWT_EXPIRES_IN`: JWT expiration (default: `7d`)
   - `CLIENT_URL`: URL of the frontend client (default: `http://localhost:5173`)

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should print `MongoDB Connected: 127.0.0.1` and `Server running in development mode on port 5000`.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
4. Verify the backend API URL inside `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
5. Start the frontend React Vite development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Listening port for Express | `5000` |
| `NODE_ENV` | Mode of operation | `development` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb://127.0.0.1:27017/fintrack` |
| `JWT_SECRET` | Encryption secret for tokens | `fintrack_jwt_secret_key_987654321` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `CLIENT_URL` | Cross-Origin Client URL | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend endpoints | `http://localhost:5000/api` |

---

## API Endpoints

All responses follow the standard formats:
- **Success**: `{ "success": true, "message": "Success Msg", "data": {} }`
- **Error**: `{ "success": false, "message": "Error Msg", "errors": [] }`

### Authentication (`/api/auth`)
- `POST /signup`: Creates a new user profile.
- `POST /login`: Logs in a user, returns JWT and user profile.
- `GET /me` (Private): Returns profile details of the current authenticated user.

### Transactions (`/api/transactions`)
- `GET /` (Private): Lists all transactions for the user, sorted newest first.
- `POST /` (Private): Creates a transaction. *Category `Income` is positive, and expenses (Food, Transport, etc.) are saved as negative values.*
- `DELETE /:id` (Private): Deletes a transaction.

### Dashboard & Analytics (`/api/dashboard`)
- `GET /summary` (Private): Aggregates metrics (Total Balance, Monthly Spending/Income, Budget Remaining), lists latest 5 transactions, and outputs month-to-date spending.
- `GET /analytics` (Private): Aggregates category splits, 6-month historical trends, and 35-day spending heatmaps.

### User Profile (`/api/users`)
- `GET /profile` (Private): Gets profile data.
- `PUT /profile` (Private): Updates profile parameters (name, monthlyBudget).

---

## Production Deployment

### Backend
1. Build and compile if using TypeScript/transpilers (this backend uses standard ES Modules).
2. Set environment variables (`NODE_ENV=production`, etc.).
3. Start the node server:
   ```bash
   npm start
   ```

### Frontend
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Serve the static files located in `frontend/dist/` using a web server or CDN (such as Nginx, Netlify, or Vercel).
