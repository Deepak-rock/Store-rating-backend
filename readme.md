# 🏪 Store Rating API Backend

A full-featured backend built with **Node.js**, **Express.js**, and **PostgreSQL** to manage users, store owners, store listings, and customer ratings.

## 🚀 Features

- 🔐 Secure user authentication (JWT-based)
- 👥 User roles: `user`, `store_owner`, `admin`
- 🏬 Store management for store owners
- ⭐ Rate stores (1 to 5)
- 📊 Store dashboard with average ratings
- 🛡️ Middleware-based role protection

---

## 🧱 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt
- **Environment:** dotenv
- **Validation:** PostgreSQL constraints

---

## 📁 Project Structure

BACKEND/
├── .env # Environment variables
├── db.js # PostgreSQL DB config
├── middleware.js # Auth & Role-based Middleware
├── server.js # Main Express server
├── package.json
└── README.md # This file

🚀 Setup Instructions

1. Clone the repository

git clone https://github.com/Deepak-rock/Store-rating-backend

2. Install dependencies

npm install

3. Configure Environment Variables
Create a .env file:

PORT=5000 //example
DATABASE_URL=postgresql://user:password@localhost:5432/dbname //example
JWT_SECRET=yourSuperSecretKey //example

4. Start the Server

npm start

---

Server will run at: http://localhost:5000

🔑 API Endpoints
Auth
POST /login → Login and receive JWT

Store Owner
GET /store/dashboard → View store rating analytics (Protected)

🗄️ PostgreSQL Schema (Simplified)
users
id, name, email, password_hash, address, role

stores
id, name, address, owner_id, email

ratings
id, user_id, store_id, rating (1-5)

🔒 Middleware
authMiddleware → Verifies JWT

adminMiddleware → Restricts to admin role

storeMiddleware → Restricts to store owners

✅ Future Enhancements
🧾 Add registration with validation

💬 Review/comment system

📍 Location-based store search

📈 Admin dashboard analytics

☁️ Deploy on Render/Heroku with SSL

🧠 Author
Made with focus and innovation by [Your Name]

📜 License
MIT License — free to use, modify and distribute.

---

### 🔁 Customize
- Replace Deepak U and GitHub repo URL https://github.com/Deepak-rock/Store-rating-backend.
- Add setup screenshots or Postman collection if needed.

Want the **frontend README** or **PostgreSQL migration scripts** next?