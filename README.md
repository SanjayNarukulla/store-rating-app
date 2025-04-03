#   Store Rating and Management System

##   📖 Overview

This project is a **MERN stack-like** application designed to facilitate user registration, authentication, store management, user ratings, and statistical tracking. The backend is built using **Express.js**, and the frontend is developed with **React.js**.

**Note:** While the project architecture shares similarities with the MERN stack, it leverages PostgreSQL as the database system instead of MongoDB.

##   🚀 Features

* **User Authentication:** User registration and login functionality.
* **Role-Based Access Control:** Implements role-based permissions (Admin, Store Owner, User) to manage access to different functionalities.
* **Store Management:** Enables store owners to add, edit, and delete store information.
* **User Ratings & Reviews:** Allows users to rate and review stores.
* **Analytics & Statistics:** Provides insights through analytics and statistical data.
* **Secure API:** Implements secure API communication using JWT (JSON Web Tokens) for authentication.

##   🛠️ Tech Stack

* **Frontend:** React.js, Material-UI
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens)
* **Security:** Helmet.js, Compression
* **State Management:** React Context API

##   📂 Project Structure

```
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
```


##   🔧 Installation & Setup

###   1️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```
### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

##  🔐 Environment Variables
Create a .env file in both the frontend and backend directories and configure the following variables:

### Backend .env

```
PORT=5000
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend .env
```
REACT_APP_API_URL=http://localhost:5000/api
```

Note: Replace the placeholders in DATABASE_URL with your actual PostgreSQL connection string.

## 🗄️ Database Setup (PostgreSQL)

This project relies on a PostgreSQL database. Follow these instructions to set up the database locally:

### Prerequisites
**PostgreSQL:** Ensure PostgreSQL is installed on your system. Download it from the official website: https://www.postgresql.org/download/
**psql:** The PostgreSQL interactive terminal (usually included with the installation).
**pgAdmin (Optional):** A graphical administration tool for PostgreSQL, available for download at: https://www.pgadmin.org/download/


### Local Database Setup

1.  **Create a Database:**

    * Open your terminal or command prompt.
    * Connect to PostgreSQL using `psql`:

        ```bash
        psql -U postgres # If using the default user
        ```

        * You might be prompted for the PostgreSQL user's password.
    * Create a new database for the project. Replace `your_database_name` with your preferred name:

        ```sql
        CREATE DATABASE your_database_name;
        ```
    * Exit `psql`:

        ```sql
        \q
        ```

2.  **Create Tables:**

    * Connect to your newly created database:

        ```bash
        psql -U postgres -d your_database_name
        ```
    * Execute the following SQL commands to create the database tables:

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

3.  **Configure Database Connection:**

    * In the `backend` directory, create a `.env` file (if it doesn't exist).
    * Add the following environment variable, replacing the placeholders with your database credentials:

        ```
        DATABASE_URL=postgresql://your_username:your_password@localhost:5432/your_database_name
        ```

        * `your_username`: Your PostgreSQL username.
        * `your_password`: Your PostgreSQL password.
        * `your_database_name`: The name of the database you created.
        * If you're using the default `postgres` user with no password, the `DATABASE_URL` would be:

            ```
            DATABASE_URL=postgresql://postgres@localhost:5432/your_database_name
            ```

4.  **Render PostgreSQL Instance (Optional):**

    * If you're deploying to Render and using their PostgreSQL service, you can migrate your local data:

        * **Dump Local Database:**
            * Use `pg_dump` to create a SQL dump of your local database:

                ```bash
                pg_dump -U your_username -d your_database_name -f local_dump.sql
                ```

            * Replace `your_username` and `your_database_name` with your local database credentials.

        * **Restore to Render Instance:**
            * Connect to your Render PostgreSQL instance using `psql` or a tool like pgAdmin, using the connection string provided by Render.
            * Execute the SQL dump file:

                ```bash
                psql -U render_username -h render_host -p render_port -d render_database_name -f local_dump.sql
                ```

            * Replace `render_username`, `render_host`, `render_port`, and `render_database_name` with the connection details from your Render PostgreSQL instance.

* Execute the SQL dump file:

                ```bash
                psql -U render_username -h render_host -p render_port -d render_database_name -f local_dump.sql
                ```

            * Replace `render_username`, `render_host`, `render_port`, and `render_database_name` with the connection details from your Render PostgreSQL instance.

### ⚠️ Important Notes

* **Security:** Never commit database credentials directly to version control. Always use environment variables.
* **Dependencies:** Ensure all necessary packages (e.g., `pg`, `node-postgres`) are installed in your backend.
* **Database Migrations:** Consider using database migrations for managing schema changes in a structured way, especially in larger projects.
* **Render Connection Strings:** Render provides direct connection strings; you might not always need `pg_dump` and `psql` for simple deployments.

### 🏗️ API Endpoints

#### 🔹 Auth Routes

* **POST /api/auth/register:** Register a new user.
    * `Request Body:` `{ name, email, password, address, role }`
    * `Response:` User object or error message.
* **POST /api/auth/login:** Authenticate a user and return a JWT.
    * `Request Body:` `{ email, password }`
    * `Response:` JWT and user object or error message.

#### 🔹 Store Routes

* **GET /api/stores:** Retrieve a list of all stores.
    * `Response:` Array of store objects.
* **POST /api/stores:** Create a new store (requires Owner role).
    * `Request Body:` `{ name, email, address }`
    * `Response:` Created store object or error message.
* **GET /api/stores/:id:** Get a specific store by ID.
    * `Response:` Store object.
* **PUT /api/stores/:id:** Update an existing store (requires Owner role).
    * `Request Body:` `{ name, email, address }` (fields to update).
    * `Response:` Updated store object or error message.
* **DELETE /api/stores/:id:** Delete a store (requires Owner role).
    * `Response:` Success message or error message.

#### 🔹 Rating Routes

* **POST /api/ratings:** Create or update a user's rating for a store.
    * `Request Body:` `{ user_id, store_id, rating }`
    * `Response:` Created/updated rating object or error message.
* **GET /api/ratings/:storeId:** Retrieve all ratings for a specific store.
    * `Response:` Array of rating objects or average rating.

#### 🔹 Stats Routes

* **GET /api/stats:** Retrieve analytics and statistical data (requires Admin role).
    * `Response:` Object containing various statistics. (Define specific stats in your application).
  
## 🔥 Deployment

You can deploy the frontend on platforms like Netlify or Vercel, and the backend on services like Render or Heroku.

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contribution

Contributions are welcome! Feel free to fork this repository and submit pull requests.

## 📞 Contact

For inquiries, please contact: narukullasanjay@gmail.com
