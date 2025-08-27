# 🌍 PayStreet Mini Remittance Portal

A full-stack assignment project that simulates a **cross-border payments platform**.  
Built with **React + TailwindCSS + GSAP** on the frontend, and **Node.js + Express + MongoDB** on the backend.

---

## 🚀 Live Demo

👉 [Insert Deploy Link Here]

---

## ✨ Features

### Core

1. **User Onboarding & Authentication**

   - Signup/Login with JWT authentication.
   - Fields: Full Name, Email, Password.
   - Account Number auto-generated (UUID).
   - Unique email validation.

2. **Beneficiary Management**

   - Add, edit, delete beneficiaries.
   - Fields: Name, Bank Account Number, Country, Currency.
   - Linked to the logged-in user.

3. **Money Transfer Workflow**

   - Select beneficiary and enter amount in source currency.
   - Fetch real-time FX conversion to target currency.
   - Show fixed + percentage fee, total debit.
   - Confirm transaction (mock execution).

4. **FX Rates Integration**

   - Integrated with [ExchangeRate API](https://exchangerate.host).
   - Caches rates for 15 minutes.
   - Graceful error handling if API is down.

5. **Transaction History & Dashboard**

   - List of past transactions with details:
     - Date, Beneficiary, Amount, FX Rate, Fees, Status.
   - Filter by date range.
   - Search by beneficiary name.

6. **Admin Panel**
   - Admin login (role-based access).
   - Admin can view **all users** and **all transactions**.
   - Transactions above $10,000 flagged as **High-Risk**.
   - **Credentials for Admin Panel:**
     ```
     Email: rahul@admin.com
     Password: 12345
     ```

---

## 🎁 Bonus Features

- **Transaction Receipts**

  - Downloadable **PDF** and **CSV** receipts per transaction.
  - Bulk export CSV (user scope & admin scope).
  - PDFs include sender/beneficiary info, FX details, fees, and QR code.

- **Unit Tests**

  - **Backend**: Auth, Transactions, Receipts API routes tested with Vitest + Supertest + in-memory Mongo.
  - **Frontend**: Key components tested with Vitest + React Testing Library + JSDOM.

- **GSAP Animations**
  - Smooth entry animations for lists, cards, and dashboards.
  - Micro-interactions for buttons and modals.

---

## 🛠️ Tech Stack

**Frontend**

- React + Vite
- TailwindCSS
- GSAP (animations)
- Axios

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- PDFKit, json2csv, QRCode (for receipts)

**Testing**

- Vitest
- Supertest
- React Testing Library
- JSDOM

---

## 📂 Project Structure

paystreet-mini/
├── client/ # React frontend
│ ├── node_modules/
│ ├── public/
│ ├── src/ # All frontend source code
│ │ ├── pages/ # Dashboard, Transfer, Beneficiaries, Admin
│ │ ├── components/ # Navbar, Routes, etc.
│ │ └── api/ # Axios config, helpers
│ ├── eslint.config.js
│ ├── index.html
│ ├── package.json
│ ├── package-lock.json
│ ├── vite.config.js
│ └── README.md
│
├── server/ # Node.js backend
│ ├── config/ # App & DB configs
│ ├── middleware/ # Auth, error handling
│ ├── models/ # User, Beneficiary, Transaction
│ ├── routes/ # Auth, Transactions, Admin, Receipts
│ ├── services/ # FX rates, caching, business logic
│ ├── tests/ # Basic unit/integration tests
│ ├── utils/ # Utility helpers
│ ├── node_modules/
│ ├── app.js # Express app setup
│ ├── server.js # Server entry point
│ ├── package.json
│ ├── package-lock.json
│ └── .env
│
├── .gitignore
└── README.md

## 🧪 Running Tests

**Backend**
cd server
npm run test

**Frontend**
cd client
npm run test

🚀 Getting Started
Backend
cd server
npm install
npm run dev
Create .env with:
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-secret>

Frontend
cd client
npm install
npm run dev
