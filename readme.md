# 🧠 Store Rating Backend

A robust backend system to manage store listings, user accounts, and customer ratings. Built using **Node.js**, **Express.js**, and **PostgreSQL** — designed to scale, secure, and serve rapidly.

---

## ⚙️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Backend framework
- **PostgreSQL** – Relational database
- **JWT** – Secure authentication
- **bcrypt** – Password hashing
- **dotenv** – Environment configuration

---

## 📦 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (local or cloud)
- npm

---

### 🚀 Setup Instructions

1. **Clone the repository**

    ```bash
    git clone https://github.com/Deepak-rock/store-rating-backend

2. **Install dependencies**

    ```bash
    npm install

3. **Configure environment**

    Create a .env file in the root directory:  

        # You can provide any Port
        PORT=5000

        # Provide your Database Url from render || docker || local.  
        DATABASE_URL=postgresql://username:password@localhost:5432/your_db
        
        DB_SSL=false
        JWT_SECRET=yourSuperSecretKey

    Copy from .env.example if available.

4. **Start the server**
    ```bash
    npm run dev     # For development with nodemon
    npm start       # For production`

---

### 🧠 API Endpoints

    | Method |         Endpoint        |           Description         |
    | ------ | ----------------------- | ----------------------------- |
    |  POST  | `/register`             |   Register new user           |
    |  POST  | `/login`                |   Login and get JWT           |
    |  POST  | `/admin/users`          |   Add user (admin-only)       |
    |  POST  | `/admin/stores`         |   Add Store (admin-only)      |
    |  GET   | `/admin/dashboard`      |   Dashboard stats(admin-only) |
    |  GET   | `/admin/users`          |   Route: Filter users         |
    |  GET   | `/admin/stores`         |   Route: Filter stores        |
    |  GET   | `/admin/users/:id`      |   User details                |
    |  GET   | `/stores`               |   List of Store for user      |
    |  POST  | `/stores/:storeId/rate` |   Store rating                |
    |  GET   | `/store/dashboard`      |   Store dashboard             |
    |  PUT   | `/password`             |   Update password             |


### 📊 Database Tables

🧑‍💼 **users**

    | Column         | Type         | Constraints      |
    | -------------- | ------------ | ---------------- |
    | id             | SERIAL       | PRIMARY KEY      |
    | name           | VARCHAR(100) | NOT NULL         |
    | email          | VARCHAR(100) | UNIQUE, NOT NULL |
    | password_hash  | TEXT         | NOT NULL         |
    | address        | TEXT         | NOT NULL         |
    | role           | VARCHAR(20)  | DEFAULT `'user'` |


🏬 **stores**

    | Column    | Type         | Constraints               |
    | --------- | ------------ | ------------------------- |
    | id        | SERIAL       | PRIMARY KEY               |
    | name      | VARCHAR(100) | NOT NULL                  |
    | address   | TEXT         | NOT NULL                  |
    | email     | VARCHAR      | NOT NULL                  |
    | owner_id  | INTEGER      | FOREIGN KEY → `users(id)` |


⭐ **ratings**

    | Column    | Type    | Constraints                    |
    | --------- | ------- | ------------------------------ |
    | id        | SERIAL  | PRIMARY KEY                    |
    | user_id   | INTEGER | FOREIGN KEY → `users(id)`      |
    | store_id  | INTEGER | FOREIGN KEY → `stores(id)`     |
    | rating    | INTEGER | CHECK (rating BETWEEN 1 AND 5) |

🔐 **Middleware**

    authMiddleware – Verifies JWT and attaches user to request

    storeMiddleware – Restricts access to store owners

    adminMiddleware – Restricts access to admin users

---

🔍 Project Structure

    BACKEND/
    ├── db.js                 # PostgreSQL connection config
    ├── middleware.js         # JWT + Role middlewares
    ├── server.js             # Main Express app
    ├── .env                  # Environment variables
    ├── package.json
    └── README.md             # This file

🧪 Scripts

    "scripts": {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js",
        "test": "echo \"Test suite coming soon\""
    }

## 🧠 Author

Engineered with purpose by Deepak U 🚀
