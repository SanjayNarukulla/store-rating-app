-- Modified Database Schema

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
    email VARCHAR(100) UNIQUE, -- Optional, but should be unique if present
    address TEXT NOT NULL,
    owner_id INT REFERENCES users(id) -- Added owner_id foreign key
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    store_id INT REFERENCES stores(id),
    rating INT CHECK (rating BETWEEN 1 AND 5)
);
