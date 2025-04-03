# Store Rating and Management System

## 📖 Overview
This project is a **MERN stack-based** application that allows users to register, authenticate, manage stores, rate them, and track statistics. The backend is built using **Express.js**, and the frontend is developed with **React.js**.

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
* **Database**: Postgres
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
