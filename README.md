# Store Rating and Management System

## 📖 Overview
This project is a **MERN stack-like** application that allows users to register, authenticate, manage stores, rate them, and track statistics. The backend is built using **Express.js**, and the frontend is developed with **React.js**.

**Note:** While the project architecture is similar to the MERN stack, it uses PostgreSQL as the database instead of MongoDB.

## 🚀 Features
* **User Authentication** (Login/Register)
* **Role-Based Access Control** (Admin, Store Owner, User)
* **Store Management** (Add, Edit, Delete Stores)
* **User Ratings & Reviews**
* **Analytics & Statistics**
* **Secure API with JWT Authentication**

## 🛠️ Tech Stack
* **Frontend**: React.js, Material-UI
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL
* **Authentication**: JWT (JSON Web Tokens)
* **Security**: Helmet.js, Compression
* **State Management**: React Context API

## 📂 Project Structure

📦 project-root
├── 📂 backend
│   ├── 📂 routes
│   │   ├── authRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── statsRoutes.js
│   │   ├── userRoutes.js
│   ├── server.js
│   ├── config.env
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components
│   │   ├── 📂 pages
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
│   ├── .env
├── README.md
└── package.json


## 🔧 Installation & Setup

### 1️⃣ Backend Setup
```bash
cd backend
npm install
npm start

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start

### 🔐 Environment Variables
### Create a .env file in both frontend and backend with the following variables:

# Backend
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api



# Database Setup

This project uses a PostgreSQL database to store application data. Follow these steps to set up the database locally:

## Prerequisites

* **PostgreSQL:** Ensure you have PostgreSQL installed on your system. You can download it from the official PostgreSQL website: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
* **psql (PostgreSQL interactive terminal):** This is usually included with the PostgreSQL installation.
* **pgAdmin (Optional):** A graphical administration tool for PostgreSQL, which can be helpful for managing your database. Download it from: [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)

## Local Database Setup

1.  **Create a Database:**
    * Open your terminal or command prompt.
    * Connect to PostgreSQL using `psql`:
        ```bash
        psql -U postgres # If you are using the default user
        ```
        * You might be prompted for the PostgreSQL user's password.
    * Create a new database for this project. Replace `your_database_name` with your desired database name:
        ```sql
        CREATE DATABASE your_database_name;
        ```
    * Exit psql.
        ```sql
        \q
        ```

2.  **Create Tables:**
    * Connect to your newly created database:
        ```bash
        psql -U postgres -d your_database_name
        ```
    * Execute the following SQL commands to create the tables:

        ```sql
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            address TEXT,
            role VARCHAR(50) CHECK (role IN ('Admin', 'User', 'Owner'))
        );

        CREATE TABLE stores (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE,
            address TEXT NOT NULL,
            owner_id INT REFERENCES users(id)
        );

        CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id),
            store_id INT REFERENCES stores(id),
            rating INT CHECK (rating BETWEEN 1 AND 5)
        );
        ```
    * Exit `psql`:
        ```sql
        \q
        ```

3.  **Database Connection in `.env`:**

    * Create a `.env` file in the root directory of your project.
    * Add the following environment variable, replacing the placeholders with your database credentials:

        ```
        DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
        ```

        * `your_username`: Your PostgreSQL username.
        * `your_password`: Your PostgreSQL password.
        * `your_database_name`: The name of the database you created.
        * If your postgresql installation is using the default postgres user, and has no password, the DATABASE_URL will look like this `DATABASE_URL=postgresql://postgres@localhost:5432/your_database_name`

## Render PostgreSQL Instance (If applicable)

If you are using a Render-hosted PostgreSQL instance, you can import your local data using the following steps:

1.  **Dump Local Database:**
    * Use `pg_dump` to create a SQL dump of your local database:
        ```bash
        pg_dump -U your_username -d your_database_name -f local_dump.sql
        ```
    * Replace `your_username` and `your_database_name` with your local database credentials.

2.  **Restore to Render Instance:**
    * Connect to your Render PostgreSQL instance using `psql` or a tool like pgAdmin, using the connection string provided by Render.
    * Execute the SQL dump file:
        ```bash
        psql -U render_username -h render_host -p render_port -d render_database_name -f local_dump.sql
        ```
    * Replace `render_username`, `render_host`, `render_port`, and `render_database_name` with the details of your Render PostgreSQL instance.

## Important Notes:

* **Security:** Never commit your database credentials directly to your version control system. Use environment variables.
* **Dependencies:** Ensure that your application's dependencies (e.g., `pg` or `node-postgres` for Node.js) are installed.
* **Migrations:** For more complex database changes, consider using database migrations to manage schema updates.
* **Render connection strings:** Render provides connection strings that you can utilize directly, rather than using pg_dump and psql.

This setup guide should help you get your PostgreSQL database running locally and, if needed, transfer data to a Render instance.
